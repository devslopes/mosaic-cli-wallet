#!/usr/bin/env node

// Packages for user input and display for CLI
import { Spinner } from 'cli-spinner';
import { white } from 'colors';
import { green, magenta, red, yellow } from 'colors/safe';
const CFonts = require('cfonts');
const prompt = require('prompt');

// fs and os are native node packages for working with file system
const fs = require('fs');
const os = require('os');

// Official nem-library
import { Password, SimpleWallet, Account } from 'nem-library';

// Wallet functions for this app
import {
	mosaicBalance, createSimpleWallet, getAccountBalances, prepareTransfer, sendMosaic, xemBalance
} from '../src/wallet';

// JSON File for mosaic settings - can be replaced with any mosaic
const mosaicSettings = require('../src/mosaic-settings.json');
const MOSAIC_NAME = mosaicSettings.mosaic_name;

// Must declare process since Typescript doesn't know about it
declare let process: any;

// Grab user arguments from command line
const args = process.argv.slice(2);

// Paths for saving and loading wallets
const PATH_HOME = `${os.homedir()}/${MOSAIC_NAME}-wallets`;
const PATH_WALLET = `${PATH_HOME}/${MOSAIC_NAME}-wallet.wlt`;

// When an account is loaded store it so it can be used later
let selectedAccount: Account;

/**
 * Show available commands for the user
 */
if (args.length === 0) {
	CFonts.say(`${MOSAIC_NAME}`, { colors: ['cyan']});
	console.log(`Usage:

	${MOSAIC_NAME} balance
		Gets your current wallet balance and public address
	
	${MOSAIC_NAME} send <amount> <address>
		Sends ${MOSAIC_NAME} from your wallet to the specified address
	
	${MOSAIC_NAME} wallet create
		Guides you through creating a new ${MOSAIC_NAME} wallet
	`);
	process.exit(1);
}

/**
 * @param {SimpleWallet} wallet The SimpleWallet to download to the hard drive
 * If default wallet already exists it will add a timestamp to the wallet path of
 * this new wallet
 */
const downloadWallet = (wallet: SimpleWallet) => {
	console.log(white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));

	if (!fs.existsSync(PATH_HOME)) {
		fs.mkdirSync(PATH_HOME);
	}

	let fullPath = PATH_WALLET;
	if (fs.existsSync(fullPath)) {
		const stamp = new Date().toISOString();
		fullPath = `${PATH_HOME}/${stamp}-${MOSAIC_NAME}-wallet.wlt`
	}
	fs.writeFileSync(fullPath, wallet.writeWLTFile());

	console.log(green(`Downloaded wallet to ${fullPath}`))
};

/**
 * Creates password when making a new wallet
 */
const createPwd = () => {
	console.log(white(
		`\nPlease enter a unique password ${yellow('(8 character minimum)')}.\n 
This password will be used to encrypt your private key and make working with your wallet easier.\n\n`
	));
	console.log(red(
		`Store this password somewhere safe. If you lose or forget it you will never be able to transfer funds\n`
	));
	prompt.message = white(`${MOSAIC_NAME} wallet`);
	prompt.start();
	prompt.get({
		properties: {
			password: {
				description: white('Password'),
				hidden: true
			},
			confirmPass: {
				description: white('Re-enter password'),
				hidden: true
			}
		}
	}, async (_, result) => {
		if (result.password !== result.confirmPass) {
			console.log(magenta('\nPasswords do not match.\n\n'));
			createPwd();
		} else {
			/**
			 * Create new SimpleWallet
			 * Open it to access the new Account
			 * Print account info
			 */
			const wallet = createSimpleWallet(result.password);
			const pass = new Password(result.password);
			const account = wallet.open(pass);
			const address = account.address.pretty();
			console.log(green(`${MOSAIC_NAME} wallet successfully created.`));
			console.log(white(`You can now start sending and receiving ${MOSAIC_NAME}!`));
			console.log(white(`\n${MOSAIC_NAME} Public Address:`));
			console.log(yellow(`${address}`));
			console.log(white(`\nPrivate Key:`));
			console.log(yellow(`${account.privateKey}`));
			await downloadWallet(wallet);
		}
	})
};

/**
 * Get users password and attempt opening the wallet
 */
const attemptWalletOpen = (wallet: SimpleWallet): Promise<Account> => {
	return new Promise<Account>((resolve, reject) => {
		prompt.message = white('wallet login');
		prompt.start();
		prompt.get({
			properties: {
				password: {
					description: white('Password'),
					hidden: true
				}
			}
		}, (_, result) => {
			const pass = new Password(result.password);
			try {
				resolve(wallet.open(pass));
			} catch (err) {
				console.log(red(`${err}`));
				console.log(white('Please try again'));
				reject();
			}
		});
	});
};

