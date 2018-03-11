#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt = require('prompt');
const colors_1 = require("colors");
const safe_1 = require("colors/safe");
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
            console.log(colors_1.white('Please enter a unique password. This password will be used to encrypt your private key and make working with your wallet easier\n\n'));
            prompt.delimiter = safe_1.blue('><');
            prompt.message = colors_1.white('Cache Wallet:');
            prompt.start();
            prompt.get({
                properties: {
                    name: {
                        description: colors_1.white('Password:')
                    }
                }
            }, (err, result) => {
                console.log(result);
            });
        }
    }
};
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LWNsaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndhbGxldC1jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLG1DQUErQjtBQUMvQixzQ0FBbUM7QUFHbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7Ozs7OztFQVNYLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxHQUFHLEVBQUU7SUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMscUlBQXFJLENBQUMsQ0FBQyxDQUFDO1lBQzFKLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ1YsVUFBVSxFQUFFO29CQUNYLElBQUksRUFBRTt3QkFDTCxXQUFXLEVBQUUsY0FBSyxDQUFDLFdBQVcsQ0FBQztxQkFDL0I7aUJBQ0Q7YUFDRCxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztJQUNGLENBQUM7QUFDRixDQUFDLENBQUM7QUFFRixJQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoJ3Byb21wdCcpO1xuaW1wb3J0IHsgd2hpdGUgfSBmcm9tICdjb2xvcnMnO1xuaW1wb3J0IHsgYmx1ZSB9IGZyb20gJ2NvbG9ycy9zYWZlJztcblxuZGVjbGFyZSBsZXQgcHJvY2VzczogYW55O1xuY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSgyKTtcblxuaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG5cdGNvbnNvbGUubG9nKGBVc2FnZTpcblx0Y2FjaGUgYmFsYW5jZVxuXHRcdEdldHMgeW91ciBjdXJyZW50IHdhbGxldCBiYWxhbmNlIGFuZCBwdWJsaWMgYWRkcmVzc1xuXHRcblx0Y2FjaGUgc2VuZCA8YW1vdW50PiA8YWRkcmVzcz5cblx0XHRTZW5kcyBjYWNoZSBmcm9tIHlvdXIgd2FsbGV0IHRvIHRoZSBzcGVjaWZpZWQgYWRkcmVzc1xuXHRcblx0Y2FjaGUgd2FsbGV0IGNyZWF0ZVxuXHRcdEd1aWRlcyB5b3UgdGhyb3VnaCBjcmVhdGluZyBhIG5ldyBjYWNoZSB3YWxsZXRcblx0YCk7XG5cdHByb2Nlc3MuZXhpdCgxKTtcbn1cbmNvbnN0IGNvbW1hbmQgPSBhcmdzWzBdO1xuY29uc3QgbWFpbiA9ICgpID0+IHtcblx0aWYgKGFyZ3NbMF0gPT09ICd3YWxsZXQnKSB7XG5cdFx0aWYgKGFyZ3NbMV0gPT09ICdjcmVhdGUnKSB7XG5cdFx0XHRjb25zb2xlLmxvZyh3aGl0ZSgnUGxlYXNlIGVudGVyIGEgdW5pcXVlIHBhc3N3b3JkLiBUaGlzIHBhc3N3b3JkIHdpbGwgYmUgdXNlZCB0byBlbmNyeXB0IHlvdXIgcHJpdmF0ZSBrZXkgYW5kIG1ha2Ugd29ya2luZyB3aXRoIHlvdXIgd2FsbGV0IGVhc2llclxcblxcbicpKTtcblx0XHRcdHByb21wdC5kZWxpbWl0ZXIgPSBibHVlKCc+PCcpO1xuXHRcdFx0cHJvbXB0Lm1lc3NhZ2UgPSB3aGl0ZSgnQ2FjaGUgV2FsbGV0OicpO1xuXHRcdFx0cHJvbXB0LnN0YXJ0KCk7XG5cdFx0XHRwcm9tcHQuZ2V0KHtcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdG5hbWU6IHtcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB3aGl0ZSgnUGFzc3dvcmQ6Jylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sIChlcnIsIHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXN1bHQpO1xuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn07XG5cbm1haW4oKTsiXX0=