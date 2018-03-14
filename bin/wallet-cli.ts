#!/usr/bin/env node
const prompt = require('prompt');
const fs = require('fs');
const os = require('os');
const child_process = require("child_process");
import { white } from 'colors';
import { green, magenta, red, yellow } from 'colors/safe';
import { Password, SimpleWallet, Account } from 'nem-library';
import { createSimpleWallet, getAccountBalance } from '../src/wallet/wallet';
const CFonts = require('cfonts');
const Spinner = require('cli-spinner').Spinner;

declare let process: any;
const args = process.argv.slice(2);
const homePath = `${os.homedir()}/cache-wallets`;
let defaultWalletPath: string;

if (args.length === 0) {
	CFonts.say('Cache', { colors: ['cyan']});
	console.log(`Usage:

	cache wallet list
		Lists all of the wallets available in your cache-wallets directory
	
	cache wallet default <number>
		Choose the wallet you want to set as default ie 'cache wallet default 3'
	
	cache balance
		Gets your current wallet balance and public address
	
	cache send <amount> <address>
		Sends cache from your wallet to the specified address
	
	cache wallet create
		Guides you through creating a new cache wallet
	`);
	process.exit(1);
}

const downloadWallet = (wallet: SimpleWallet, address: string) => {
	console.log(white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
	const addAbb = address.substring(0,6);
	const stamp = new Date().toISOString().substring(0,10);

	if (!fs.existsSync(homePath)) {
		fs.mkdirSync(homePath);
	}
	const path = `${homePath}/${addAbb}-${stamp}-cache.wlt`;
	fs.writeFile(path, wallet.writeWLTFile(), (_) => {
		console.log(green(`\nDownloaded wallet to ${path}\n`));
	});
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
			await downloadWallet(wallet, address);
		}
	})
};

const listWallets = () => {
	console.log(white('Fetching wallets...\n'));

	loadWalletPaths(paths => {
		if (paths.length === 0) {
			console.log(white(`No wallets found. Create a new wallet or place an existing .wlt file
in ${homePath}\n`));
			process.exit(1);
		}
		for (let x = 0; x < paths.length; x++) {
			console.log(`${x} - ${paths[x]}`);
		}
		console.log('\n')
	});
};

const loadWalletPaths = (onLoaded: (paths: Array<string>) => void) => {
	fs.readdir(homePath, (_, files) => {
		let paths: Array<string> = [];
		for (let x = 0; x < files.length; x++) {
			if (files[x].includes('default')) {
				defaultWalletPath = files[x];
			}
			const str = files[x].substring(files[x].length - 3, files[x].length);
			if (str === 'wlt') {
				paths.push(files[x]);
			}
		}
		onLoaded(paths);
	});
};
const attemptWalletOpen = (wallet: SimpleWallet): Promise<Account> => {
	return new Promise<Account>((resolve, reject) => {
		prompt.start();
		prompt.get({
			properties: {
				password: {
					description: white('Password'),
					hidden: true
				}
			}
		}, (_, result) => {
			const pass = new Password(result);
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
	loadWalletPaths(_ => {});
	child_process.execSync('sleep 1');
	const fullPath = `${homePath}/${defaultWalletPath}`;
	const contents = fs.readFileSync(fullPath, 'utf8');
	return SimpleWallet.readFromWLT(contents);
};
const getBalance = async () => {
	const wallet = loadWallet();
	try {
		const account = await attemptWalletOpen(wallet);
		const spinner = new Spinner('processing.. %s');
		spinner.setSpinnerString(9);
		spinner.start();
		const cacheMosaic = await getAccountBalance(account);
		const balance = cacheMosaic ? cacheMosaic.quantity : 0;
		spinner.stop();
		const bal = Math.round(balance * 1e6) / 1e6;

		console.log(green('\n\nCache Balance: '));
		console.log(white(`${bal}\n`));
	} catch (err) {
		if (err) {
			console.log(err);
		}
		getBalance();
	}
};
const setDefaultWallet = (walletIndex: number) => {
	loadWalletPaths(paths => {
		if (paths[walletIndex].includes('default')) return;
		for (let x = 0; x < paths.length; x++) {
			let newPath = paths[x].replace('default-','');
			newPath = `${homePath}/${newPath}`;
			fs.rename(`${homePath}/${paths[x]}`, newPath, (_) => {});
		}
		setTimeout(() => {
			fs.rename(`${homePath}/${paths[walletIndex]}`, `${homePath}/default-${paths[walletIndex]}`)
		}, 800);
	});
};
const main = () => {
	loadWalletPaths(paths => {
		if (args[0] === 'wallet') {
			if (args[1] === 'create') {
				createPwd();
			} else if (args[1] === 'balance') {
				if (!defaultWalletPath) {
					return console.log(yellow(`\nYou must first set a default wallet. Run ${white('cache wallet list')} then ${white('cache wallet default <number>')}\n`));
				}
				getBalance();
			} else if (args[1] === 'list') {
				listWallets();
			} else if (args[1] === 'default') {
				const idx = parseInt(args[2]);
				if (isNaN(idx)) {
					console.log(red('Invalid wallet index. Must be an Integer'))
				} else {
					if (idx >= 0 && idx < paths.length) {
						setDefaultWallet(idx);
					} else {
						console.log(red('Invalid wallet selection'))
					}
				}
			}
		}
	});
};

main();

process.on('uncaughtException', function(err) {
	console.log(err);
	console.log('Wallet closed');
	process.exit(1);
});