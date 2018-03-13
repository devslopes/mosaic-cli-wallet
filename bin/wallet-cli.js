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
const args = process.argv.slice(2);
const homePath = `${os.homedir()}/cache-wallets`;
let walletPaths;
CFonts.say('Cache', { colors: ['cyan'] });
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
const pwd = () => {
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
            pwd();
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
const listWallets = () => __awaiter(this, void 0, void 0, function* () {
    console.log(colors_1.white('Fetching wallets...\n'));
    loadWalletPaths(() => {
        if (walletPaths.length === 0) {
            console.log(colors_1.white(`No wallets found. Create a new wallet or place an existing .wlt file
in ${homePath}\n`));
            process.exit(1);
        }
        for (let x = 0; x < walletPaths.length; x++) {
            console.log(`${x} - ${walletPaths[x]}`);
        }
        console.log('\n');
    });
});
const loadWalletPaths = (onLoaded) => {
    fs.readdir(homePath, (_, files) => {
        let paths = [];
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
const main = () => __awaiter(this, void 0, void 0, function* () {
    if (args[0] === 'wallet') {
        if (args[1] === 'create') {
            pwd();
        }
        else if (args[1] === 'list') {
            yield listWallets();
        }
        else if (args[1] === 'select') {
        }
    }
});
loadWalletPaths();
main();
process.on('uncaughtException', function (_) {
    console.log('Wallet closed');
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixtQ0FBK0I7QUFDL0Isc0NBQTBEO0FBQzFELDZDQUFxRDtBQUNyRCxpREFBMEQ7QUFDMUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBR2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQztBQUNqRCxJQUFJLFdBQTBCLENBQUM7QUFHL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQlgsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFvQixFQUFFLE9BQWUsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDO0VBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0osTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVB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QUM7SUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoJ3Byb21wdCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuaW1wb3J0IHsgd2hpdGUgfSBmcm9tICdjb2xvcnMnO1xuaW1wb3J0IHsgZ3JlZW4sIG1hZ2VudGEsIHJlZCwgeWVsbG93IH0gZnJvbSAnY29sb3JzL3NhZmUnO1xuaW1wb3J0IHsgUGFzc3dvcmQsIFNpbXBsZVdhbGxldCB9IGZyb20gJ25lbS1saWJyYXJ5JztcbmltcG9ydCB7IGNyZWF0ZVNpbXBsZVdhbGxldCB9IGZyb20gJy4uL3NyYy93YWxsZXQvd2FsbGV0JztcbmNvbnN0IENGb250cyA9IHJlcXVpcmUoJ2Nmb250cycpO1xuXG5kZWNsYXJlIGxldCBwcm9jZXNzOiBhbnk7XG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xuY29uc3QgaG9tZVBhdGggPSBgJHtvcy5ob21lZGlyKCl9L2NhY2hlLXdhbGxldHNgO1xubGV0IHdhbGxldFBhdGhzOiBBcnJheTxzdHJpbmc+O1xuLy8gbGV0IHNlbGVjdGVkV2FsbGV0OiBTaW1wbGVXYWxsZXQ7XG5cbkNGb250cy5zYXkoJ0NhY2hlJywgeyBjb2xvcnM6IFsnY3lhbiddfSk7XG5pZiAoYXJncy5sZW5ndGggPT09IDApIHtcblx0Y29uc29sZS5sb2coYFVzYWdlOlxuXG5cdGNhY2hlIHdhbGxldCBsaXN0XG5cdFx0TGlzdHMgYWxsIG9mIHRoZSB3YWxsZXRzIGF2YWlsYWJsZSBpbiB5b3VyIGNhY2hlLXdhbGxldHMgZGlyZWN0b3J5XG5cdFxuXHRjYWNoZSB3YWxsZXQgc2VsZWN0IDxudW1iZXI+XG5cdFx0Q2hvb3NlIHRoZSB3YWxsZXQgeW91IHdhbnQgdG8gd29yayB3aXRoIGllICdjYWNoZSB3YWxsZXQgc2VsZWN0IDMnXG5cdFxuXHRjYWNoZSBiYWxhbmNlXG5cdFx0R2V0cyB5b3VyIGN1cnJlbnQgd2FsbGV0IGJhbGFuY2UgYW5kIHB1YmxpYyBhZGRyZXNzXG5cdFxuXHRjYWNoZSBzZW5kIDxhbW91bnQ+IDxhZGRyZXNzPlxuXHRcdFNlbmRzIGNhY2hlIGZyb20geW91ciB3YWxsZXQgdG8gdGhlIHNwZWNpZmllZCBhZGRyZXNzXG5cdFxuXHRjYWNoZSB3YWxsZXQgY3JlYXRlXG5cdFx0R3VpZGVzIHlvdSB0aHJvdWdoIGNyZWF0aW5nIGEgbmV3IGNhY2hlIHdhbGxldFxuXHRgKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufVxuXG5jb25zdCBkb3dubG9hZFdhbGxldCA9ICh3YWxsZXQ6IFNpbXBsZVdhbGxldCwgYWRkcmVzczogc3RyaW5nKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5cXG5Eb3dubG9hZGluZyB3YWxsZXQgZm9yIHlvdXIgY29udmVuaWVuY2UuXFxuXFxuUGxlYXNlIHN0b3JlIHNvbWVwbGFjZSBzYWZlLiBUaGUgcHJpdmF0ZSBrZXkgaXMgZW5jcnlwdGVkIGJ5IHlvdXIgcGFzc3dvcmQuXFxuXFxuVG8gbG9hZCB0aGlzIHdhbGxldCBvbiBhIG5ldyBjb21wdXRlciB5b3Ugd291bGQgc2ltcGx5IGltcG9ydCB0aGUgLndsdCBmaWxlIGludG8gdGhpcyBhcHAgYW5kIGVudGVyIHlvdXIgcGFzc3dvcmQgYW5kIHlvdSdsbCBiZSBhYmxlIHRvIHNpZ24gdHJhbnNhY3Rpb25zLlxuXHRgKSk7XG5cdGNvbnN0IGFkZEFiYiA9IGFkZHJlc3Muc3Vic3RyaW5nKDAsNik7XG5cdGNvbnN0IHN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLDEwKTtcblxuXHRpZiAoIWZzLmV4aXN0c1N5bmMoaG9tZVBhdGgpKSB7XG5cdFx0ZnMubWtkaXJTeW5jKGhvbWVQYXRoKTtcblx0fVxuXHRjb25zdCBwYXRoID0gYCR7aG9tZVBhdGh9LyR7YWRkQWJifS0ke3N0YW1wfS1jYWNoZS53bHRgO1xuXHRmcy53cml0ZUZpbGUocGF0aCwgd2FsbGV0LndyaXRlV0xURmlsZSgpLCAoXykgPT4ge1xuXHRcdGNvbnNvbGUubG9nKGdyZWVuKGBcXG5Eb3dubG9hZGVkIHdhbGxldCB0byAke3BhdGh9XFxuYCkpO1xuXHR9KTtcbn07XG5cbmNvbnN0IHB3ZCA9ICgpID0+IHtcblx0Y29uc29sZS5sb2cod2hpdGUoXG5gXFxuUGxlYXNlIGVudGVyIGEgdW5pcXVlIHBhc3N3b3JkICR7eWVsbG93KCcoOCBjaGFyYWN0ZXIgbWluaW11bSknKX0uXFxuIFxuVGhpcyBwYXNzd29yZCB3aWxsIGJlIHVzZWQgdG8gZW5jcnlwdCB5b3VyIHByaXZhdGUga2V5IGFuZCBtYWtlIHdvcmtpbmcgd2l0aCB5b3VyIHdhbGxldCBlYXNpZXIuXFxuXFxuYFxuXHQpKTtcblx0Y29uc29sZS5sb2cocmVkKFxuXHRcdGBTdG9yZSB0aGlzIHBhc3N3b3JkIHNvbWV3aGVyZSBzYWZlLiBJZiB5b3UgbG9zZSBvciBmb3JnZXQgaXQgeW91IHdpbGwgbmV2ZXIgYmUgYWJsZSB0byB0cmFuc2ZlciBmdW5kc1xcbmBcblx0KSk7XG5cdHByb21wdC5tZXNzYWdlID0gd2hpdGUoJ0NhY2hlIFdhbGxldCcpO1xuXHRwcm9tcHQuc3RhcnQoKTtcblx0cHJvbXB0LmdldCh7XG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0cGFzc3dvcmQ6IHtcblx0XHRcdFx0ZGVzY3JpcHRpb246IHdoaXRlKCdQYXNzd29yZCcpLFxuXHRcdFx0XHRoaWRkZW46IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjb25maXJtUGFzczoge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogd2hpdGUoJ1JlLWVudGVyIHBhc3N3b3JkJyksXG5cdFx0XHRcdGhpZGRlbjogdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0fSwgYXN5bmMgKF8sIHJlc3VsdCkgPT4ge1xuXHRcdGlmIChyZXN1bHQucGFzc3dvcmQgIT09IHJlc3VsdC5jb25maXJtUGFzcykge1xuXHRcdFx0Y29uc29sZS5sb2cobWFnZW50YSgnXFxuUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC5cXG5cXG4nKSk7XG5cdFx0XHRwd2QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgd2FsbGV0ID0gY3JlYXRlU2ltcGxlV2FsbGV0KHJlc3VsdC5wYXNzd29yZCk7XG5cdFx0XHRjb25zdCBwYXNzID0gbmV3IFBhc3N3b3JkKHJlc3VsdC5wYXNzd29yZCk7XG5cdFx0XHRjb25zdCBhY2NvdW50ID0gd2FsbGV0Lm9wZW4ocGFzcyk7XG5cdFx0XHRjb25zdCBhZGRyZXNzID0gYWNjb3VudC5hZGRyZXNzLnByZXR0eSgpO1xuXHRcdFx0Y29uc29sZS5sb2coZ3JlZW4oJ1xcbkNhY2hlIHdhbGxldCBzdWNjZXNzZnVsbHkgY3JlYXRlZC5cXG4nKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnWW91IGNhbiBub3cgc3RhcnQgc2VuZGluZyBhbmQgcmVjZWl2aW5nIGNhY2hlIVxcbicpKTtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBcXG5DYWNoZSBQdWJsaWMgQWRkcmVzczpgKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh5ZWxsb3coYCR7YWRkcmVzc31gKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZShgXFxuUHJpdmF0ZSBLZXk6YCkpO1xuXHRcdFx0Y29uc29sZS5sb2coeWVsbG93KGAke2FjY291bnQucHJpdmF0ZUtleX1gKSk7XG5cdFx0XHRhd2FpdCBkb3dubG9hZFdhbGxldCh3YWxsZXQsIGFkZHJlc3MpO1xuXHRcdH1cblx0fSlcbn07XG5cbmNvbnN0IGxpc3RXYWxsZXRzID0gYXN5bmMgKCkgPT4ge1xuXHRjb25zb2xlLmxvZyh3aGl0ZSgnRmV0Y2hpbmcgd2FsbGV0cy4uLlxcbicpKTtcblxuXHRsb2FkV2FsbGV0UGF0aHMoKCkgPT4ge1xuXHRcdGlmICh3YWxsZXRQYXRocy5sZW5ndGggPT09IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKHdoaXRlKGBObyB3YWxsZXRzIGZvdW5kLiBDcmVhdGUgYSBuZXcgd2FsbGV0IG9yIHBsYWNlIGFuIGV4aXN0aW5nIC53bHQgZmlsZVxuaW4gJHtob21lUGF0aH1cXG5gKSk7XG5cdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXHRcdGZvciAobGV0IHggPSAwOyB4IDwgd2FsbGV0UGF0aHMubGVuZ3RoOyB4KyspIHtcblx0XHRcdGNvbnNvbGUubG9nKGAke3h9IC0gJHt3YWxsZXRQYXRoc1t4XX1gKTtcblx0XHR9XG5cdFx0Y29uc29sZS5sb2coJ1xcbicpXG5cdH0pO1xufTtcblxuY29uc3QgbG9hZFdhbGxldFBhdGhzID0gKG9uTG9hZGVkPzogKCkgPT4gdm9pZCkgPT4ge1xuXHQvLyBMb2FkIHdhbGxldCBwYXRocyBiZWhpbmQgdGhlIHNjZW5lcyBhdXRvbWF0aWNhbGx5XG5cdGZzLnJlYWRkaXIoaG9tZVBhdGgsIChfLCBmaWxlcykgPT4ge1xuXHRcdGxldCBwYXRoczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuXHRcdGZvciAobGV0IHggPSAwOyB4IDwgZmlsZXMubGVuZ3RoOyB4KyspIHtcblx0XHRcdGNvbnN0IHN0ciA9IGZpbGVzW3hdLnN1YnN0cmluZyhmaWxlc1t4XS5sZW5ndGggLSAzLCBmaWxlc1t4XS5sZW5ndGgpO1xuXHRcdFx0aWYgKHN0ciA9PT0gJ3dsdCcpIHtcblx0XHRcdFx0cGF0aHMucHVzaChmaWxlc1t4XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHdhbGxldFBhdGhzID0gcGF0aHM7XG5cdFx0aWYgKG9uTG9hZGVkKSB7XG5cdFx0XHRvbkxvYWRlZCgpO1xuXHRcdH1cblx0fSk7XG59O1xuXG5jb25zdCBtYWluID0gYXN5bmMgKCkgPT4ge1xuXHRpZiAoYXJnc1swXSA9PT0gJ3dhbGxldCcpIHtcblx0XHRpZiAoYXJnc1sxXSA9PT0gJ2NyZWF0ZScpIHtcblx0XHRcdHB3ZCgpO1xuXHRcdH0gZWxzZSBpZiAoYXJnc1sxXSA9PT0gJ2xpc3QnKSB7XG5cdFx0XHRhd2FpdCBsaXN0V2FsbGV0cygpO1xuXHRcdH0gZWxzZSBpZiAoYXJnc1sxXSA9PT0gJ3NlbGVjdCcpIHtcblxuXHRcdH1cblx0fVxufTtcblxubG9hZFdhbGxldFBhdGhzKCk7XG5tYWluKCk7XG5cbnByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZnVuY3Rpb24oXykge1xuXHRjb25zb2xlLmxvZygnV2FsbGV0IGNsb3NlZCcpO1xuXHRwcm9jZXNzLmV4aXQoMSk7XG59KTsiXX0=