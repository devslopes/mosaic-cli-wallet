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
CFonts.say('Cache', { colors: ['cyan'] });
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
const downloadWallet = (wallet, address) => {
    console.log(colors_1.white(`\n\nDownloading wallet for your convenience.\n\nPlease store someplace safe. The private key is encrypted by your password.\n\nTo load this wallet on a new computer you would simply import the .wlt file into this app and enter your password and you'll be able to sign transactions.
	`));
    const addAbb = address.substring(0, 6);
    const stamp = new Date().toISOString().substring(0, 10);
    const homePath = `${os.homedir()}/cache-wallets`;
    if (!fs.existsSync(homePath)) {
        fs.mkdirSync(homePath);
    }
    const path = `${homePath}/${addAbb}-${stamp}-cache.wlt`;
    fs.writeFile(path, wallet.encryptedPrivateKey.encryptedKey, (_) => {
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
const main = () => {
    if (args[0] === 'wallet') {
        if (args[1] === 'create') {
            pwd();
        }
    }
};
main();
process.on('uncaughtException', function (_) {
    console.log('Wallet closed');
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixtQ0FBK0I7QUFDL0Isc0NBQTBEO0FBQzFELDZDQUFxRDtBQUNyRCxpREFBMEQ7QUFDMUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBR2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ3pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7RUFTWCxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQW9CLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUM7RUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDSixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFD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RixDQUFDLENBQUEsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFO0lBQ2pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEdBQUcsRUFBRSxDQUFDO1FBQ1AsQ0FBQztJQUNGLENBQUM7QUFDRixDQUFDLENBQUM7QUFFRixJQUFJLEVBQUUsQ0FBQztBQUVQLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBUyxDQUFDO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoJ3Byb21wdCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuaW1wb3J0IHsgd2hpdGUgfSBmcm9tICdjb2xvcnMnO1xuaW1wb3J0IHsgZ3JlZW4sIG1hZ2VudGEsIHJlZCwgeWVsbG93IH0gZnJvbSAnY29sb3JzL3NhZmUnO1xuaW1wb3J0IHsgUGFzc3dvcmQsIFNpbXBsZVdhbGxldCB9IGZyb20gJ25lbS1saWJyYXJ5JztcbmltcG9ydCB7IGNyZWF0ZVNpbXBsZVdhbGxldCB9IGZyb20gJy4uL3NyYy93YWxsZXQvd2FsbGV0JztcbmNvbnN0IENGb250cyA9IHJlcXVpcmUoJ2Nmb250cycpO1xuXG5kZWNsYXJlIGxldCBwcm9jZXNzOiBhbnk7XG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xuXG5DRm9udHMuc2F5KCdDYWNoZScsIHsgY29sb3JzOiBbJ2N5YW4nXX0pO1xuaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG5cdGNvbnNvbGUubG9nKGBVc2FnZTpcblx0Y2FjaGUgYmFsYW5jZVxuXHRcdEdldHMgeW91ciBjdXJyZW50IHdhbGxldCBiYWxhbmNlIGFuZCBwdWJsaWMgYWRkcmVzc1xuXHRcblx0Y2FjaGUgc2VuZCA8YW1vdW50PiA8YWRkcmVzcz5cblx0XHRTZW5kcyBjYWNoZSBmcm9tIHlvdXIgd2FsbGV0IHRvIHRoZSBzcGVjaWZpZWQgYWRkcmVzc1xuXHRcblx0Y2FjaGUgd2FsbGV0IGNyZWF0ZVxuXHRcdEd1aWRlcyB5b3UgdGhyb3VnaCBjcmVhdGluZyBhIG5ldyBjYWNoZSB3YWxsZXRcblx0YCk7XG5cdHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuY29uc3QgZG93bmxvYWRXYWxsZXQgPSAod2FsbGV0OiBTaW1wbGVXYWxsZXQsIGFkZHJlc3M6IHN0cmluZykgPT4ge1xuXHRjb25zb2xlLmxvZyh3aGl0ZShgXFxuXFxuRG93bmxvYWRpbmcgd2FsbGV0IGZvciB5b3VyIGNvbnZlbmllbmNlLlxcblxcblBsZWFzZSBzdG9yZSBzb21lcGxhY2Ugc2FmZS4gVGhlIHByaXZhdGUga2V5IGlzIGVuY3J5cHRlZCBieSB5b3VyIHBhc3N3b3JkLlxcblxcblRvIGxvYWQgdGhpcyB3YWxsZXQgb24gYSBuZXcgY29tcHV0ZXIgeW91IHdvdWxkIHNpbXBseSBpbXBvcnQgdGhlIC53bHQgZmlsZSBpbnRvIHRoaXMgYXBwIGFuZCBlbnRlciB5b3VyIHBhc3N3b3JkIGFuZCB5b3UnbGwgYmUgYWJsZSB0byBzaWduIHRyYW5zYWN0aW9ucy5cblx0YCkpO1xuXHRjb25zdCBhZGRBYmIgPSBhZGRyZXNzLnN1YnN0cmluZygwLDYpO1xuXHRjb25zdCBzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwxMCk7XG5cdGNvbnN0IGhvbWVQYXRoID0gYCR7b3MuaG9tZWRpcigpfS9jYWNoZS13YWxsZXRzYDtcblx0aWYgKCFmcy5leGlzdHNTeW5jKGhvbWVQYXRoKSkge1xuXHRcdGZzLm1rZGlyU3luYyhob21lUGF0aCk7XG5cdH1cblx0Y29uc3QgcGF0aCA9IGAke2hvbWVQYXRofS8ke2FkZEFiYn0tJHtzdGFtcH0tY2FjaGUud2x0YDtcblx0ZnMud3JpdGVGaWxlKHBhdGgsIHdhbGxldC5lbmNyeXB0ZWRQcml2YXRlS2V5LmVuY3J5cHRlZEtleSwgKF8pID0+IHtcblx0XHRjb25zb2xlLmxvZyhncmVlbihgXFxuRG93bmxvYWRlZCB3YWxsZXQgdG8gJHtwYXRofVxcbmApKTtcblx0fSk7XG59O1xuXG5jb25zdCBwd2QgPSAoKSA9PiB7XG5cdGNvbnNvbGUubG9nKHdoaXRlKFxuYFxcblBsZWFzZSBlbnRlciBhIHVuaXF1ZSBwYXNzd29yZCAke3llbGxvdygnKDggY2hhcmFjdGVyIG1pbmltdW0pJyl9LlxcbiBcblRoaXMgcGFzc3dvcmQgd2lsbCBiZSB1c2VkIHRvIGVuY3J5cHQgeW91ciBwcml2YXRlIGtleSBhbmQgbWFrZSB3b3JraW5nIHdpdGggeW91ciB3YWxsZXQgZWFzaWVyLlxcblxcbmBcblx0KSk7XG5cdGNvbnNvbGUubG9nKHJlZChcblx0XHRgU3RvcmUgdGhpcyBwYXNzd29yZCBzb21ld2hlcmUgc2FmZS4gSWYgeW91IGxvc2Ugb3IgZm9yZ2V0IGl0IHlvdSB3aWxsIG5ldmVyIGJlIGFibGUgdG8gdHJhbnNmZXIgZnVuZHNcXG5gXG5cdCkpO1xuXHRwcm9tcHQubWVzc2FnZSA9IHdoaXRlKCdDYWNoZSBXYWxsZXQnKTtcblx0cHJvbXB0LnN0YXJ0KCk7XG5cdHByb21wdC5nZXQoe1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdHBhc3N3b3JkOiB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUGFzc3dvcmQnKSxcblx0XHRcdFx0aGlkZGVuOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29uZmlybVBhc3M6IHtcblx0XHRcdFx0ZGVzY3JpcHRpb246IHdoaXRlKCdSZS1lbnRlciBwYXNzd29yZCcpLFxuXHRcdFx0XHRoaWRkZW46IHRydWVcblx0XHRcdH1cblx0XHR9XG5cdH0sIGFzeW5jIChfLCByZXN1bHQpID0+IHtcblx0XHRpZiAocmVzdWx0LnBhc3N3b3JkICE9PSByZXN1bHQuY29uZmlybVBhc3MpIHtcblx0XHRcdGNvbnNvbGUubG9nKG1hZ2VudGEoJ1xcblBhc3N3b3JkcyBkbyBub3QgbWF0Y2guXFxuXFxuJykpO1xuXHRcdFx0cHdkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHdhbGxldCA9IGNyZWF0ZVNpbXBsZVdhbGxldChyZXN1bHQucGFzc3dvcmQpO1xuXHRcdFx0Y29uc3QgcGFzcyA9IG5ldyBQYXNzd29yZChyZXN1bHQucGFzc3dvcmQpO1xuXHRcdFx0Y29uc3QgYWNjb3VudCA9IHdhbGxldC5vcGVuKHBhc3MpO1xuXHRcdFx0Y29uc3QgYWRkcmVzcyA9IGFjY291bnQuYWRkcmVzcy5wcmV0dHkoKTtcblx0XHRcdGNvbnNvbGUubG9nKGdyZWVuKCdcXG5DYWNoZSB3YWxsZXQgc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQuXFxuJykpO1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoJ1lvdSBjYW4gbm93IHN0YXJ0IHNlbmRpbmcgYW5kIHJlY2VpdmluZyBjYWNoZSFcXG4nKSk7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZShgXFxuQ2FjaGUgUHVibGljIEFkZHJlc3M6YCkpO1xuXHRcdFx0Y29uc29sZS5sb2coeWVsbG93KGAke2FkZHJlc3N9YCkpO1xuXHRcdFx0Y29uc29sZS5sb2cod2hpdGUoYFxcblByaXZhdGUgS2V5OmApKTtcblx0XHRcdGNvbnNvbGUubG9nKHllbGxvdyhgJHthY2NvdW50LnByaXZhdGVLZXl9YCkpO1xuXHRcdFx0YXdhaXQgZG93bmxvYWRXYWxsZXQod2FsbGV0LCBhZGRyZXNzKTtcblx0XHR9XG5cdH0pXG59O1xuXG5jb25zdCBtYWluID0gKCkgPT4ge1xuXHRpZiAoYXJnc1swXSA9PT0gJ3dhbGxldCcpIHtcblx0XHRpZiAoYXJnc1sxXSA9PT0gJ2NyZWF0ZScpIHtcblx0XHRcdHB3ZCgpO1xuXHRcdH1cblx0fVxufTtcblxubWFpbigpO1xuXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGZ1bmN0aW9uKF8pIHtcblx0Y29uc29sZS5sb2coJ1dhbGxldCBjbG9zZWQnKTtcblx0cHJvY2Vzcy5leGl0KDEpO1xufSk7Il19