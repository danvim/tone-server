global.Blob = require('blob-polyfill').Blob;
const peerjs = require('peerjs-nodejs');

const Protocol = require('tone-core/dist/lib/Protocol/').Protocol;
const PackageType = require('tone-core/dist/lib/Protocol/PackageType')
  .PackageType;

// @ts-ignore
global.postMessage = (...arg) => console.log(arg);

const PORT = 30000;

const clientProcotocol = new Protocol();

let peer2 = peerjs({ host: 'localhost', port: PORT, path: '/peer' });
peer2.serialization = 'none';
let conn2 = peer2.connect('server');
conn2.serialization = 'none';
conn2.on('data', data => {
  console.log('conn2', data);
});
conn2.on('open', () => {
  console.log('send');
  clientProcotocol.add(conn2);
  // clientProcotocol.AssignId(2);
  clientProcotocol.Message('hello');
  clientProcotocol.emit(PackageType.MESSAGE, { content: 'world' });

  clientProcotocol.emit(PackageType.TRY_JOIN_LOBBY, { username: 'dipsy' });
  clientProcotocol.on(PackageType.UPDATE_LOBBY, (data, conn) => {
    console.log(data);
    clientProcotocol.emit(PackageType.TRY_START_GAME, {});
  });
  clientProcotocol.on(PackageType.START_GAME, () => {
    console.log('start game');
  });
  clientProcotocol.on(PackageType.UPDATE_TILES, (object, conn) => {
    console.log(object);
  });
});
