global.Blob = require('blob-polyfill').Blob;
const peerjs = require('peerjs-nodejs');

const Protocol = require('tone-core/dist/lib/Protocol/').Protocol;
const PackageType = require('tone-core/dist/lib/Protocol/PackageType')
  .PackageType;

// @ts-ignore
global.postMessage = (...arg) => console.log(arg);

const PORT = 30000;

const clientProcotocol = new Protocol();
const protocol1 = new Protocol();

let peer1 = peerjs({ host: 'localhost', port: PORT, path: '/peer' });
peer1.serialization = 'none';
let conn1 = peer1.connect('server');
conn1.serialization = 'none';
conn1.on('data', data => {
  console.log('conn1', data);
});
conn1.on('open', () => {
  protocol1.add(conn1);
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel Chueng' });
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel The God' });
});

let peer3 = peerjs({ host: 'localhost', port: PORT, path: '/peer' });
peer3.serialization = 'none';
let conn3 = peer3.connect('server');
conn3.serialization = 'none';
conn3.on('data', data => {
  console.log('conn3', data);
});
conn3.on('open', () => {
  protocol1.add(conn3);
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel The God' });
});

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
  clientProcotocol.emit(PackageType.CHAT, { content: 'world' });

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
