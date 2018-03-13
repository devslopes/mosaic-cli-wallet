import {
	Account, Address, EmptyMessage, MosaicHttp, MosaicId, NEMLibrary, NetworkTypes, Password, SimpleWallet, TimeWindow,
	TransferTransaction
} from 'nem-library';
import { Observable } from 'rxjs/Observable';
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

const WALLET_NAME = 'cache wallet';
declare let process: any;

const namespace = 'devslopes';
const cache = 'cache';
const cacheId = new MosaicId(namespace, cache);
const mosaicHttp = new MosaicHttp();

const privateKey: string = process.env.PRIVATE_KEY;

export const getWallet = (password: string): Account => {
	const pass = new Password(password);
	const wallet = SimpleWallet.createWithPrivateKey(WALLET_NAME, pass, privateKey);
	return wallet.open(pass);
};

export const createSimpleWallet = (password: string): SimpleWallet => {
	const pass = new Password(password);
	return SimpleWallet.create(WALLET_NAME, pass);
};

export const sendCache = () => {
	Observable.from([cacheId])
		.flatMap(mosaic => mosaicHttp.getMosaicTransferableWithAmount(mosaic, 10))
		.toArray()
		.map(mosaics => TransferTransaction.createWithMosaics(
			TimeWindow.createWithDeadline(),
			new Address('blah'),
			mosaics,
			EmptyMessage))

};