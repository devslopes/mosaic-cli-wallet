// import {
// 	MosaicHttp, MosaicId, MosaicTransferable, NEMLibrary, NetworkTypes, TimeWindow,
// 	TransferTransaction, Address, EmptyMessage
// } from 'nem-library';
// import { MosaicDefinition } from 'nem-library/dist/src/models/mosaic/MosaicDefinition';
// import { Observable } from 'rxjs/Observable';
//
// NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
//
// const mosaicHttp = new MosaicHttp();
// const namespace = 'devslopes';
// const cache = 'cache';
//
// const cacheId = new MosaicId(namespace, cache);
//
// mosaicHttp.getMosaicDefinition(cacheId).subscribe(definition => {
// 	console.log(definition);
// });
//
// let cacheDefinition: MosaicDefinition;
//
//
// const send = () => {
// 	Observable.from([cacheId])
// 		.flatMap(mosaic => mosaicHttp.getMosaicTransferableWithAmount(mosaic, 10))
// 		.toArray()
// 		.map(mosaics => TransferTransaction.createWithMosaics(
// 			TimeWindow.createWithDeadline(),
// 			new Address('blah'),
// 			mosaics,
// 			EmptyMessage))
//
//
// };