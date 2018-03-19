#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt = require('prompt');
const fs = require('fs');
const os = require('os');
const colors_1 = require("colors");
const safe_1 = require("colors/safe");
const nem_library_1 = require("nem-library");
const wallet_1 = require("../src/wallet/wallet");
const CFonts = require('cfonts');
const cli_spinner_1 = require("cli-spinner");
const args = process.argv.slice(2);
const PATH_HOME = `${os.homedir()}/cache-wallets`;
const PATH_WALLET = `${PATH_HOME}/cache-wallet.wlt`;
let selectedAccount;
if (args.length === 0) {
    CFonts.say('Cache', { colors: ['cyan'] });
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
const downloadWallet = (wallet) => {
    console.log(colors_1.white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
    if (!fs.existsSync(PATH_HOME)) {
        fs.mkdirSync(PATH_HOME);
    }
    let fullPath = PATH_WALLET;
    if (fs.existsSync(fullPath)) {
        const stamp = new Date().toISOString();
        fullPath = `${PATH_HOME}/${stamp}-cache-wallet.wlt`;
    }
    fs.writeFileSync(fullPath, wallet.writeWLTFile());
    console.log(safe_1.green(`Downloaded wallet to ${fullPath}`));
};
const createPwd = () => {
    console.log(colors_1.white(`\nPlease enter a unique password ${safe_1.yellow('(8 character minimum)')}.\n 
This password will be used to encrypt your private key and make working with your wallet easier.\n\n`));
    console.log(safe_1.red(`Store this password somewhere safe. If you lose or forget it you will never be able to transfer funds\n`));
    prompt.message = colors_1.white('Cache Wallet');
    prompt.start();
    prompt.get({
        properties: {
            password: {
                description: colors_1.white('Password'),
                hidden: true
            },
            confirmPass: {
                description: colors_1.white('Re-enter password'),
                hidden: true
            }
        }
    }, (_, result) => __awaiter(this, void 0, void 0, function* () {
        if (result.password !== result.confirmPass) {
            console.log(safe_1.magenta('\nPasswords do not match.\n\n'));
            createPwd();
        }
        else {
            const wallet = wallet_1.createSimpleWallet(result.password);
            const pass = new nem_library_1.Password(result.password);
            const account = wallet.open(pass);
            const address = account.address.pretty();
            console.log(safe_1.green('\nCache wallet successfully created.\n'));
            console.log(colors_1.white('You can now start sending and receiving cache!\n'));
            console.log(colors_1.white(`\nCache Public Address:`));
            console.log(safe_1.yellow(`${address}`));
            console.log(colors_1.white(`\nPrivate Key:`));
            console.log(safe_1.yellow(`${account.privateKey}`));
            yield downloadWallet(wallet);
        }
    }));
};
const attemptWalletOpen = (wallet) => {
    return new Promise((resolve, reject) => {
        prompt.message = colors_1.white('Wallet Login');
        prompt.start();
        prompt.get({
            properties: {
                password: {
                    description: colors_1.white('Password'),
                    hidden: true
                }
            }
        }, (_, result) => {
            const pass = new nem_library_1.Password(result.password);
            try {
                resolve(wallet.open(pass));
            }
            catch (err) {
                console.log(safe_1.red(`${err}`));
                console.log(colors_1.white('Please try again'));
                reject();
            }
        });
    });
};
const loadWallet = () => {
    const contents = fs.readFileSync(PATH_WALLET);
    return nem_library_1.SimpleWallet.readFromWLT(contents);
};
const printBalance = (onBalance) => __awaiter(this, void 0, void 0, function* () {
    const wallet = loadWallet();
    try {
        const account = yield attemptWalletOpen(wallet);
        selectedAccount = account;
        console.log('\n');
        const spinner = new cli_spinner_1.Spinner(safe_1.yellow('Fetching balance... %s'));
        spinner.setSpinnerString(0);
        spinner.start();
        const balances = yield wallet_1.getAccountBalances(account);
        const cache = yield wallet_1.cacheBalance(balances);
        const xem = yield wallet_1.xemBalance(balances);
        spinner.stop();
        const bal = (cache / 1e6).toString();
        const xemBal = (xem / 1e6).toString();
        console.log('\n');
        console.log(`\n${colors_1.white('XEM Balance:')} ${colors_1.white(xemBal)}`);
        console.log(`\n${colors_1.white('Cache Balance:')} ${colors_1.white(bal)}\n`);
        onBalance(cache / 1e6);
    }
    catch (err) {
        if (err) {
            console.log(err);
        }
    }
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    if (args[0] === 'wallet') {
        if (args[1] === 'create') {
            return createPwd();
        }
        if (!fs.existsSync(PATH_WALLET)) {
            console.log(safe_1.red(`Cannot find default wallet. Please place a file named ${colors_1.white('cache-wallet.wlt')} at this location: ${PATH_WALLET}`));
            process.exit(1);
        }
        if (args[1] === 'balance') {
            yield printBalance(_ => { });
        }
        else if (args[1] === 'send') {
            yield printBalance((balance) => __awaiter(this, void 0, void 0, function* () {
                const amt = parseFloat(args[2]);
                const address = args[3];
                if (isNaN(amt)) {
                    console.log(safe_1.red('Must provide a valid number with maximum of 6 digits ie 10.356784'));
                    process.exit(1);
                }
                if (!address) {
                    console.log(safe_1.red('Must provide a valid recipient address'));
                    process.exit(1);
                }
                if (amt > balance) {
                    console.log(safe_1.red(`You don't have enough cache to send`));
                    process.exit(1);
                }
                try {
                    const preTransaction = yield wallet_1.prepareTransfer(address, amt);
                    const xemFee = (preTransaction.fee / 1e6).toString();
                    console.log(colors_1.white('Transaction Details: \n'));
                    console.log(`Recipient:          ${safe_1.yellow(address)}\n`);
                    console.log(`Cache to send:      ${safe_1.yellow(amt.toString())}\n`);
                    console.log(`XEM Fee:            ${safe_1.yellow(xemFee)}\n\n`);
                    console.log(`${colors_1.white('Would you like to proceed?\n')}`);
                    prompt.message = colors_1.white('Cache Transfer');
                    prompt.start();
                    prompt.get({
                        properties: {
                            confirmation: {
                                description: safe_1.yellow('Proceed? ( y/n )')
                            }
                        }
                    }, (_, result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.confirmation.toLowerCase() === 'y' || result.confirmation.toLowerCase() === 'yes') {
                            try {
                                const result = yield wallet_1.sendCache(address, amt, selectedAccount);
                                console.log(result);
                                console.log('\n\n');
                                console.log(colors_1.white('Transaction successfully announced to the NEM blockchain. Transaction could take some time. Come back here in 5 minutes to check your balance to ensure that the transaction was successfully sent\n'));
                            }
                            catch (err) {
                                console.log(safe_1.red(err));
                            }
                        }
                        else {
                            console.log('Transaction canceled');
                            process.exit(1);
                        }
                    }));
                }
                catch (err) {
                    console.log(`\n${err}\n`);
                }
            }));
        }
    }
});
main();
process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('Wallet closed');
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixtQ0FBK0I7QUFDL0Isc0NBQTBEO0FBQzFELDZDQUE4RDtBQUM5RCxpREFHOEI7QUFDOUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLDZDQUFzQztBQUd0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUM7QUFDbEQsTUFBTSxXQUFXLEdBQUcsR0FBRyxTQUFTLG1CQUFtQixDQUFDO0FBQ3BELElBQUksZUFBd0IsQ0FBQztBQUU3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7Ozs7Ozs7OztFQVVYLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQU9ELE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBb0IsRUFBRSxFQUFFO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDO0VBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBRUosRUFB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QUFHLENBQUMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZCLENBQUM7d0JBQ0YsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7NEJBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pCLENBQUM7b0JBQ0YsQ0FBQyxDQUFBLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7WUFDRixDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0osQ0FBQztJQUNGLENBQUM7QUFDRixDQUFDLENBQUEsQ0FBQztBQUVGLElBQUksRUFBRSxDQUFDO0FBRVAsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFTLEdBQUc7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5jb25zdCBwcm9tcHQgPSByZXF1aXJlKCdwcm9tcHQnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmltcG9ydCB7IHdoaXRlIH0gZnJvbSAnY29sb3JzJztcbmltcG9ydCB7IGdyZWVuLCBtYWdlbnRhLCByZWQsIHllbGxvdyB9IGZyb20gJ2NvbG9ycy9zYWZlJztcbmltcG9ydCB7IFBhc3N3b3JkLCBTaW1wbGVXYWxsZXQsIEFjY291bnQgfSBmcm9tICduZW0tbGlicmFyeSc7XG5pbXBvcnQge1xuXHRjYWNoZUJhbGFuY2UsIGNyZWF0ZVNpbXBsZVdhbGxldCwgZ2V0QWNjb3VudEJhbGFuY2VzLCBwcmVwYXJlVHJhbnNmZXIsIHNlbmRDYWNoZSxcblx0eGVtQmFsYW5jZVxufSBmcm9tICcuLi9zcmMvd2FsbGV0L3dhbGxldCc7XG5jb25zdCBDRm9udHMgPSByZXF1aXJlKCdjZm9udHMnKTtcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICdjbGktc3Bpbm5lcic7XG5cbmRlY2xhcmUgbGV0IHByb2Nlc3M6IGFueTtcbmNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7XG5jb25zdCBQQVRIX0hPTUUgPSBgJHtvcy5ob21lZGlyKCl9L2NhY2hlLXdhbGxldHNgO1xuY29uc3QgUEFUSF9XQUxMRVQgPSBgJHtQQVRIX0hPTUV9L2NhY2hlLXdhbGxldC53bHRgO1xubGV0IHNlbGVjdGVkQWNjb3VudDogQWNjb3VudDtcblxuaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG5cdENGb250cy5zYXkoJ0NhY2hlJywgeyBjb2xvcnM6IFsnY3lhbiddfSk7XG5cdGNvbnNvbGUubG9nKGBVc2FnZTpcblxuXHRjYWNoZSBiYWxhbmNlXG5cdFx0R2V0cyB5b3VyIGN1cnJlbnQgd2FsbGV0IGJhbGFuY2UgYW5kIHB1YmxpYyBhZGRyZXNzXG5cdFxuXHRjYWNoZSBzZW5kIDxhbW91bnQ+IDxhZGRyZXNzPlxuXHRcdFNlbmRzIGNhY2hlIGZyb20geW91ciB3YWxsZXQgdG8gdGhlIHNwZWNpZmllZCBhZGRyZXNzXG5cdFxuXHRjYWNoZSB3YWxsZXQgY3JlYXRlXG5cdFx0R3VpZGVzIHlvdSB0aHJvdWdoIGNyZWF0aW5nIGEgbmV3IGNhY2hlIHdhbGxldFxuXHRgKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7U2ltcGxlV2FsbGV0fSB3YWxsZXQgVGhlIFNpbXBsZVdhbGxldCB0byBkb3dubG9hZCB0byB0aGUgaGFyZCBkcml2ZVxuICogSWYgZGVmYXVsdCB3YWxsZXQgYWxyZWFkeSBleGlzdHMgaXQgd2lsbCBhZGQgYSB0aW1lc3RhbXAgdG8gdGhlIHdhbGxldCBwYXRoIG9mXG4gKiB0aGlzIG5ldyB3YWxsZXRcbiAqL1xuY29uc3QgZG93bmxvYWRXYWxsZXQgPSAod2FsbGV0OiBTaW1wbGVXYWxsZXQpID0+IHtcblx0Y29uc29sZS5sb2cod2hpdGUoYFxcblxcbkRvd25sb2FkaW5nIHdhbGxldCBmb3IgeW91ciBjb252ZW5pZW5jZS5cXG5cXG5QbGVhc2Ugc3RvcmUgc29tZXBsYWNlIHNhZmUuIFRoZSBwcml2YXRlIGtleSBpcyBlbmNyeXB0ZWQgYnkgeW91ciBwYXNzd29yZC5cXG5cXG5UbyBsb2FkIHRoaXMgd2FsbGV0IG9uIGEgbmV3IGNvbXB1dGVyIHlvdSB3b3VsZCBzaW1wbHkgaW1wb3J0IHRoZSAud2x0IGZpbGUgaW50byB0aGlzIGFwcCBhbmQgZW50ZXIgeW91ciBwYXNzd29yZCBhbmQgeW91J2xsIGJlIGFibGUgdG8gc2lnbiB0cmFuc2FjdGlvbnMuXG5cdGApKTtcblxuXHRpZiAoIWZzLmV4aXN0c1N5bmMoUEFUSF9IT01FKSkge1xuXHRcdGZzLm1rZGlyU3luYyhQQVRIX0hPTUUpO1xuXHR9XG5cblx0bGV0IGZ1bGxQYXRoID0gUEFUSF9XQUxMRVQ7XG5cdGlmIChmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuXHRcdGNvbnN0IHN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXHRcdGZ1bGxQYXRoID0gYCR7UEFUSF9IT01FfS8ke3N0YW1wfS1jYWNoZS13YWxsZXQud2x0YFxuXHR9XG5cdGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIHdhbGxldC53cml0ZVdMVEZpbGUoKSk7XG5cblx0Y29uc29sZS5sb2coZ3JlZW4oYERvd25sb2FkZWQgd2FsbGV0IHRvICR7ZnVsbFBhdGh9YCkpXG59O1xuXG5jb25zdCBjcmVhdGVQd2QgPSAoKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKFxuXHRcdGBcXG5QbGVhc2UgZW50ZXIgYSB1bmlxdWUgcGFzc3dvcmQgJHt5ZWxsb3coJyg4IGNoYXJhY3RlciBtaW5pbXVtKScpfS5cXG4gXG5UaGlzIHBhc3N3b3JkIHdpbGwgYmUgdXNlZCB0byBlbmNyeXB0IHlvdXIgcHJpdmF0ZSBrZXkgYW5kIG1ha2Ugd29ya2luZyB3aXRoIHlvdXIgd2FsbGV0IGVhc2llci5cXG5cXG5gXG5cdCkpO1xuXHRjb25zb2xlLmxvZyhyZWQoXG5cdFx0YFN0b3JlIHRoaXMgcGFzc3dvcmQgc29tZXdoZXJlIHNhZmUuIElmIHlvdSBsb3NlIG9yIGZvcmdldCBpdCB5b3Ugd2lsbCBuZXZlciBiZSBhYmxlIHRvIHRyYW5zZmVyIGZ1bmRzXFxuYFxuXHQpKTtcblx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZSgnQ2FjaGUgV2FsbGV0Jyk7XG5cdHByb21wdC5zdGFydCgpO1xuXHRwcm9tcHQuZ2V0KHtcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1Bhc3N3b3JkJyksXG5cdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGNvbmZpcm1QYXNzOiB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUmUtZW50ZXIgcGFzc3dvcmQnKSxcblx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBhc3luYyAoXywgcmVzdWx0KSA9PiB7XG5cdFx0aWYgKHJlc3VsdC5wYXNzd29yZCAhPT0gcmVzdWx0LmNvbmZpcm1QYXNzKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtYWdlbnRhKCdcXG5QYXNzd29yZHMgZG8gbm90IG1hdGNoLlxcblxcbicpKTtcblx0XHRcdGNyZWF0ZVB3ZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB3YWxsZXQgPSBjcmVhdGVTaW1wbGVXYWxsZXQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IHBhc3MgPSBuZXcgUGFzc3dvcmQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IGFjY291bnQgPSB3YWxsZXQub3BlbihwYXNzKTtcblx0XHRcdGNvbnN0IGFkZHJlc3MgPSBhY2NvdW50LmFkZHJlc3MucHJldHR5KCk7XG5cdFx0XHRjb25zb2xlLmxvZyhncmVlbignXFxuQ2FjaGUgd2FsbGV0IHN1Y2Nlc3NmdWxseSBjcmVhdGVkLlxcbicpKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKCdZb3UgY2FuIG5vdyBzdGFydCBzZW5kaW5nIGFuZCByZWNlaXZpbmcgY2FjaGUhXFxuJykpO1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoYFxcbkNhY2hlIFB1YmxpYyBBZGRyZXNzOmApKTtcblx0XHRcdGNvbnNvbGUubG9nKHllbGxvdyhgJHthZGRyZXNzfWApKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5Qcml2YXRlIEtleTpgKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh5ZWxsb3coYCR7YWNjb3VudC5wcml2YXRlS2V5fWApKTtcblx0XHRcdGF3YWl0IGRvd25sb2FkV2FsbGV0KHdhbGxldCk7XG5cdFx0fVxuXHR9KVxufTtcblxuY29uc3QgYXR0ZW1wdFdhbGxldE9wZW4gPSAod2FsbGV0OiBTaW1wbGVXYWxsZXQpOiBQcm9taXNlPEFjY291bnQ+ID0+IHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPEFjY291bnQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRwcm9tcHQubWVzc2FnZSA9IHdoaXRlKCdXYWxsZXQgTG9naW4nKTtcblx0XHRwcm9tcHQuc3RhcnQoKTtcblx0XHRwcm9tcHQuZ2V0KHtcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0cGFzc3dvcmQ6IHtcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1Bhc3N3b3JkJyksXG5cdFx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCAoXywgcmVzdWx0KSA9PiB7XG5cdFx0XHRjb25zdCBwYXNzID0gbmV3IFBhc3N3b3JkKHJlc3VsdC5wYXNzd29yZCk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXNvbHZlKHdhbGxldC5vcGVuKHBhc3MpKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoYCR7ZXJyfWApKTtcblx0XHRcdFx0Y29uc29sZS5sb2cod2hpdGUoJ1BsZWFzZSB0cnkgYWdhaW4nKSk7XG5cdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn07XG5jb25zdCBsb2FkV2FsbGV0ID0gKCk6IFNpbXBsZVdhbGxldCA9PiB7XG5cdGNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKFBBVEhfV0FMTEVUKTtcblx0cmV0dXJuIFNpbXBsZVdhbGxldC5yZWFkRnJvbVdMVChjb250ZW50cyk7XG59O1xuY29uc3QgcHJpbnRCYWxhbmNlID0gYXN5bmMgKG9uQmFsYW5jZTogKGJhbGFuY2U6IG51bWJlcikgPT4gdm9pZCkgPT4ge1xuXHRjb25zdCB3YWxsZXQgPSBsb2FkV2FsbGV0KCk7XG5cdHRyeSB7XG5cdFx0Y29uc3QgYWNjb3VudCA9IGF3YWl0IGF0dGVtcHRXYWxsZXRPcGVuKHdhbGxldCk7XG5cdFx0c2VsZWN0ZWRBY2NvdW50ID0gYWNjb3VudDtcblx0XHRjb25zb2xlLmxvZygnXFxuJyk7XG5cdFx0Y29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKHllbGxvdygnRmV0Y2hpbmcgYmFsYW5jZS4uLiAlcycpKTtcblx0XHRzcGlubmVyLnNldFNwaW5uZXJTdHJpbmcoMCk7XG5cdFx0c3Bpbm5lci5zdGFydCgpO1xuXHRcdGNvbnN0IGJhbGFuY2VzID0gYXdhaXQgZ2V0QWNjb3VudEJhbGFuY2VzKGFjY291bnQpO1xuXHRcdGNvbnN0IGNhY2hlID0gYXdhaXQgY2FjaGVCYWxhbmNlKGJhbGFuY2VzKTtcblx0XHRjb25zdCB4ZW0gPSBhd2FpdCB4ZW1CYWxhbmNlKGJhbGFuY2VzKTtcblx0XHRzcGlubmVyLnN0b3AoKTtcblx0XHRjb25zdCBiYWwgPSAoY2FjaGUgLyAxZTYpLnRvU3RyaW5nKCk7XG5cdFx0Y29uc3QgeGVtQmFsID0gKHhlbSAvIDFlNikudG9TdHJpbmcoKTtcblx0XHRjb25zb2xlLmxvZygnXFxuJyk7XG5cdFx0Y29uc29sZS5sb2coYFxcbiR7d2hpdGUoJ1hFTSBCYWxhbmNlOicpfSAke3doaXRlKHhlbUJhbCl9YCk7XG5cdFx0Y29uc29sZS5sb2coYFxcbiR7d2hpdGUoJ0NhY2hlIEJhbGFuY2U6Jyl9ICR7d2hpdGUoYmFsKX1cXG5gKTtcblx0XHRvbkJhbGFuY2UoY2FjaGUgLyAxZTYpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH1cblx0fVxufTtcbmNvbnN0IG1haW4gPSBhc3luYyAoKSA9PiB7XG5cdGlmIChhcmdzWzBdID09PSAnd2FsbGV0Jykge1xuXHRcdGlmIChhcmdzWzFdID09PSAnY3JlYXRlJykge1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVB3ZCgpO1xuXHRcdH1cblxuXHRcdGlmICghZnMuZXhpc3RzU3luYyhQQVRIX1dBTExFVCkpIHtcblx0XHRcdGNvbnNvbGUubG9nKHJlZChgQ2Fubm90IGZpbmQgZGVmYXVsdCB3YWxsZXQuIFBsZWFzZSBwbGFjZSBhIGZpbGUgbmFtZWQgJHt3aGl0ZSgnY2FjaGUtd2FsbGV0LndsdCcpfSBhdCB0aGlzIGxvY2F0aW9uOiAke1BBVEhfV0FMTEVUfWApKTtcblx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHRpZiAoYXJnc1sxXSA9PT0gJ2JhbGFuY2UnKSB7XG5cdFx0XHRhd2FpdCBwcmludEJhbGFuY2UoXyA9PiB7fSk7XG5cdFx0fSBlbHNlIGlmIChhcmdzWzFdID09PSAnc2VuZCcpIHtcblx0XHRcdGF3YWl0IHByaW50QmFsYW5jZShhc3luYyAoYmFsYW5jZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBhbXQgPSBwYXJzZUZsb2F0KGFyZ3NbMl0pO1xuXHRcdFx0XHRjb25zdCBhZGRyZXNzID0gYXJnc1szXTtcblx0XHRcdFx0aWYgKGlzTmFOKGFtdCkpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoJ011c3QgcHJvdmlkZSBhIHZhbGlkIG51bWJlciB3aXRoIG1heGltdW0gb2YgNiBkaWdpdHMgaWUgMTAuMzU2Nzg0JykpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWFkZHJlc3MpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoJ011c3QgcHJvdmlkZSBhIHZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJykpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAgKGFtdCA+IGJhbGFuY2UpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoYFlvdSBkb24ndCBoYXZlIGVub3VnaCBjYWNoZSB0byBzZW5kYCkpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IHByZVRyYW5zYWN0aW9uID0gYXdhaXQgcHJlcGFyZVRyYW5zZmVyKGFkZHJlc3MsIGFtdCk7XG5cdFx0XHRcdFx0Y29uc3QgeGVtRmVlID0gKHByZVRyYW5zYWN0aW9uLmZlZSAvIDFlNikudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnVHJhbnNhY3Rpb24gRGV0YWlsczogXFxuJykpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBSZWNpcGllbnQ6ICAgICAgICAgICR7eWVsbG93KGFkZHJlc3MpfVxcbmApO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBDYWNoZSB0byBzZW5kOiAgICAgICR7eWVsbG93KGFtdC50b1N0cmluZygpKX1cXG5gKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgWEVNIEZlZTogICAgICAgICAgICAke3llbGxvdyh4ZW1GZWUpfVxcblxcbmApO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGAke3doaXRlKCdXb3VsZCB5b3UgbGlrZSB0byBwcm9jZWVkP1xcbicpfWApO1xuXG5cdFx0XHRcdFx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZSgnQ2FjaGUgVHJhbnNmZXInKTtcblx0XHRcdFx0XHRwcm9tcHQuc3RhcnQoKTtcblx0XHRcdFx0XHRwcm9tcHQuZ2V0KHtcblx0XHRcdFx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0XHRcdFx0Y29uZmlybWF0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHllbGxvdygnUHJvY2VlZD8gKCB5L24gKScpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBhc3luYyAoXywgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0LmNvbmZpcm1hdGlvbi50b0xvd2VyQ2FzZSgpID09PSAneScgfHwgcmVzdWx0LmNvbmZpcm1hdGlvbi50b0xvd2VyQ2FzZSgpID09PSAneWVzJykge1xuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlbmRDYWNoZShhZGRyZXNzLCBhbXQsIHNlbGVjdGVkQWNjb3VudCk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnXFxuXFxuJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cod2hpdGUoJ1RyYW5zYWN0aW9uIHN1Y2Nlc3NmdWxseSBhbm5vdW5jZWQgdG8gdGhlIE5FTSBibG9ja2NoYWluLiBUcmFuc2FjdGlvbiBjb3VsZCB0YWtlIHNvbWUgdGltZS4gQ29tZSBiYWNrIGhlcmUgaW4gNSBtaW51dGVzIHRvIGNoZWNrIHlvdXIgYmFsYW5jZSB0byBlbnN1cmUgdGhhdCB0aGUgdHJhbnNhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50XFxuJykpO1xuXG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlZChlcnIpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ1RyYW5zYWN0aW9uIGNhbmNlbGVkJyk7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7ZXJyfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn07XG5cbm1haW4oKTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbihlcnIpIHtcblx0Y29uc29sZS5sb2coZXJyKTtcblx0Y29uc29sZS5sb2coJ1dhbGxldCBjbG9zZWQnKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufSk7Il19