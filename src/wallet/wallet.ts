import { Account, NEMLibrary, NetworkTypes, Password, SimpleWallet } from 'nem-library';

const WALLET_NAME = 'cache wallet';
declare let process: any;

NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
const privateKey: string = process.env.PRIVATE_KEY;

export const getWallet = (password: string): Account => {
	const pass = new Password(password);
	const wallet = SimpleWallet.createWithPrivateKey(WALLET_NAME, pass, privateKey);
	return wallet.open(pass);
};

export const createSimpleWallet = (password: string): Account => {
	const pass = new Password(password);
	const wallet = SimpleWallet.create(WALLET_NAME, pass);
	return wallet.open(pass);
};