/**
 * Load wallet from file system
 */
const loadWallet = (): SimpleWallet => {
	const contents = fs.readFileSync(PATH_WALLET);
	return SimpleWallet.readFromWLT(contents);
};

/**
 * Talk to NEM API to fetch the mosaic balance & XEM balance
 */
const printBalance = async (onBalance: (balance: number) => void) => {
	const wallet = loadWallet();
	try {
		const account = await attemptWalletOpen(wallet);
		selectedAccount = account;
		console.log('\n');
		const spinner = new Spinner(yellow('Fetching balance... %s'));
		spinner.setSpinnerString(0);
		spinner.start();
		const balances = await getAccountBalances(account);
		const mosaic = await mosaicBalance(balances);
		const xem = await xemBalance(balances);
		spinner.stop();
		/**
		 * Convert raw number into user-readable string
		 * 1e6 is Scientific Notation - adds the decimal six
		 * places from the right: ie 156349876 => 156.349876
		 */
		const bal = (mosaic / 1e6).toString();
		const xemBal = (xem / 1e6).toString();
		console.log('\n');
		console.log(`\n${white('XEM Balance:')} ${white(xemBal)}`);
		console.log(`\n${white(`${MOSAIC_NAME} Balance:`)} ${white(bal)}\n`);
		onBalance(mosaic / 1e6);
	} catch (err) {
		if (err) {
			console.log(err);
		}
	}
};

/**
 * Main entry point for wallet
 */
const main = async () => {
	if (args[0] === 'wallet') {
		if (args[1] === 'create') {
			createPwd();
		}
	} else {
		/**
		 * If the default wallet file is not in the correct path
		 * throw an error
		 */
		if (!fs.existsSync(PATH_WALLET)) {
			const file = `${MOSAIC_NAME}-wallet.wlt`;
			console.log(red(`Cannot find default wallet. Please place a file named ${white(file)} at this location: ${PATH_WALLET}`));
			process.exit(1);
		}

		/**
		 * Fetch and display the wallet balance
		 */
		if (args[0] === 'balance') {
			await printBalance(_ => {});
		} else if (args[0] === 'send') {
			/**
			 * Manage user input for sending mosaic to another wallet
			 * printBalance for user convenience
			 */
			await printBalance(async (balance) => {
				const amt = parseFloat(args[1]);
				const address = args[2];
				if (isNaN(amt)) {
					console.log(red('Must provide a valid number with maximum of 6 digits ie 10.356784'));
					process.exit(1);
				}
				if (!address) {
					console.log(red('Must provide a valid recipient address'));
					process.exit(1);
				}
				if  (amt > balance) {
					console.log(red(`You don't have enough ${MOSAIC_NAME} to send`));
					process.exit(1);
				}
				try {
					const preTransaction = await prepareTransfer(address, amt);
					const xemFee = (preTransaction.fee / 1e6).toString();
					console.log(white('Transaction Details: \n'));
					console.log(`Recipient:          ${yellow(address)}\n`);
					console.log(`${MOSAIC_NAME} to send:      ${yellow(amt.toString())}\n`);
					console.log(`XEM Fee:            ${yellow(xemFee)}\n\n`);
					console.log(`${white('Would you like to proceed?\n')}`);

					prompt.message = white(`${MOSAIC_NAME} Transfer`);
					prompt.start();
					prompt.get({
						properties: {
							confirmation: {
								description: yellow('Proceed? ( y/n )')
							}
						}
					}, async (_, result) => {
						if (result.confirmation.toLowerCase() === 'y' || result.confirmation.toLowerCase() === 'yes') {
							try {
								const result = await sendMosaic(address, amt, selectedAccount);
								console.log(result);
								console.log('\n\n');
								console.log(white('Transaction successfully announced to the NEM blockchain. Transaction could take some time. Come back here in 5 minutes to check your balance to ensure that the transaction was successfully sent\n'));

							} catch (err) {
								console.log(red(err));
							}
						} else {
							console.log('Transaction canceled');
							process.exit(1);
						}
					});
				} catch (err) {
					console.log(`\n${err}\n`);
				}
			});
		}
	}
};

main();

process.on('uncaughtException', function(err) {
	console.log(err);
	console.log('Wallet closed');
	process.exit(1);
});