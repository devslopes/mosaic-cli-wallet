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
    const contents = fs.readFileSync(fullPath, 'utf8');
    return nem_library_1.SimpleWallet.readFromWLT(contents);
};
const getBalance = () => __awaiter(this, void 0, void 0, function* () {
    const wallet = loadWallet();
    try {
        const account = yield attemptWalletOpen(wallet);
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
    }
    catch (err) {
        if (err) {
            console.log(err);
        }
        getBalance();
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
const main = () => {
    loadWalletPaths(paths => {
        if (args[0] === 'wallet') {
            if (args[1] === 'create') {
                createPwd();
            }
            else if (args[1] === 'balance') {
                if (!defaultWalletPath) {
                    return console.log(safe_1.yellow(`\nYou must first set a default wallet. Run ${colors_1.white('cache wallet list')} then ${colors_1.white('cache wallet default <number>')}\n`));
                }
                getBalance();
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
        }
    });
};
main();
process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('Wallet closed');
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0MsbUNBQStCO0FBQy9CLHNDQUEwRDtBQUMxRCw2Q0FBOEQ7QUFDOUQsaURBQTZFO0FBQzdFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw2Q0FBc0M7QUFHdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDO0FBQ2pELElBQUksaUJBQXlCLENBQUM7QUFFOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQlgsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFvQixFQUFFLE9BQWUsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDO0VBQ2pCLENB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IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoJ3Byb21wdCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuY29uc3QgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpO1xuaW1wb3J0IHsgd2hpdGUgfSBmcm9tICdjb2xvcnMnO1xuaW1wb3J0IHsgZ3JlZW4sIG1hZ2VudGEsIHJlZCwgeWVsbG93IH0gZnJvbSAnY29sb3JzL3NhZmUnO1xuaW1wb3J0IHsgUGFzc3dvcmQsIFNpbXBsZVdhbGxldCwgQWNjb3VudCB9IGZyb20gJ25lbS1saWJyYXJ5JztcbmltcG9ydCB7IGNyZWF0ZVNpbXBsZVdhbGxldCwgZ2V0QWNjb3VudEJhbGFuY2UgfSBmcm9tICcuLi9zcmMvd2FsbGV0L3dhbGxldCc7XG5jb25zdCBDRm9udHMgPSByZXF1aXJlKCdjZm9udHMnKTtcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICdjbGktc3Bpbm5lcic7XG5cbmRlY2xhcmUgbGV0IHByb2Nlc3M6IGFueTtcbmNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7XG5jb25zdCBob21lUGF0aCA9IGAke29zLmhvbWVkaXIoKX0vY2FjaGUtd2FsbGV0c2A7XG5sZXQgZGVmYXVsdFdhbGxldFBhdGg6IHN0cmluZztcblxuaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG5cdENGb250cy5zYXkoJ0NhY2hlJywgeyBjb2xvcnM6IFsnY3lhbiddfSk7XG5cdGNvbnNvbGUubG9nKGBVc2FnZTpcblxuXHRjYWNoZSB3YWxsZXQgbGlzdFxuXHRcdExpc3RzIGFsbCBvZiB0aGUgd2FsbGV0cyBhdmFpbGFibGUgaW4geW91ciBjYWNoZS13YWxsZXRzIGRpcmVjdG9yeVxuXHRcblx0Y2FjaGUgd2FsbGV0IGRlZmF1bHQgPG51bWJlcj5cblx0XHRDaG9vc2UgdGhlIHdhbGxldCB5b3Ugd2FudCB0byBzZXQgYXMgZGVmYXVsdCBpZSAnY2FjaGUgd2FsbGV0IGRlZmF1bHQgMydcblx0XG5cdGNhY2hlIGJhbGFuY2Vcblx0XHRHZXRzIHlvdXIgY3VycmVudCB3YWxsZXQgYmFsYW5jZSBhbmQgcHVibGljIGFkZHJlc3Ncblx0XG5cdGNhY2hlIHNlbmQgPGFtb3VudD4gPGFkZHJlc3M+XG5cdFx0U2VuZHMgY2FjaGUgZnJvbSB5b3VyIHdhbGxldCB0byB0aGUgc3BlY2lmaWVkIGFkZHJlc3Ncblx0XG5cdGNhY2hlIHdhbGxldCBjcmVhdGVcblx0XHRHdWlkZXMgeW91IHRocm91Z2ggY3JlYXRpbmcgYSBuZXcgY2FjaGUgd2FsbGV0XG5cdGApO1xuXHRwcm9jZXNzLmV4aXQoMSk7XG59XG5cbmNvbnN0IGRvd25sb2FkV2FsbGV0ID0gKHdhbGxldDogU2ltcGxlV2FsbGV0LCBhZGRyZXNzOiBzdHJpbmcpID0+IHtcblx0Y29uc29sZS5sb2cod2hpdGUoYFxcblxcbkRvd25sb2FkaW5nIHdhbGxldCBmb3IgeW91ciBjb252ZW5pZW5jZS5cXG5cXG5QbGVhc2Ugc3RvcmUgc29tZXBsYWNlIHNhZmUuIFRoZSBwcml2YXRlIGtleSBpcyBlbmNyeXB0ZWQgYnkgeW91ciBwYXNzd29yZC5cXG5cXG5UbyBsb2FkIHRoaXMgd2FsbGV0IG9uIGEgbmV3IGNvbXB1dGVyIHlvdSB3b3VsZCBzaW1wbHkgaW1wb3J0IHRoZSAud2x0IGZpbGUgaW50byB0aGlzIGFwcCBhbmQgZW50ZXIgeW91ciBwYXNzd29yZCBhbmQgeW91J2xsIGJlIGFibGUgdG8gc2lnbiB0cmFuc2FjdGlvbnMuXG5cdGApKTtcblx0Y29uc3QgYWRkQWJiID0gYWRkcmVzcy5zdWJzdHJpbmcoMCw2KTtcblx0Y29uc3Qgc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsMTApO1xuXG5cdGlmICghZnMuZXhpc3RzU3luYyhob21lUGF0aCkpIHtcblx0XHRmcy5ta2RpclN5bmMoaG9tZVBhdGgpO1xuXHR9XG5cdGNvbnN0IHBhdGggPSBgJHtob21lUGF0aH0vJHthZGRBYmJ9LSR7c3RhbXB9LWNhY2hlLndsdGA7XG5cdGZzLndyaXRlRmlsZShwYXRoLCB3YWxsZXQud3JpdGVXTFRGaWxlKCksIChfKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coZ3JlZW4oYFxcbkRvd25sb2FkZWQgd2FsbGV0IHRvICR7cGF0aH1cXG5gKSk7XG5cdH0pO1xufTtcblxuY29uc3QgY3JlYXRlUHdkID0gKCkgPT4ge1xuXHRjb25zb2xlLmxvZyh3aGl0ZShcbmBcXG5QbGVhc2UgZW50ZXIgYSB1bmlxdWUgcGFzc3dvcmQgJHt5ZWxsb3coJyg4IGNoYXJhY3RlciBtaW5pbXVtKScpfS5cXG4gXG5UaGlzIHBhc3N3b3JkIHdpbGwgYmUgdXNlZCB0byBlbmNyeXB0IHlvdXIgcHJpdmF0ZSBrZXkgYW5kIG1ha2Ugd29ya2luZyB3aXRoIHlvdXIgd2FsbGV0IGVhc2llci5cXG5cXG5gXG5cdCkpO1xuXHRjb25zb2xlLmxvZyhyZWQoXG5cdFx0YFN0b3JlIHRoaXMgcGFzc3dvcmQgc29tZXdoZXJlIHNhZmUuIElmIHlvdSBsb3NlIG9yIGZvcmdldCBpdCB5b3Ugd2lsbCBuZXZlciBiZSBhYmxlIHRvIHRyYW5zZmVyIGZ1bmRzXFxuYFxuXHQpKTtcblx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZSgnQ2FjaGUgV2FsbGV0Jyk7XG5cdHByb21wdC5zdGFydCgpO1xuXHRwcm9tcHQuZ2V0KHtcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1Bhc3N3b3JkJyksXG5cdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGNvbmZpcm1QYXNzOiB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUmUtZW50ZXIgcGFzc3dvcmQnKSxcblx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBhc3luYyAoXywgcmVzdWx0KSA9PiB7XG5cdFx0aWYgKHJlc3VsdC5wYXNzd29yZCAhPT0gcmVzdWx0LmNvbmZpcm1QYXNzKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtYWdlbnRhKCdcXG5QYXNzd29yZHMgZG8gbm90IG1hdGNoLlxcblxcbicpKTtcblx0XHRcdGNyZWF0ZVB3ZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB3YWxsZXQgPSBjcmVhdGVTaW1wbGVXYWxsZXQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IHBhc3MgPSBuZXcgUGFzc3dvcmQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IGFjY291bnQgPSB3YWxsZXQub3BlbihwYXNzKTtcblx0XHRcdGNvbnN0IGFkZHJlc3MgPSBhY2NvdW50LmFkZHJlc3MucHJldHR5KCk7XG5cdFx0XHRjb25zb2xlLmxvZyhncmVlbignXFxuQ2FjaGUgd2FsbGV0IHN1Y2Nlc3NmdWxseSBjcmVhdGVkLlxcbicpKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKCdZb3UgY2FuIG5vdyBzdGFydCBzZW5kaW5nIGFuZCByZWNlaXZpbmcgY2FjaGUhXFxuJykpO1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoYFxcbkNhY2hlIFB1YmxpYyBBZGRyZXNzOmApKTtcblx0XHRcdGNvbnNvbGUubG9nKHllbGxvdyhgJHthZGRyZXNzfWApKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5Qcml2YXRlIEtleTpgKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh5ZWxsb3coYCR7YWNjb3VudC5wcml2YXRlS2V5fWApKTtcblx0XHRcdGF3YWl0IGRvd25sb2FkV2FsbGV0KHdhbGxldCwgYWRkcmVzcyk7XG5cdFx0fVxuXHR9KVxufTtcblxuY29uc3QgbGlzdFdhbGxldHMgPSAoKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKCdGZXRjaGluZyB3YWxsZXRzLi4uXFxuJykpO1xuXG5cdGxvYWRXYWxsZXRQYXRocyhwYXRocyA9PiB7XG5cdFx0aWYgKHBhdGhzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoYE5vIHdhbGxldHMgZm91bmQuIENyZWF0ZSBhIG5ldyB3YWxsZXQgb3IgcGxhY2UgYW4gZXhpc3RpbmcgLndsdCBmaWxlXG5pbiAke2hvbWVQYXRofVxcbmApKTtcblx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cdFx0Zm9yIChsZXQgeCA9IDA7IHggPCBwYXRocy5sZW5ndGg7IHgrKykge1xuXHRcdFx0Y29uc29sZS5sb2coYCR7eH0gLSAke3BhdGhzW3hdfWApO1xuXHRcdH1cblx0XHRjb25zb2xlLmxvZygnXFxuJylcblx0fSk7XG59O1xuXG5jb25zdCBsb2FkV2FsbGV0UGF0aHMgPSAob25Mb2FkZWQ6IChwYXRoczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCkgPT4ge1xuXHRmcy5yZWFkZGlyKGhvbWVQYXRoLCAoXywgZmlsZXMpID0+IHtcblx0XHRsZXQgcGF0aHM6IEFycmF5PHN0cmluZz4gPSBbXTtcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IGZpbGVzLmxlbmd0aDsgeCsrKSB7XG5cdFx0XHRpZiAoZmlsZXNbeF0uaW5jbHVkZXMoJ2RlZmF1bHQnKSkge1xuXHRcdFx0XHRkZWZhdWx0V2FsbGV0UGF0aCA9IGZpbGVzW3hdO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgc3RyID0gZmlsZXNbeF0uc3Vic3RyaW5nKGZpbGVzW3hdLmxlbmd0aCAtIDMsIGZpbGVzW3hdLmxlbmd0aCk7XG5cdFx0XHRpZiAoc3RyID09PSAnd2x0Jykge1xuXHRcdFx0XHRwYXRocy5wdXNoKGZpbGVzW3hdKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0b25Mb2FkZWQocGF0aHMpO1xuXHR9KTtcbn07XG5jb25zdCBhdHRlbXB0V2FsbGV0T3BlbiA9ICh3YWxsZXQ6IFNpbXBsZVdhbGxldCk6IFByb21pc2U8QWNjb3VudD4gPT4ge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8QWNjb3VudD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdHByb21wdC5zdGFydCgpO1xuXHRcdHByb21wdC5nZXQoe1xuXHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUGFzc3dvcmQnKSxcblx0XHRcdFx0XHRoaWRkZW46IHRydWVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIChfLCByZXN1bHQpID0+IHtcblx0XHRcdGNvbnN0IHBhc3MgPSBuZXcgUGFzc3dvcmQocmVzdWx0KTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlc29sdmUod2FsbGV0Lm9wZW4ocGFzcykpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlZChgJHtlcnJ9YCkpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnUGxlYXNlIHRyeSBhZ2FpbicpKTtcblx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufTtcbmNvbnN0IGxvYWRXYWxsZXQgPSAoKTogU2ltcGxlV2FsbGV0ID0+IHtcblx0bG9hZFdhbGxldFBhdGhzKF8gPT4ge30pO1xuXHRjaGlsZF9wcm9jZXNzLmV4ZWNTeW5jKCdzbGVlcCAxJyk7XG5cdGNvbnN0IGZ1bGxQYXRoID0gYCR7aG9tZVBhdGh9LyR7ZGVmYXVsdFdhbGxldFBhdGh9YDtcblx0Y29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGY4Jyk7XG5cdHJldHVybiBTaW1wbGVXYWxsZXQucmVhZEZyb21XTFQoY29udGVudHMpO1xufTtcbmNvbnN0IGdldEJhbGFuY2UgPSBhc3luYyAoKSA9PiB7XG5cdGNvbnN0IHdhbGxldCA9IGxvYWRXYWxsZXQoKTtcblx0dHJ5IHtcblx0XHRjb25zdCBhY2NvdW50ID0gYXdhaXQgYXR0ZW1wdFdhbGxldE9wZW4od2FsbGV0KTtcblx0XHRjb25zb2xlLmxvZygnXFxuJyk7XG5cdFx0Y29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKHllbGxvdygnRmV0Y2hpbmcgYmFsYW5jZS4uLiAlcycpKTtcblx0XHRzcGlubmVyLnNldFNwaW5uZXJTdHJpbmcoMCk7XG5cdFx0c3Bpbm5lci5zdGFydCgpO1xuXHRcdGNvbnN0IGNhY2hlTW9zYWljID0gYXdhaXQgZ2V0QWNjb3VudEJhbGFuY2UoYWNjb3VudCk7XG5cdFx0Y29uc3QgYmFsYW5jZSA9IGNhY2hlTW9zYWljID8gY2FjaGVNb3NhaWMucXVhbnRpdHkgOiAwO1xuXHRcdHNwaW5uZXIuc3RvcCgpO1xuXHRcdGNvbnN0IGJhbCA9IChiYWxhbmNlIC8gMWU2KS50b1N0cmluZygpO1xuXHRcdGNvbnNvbGUubG9nKCdcXG4nKTtcblx0XHRjb25zb2xlLmxvZyhgXFxuJHt3aGl0ZSgnQ2FjaGUgQmFsYW5jZTonKX0gJHt3aGl0ZShiYWwpfVxcbmApO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH1cblx0XHRnZXRCYWxhbmNlKCk7XG5cdH1cbn07XG5jb25zdCBzZXREZWZhdWx0V2FsbGV0ID0gKHdhbGxldEluZGV4OiBudW1iZXIpID0+IHtcblx0bG9hZFdhbGxldFBhdGhzKHBhdGhzID0+IHtcblx0XHRpZiAocGF0aHNbd2FsbGV0SW5kZXhdLmluY2x1ZGVzKCdkZWZhdWx0JykpIHJldHVybjtcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IHBhdGhzLmxlbmd0aDsgeCsrKSB7XG5cdFx0XHRsZXQgbmV3UGF0aCA9IHBhdGhzW3hdLnJlcGxhY2UoJ2RlZmF1bHQtJywnJyk7XG5cdFx0XHRuZXdQYXRoID0gYCR7aG9tZVBhdGh9LyR7bmV3UGF0aH1gO1xuXHRcdFx0ZnMucmVuYW1lKGAke2hvbWVQYXRofS8ke3BhdGhzW3hdfWAsIG5ld1BhdGgsIChfKSA9PiB7fSk7XG5cdFx0fVxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0ZnMucmVuYW1lKGAke2hvbWVQYXRofS8ke3BhdGhzW3dhbGxldEluZGV4XX1gLCBgJHtob21lUGF0aH0vZGVmYXVsdC0ke3BhdGhzW3dhbGxldEluZGV4XX1gKVxuXHRcdH0sIDgwMCk7XG5cdH0pO1xufTtcbmNvbnN0IG1haW4gPSAoKSA9PiB7XG5cdGxvYWRXYWxsZXRQYXRocyhwYXRocyA9PiB7XG5cdFx0aWYgKGFyZ3NbMF0gPT09ICd3YWxsZXQnKSB7XG5cdFx0XHRpZiAoYXJnc1sxXSA9PT0gJ2NyZWF0ZScpIHtcblx0XHRcdFx0Y3JlYXRlUHdkKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ3NbMV0gPT09ICdiYWxhbmNlJykge1xuXHRcdFx0XHRpZiAoIWRlZmF1bHRXYWxsZXRQYXRoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnNvbGUubG9nKHllbGxvdyhgXFxuWW91IG11c3QgZmlyc3Qgc2V0IGEgZGVmYXVsdCB3YWxsZXQuIFJ1biAke3doaXRlKCdjYWNoZSB3YWxsZXQgbGlzdCcpfSB0aGVuICR7d2hpdGUoJ2NhY2hlIHdhbGxldCBkZWZhdWx0IDxudW1iZXI+Jyl9XFxuYCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGdldEJhbGFuY2UoKTtcblx0XHRcdH0gZWxzZSBpZiAoYXJnc1sxXSA9PT0gJ2xpc3QnKSB7XG5cdFx0XHRcdGxpc3RXYWxsZXRzKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ3NbMV0gPT09ICdkZWZhdWx0Jykge1xuXHRcdFx0XHRjb25zdCBpZHggPSBwYXJzZUludChhcmdzWzJdKTtcblx0XHRcdFx0aWYgKGlzTmFOKGlkeCkpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoJ0ludmFsaWQgd2FsbGV0IGluZGV4LiBNdXN0IGJlIGFuIEludGVnZXInKSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoaWR4ID49IDAgJiYgaWR4IDwgcGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRzZXREZWZhdWx0V2FsbGV0KGlkeCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlZCgnSW52YWxpZCB3YWxsZXQgc2VsZWN0aW9uJykpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1haW4oKTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbihlcnIpIHtcblx0Y29uc29sZS5sb2coZXJyKTtcblx0Y29uc29sZS5sb2coJ1dhbGxldCBjbG9zZWQnKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufSk7Il19