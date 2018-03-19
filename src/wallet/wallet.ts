import {
	Account, Address, EmptyMessage, MosaicHttp, MosaicId, NEMLibrary, NetworkTypes, Password, SimpleWallet, TimeWindow,
	TransferTransaction, AccountHttp, Mosaic, TransactionHttp, NemAnnounceResult
} from 'nem-library';
import { Observable } from 'rxjs/Observable';
const NETWORK = NetworkTypes.TEST_NET;
NEMLibrary.bootstrap(NETWORK);

const WALLET_NAME = 'cache wallet';
const namespace = 'devslopes';
const cache = 'cache';
const cacheId = new MosaicId(namespace, cache);
const mosaicHttp = new MosaicHttp();

export const getAccountBalances = (account: Account): Promise<Array<Mosaic>> => {
	return new Promise<Array<Mosaic>>((resolve, reject) => {
		const accountHttp = new AccountHttp();
		accountHttp.getMosaicOwnedByAddress(account.address).subscribe(mosaics => {
			resolve(mosaics);
		}, error => {
			reject(error);
		});
	});
};

export const cacheBalance = (balances: Array<Mosaic>): number => {
	const cacheMosaic = balances.find((mosaic) => {
		return mosaic.mosaicId.name === cache
	});
	if (!cacheMosaic) return 0;
	return cacheMosaic.quantity;
};

export const xemBalance = (balances: Array<Mosaic>): number => {
	const xemMosaic = balances.find((mosaic) => {
		return mosaic.mosaicId.name === 'xem'
	});
	if (!xemMosaic) return 0;
	return xemMosaic.quantity;
};

export const createSimpleWallet= (password: string): SimpleWallet => {
	const pass = new Password(password);
	return SimpleWallet.create(WALLET_NAME, pass);
};
export const prepareTransfer = (toAddress: string, amount: number): Promise<TransferTransaction> => {
	return new Promise<TransferTransaction>((resolve, reject) => {
			mosaicHttp.getMosaicTransferableWithAmount(cacheId, amount)
				.subscribe(transferable => {
					resolve(TransferTransaction.createWithMosaics(
						TimeWindow.createWithDeadline(),
						new Address(toAddress),
						[transferable],
						EmptyMessage))
				}, error => {
					reject(error);
				});
	});
};
export const sendCache = (toAddress: string, amount: number, account: Account): Promise<NemAnnounceResult> => {
	return new Promise<NemAnnounceResult>((resolve, reject) => {
		const transactionHttp = new TransactionHttp();
		Observable.from([cacheId])
			.flatMap(mosaic => mosaicHttp.getMosaicTransferableWithAmount(mosaic, amount))
			.toArray()
			.map(mosaics => TransferTransaction.createWithMosaics(
				TimeWindow.createWithDeadline(),
				new Address(toAddress),
				mosaics,
				EmptyMessage))
			.map(transaction => account.signTransaction(transaction))
			.flatMap(signed => transactionHttp.announceTransaction(signed))
			.subscribe(result => {
				resolve(result);
			}, error => {
				reject(error);
			});
	});
};
