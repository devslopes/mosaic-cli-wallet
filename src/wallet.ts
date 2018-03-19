import {
	Account, Address, EmptyMessage, MosaicHttp, MosaicId, NEMLibrary, NetworkTypes, Password, SimpleWallet, TimeWindow,
	TransferTransaction, AccountHttp, Mosaic, TransactionHttp, NemAnnounceResult
} from 'nem-library';
import { Observable } from 'rxjs/Observable';

const NETWORK = NetworkTypes.TEST_NET;
NEMLibrary.bootstrap(NETWORK);

const mosaicSettings = require('./mosaic-settings.json');
const WALLET_NAME = mosaicSettings.wallet_name;
const namespace = mosaicSettings.mosaic_namespace;
const mosaicName = mosaicSettings.mosaic_name;
const mosaicId = new MosaicId(namespace, mosaicName);
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

export const mosaicBalance = (balances: Array<Mosaic>): number => {
	const found = balances.find((mosaic) => {
		return mosaic.mosaicId.name === mosaicName
	});
	if (!found) return 0;
	return found.quantity;
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
			mosaicHttp.getMosaicTransferableWithAmount(mosaicId, amount)
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
export const sendMosaic = (toAddress: string, amount: number, account: Account): Promise<NemAnnounceResult> => {
	return new Promise<NemAnnounceResult>((resolve, reject) => {
		const transactionHttp = new TransactionHttp();
		Observable.from([mosaicId])
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
