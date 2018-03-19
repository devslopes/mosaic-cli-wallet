#!/usr/bin/env node
const prompt = require('prompt');
const fs = require('fs');
const os = require('os');
import { white } from 'colors';
import { green, magenta, red, yellow } from 'colors/safe';
import { Password, SimpleWallet, Account } from 'nem-library';
import {
	cacheBalance, createSimpleWallet, getAccountBalances, prepareTransfer, sendCache,
	xemBalance
} from '../src/wallet/wallet';
const CFonts = require('cfonts');
import { Spinner } from 'cli-spinner';

declare let process: any;
const args = process.argv.slice(2);
const PATH_HOME = `${os.homedir()}/cache-wallets`;
const PATH_WALLET = `${PATH_HOME}/cache-wallet.wlt`;
let selectedAccount: Account;

if (args.length === 0) {
	CFonts.say('Cache', { colors: ['cyan']});
	console.log(`Usage:

	cache balance
		Gets your current wallet balance and public address
	
	cache send <amount> <address>
		Sends cache from your wallet to the specified address
	
	cache wallet create
		Guides you through creating a new cache wallet
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
		fullPath = `${PATH_HOME}/${stamp}-cache-wallet.wlt`
	}
	fs.writeFileSync(fullPath, wallet.writeWLTFile());

	console.log(green(`Downloaded wallet to ${fullPath}`))
};

const createPwd = () => {
	console.log(white(
		`\nPlease enter a unique password ${yellow('(8 character minimum)')}.\n 
This password will be used to encrypt your private key and make working with your wallet easier.\n\n`
	));
	console.log(red(
		`Store this password somewhere safe. If you lose or forget it you will never be able to transfer funds\n`
	));
	prompt.message = white('Cache Wallet');
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
			const wallet = createSimpleWallet(result.password);
			const pass = new Password(result.password);
			const account = wallet.open(pass);
			const address = account.address.pretty();
			console.log(green('\nCache wallet successfully created.\n'));
			console.log(white('You can now start sending and receiving cache!\n'));
			console.log(white(`\nCache Public Address:`));
			console.log(yellow(`${address}`));
			console.log(white(`\nPrivate Key:`));
			console.log(yellow(`${account.privateKey}`));
			await downloadWallet(wallet);
		}
	})
};

const attemptWalletOpen = (wallet: SimpleWallet): Promise<Account> => {
	return new Promise<Account>((resolve, reject) => {
		prompt.message = white('Wallet Login');
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
const loadWallet = (): SimpleWallet => {
	const contents = fs.readFileSync(PATH_WALLET);
	return SimpleWallet.readFromWLT(contents);
};
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
		const cache = await cacheBalance(balances);
		const xem = await xemBalance(balances);
		spinner.stop();
		const bal = (cache / 1e6).toString();
		const xemBal = (xem / 1e6).toString();
		console.log('\n');
		console.log(`\n${white('XEM Balance:')} ${white(xemBal)}`);
		console.log(`\n${white('Cache Balance:')} ${white(bal)}\n`);
		onBalance(cache / 1e6);
	} catch (err) {
		if (err) {
			console.log(err);
		}
	}
};
const main = async () => {
	if (args[0] === 'wallet') {
		if (args[1] === 'create') {
			return createPwd();
		}

		if (!fs.existsSync(PATH_WALLET)) {
			console.log(red(`Cannot find default wallet. Please place a file named ${white('cache-wallet.wlt')} at this location: ${PATH_WALLET}`));
			process.exit(1);
		}

		if (args[1] === 'balance') {
			await printBalance(_ => {});
		} else if (args[1] === 'send') {
			await printBalance(async (balance) => {
				const amt = parseFloat(args[2]);
				const address = args[3];
				if (isNaN(amt)) {
					console.log(red('Must provide a valid number with maximum of 6 digits ie 10.356784'));
					process.exit(1);
				}
				if (!address) {
					console.log(red('Must provide a valid recipient address'));
					process.exit(1);
				}
				if  (amt > balance) {
					console.log(red(`You don't have enough cache to send`));
					process.exit(1);
				}
				try {
					const preTransaction = await prepareTransfer(address, amt);
					const xemFee = (preTransaction.fee / 1e6).toString();
					console.log(white('Transaction Details: \n'));
					console.log(`Recipient:          ${yellow(address)}\n`);
					console.log(`Cache to send:      ${yellow(amt.toString())}\n`);
					console.log(`XEM Fee:            ${yellow(xemFee)}\n\n`);
					console.log(`${white('Would you like to proceed?\n')}`);

					prompt.message = white('Cache Transfer');
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
								const result = await sendCache(address, amt, selectedAccount);
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