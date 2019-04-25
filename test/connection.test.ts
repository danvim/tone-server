// // tslint:disable-next-line: no-var-requires
// global.Blob = require('blob-polyfill').Blob;

// // tslint:disable-next-line: no-var-requires
// const Peer = require('peerjs-nodejs');

// // tslint:disable-next-line: no-var-requires
// const Protocol = require('tone-core/dist/lib/Protocol/').Protocol;
// // tslint:disable-next-line: no-var-requires
// const PackageType = require('tone-core/dist/lib/Protocol/PackageType')
//   .PackageType;

// // @ts-ignore
// global.postMessage = (...arg) => global.console.log(arg);

// const PORT = 30000;

// const clientProtocol = new Protocol();
// const protocol1 = new Protocol();

// const peer1 = new Peer({ host: 'localhost', port: PORT, path: '/peer' });
// // @ts-ignore
// peer1.serialization = 'none';
// const conn1 = peer1.connect('server');
// conn1.serialization = 'none';
// conn1.on('data', (data) => {
//   global.console.log('conn1', data);
// });

// it('t', async (done) => {
//   expect(1).toBe(1);
//   conn1.on('open', () => {
//     protocol1.add(conn1);
//     protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel Chueng' });
//     protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel The God' });
//     done();
//   });
// });

// // import { Protocol, PackageType } from 'tone-core/dist/lib';
// // // tslint:disable-next-line: no-var-requires
// // global.Blob = require('blob-polyfill').Blob;
// // // tslint:disable-next-line: no-var-requires
// // const Peer = require('peerjs-nodejs');
// // // @ts-ignore
// // global.postMessage = (...arg) => global.console.log(arg);

// // const PORT = 30000;

// // const protocol = new Protocol();
// // const peer = new Peer({ host: 'localhost', port: PORT, path: '/peer' });
// // peer.serialization = 'none';
// // const conn = peer.connect('server');
// // conn.serialization = 'none';
// // conn.on('data', (data: any) => {
// //   global.console.log('conn', data);
// // });
// // protocol.add(conn);

// // describe('lobby', () => {
// //   it('connected', async (done) => {
// //     await new Promise((resolve) => conn.on('open', resolve));
// //     expect(conn.open).toBe(true);
// //     protocol.emit(PackageType.CHAT, { content: 'jest testing' });
// //     done();
// //   });
// //   it('join lobby', async (done) => {
// //     protocol.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Dipsy' });
// //     const object = await new Promise((resolve) =>
// //       protocol.on(PackageType.UPDATE_LOBBY, (object: any) =>
// //         resolve(Object(object)),
// //       ),
// //     );
// //     expect(object).toStrictEqual({
// //       playerId: 0,
// //       username: 'Dipsy',
// //       connId: conn.peer,
// //     });
// //     done();
// //   });
// //   it('start game', async (done) => {
// //     protocol.emit(PackageType.TRY_START_GAME, {});
// //     const object = await new Promise((resolve) =>
// //       protocol.on(PackageType.START_GAME, (object: any) => {
// //         resolve(object);
// //       }),
// //     );
// //     expect(object).toStrictEqual({});
// //     done();
// //   });
// // });

it('placeholder', () => {
  expect(1).toBe(1);
});
