#!/usr/bin/env node
const prompt = require('prompt');
const fs = require('fs');
const os = require('os');
import { white } from 'colors';
import { green, magenta, red, yellow } from 'colors/safe';
import { Password, SimpleWallet } from 'nem-library';
import { createSimpleWallet } from '../src/wallet/wallet';
const CFonts = require('cfonts');

declare let process: any;
const args = process.argv.slice(2);
const homePath = `${os.homedir()}/cache-wallets`;
let walletPaths: Array<string>;
// let selectedWallet: SimpleWallet;

CFonts.say('Cache', { colors: ['cyan']});
if (args.length === 0) {
	console.log(`Usage:

	cache wallet list
		Lists all of the wallets available in your cache-wallets directory
	
	cache wallet select <number>
		Choose the wallet you want to work with ie 'cache wallet select 3'
	
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

const pwd = () => {
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
			pwd();
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

const listWallets = async () => {
	console.log(white('Fetching wallets...\n'));

	loadWalletPaths(() => {
		if (walletPaths.length === 0) {
			console.log(white(`No wallets found. Create a new wallet or place an existing .wlt file
in ${homePath}\n`));
			process.exit(1);
		}
		for (let x = 0; x < walletPaths.length; x++) {
			console.log(`${x} - ${walletPaths[x]}`);
		}
		console.log('\n')
	});
};

const loadWalletPaths = (onLoaded?: () => void) => {
	// Load wallet paths behind the scenes automatically
	fs.readdir(homePath, (_, files) => {
		let paths: Array<string> = [];
		for (let x = 0; x < files.length; x++) {
			const str = files[x].substring(files[x].length - 3, files[x].length);
			if (str === 'wlt') {
				paths.push(files[x]);
			}
		}
		walletPaths = paths;
		if (onLoaded) {
			onLoaded();
		}
	});
};

const main = async () => {
	if (args[0] === 'wallet') {
		if (args[1] === 'create') {
			pwd();
		} else if (args[1] === 'list') {
			await listWallets();
		} else if (args[1] === 'select') {

		}
	}
};

loadWalletPaths();
main();

process.on('uncaughtException', function(_) {
	console.log('Wallet closed');
	process.exit(1);
});