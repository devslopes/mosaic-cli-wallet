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
const child_process = require("child_process");
const colors_1 = require("colors");
const safe_1 = require("colors/safe");
const nem_library_1 = require("nem-library");
const wallet_1 = require("../src/wallet/wallet");
const CFonts = require('cfonts');
const cli_spinner_1 = require("cli-spinner");
const args = process.argv.slice(2);
const homePath = `${os.homedir()}/cache-wallets`;
let defaultWalletPath;
let selectedAccount;
if (args.length === 0) {
    CFonts.say('Cache', { colors: ['cyan'] });
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
const downloadWallet = (wallet, address) => {
    console.log(colors_1.white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
    const addAbb = address.substring(0, 6);
    const stamp = new Date().toISOString().substring(0, 10);
    if (!fs.existsSync(homePath)) {
        fs.mkdirSync(homePath);
    }
    const path = `${homePath}/${addAbb}-${stamp}-cache.wlt`;
    fs.writeFile(path, wallet.writeWLTFile(), (_) => {
        console.log(safe_1.green(`\nDownloaded wallet to ${path}\n`));
    });
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
            yield downloadWallet(wallet, address);
        }
    }));
};
const listWallets = () => {
    console.log(colors_1.white('Fetching wallets...\n'));
    loadWalletPaths(paths => {
        if (paths.length === 0) {
            console.log(colors_1.white(`No wallets found. Create a new wallet or place an existing .wlt file
in ${homePath}\n`));
            process.exit(1);
        }
        for (let x = 0; x < paths.length; x++) {
            console.log(`${x} - ${paths[x]}`);
        }
        console.log('\n');
    });
};
const loadWalletPaths = (onLoaded) => {
    fs.readdir(homePath, (_, files) => {
        let paths = [];
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
            const pass = new nem_library_1.Password(result);
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
    loadWalletPaths(_ => { });
    child_process.execSync('sleep 1');
    const fullPath = `${homePath}/${defaultWalletPath}`;
    const contents = fs.readFileSync(fullPath);
    return nem_library_1.SimpleWallet.readFromWLT(contents);
};
const getBalance = (onBalance) => __awaiter(this, void 0, void 0, function* () {
    const wallet = loadWallet();
    try {
        const account = yield attemptWalletOpen(wallet);
        selectedAccount = account;
        console.log('\n');
        const spinner = new cli_spinner_1.Spinner(safe_1.yellow('Fetching balance... %s'));
        spinner.setSpinnerString(0);
        spinner.start();
        const cacheMosaic = yield wallet_1.getAccountBalance(account);
        const balance = cacheMosaic ? cacheMosaic.quantity : 0;
        spinner.stop();
        const bal = (balance / 1e6).toString();
        console.log('\n');
        console.log(`\n${colors_1.white('Cache Balance:')} ${colors_1.white(bal)}\n`);
        onBalance(balance / 1e6);
    }
    catch (err) {
        if (err) {
            console.log(err);
        }
        getBalance(_ => { });
    }
});
const setDefaultWallet = (walletIndex) => {
    loadWalletPaths(paths => {
        if (paths[walletIndex].includes('default'))
            return;
        for (let x = 0; x < paths.length; x++) {
            let newPath = paths[x].replace('default-', '');
            newPath = `${homePath}/${newPath}`;
            fs.rename(`${homePath}/${paths[x]}`, newPath, (_) => { });
        }
        setTimeout(() => {
            fs.rename(`${homePath}/${paths[walletIndex]}`, `${homePath}/default-${paths[walletIndex]}`);
        }, 800);
    });
};
const isDefaultWallet = () => {
    if (!defaultWalletPath) {
        console.log(safe_1.yellow(`\nYou must first set a default wallet. Run ${colors_1.white('cache wallet list')} then ${colors_1.white('cache wallet default <number>')}\n`));
        return false;
    }
    return true;
};
const main = () => {
    loadWalletPaths(paths => {
        if (args[0] === 'wallet') {
            if (args[1] === 'create') {
                createPwd();
            }
            else if (args[1] === 'balance') {
                if (isDefaultWallet()) {
                    getBalance(_ => { });
                }
            }
            else if (args[1] === 'list') {
                listWallets();
            }
            else if (args[1] === 'default') {
                const idx = parseInt(args[2]);
                if (isNaN(idx)) {
                    console.log(safe_1.red('Invalid wallet index. Must be an Integer'));
                }
                else {
                    if (idx >= 0 && idx < paths.length) {
                        setDefaultWallet(idx);
                    }
                    else {
                        console.log(safe_1.red('Invalid wallet selection'));
                    }
                }
            }
            else if (args[1] === 'send') {
                if (!isDefaultWallet())
                    return;
                getBalance((balance) => __awaiter(this, void 0, void 0, function* () {
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
                        const result = yield wallet_1.sendCache(address, amt, selectedAccount);
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                }));
            }
        }
    });
};
main();
process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('Wallet closed');
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0MsbUNBQStCO0FBQy9CLHNDQUEwRDtBQUMxRCw2Q0FBOEQ7QUFDOUQsaURBQXdGO0FBQ3hGLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw2Q0FBc0M7QUFHdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDO0FBQ2pELElBQUksaUJBQXlCLENBQUM7QUFDOUIsSUFBSSxlQUF3QixDQUFDO0FBRTdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JYLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBb0IsRUFBRSxPQUFlLEVBQUUsRUFBRTtJQUNoRSxPQUFPLENBQUMsR0FBRyxD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LEVBQUUsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDO3dCQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixDQUFDO29CQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbEIsQ0FBQztnQkFDRixDQUFDLENBQUEsQ0FBQyxDQUFDO1lBQ0osQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGLElBQUksRUFBRSxDQUFDO0FBRVAsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFTLEdBQUc7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5jb25zdCBwcm9tcHQgPSByZXF1aXJlKCdwcm9tcHQnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IGNoaWxkX3Byb2Nlc3MgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcbmltcG9ydCB7IHdoaXRlIH0gZnJvbSAnY29sb3JzJztcbmltcG9ydCB7IGdyZWVuLCBtYWdlbnRhLCByZWQsIHllbGxvdyB9IGZyb20gJ2NvbG9ycy9zYWZlJztcbmltcG9ydCB7IFBhc3N3b3JkLCBTaW1wbGVXYWxsZXQsIEFjY291bnQgfSBmcm9tICduZW0tbGlicmFyeSc7XG5pbXBvcnQgeyBjcmVhdGVTaW1wbGVXYWxsZXQsIGdldEFjY291bnRCYWxhbmNlLCBzZW5kQ2FjaGUgfSBmcm9tICcuLi9zcmMvd2FsbGV0L3dhbGxldCc7XG5jb25zdCBDRm9udHMgPSByZXF1aXJlKCdjZm9udHMnKTtcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICdjbGktc3Bpbm5lcic7XG5cbmRlY2xhcmUgbGV0IHByb2Nlc3M6IGFueTtcbmNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7XG5jb25zdCBob21lUGF0aCA9IGAke29zLmhvbWVkaXIoKX0vY2FjaGUtd2FsbGV0c2A7XG5sZXQgZGVmYXVsdFdhbGxldFBhdGg6IHN0cmluZztcbmxldCBzZWxlY3RlZEFjY291bnQ6IEFjY291bnQ7XG5cbmlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuXHRDRm9udHMuc2F5KCdDYWNoZScsIHsgY29sb3JzOiBbJ2N5YW4nXX0pO1xuXHRjb25zb2xlLmxvZyhgVXNhZ2U6XG5cblx0Y2FjaGUgd2FsbGV0IGxpc3Rcblx0XHRMaXN0cyBhbGwgb2YgdGhlIHdhbGxldHMgYXZhaWxhYmxlIGluIHlvdXIgY2FjaGUtd2FsbGV0cyBkaXJlY3Rvcnlcblx0XG5cdGNhY2hlIHdhbGxldCBkZWZhdWx0IDxudW1iZXI+XG5cdFx0Q2hvb3NlIHRoZSB3YWxsZXQgeW91IHdhbnQgdG8gc2V0IGFzIGRlZmF1bHQgaWUgJ2NhY2hlIHdhbGxldCBkZWZhdWx0IDMnXG5cdFxuXHRjYWNoZSBiYWxhbmNlXG5cdFx0R2V0cyB5b3VyIGN1cnJlbnQgd2FsbGV0IGJhbGFuY2UgYW5kIHB1YmxpYyBhZGRyZXNzXG5cdFxuXHRjYWNoZSBzZW5kIDxhbW91bnQ+IDxhZGRyZXNzPlxuXHRcdFNlbmRzIGNhY2hlIGZyb20geW91ciB3YWxsZXQgdG8gdGhlIHNwZWNpZmllZCBhZGRyZXNzXG5cdFxuXHRjYWNoZSB3YWxsZXQgY3JlYXRlXG5cdFx0R3VpZGVzIHlvdSB0aHJvdWdoIGNyZWF0aW5nIGEgbmV3IGNhY2hlIHdhbGxldFxuXHRgKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufVxuXG5jb25zdCBkb3dubG9hZFdhbGxldCA9ICh3YWxsZXQ6IFNpbXBsZVdhbGxldCwgYWRkcmVzczogc3RyaW5nKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5cXG5Eb3dubG9hZGluZyB3YWxsZXQgZm9yIHlvdXIgY29udmVuaWVuY2UuXFxuXFxuUGxlYXNlIHN0b3JlIHNvbWVwbGFjZSBzYWZlLiBUaGUgcHJpdmF0ZSBrZXkgaXMgZW5jcnlwdGVkIGJ5IHlvdXIgcGFzc3dvcmQuXFxuXFxuVG8gbG9hZCB0aGlzIHdhbGxldCBvbiBhIG5ldyBjb21wdXRlciB5b3Ugd291bGQgc2ltcGx5IGltcG9ydCB0aGUgLndsdCBmaWxlIGludG8gdGhpcyBhcHAgYW5kIGVudGVyIHlvdXIgcGFzc3dvcmQgYW5kIHlvdSdsbCBiZSBhYmxlIHRvIHNpZ24gdHJhbnNhY3Rpb25zLlxuXHRgKSk7XG5cdGNvbnN0IGFkZEFiYiA9IGFkZHJlc3Muc3Vic3RyaW5nKDAsNik7XG5cdGNvbnN0IHN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLDEwKTtcblxuXHRpZiAoIWZzLmV4aXN0c1N5bmMoaG9tZVBhdGgpKSB7XG5cdFx0ZnMubWtkaXJTeW5jKGhvbWVQYXRoKTtcblx0fVxuXHRjb25zdCBwYXRoID0gYCR7aG9tZVBhdGh9LyR7YWRkQWJifS0ke3N0YW1wfS1jYWNoZS53bHRgO1xuXHRmcy53cml0ZUZpbGUocGF0aCwgd2FsbGV0LndyaXRlV0xURmlsZSgpLCAoXykgPT4ge1xuXHRcdGNvbnNvbGUubG9nKGdyZWVuKGBcXG5Eb3dubG9hZGVkIHdhbGxldCB0byAke3BhdGh9XFxuYCkpO1xuXHR9KTtcbn07XG5cbmNvbnN0IGNyZWF0ZVB3ZCA9ICgpID0+IHtcblx0Y29uc29sZS5sb2cod2hpdGUoXG5gXFxuUGxlYXNlIGVudGVyIGEgdW5pcXVlIHBhc3N3b3JkICR7eWVsbG93KCcoOCBjaGFyYWN0ZXIgbWluaW11bSknKX0uXFxuIFxuVGhpcyBwYXNzd29yZCB3aWxsIGJlIHVzZWQgdG8gZW5jcnlwdCB5b3VyIHByaXZhdGUga2V5IGFuZCBtYWtlIHdvcmtpbmcgd2l0aCB5b3VyIHdhbGxldCBlYXNpZXIuXFxuXFxuYFxuXHQpKTtcblx0Y29uc29sZS5sb2cocmVkKFxuXHRcdGBTdG9yZSB0aGlzIHBhc3N3b3JkIHNvbWV3aGVyZSBzYWZlLiBJZiB5b3UgbG9zZSBvciBmb3JnZXQgaXQgeW91IHdpbGwgbmV2ZXIgYmUgYWJsZSB0byB0cmFuc2ZlciBmdW5kc1xcbmBcblx0KSk7XG5cdHByb21wdC5tZXNzYWdlID0gd2hpdGUoJ0NhY2hlIFdhbGxldCcpO1xuXHRwcm9tcHQuc3RhcnQoKTtcblx0cHJvbXB0LmdldCh7XG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0cGFzc3dvcmQ6IHtcblx0XHRcdFx0ZGVzY3JpcHRpb246IHdoaXRlKCdQYXNzd29yZCcpLFxuXHRcdFx0XHRoaWRkZW46IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjb25maXJtUGFzczoge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1JlLWVudGVyIHBhc3N3b3JkJyksXG5cdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0fSwgYXN5bmMgKF8sIHJlc3VsdCkgPT4ge1xuXHRcdGlmIChyZXN1bHQucGFzc3dvcmQgIT09IHJlc3VsdC5jb25maXJtUGFzcykge1xuXHRcdFx0Y29uc29sZS5sb2cobWFnZW50YSgnXFxuUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC5cXG5cXG4nKSk7XG5cdFx0XHRjcmVhdGVQd2QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgd2FsbGV0ID0gY3JlYXRlU2ltcGxlV2FsbGV0KHJlc3VsdC5wYXNzd29yZCk7XG5cdFx0XHRjb25zdCBwYXNzID0gbmV3IFBhc3N3b3JkKHJlc3VsdC5wYXNzd29yZCk7XG5cdFx0XHRjb25zdCBhY2NvdW50ID0gd2FsbGV0Lm9wZW4ocGFzcyk7XG5cdFx0XHRjb25zdCBhZGRyZXNzID0gYWNjb3VudC5hZGRyZXNzLnByZXR0eSgpO1xuXHRcdFx0Y29uc29sZS5sb2coZ3JlZW4oJ1xcbkNhY2hlIHdhbGxldCBzdWNjZXNzZnVsbHkgY3JlYXRlZC5cXG4nKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnWW91IGNhbiBub3cgc3RhcnQgc2VuZGluZyBhbmQgcmVjZWl2aW5nIGNhY2hlIVxcbicpKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5DYWNoZSBQdWJsaWMgQWRkcmVzczpgKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh5ZWxsb3coYCR7YWRkcmVzc31gKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZShgXFxuUHJpdmF0ZSBLZXk6YCkpO1xuXHRcdFx0Y29uc29sZS5sb2coeWVsbG93KGAke2FjY291bnQucHJpdmF0ZUtleX1gKSk7XG5cdFx0XHRhd2FpdCBkb3dubG9hZFdhbGxldCh3YWxsZXQsIGFkZHJlc3MpO1xuXHRcdH1cblx0fSlcbn07XG5cbmNvbnN0IGxpc3RXYWxsZXRzID0gKCkgPT4ge1xuXHRjb25zb2xlLmxvZyh3aGl0ZSgnRmV0Y2hpbmcgd2FsbGV0cy4uLlxcbicpKTtcblxuXHRsb2FkV2FsbGV0UGF0aHMocGF0aHMgPT4ge1xuXHRcdGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBObyB3YWxsZXRzIGZvdW5kLiBDcmVhdGUgYSBuZXcgd2FsbGV0IG9yIHBsYWNlIGFuIGV4aXN0aW5nIC53bHQgZmlsZVxuaW4gJHtob21lUGF0aH1cXG5gKSk7XG5cdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXHRcdGZvciAobGV0IHggPSAwOyB4IDwgcGF0aHMubGVuZ3RoOyB4KyspIHtcblx0XHRcdGNvbnNvbGUubG9nKGAke3h9IC0gJHtwYXRoc1t4XX1gKTtcblx0XHR9XG5cdFx0Y29uc29sZS5sb2coJ1xcbicpXG5cdH0pO1xufTtcblxuY29uc3QgbG9hZFdhbGxldFBhdGhzID0gKG9uTG9hZGVkOiAocGF0aHM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQpID0+IHtcblx0ZnMucmVhZGRpcihob21lUGF0aCwgKF8sIGZpbGVzKSA9PiB7XG5cdFx0bGV0IHBhdGhzOiBBcnJheTxzdHJpbmc+ID0gW107XG5cdFx0Zm9yIChsZXQgeCA9IDA7IHggPCBmaWxlcy5sZW5ndGg7IHgrKykge1xuXHRcdFx0aWYgKGZpbGVzW3hdLmluY2x1ZGVzKCdkZWZhdWx0JykpIHtcblx0XHRcdFx0ZGVmYXVsdFdhbGxldFBhdGggPSBmaWxlc1t4XTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHN0ciA9IGZpbGVzW3hdLnN1YnN0cmluZyhmaWxlc1t4XS5sZW5ndGggLSAzLCBmaWxlc1t4XS5sZW5ndGgpO1xuXHRcdFx0aWYgKHN0ciA9PT0gJ3dsdCcpIHtcblx0XHRcdFx0cGF0aHMucHVzaChmaWxlc1t4XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG9uTG9hZGVkKHBhdGhzKTtcblx0fSk7XG59O1xuY29uc3QgYXR0ZW1wdFdhbGxldE9wZW4gPSAod2FsbGV0OiBTaW1wbGVXYWxsZXQpOiBQcm9taXNlPEFjY291bnQ+ID0+IHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPEFjY291bnQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRwcm9tcHQubWVzc2FnZSA9IHdoaXRlKCdXYWxsZXQgTG9naW4nKTtcblx0XHRwcm9tcHQuc3RhcnQoKTtcblx0XHRwcm9tcHQuZ2V0KHtcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0cGFzc3dvcmQ6IHtcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1Bhc3N3b3JkJyksXG5cdFx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCAoXywgcmVzdWx0KSA9PiB7XG5cdFx0XHRjb25zdCBwYXNzID0gbmV3IFBhc3N3b3JkKHJlc3VsdCk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXNvbHZlKHdhbGxldC5vcGVuKHBhc3MpKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoYCR7ZXJyfWApKTtcblx0XHRcdFx0Y29uc29sZS5sb2cod2hpdGUoJ1BsZWFzZSB0cnkgYWdhaW4nKSk7XG5cdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn07XG5jb25zdCBsb2FkV2FsbGV0ID0gKCk6IFNpbXBsZVdhbGxldCA9PiB7XG5cdGxvYWRXYWxsZXRQYXRocyhfID0+IHt9KTtcblx0Y2hpbGRfcHJvY2Vzcy5leGVjU3luYygnc2xlZXAgMScpO1xuXHRjb25zdCBmdWxsUGF0aCA9IGAke2hvbWVQYXRofS8ke2RlZmF1bHRXYWxsZXRQYXRofWA7XG5cdGNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoKTtcblx0cmV0dXJuIFNpbXBsZVdhbGxldC5yZWFkRnJvbVdMVChjb250ZW50cyk7XG59O1xuY29uc3QgZ2V0QmFsYW5jZSA9IGFzeW5jIChvbkJhbGFuY2U6IChiYWxhbmNlOiBudW1iZXIpID0+IHZvaWQpID0+IHtcblx0Y29uc3Qgd2FsbGV0ID0gbG9hZFdhbGxldCgpO1xuXHR0cnkge1xuXHRcdGNvbnN0IGFjY291bnQgPSBhd2FpdCBhdHRlbXB0V2FsbGV0T3Blbih3YWxsZXQpO1xuXHRcdHNlbGVjdGVkQWNjb3VudCA9IGFjY291bnQ7XG5cdFx0Y29uc29sZS5sb2coJ1xcbicpO1xuXHRcdGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcih5ZWxsb3coJ0ZldGNoaW5nIGJhbGFuY2UuLi4gJXMnKSk7XG5cdFx0c3Bpbm5lci5zZXRTcGlubmVyU3RyaW5nKDApO1xuXHRcdHNwaW5uZXIuc3RhcnQoKTtcblx0XHRjb25zdCBjYWNoZU1vc2FpYyA9IGF3YWl0IGdldEFjY291bnRCYWxhbmNlKGFjY291bnQpO1xuXHRcdGNvbnN0IGJhbGFuY2UgPSBjYWNoZU1vc2FpYyA/IGNhY2hlTW9zYWljLnF1YW50aXR5IDogMDtcblx0XHRzcGlubmVyLnN0b3AoKTtcblx0XHRjb25zdCBiYWwgPSAoYmFsYW5jZSAvIDFlNikudG9TdHJpbmcoKTtcblx0XHRjb25zb2xlLmxvZygnXFxuJyk7XG5cdFx0Y29uc29sZS5sb2coYFxcbiR7d2hpdGUoJ0NhY2hlIEJhbGFuY2U6Jyl9ICR7d2hpdGUoYmFsKX1cXG5gKTtcblx0XHRvbkJhbGFuY2UoYmFsYW5jZSAvIDFlNik7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0fVxuXHRcdGdldEJhbGFuY2UoXyA9PiB7fSk7XG5cdH1cbn07XG5jb25zdCBzZXREZWZhdWx0V2FsbGV0ID0gKHdhbGxldEluZGV4OiBudW1iZXIpID0+IHtcblx0bG9hZFdhbGxldFBhdGhzKHBhdGhzID0+IHtcblx0XHRpZiAocGF0aHNbd2FsbGV0SW5kZXhdLmluY2x1ZGVzKCdkZWZhdWx0JykpIHJldHVybjtcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IHBhdGhzLmxlbmd0aDsgeCsrKSB7XG5cdFx0XHRsZXQgbmV3UGF0aCA9IHBhdGhzW3hdLnJlcGxhY2UoJ2RlZmF1bHQtJywnJyk7XG5cdFx0XHRuZXdQYXRoID0gYCR7aG9tZVBhdGh9LyR7bmV3UGF0aH1gO1xuXHRcdFx0ZnMucmVuYW1lKGAke2hvbWVQYXRofS8ke3BhdGhzW3hdfWAsIG5ld1BhdGgsIChfKSA9PiB7fSk7XG5cdFx0fVxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0ZnMucmVuYW1lKGAke2hvbWVQYXRofS8ke3BhdGhzW3dhbGxldEluZGV4XX1gLCBgJHtob21lUGF0aH0vZGVmYXVsdC0ke3BhdGhzW3dhbGxldEluZGV4XX1gKVxuXHRcdH0sIDgwMCk7XG5cdH0pO1xufTtcbmNvbnN0IGlzRGVmYXVsdFdhbGxldCA9ICgpOiBib29sZWFuID0+IHtcblx0aWYgKCFkZWZhdWx0V2FsbGV0UGF0aCkge1xuXHRcdGNvbnNvbGUubG9nKHllbGxvdyhgXFxuWW91IG11c3QgZmlyc3Qgc2V0IGEgZGVmYXVsdCB3YWxsZXQuIFJ1biAke3doaXRlKCdjYWNoZSB3YWxsZXQgbGlzdCcpfSB0aGVuICR7d2hpdGUoJ2NhY2hlIHdhbGxldCBkZWZhdWx0IDxudW1iZXI+Jyl9XFxuYCkpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5jb25zdCBtYWluID0gKCkgPT4ge1xuXHRsb2FkV2FsbGV0UGF0aHMocGF0aHMgPT4ge1xuXHRcdGlmIChhcmdzWzBdID09PSAnd2FsbGV0Jykge1xuXHRcdFx0aWYgKGFyZ3NbMV0gPT09ICdjcmVhdGUnKSB7XG5cdFx0XHRcdGNyZWF0ZVB3ZCgpO1xuXHRcdFx0fSBlbHNlIGlmIChhcmdzWzFdID09PSAnYmFsYW5jZScpIHtcblx0XHRcdFx0aWYgKGlzRGVmYXVsdFdhbGxldCgpKSB7XG5cdFx0XHRcdFx0Z2V0QmFsYW5jZShfID0+IHt9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhcmdzWzFdID09PSAnbGlzdCcpIHtcblx0XHRcdFx0bGlzdFdhbGxldHMoKTtcblx0XHRcdH0gZWxzZSBpZiAoYXJnc1sxXSA9PT0gJ2RlZmF1bHQnKSB7XG5cdFx0XHRcdGNvbnN0IGlkeCA9IHBhcnNlSW50KGFyZ3NbMl0pO1xuXHRcdFx0XHRpZiAoaXNOYU4oaWR4KSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlZCgnSW52YWxpZCB3YWxsZXQgaW5kZXguIE11c3QgYmUgYW4gSW50ZWdlcicpKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChpZHggPj0gMCAmJiBpZHggPCBwYXRocy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHNldERlZmF1bHRXYWxsZXQoaWR4KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVkKCdJbnZhbGlkIHdhbGxldCBzZWxlY3Rpb24nKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYXJnc1sxXSA9PT0gJ3NlbmQnKSB7XG5cdFx0XHRcdGlmICghaXNEZWZhdWx0V2FsbGV0KCkpIHJldHVybjtcblx0XHRcdFx0Z2V0QmFsYW5jZShhc3luYyAoYmFsYW5jZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFtdCA9IHBhcnNlRmxvYXQoYXJnc1syXSk7XG5cdFx0XHRcdFx0Y29uc3QgYWRkcmVzcyA9IGFyZ3NbM107XG5cdFx0XHRcdFx0aWYgKGlzTmFOKGFtdCkpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlZCgnTXVzdCBwcm92aWRlIGEgdmFsaWQgbnVtYmVyIHdpdGggbWF4aW11bSBvZiA2IGRpZ2l0cyBpZSAxMC4zNTY3ODQnKSk7XG5cdFx0XHRcdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghYWRkcmVzcykge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVkKCdNdXN0IHByb3ZpZGUgYSB2YWxpZCByZWNpcGllbnQgYWRkcmVzcycpKTtcblx0XHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgIChhbXQgPiBiYWxhbmNlKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoYFlvdSBkb24ndCBoYXZlIGVub3VnaCBjYWNoZSB0byBzZW5kYCkpO1xuXHRcdFx0XHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgc2VuZENhY2hlKGFkZHJlc3MsIGFtdCwgc2VsZWN0ZWRBY2NvdW50KTtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3VsdCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1haW4oKTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbihlcnIpIHtcblx0Y29uc29sZS5sb2coZXJyKTtcblx0Y29uc29sZS5sb2coJ1dhbGxldCBjbG9zZWQnKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufSk7Il19