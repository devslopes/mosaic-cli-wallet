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

CFonts.say('Cache', { colors: ['cyan']});
if (args.length === 0) {
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

const downloadWallet = (wallet: SimpleWallet, address: string) => {
	console.log(white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
	const addAbb = address.substring(0,6);
	const stamp = new Date().toISOString().substring(0,10);
	const homePath = `${os.homedir()}/cache-wallets`;
	if (!fs.existsSync(homePath)) {
		fs.mkdirSync(homePath);
	}
	const path = `${homePath}/${addAbb}-${stamp}-cache.wlt`;
	fs.writeFile(path, wallet.encryptedPrivateKey.encryptedKey, (_) => {
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

const main = () => {
	if (args[0] === 'wallet') {
		if (args[1] === 'create') {
			pwd();
		}
	}
};

main();

process.on('uncaughtException', function(_) {
	console.log('Wallet closed');
	process.exit(1);
});