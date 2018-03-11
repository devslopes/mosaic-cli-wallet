#!/usr/bin/env node
const prompt = require('prompt');
import { white } from 'colors';
import { blue } from 'colors/safe';

declare let process: any;
const args = process.argv.slice(2);

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
const command = args[0];
const main = () => {
	if (args[0] === 'wallet') {
		if (args[1] === 'create') {
			console.log(white('Please enter a unique password. This password will be used to encrypt your private key and make working with your wallet easier\n\n'));
			prompt.delimiter = blue('><');
			prompt.message = white('Cache Wallet:');
			prompt.start();
			prompt.get({
				properties: {
					name: {
						description: white('Password:')
					}
				}
			}, (err, result) => {
				console.log(result);
			})
		}
	}
};

main();