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
const cli_spinner_1 = require("cli-spinner");
const colors_1 = require("colors");
const safe_1 = require("colors/safe");
const CFonts = require('cfonts');
const prompt = require('prompt');
const fs = require('fs');
const os = require('os');
const nem_library_1 = require("nem-library");
const wallet_1 = require("../src/wallet");
const mosaicSettings = require('../src/mosaic-settings.json');
const MOSAIC_NAME = mosaicSettings.mosaic_name;
const args = process.argv.slice(2);
const PATH_HOME = `${os.homedir()}/${MOSAIC_NAME}-wallets`;
const PATH_WALLET = `${PATH_HOME}/${MOSAIC_NAME}-wallet.wlt`;
let selectedAccount;
if (args.length === 0) {
    CFonts.say(`${MOSAIC_NAME}`, { colors: ['cyan'] });
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
const downloadWallet = (wallet) => {
    console.log(colors_1.white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
    if (!fs.existsSync(PATH_HOME)) {
        fs.mkdirSync(PATH_HOME);
    }
    let fullPath = PATH_WALLET;
    if (fs.existsSync(fullPath)) {
        const stamp = new Date().toISOString();
        fullPath = `${PATH_HOME}/${stamp}-${MOSAIC_NAME}-wallet.wlt`;
    }
    fs.writeFileSync(fullPath, wallet.writeWLTFile());
    console.log(safe_1.green(`Downloaded wallet to ${fullPath}`));
};
const createPwd = () => {
    console.log(colors_1.white(`\nPlease enter a unique password ${safe_1.yellow('(8 character minimum)')}.\n 
This password will be used to encrypt your private key and make working with your wallet easier.\n\n`));
    console.log(safe_1.red(`Store this password somewhere safe. If you lose or forget it you will never be able to transfer funds\n`));
    prompt.message = colors_1.white(`${MOSAIC_NAME} wallet`);
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
            console.log(safe_1.green(`${MOSAIC_NAME} wallet successfully created.`));
            console.log(colors_1.white(`You can now start sending and receiving ${MOSAIC_NAME}!`));
            console.log(colors_1.white(`\n${MOSAIC_NAME} Public Address:`));
            console.log(safe_1.yellow(`${address}`));
            console.log(colors_1.white(`\nPrivate Key:`));
            console.log(safe_1.yellow(`${account.privateKey}`));
            yield downloadWallet(wallet);
        }
    }));
};
const attemptWalletOpen = (wallet) => {
    return new Promise((resolve, reject) => {
        prompt.message = colors_1.white('wallet login');
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
        const mosaic = yield wallet_1.mosaicBalance(balances);
        const xem = yield wallet_1.xemBalance(balances);
        spinner.stop();
        const bal = (mosaic / 1e6).toString();
        const xemBal = (xem / 1e6).toString();
        console.log('\n');
        console.log(`\n${colors_1.white('XEM Balance:')} ${colors_1.white(xemBal)}`);
        console.log(`\n${colors_1.white(`${MOSAIC_NAME} Balance:`)} ${colors_1.white(bal)}\n`);
        onBalance(mosaic / 1e6);
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
            createPwd();
        }
    }
    else {
        if (!fs.existsSync(PATH_WALLET)) {
            const file = `${MOSAIC_NAME}-wallet.wlt`;
            console.log(safe_1.red(`Cannot find default wallet. Please place a file named ${colors_1.white(file)} at this location: ${PATH_WALLET}`));
            process.exit(1);
        }
        if (args[0] === 'balance') {
            yield printBalance(_ => { });
        }
        else if (args[0] === 'send') {
            yield printBalance((balance) => __awaiter(this, void 0, void 0, function* () {
                const amt = parseFloat(args[1]);
                const address = args[2];
                if (isNaN(amt)) {
                    console.log(safe_1.red('Must provide a valid number with maximum of 6 digits ie 10.356784'));
                    process.exit(1);
                }
                if (!address) {
                    console.log(safe_1.red('Must provide a valid recipient address'));
                    process.exit(1);
                }
                if (amt > balance) {
                    console.log(safe_1.red(`You don't have enough ${MOSAIC_NAME} to send`));
                    process.exit(1);
                }
                try {
                    const preTransaction = yield wallet_1.prepareTransfer(address, amt);
                    const xemFee = (preTransaction.fee / 1e6).toString();
                    console.log(colors_1.white('Transaction Details: \n'));
                    console.log(`Recipient:          ${safe_1.yellow(address)}\n`);
                    console.log(`${MOSAIC_NAME} to send:      ${safe_1.yellow(amt.toString())}\n`);
                    console.log(`XEM Fee:            ${safe_1.yellow(xemFee)}\n\n`);
                    console.log(`${colors_1.white('Would you like to proceed?\n')}`);
                    prompt.message = colors_1.white(`${MOSAIC_NAME} Transfer`);
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
                                const result = yield wallet_1.sendMosaic(address, amt, selectedAccount);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFHQSw2Q0FBc0M7QUFDdEMsbUNBQStCO0FBQy9CLHNDQUEwRDtBQUMxRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBR2pDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHekIsNkNBQThEO0FBRzlELDBDQUV1QjtBQUd2QixNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUM5RCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDO0FBTS9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBR25DLE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsVUFBVSxDQUFDO0FBQzNELE1BQU0sV0FBVyxHQUFHLEdBQUcsU0FBUyxJQUFJLFdBQVcsYUFBYSxDQUFDO0FBRzdELElBQUksZUFBd0IsQ0FBQztBQUs3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUM7O0dBRVYsV0FBVzs7O0dBR1gsV0FBVztVQUNKLFdBQVc7O0dBRWxCLFdBQVc7c0NBQ3dCLFdBQVc7RUFDL0MsQ0FB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QUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbi8vIFBhY2thZ2VzIGZvciB1c2VyIGlucHV0IGFuZCBkaXNwbGF5IGZvciBDTElcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICdjbGktc3Bpbm5lcic7XG5pbXBvcnQgeyB3aGl0ZSB9IGZyb20gJ2NvbG9ycyc7XG5pbXBvcnQgeyBncmVlbiwgbWFnZW50YSwgcmVkLCB5ZWxsb3cgfSBmcm9tICdjb2xvcnMvc2FmZSc7XG5jb25zdCBDRm9udHMgPSByZXF1aXJlKCdjZm9udHMnKTtcbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoJ3Byb21wdCcpO1xuXG4vLyBmcyBhbmQgb3MgYXJlIG5hdGl2ZSBub2RlIHBhY2thZ2VzIGZvciB3b3JraW5nIHdpdGggZmlsZSBzeXN0ZW1cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcblxuLy8gT2ZmaWNpYWwgbmVtLWxpYnJhcnlcbmltcG9ydCB7IFBhc3N3b3JkLCBTaW1wbGVXYWxsZXQsIEFjY291bnQgfSBmcm9tICduZW0tbGlicmFyeSc7XG5cbi8vIFdhbGxldCBmdW5jdGlvbnMgZm9yIHRoaXMgYXBwXG5pbXBvcnQge1xuXHRtb3NhaWNCYWxhbmNlLCBjcmVhdGVTaW1wbGVXYWxsZXQsIGdldEFjY291bnRCYWxhbmNlcywgcHJlcGFyZVRyYW5zZmVyLCBzZW5kTW9zYWljLCB4ZW1CYWxhbmNlXG59IGZyb20gJy4uL3NyYy93YWxsZXQnO1xuXG4vLyBKU09OIEZpbGUgZm9yIG1vc2FpYyBzZXR0aW5ncyAtIGNhbiBiZSByZXBsYWNlZCB3aXRoIGFueSBtb3NhaWNcbmNvbnN0IG1vc2FpY1NldHRpbmdzID0gcmVxdWlyZSgnLi4vc3JjL21vc2FpYy1zZXR0aW5ncy5qc29uJyk7XG5jb25zdCBNT1NBSUNfTkFNRSA9IG1vc2FpY1NldHRpbmdzLm1vc2FpY19uYW1lO1xuXG4vLyBNdXN0IGRlY2xhcmUgcHJvY2VzcyBzaW5jZSBUeXBlc2NyaXB0IGRvZXNuJ3Qga25vdyBhYm91dCBpdFxuZGVjbGFyZSBsZXQgcHJvY2VzczogYW55O1xuXG4vLyBHcmFiIHVzZXIgYXJndW1lbnRzIGZyb20gY29tbWFuZCBsaW5lXG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xuXG4vLyBQYXRocyBmb3Igc2F2aW5nIGFuZCBsb2FkaW5nIHdhbGxldHNcbmNvbnN0IFBBVEhfSE9NRSA9IGAke29zLmhvbWVkaXIoKX0vJHtNT1NBSUNfTkFNRX0td2FsbGV0c2A7XG5jb25zdCBQQVRIX1dBTExFVCA9IGAke1BBVEhfSE9NRX0vJHtNT1NBSUNfTkFNRX0td2FsbGV0LndsdGA7XG5cbi8vIFdoZW4gYW4gYWNjb3VudCBpcyBsb2FkZWQgc3RvcmUgaXQgc28gaXQgY2FuIGJlIHVzZWQgbGF0ZXJcbmxldCBzZWxlY3RlZEFjY291bnQ6IEFjY291bnQ7XG5cbi8qKlxuICogU2hvdyBhdmFpbGFibGUgY29tbWFuZHMgZm9yIHRoZSB1c2VyXG4gKi9cbmlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuXHRDRm9udHMuc2F5KGAke01PU0FJQ19OQU1FfWAsIHsgY29sb3JzOiBbJ2N5YW4nXX0pO1xuXHRjb25zb2xlLmxvZyhgVXNhZ2U6XG5cblx0JHtNT1NBSUNfTkFNRX0gYmFsYW5jZVxuXHRcdEdldHMgeW91ciBjdXJyZW50IHdhbGxldCBiYWxhbmNlIGFuZCBwdWJsaWMgYWRkcmVzc1xuXHRcblx0JHtNT1NBSUNfTkFNRX0gc2VuZCA8YW1vdW50PiA8YWRkcmVzcz5cblx0XHRTZW5kcyAke01PU0FJQ19OQU1FfSBmcm9tIHlvdXIgd2FsbGV0IHRvIHRoZSBzcGVjaWZpZWQgYWRkcmVzc1xuXHRcblx0JHtNT1NBSUNfTkFNRX0gd2FsbGV0IGNyZWF0ZVxuXHRcdEd1aWRlcyB5b3UgdGhyb3VnaCBjcmVhdGluZyBhIG5ldyAke01PU0FJQ19OQU1FfSB3YWxsZXRcblx0YCk7XG5cdHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1NpbXBsZVdhbGxldH0gd2FsbGV0IFRoZSBTaW1wbGVXYWxsZXQgdG8gZG93bmxvYWQgdG8gdGhlIGhhcmQgZHJpdmVcbiAqIElmIGRlZmF1bHQgd2FsbGV0IGFscmVhZHkgZXhpc3RzIGl0IHdpbGwgYWRkIGEgdGltZXN0YW1wIHRvIHRoZSB3YWxsZXQgcGF0aCBvZlxuICogdGhpcyBuZXcgd2FsbGV0XG4gKi9cbmNvbnN0IGRvd25sb2FkV2FsbGV0ID0gKHdhbGxldDogU2ltcGxlV2FsbGV0KSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5cXG5Eb3dubG9hZGluZyB3YWxsZXQgZm9yIHlvdXIgY29udmVuaWVuY2UuXFxuXFxuUGxlYXNlIHN0b3JlIHNvbWVwbGFjZSBzYWZlLiBUaGUgcHJpdmF0ZSBrZXkgaXMgZW5jcnlwdGVkIGJ5IHlvdXIgcGFzc3dvcmQuXFxuXFxuVG8gbG9hZCB0aGlzIHdhbGxldCBvbiBhIG5ldyBjb21wdXRlciB5b3Ugd291bGQgc2ltcGx5IGltcG9ydCB0aGUgLndsdCBmaWxlIGludG8gdGhpcyBhcHAgYW5kIGVudGVyIHlvdXIgcGFzc3dvcmQgYW5kIHlvdSdsbCBiZSBhYmxlIHRvIHNpZ24gdHJhbnNhY3Rpb25zLlxuXHRgKSk7XG5cblx0aWYgKCFmcy5leGlzdHNTeW5jKFBBVEhfSE9NRSkpIHtcblx0XHRmcy5ta2RpclN5bmMoUEFUSF9IT01FKTtcblx0fVxuXG5cdGxldCBmdWxsUGF0aCA9IFBBVEhfV0FMTEVUO1xuXHRpZiAoZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcblx0XHRjb25zdCBzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblx0XHRmdWxsUGF0aCA9IGAke1BBVEhfSE9NRX0vJHtzdGFtcH0tJHtNT1NBSUNfTkFNRX0td2FsbGV0LndsdGBcblx0fVxuXHRmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCB3YWxsZXQud3JpdGVXTFRGaWxlKCkpO1xuXG5cdGNvbnNvbGUubG9nKGdyZWVuKGBEb3dubG9hZGVkIHdhbGxldCB0byAke2Z1bGxQYXRofWApKVxufTtcblxuLyoqXG4gKiBDcmVhdGVzIHBhc3N3b3JkIHdoZW4gbWFraW5nIGEgbmV3IHdhbGxldFxuICovXG5jb25zdCBjcmVhdGVQd2QgPSAoKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKFxuXHRcdGBcXG5QbGVhc2UgZW50ZXIgYSB1bmlxdWUgcGFzc3dvcmQgJHt5ZWxsb3coJyg4IGNoYXJhY3RlciBtaW5pbXVtKScpfS5cXG4gXG5UaGlzIHBhc3N3b3JkIHdpbGwgYmUgdXNlZCB0byBlbmNyeXB0IHlvdXIgcHJpdmF0ZSBrZXkgYW5kIG1ha2Ugd29ya2luZyB3aXRoIHlvdXIgd2FsbGV0IGVhc2llci5cXG5cXG5gXG5cdCkpO1xuXHRjb25zb2xlLmxvZyhyZWQoXG5cdFx0YFN0b3JlIHRoaXMgcGFzc3dvcmQgc29tZXdoZXJlIHNhZmUuIElmIHlvdSBsb3NlIG9yIGZvcmdldCBpdCB5b3Ugd2lsbCBuZXZlciBiZSBhYmxlIHRvIHRyYW5zZmVyIGZ1bmRzXFxuYFxuXHQpKTtcblx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZShgJHtNT1NBSUNfTkFNRX0gd2FsbGV0YCk7XG5cdHByb21wdC5zdGFydCgpO1xuXHRwcm9tcHQuZ2V0KHtcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1Bhc3N3b3JkJyksXG5cdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGNvbmZpcm1QYXNzOiB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUmUtZW50ZXIgcGFzc3dvcmQnKSxcblx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBhc3luYyAoXywgcmVzdWx0KSA9PiB7XG5cdFx0aWYgKHJlc3VsdC5wYXNzd29yZCAhPT0gcmVzdWx0LmNvbmZpcm1QYXNzKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtYWdlbnRhKCdcXG5QYXNzd29yZHMgZG8gbm90IG1hdGNoLlxcblxcbicpKTtcblx0XHRcdGNyZWF0ZVB3ZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIENyZWF0ZSBuZXcgU2ltcGxlV2FsbGV0XG5cdFx0XHQgKiBPcGVuIGl0IHRvIGFjY2VzcyB0aGUgbmV3IEFjY291bnRcblx0XHRcdCAqIFByaW50IGFjY291bnQgaW5mb1xuXHRcdFx0ICovXG5cdFx0XHRjb25zdCB3YWxsZXQgPSBjcmVhdGVTaW1wbGVXYWxsZXQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IHBhc3MgPSBuZXcgUGFzc3dvcmQocmVzdWx0LnBhc3N3b3JkKTtcblx0XHRcdGNvbnN0IGFjY291bnQgPSB3YWxsZXQub3BlbihwYXNzKTtcblx0XHRcdGNvbnN0IGFkZHJlc3MgPSBhY2NvdW50LmFkZHJlc3MucHJldHR5KCk7XG5cdFx0XHRjb25zb2xlLmxvZyhncmVlbihgJHtNT1NBSUNfTkFNRX0gd2FsbGV0IHN1Y2Nlc3NmdWxseSBjcmVhdGVkLmApKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBZb3UgY2FuIG5vdyBzdGFydCBzZW5kaW5nIGFuZCByZWNlaXZpbmcgJHtNT1NBSUNfTkFNRX0hYCkpO1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoYFxcbiR7TU9TQUlDX05BTUV9IFB1YmxpYyBBZGRyZXNzOmApKTtcblx0XHRcdGNvbnNvbGUubG9nKHllbGxvdyhgJHthZGRyZXNzfWApKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5Qcml2YXRlIEtleTpgKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh5ZWxsb3coYCR7YWNjb3VudC5wcml2YXRlS2V5fWApKTtcblx0XHRcdGF3YWl0IGRvd25sb2FkV2FsbGV0KHdhbGxldCk7XG5cdFx0fVxuXHR9KVxufTtcblxuLyoqXG4gKiBHZXQgdXNlcnMgcGFzc3dvcmQgYW5kIGF0dGVtcHQgb3BlbmluZyB0aGUgd2FsbGV0XG4gKi9cbmNvbnN0IGF0dGVtcHRXYWxsZXRPcGVuID0gKHdhbGxldDogU2ltcGxlV2FsbGV0KTogUHJvbWlzZTxBY2NvdW50PiA9PiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZTxBY2NvdW50PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZSgnd2FsbGV0IGxvZ2luJyk7XG5cdFx0cHJvbXB0LnN0YXJ0KCk7XG5cdFx0cHJvbXB0LmdldCh7XG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdHBhc3N3b3JkOiB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHdoaXRlKCdQYXNzd29yZCcpLFxuXHRcdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgKF8sIHJlc3VsdCkgPT4ge1xuXHRcdFx0Y29uc3QgcGFzcyA9IG5ldyBQYXNzd29yZChyZXN1bHQucGFzc3dvcmQpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmVzb2x2ZSh3YWxsZXQub3BlbihwYXNzKSk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVkKGAke2Vycn1gKSk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKCdQbGVhc2UgdHJ5IGFnYWluJykpO1xuXHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59O1xuXG4vKipcbiAqIExvYWQgd2FsbGV0IGZyb20gZmlsZSBzeXN0ZW1cbiAqL1xuY29uc3QgbG9hZFdhbGxldCA9ICgpOiBTaW1wbGVXYWxsZXQgPT4ge1xuXHRjb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhQQVRIX1dBTExFVCk7XG5cdHJldHVybiBTaW1wbGVXYWxsZXQucmVhZEZyb21XTFQoY29udGVudHMpO1xufTtcblxuLyoqXG4gKiBUYWxrIHRvIE5FTSBBUEkgdG8gZmV0Y2ggdGhlIG1vc2FpYyBiYWxhbmNlICYgWEVNIGJhbGFuY2VcbiAqL1xuY29uc3QgcHJpbnRCYWxhbmNlID0gYXN5bmMgKG9uQmFsYW5jZTogKGJhbGFuY2U6IG51bWJlcikgPT4gdm9pZCkgPT4ge1xuXHRjb25zdCB3YWxsZXQgPSBsb2FkV2FsbGV0KCk7XG5cdHRyeSB7XG5cdFx0Y29uc3QgYWNjb3VudCA9IGF3YWl0IGF0dGVtcHRXYWxsZXRPcGVuKHdhbGxldCk7XG5cdFx0c2VsZWN0ZWRBY2NvdW50ID0gYWNjb3VudDtcblx0XHRjb25zb2xlLmxvZygnXFxuJyk7XG5cdFx0Y29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKHllbGxvdygnRmV0Y2hpbmcgYmFsYW5jZS4uLiAlcycpKTtcblx0XHRzcGlubmVyLnNldFNwaW5uZXJTdHJpbmcoMCk7XG5cdFx0c3Bpbm5lci5zdGFydCgpO1xuXHRcdGNvbnN0IGJhbGFuY2VzID0gYXdhaXQgZ2V0QWNjb3VudEJhbGFuY2VzKGFjY291bnQpO1xuXHRcdGNvbnN0IG1vc2FpYyA9IGF3YWl0IG1vc2FpY0JhbGFuY2UoYmFsYW5jZXMpO1xuXHRcdGNvbnN0IHhlbSA9IGF3YWl0IHhlbUJhbGFuY2UoYmFsYW5jZXMpO1xuXHRcdHNwaW5uZXIuc3RvcCgpO1xuXHRcdC8qKlxuXHRcdCAqIENvbnZlcnQgcmF3IG51bWJlciBpbnRvIHVzZXItcmVhZGFibGUgc3RyaW5nXG5cdFx0ICogMWU2IGlzIFNjaWVudGlmaWMgTm90YXRpb24gLSBhZGRzIHRoZSBkZWNpbWFsIHNpeFxuXHRcdCAqIHBsYWNlcyBmcm9tIHRoZSByaWdodDogaWUgMTU2MzQ5ODc2ID0+IDE1Ni4zNDk4NzZcblx0XHQgKi9cblx0XHRjb25zdCBiYWwgPSAobW9zYWljIC8gMWU2KS50b1N0cmluZygpO1xuXHRcdGNvbnN0IHhlbUJhbCA9ICh4ZW0gLyAxZTYpLnRvU3RyaW5nKCk7XG5cdFx0Y29uc29sZS5sb2coJ1xcbicpO1xuXHRcdGNvbnNvbGUubG9nKGBcXG4ke3doaXRlKCdYRU0gQmFsYW5jZTonKX0gJHt3aGl0ZSh4ZW1CYWwpfWApO1xuXHRcdGNvbnNvbGUubG9nKGBcXG4ke3doaXRlKGAke01PU0FJQ19OQU1FfSBCYWxhbmNlOmApfSAke3doaXRlKGJhbCl9XFxuYCk7XG5cdFx0b25CYWxhbmNlKG1vc2FpYyAvIDFlNik7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHdhbGxldFxuICovXG5jb25zdCBtYWluID0gYXN5bmMgKCkgPT4ge1xuXHRpZiAoYXJnc1swXSA9PT0gJ3dhbGxldCcpIHtcblx0XHRpZiAoYXJnc1sxXSA9PT0gJ2NyZWF0ZScpIHtcblx0XHRcdGNyZWF0ZVB3ZCgpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvKipcblx0XHQgKiBJZiB0aGUgZGVmYXVsdCB3YWxsZXQgZmlsZSBpcyBub3QgaW4gdGhlIGNvcnJlY3QgcGF0aFxuXHRcdCAqIHRocm93IGFuIGVycm9yXG5cdFx0ICovXG5cdFx0aWYgKCFmcy5leGlzdHNTeW5jKFBBVEhfV0FMTEVUKSkge1xuXHRcdFx0Y29uc3QgZmlsZSA9IGAke01PU0FJQ19OQU1FfS13YWxsZXQud2x0YDtcblx0XHRcdGNvbnNvbGUubG9nKHJlZChgQ2Fubm90IGZpbmQgZGVmYXVsdCB3YWxsZXQuIFBsZWFzZSBwbGFjZSBhIGZpbGUgbmFtZWQgJHt3aGl0ZShmaWxlKX0gYXQgdGhpcyBsb2NhdGlvbjogJHtQQVRIX1dBTExFVH1gKSk7XG5cdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRmV0Y2ggYW5kIGRpc3BsYXkgdGhlIHdhbGxldCBiYWxhbmNlXG5cdFx0ICovXG5cdFx0aWYgKGFyZ3NbMF0gPT09ICdiYWxhbmNlJykge1xuXHRcdFx0YXdhaXQgcHJpbnRCYWxhbmNlKF8gPT4ge30pO1xuXHRcdH0gZWxzZSBpZiAoYXJnc1swXSA9PT0gJ3NlbmQnKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIE1hbmFnZSB1c2VyIGlucHV0IGZvciBzZW5kaW5nIG1vc2FpYyB0byBhbm90aGVyIHdhbGxldFxuXHRcdFx0ICogcHJpbnRCYWxhbmNlIGZvciB1c2VyIGNvbnZlbmllbmNlXG5cdFx0XHQgKi9cblx0XHRcdGF3YWl0IHByaW50QmFsYW5jZShhc3luYyAoYmFsYW5jZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBhbXQgPSBwYXJzZUZsb2F0KGFyZ3NbMV0pO1xuXHRcdFx0XHRjb25zdCBhZGRyZXNzID0gYXJnc1syXTtcblx0XHRcdFx0aWYgKGlzTmFOKGFtdCkpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoJ011c3QgcHJvdmlkZSBhIHZhbGlkIG51bWJlciB3aXRoIG1heGltdW0gb2YgNiBkaWdpdHMgaWUgMTAuMzU2Nzg0JykpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWFkZHJlc3MpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoJ011c3QgcHJvdmlkZSBhIHZhbGlkIHJlY2lwaWVudCBhZGRyZXNzJykpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAgKGFtdCA+IGJhbGFuY2UpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoYFlvdSBkb24ndCBoYXZlIGVub3VnaCAke01PU0FJQ19OQU1FfSB0byBzZW5kYCkpO1xuXHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IHByZVRyYW5zYWN0aW9uID0gYXdhaXQgcHJlcGFyZVRyYW5zZmVyKGFkZHJlc3MsIGFtdCk7XG5cdFx0XHRcdFx0Y29uc3QgeGVtRmVlID0gKHByZVRyYW5zYWN0aW9uLmZlZSAvIDFlNikudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnVHJhbnNhY3Rpb24gRGV0YWlsczogXFxuJykpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBSZWNpcGllbnQ6ICAgICAgICAgICR7eWVsbG93KGFkZHJlc3MpfVxcbmApO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGAke01PU0FJQ19OQU1FfSB0byBzZW5kOiAgICAgICR7eWVsbG93KGFtdC50b1N0cmluZygpKX1cXG5gKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgWEVNIEZlZTogICAgICAgICAgICAke3llbGxvdyh4ZW1GZWUpfVxcblxcbmApO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGAke3doaXRlKCdXb3VsZCB5b3UgbGlrZSB0byBwcm9jZWVkP1xcbicpfWApO1xuXG5cdFx0XHRcdFx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZShgJHtNT1NBSUNfTkFNRX0gVHJhbnNmZXJgKTtcblx0XHRcdFx0XHRwcm9tcHQuc3RhcnQoKTtcblx0XHRcdFx0XHRwcm9tcHQuZ2V0KHtcblx0XHRcdFx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0XHRcdFx0Y29uZmlybWF0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHllbGxvdygnUHJvY2VlZD8gKCB5L24gKScpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBhc3luYyAoXywgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0LmNvbmZpcm1hdGlvbi50b0xvd2VyQ2FzZSgpID09PSAneScgfHwgcmVzdWx0LmNvbmZpcm1hdGlvbi50b0xvd2VyQ2FzZSgpID09PSAneWVzJykge1xuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlbmRNb3NhaWMoYWRkcmVzcywgYW10LCBzZWxlY3RlZEFjY291bnQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3VsdCk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ1xcblxcbicpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKCdUcmFuc2FjdGlvbiBzdWNjZXNzZnVsbHkgYW5ub3VuY2VkIHRvIHRoZSBORU0gYmxvY2tjaGFpbi4gVHJhbnNhY3Rpb24gY291bGQgdGFrZSBzb21lIHRpbWUuIENvbWUgYmFjayBoZXJlIGluIDUgbWludXRlcyB0byBjaGVjayB5b3VyIGJhbGFuY2UgdG8gZW5zdXJlIHRoYXQgdGhlIHRyYW5zYWN0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudFxcbicpKTtcblxuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZWQoZXJyKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdUcmFuc2FjdGlvbiBjYW5jZWxlZCcpO1xuXHRcdFx0XHRcdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2Vycn1cXG5gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59O1xuXG5tYWluKCk7XG5cbnByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZnVuY3Rpb24oZXJyKSB7XG5cdGNvbnNvbGUubG9nKGVycik7XG5cdGNvbnNvbGUubG9nKCdXYWxsZXQgY2xvc2VkJyk7XG5cdHByb2Nlc3MuZXhpdCgxKTtcbn0pOyJdfQ==