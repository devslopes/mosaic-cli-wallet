import {
	Account, Address, EmptyMessage, MosaicHttp, MosaicId, NEMLibrary, NetworkTypes, Password, SimpleWallet, TimeWindow,
	TransferTransaction, AccountHttp, Mosaic
} from 'nem-library';
import { Observable } from 'rxjs/Observable';
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

const WALLET_NAME = 'cache wallet';
const namespace = 'devslopes';
const cache = 'cache';
const cacheId = new MosaicId(namespace, cache);
const mosaicHttp = new MosaicHttp();

export const getAccountBalance = (account: Account): Promise<Mosaic | null> => {
	return new Promise<Mosaic | null>((resolve, reject) => {
		const accountHttp = new AccountHttp();
		accountHttp.getMosaicOwnedByAddress(account.address).subscribe(mosaics => {
			const cacheMosaic = mosaics.find((mosaic) => {
				return mosaic.mosaicId.name === cache
			});
			if (!cacheMosaic) resolve(null);
			resolve(cacheMosaic);
		}, error => {
			reject(error);
		});
	});
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