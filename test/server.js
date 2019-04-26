global.Blob = require('blob-polyfill').Blob;
const Peer = require('peerjs-nodejs');

const Protocol = require('tone-core/dist/lib/Protocol/').Protocol;
const PackageType = require('tone-core/dist/lib/Protocol/PackageType')
  .PackageType;

// @ts-ignore
global.postMessage = (...arg) => global.console.log(arg);

const PORT = 30000;

const clientProtocol = new Protocol();
const protocol1 = new Protocol();
const Axial = require('tone-core/dist/lib').Axial;
const BuildingType = require('tone-core/dist/lib').BuildingType;

let peer1 = new Peer({ host: 'localhost', port: PORT, path: '/peer' });
peer1.serialization = 'none';
let conn1 = peer1.connect('server');
conn1.serialization = 'none';
conn1.on('data', data => {
  global.console.log('conn1', data);
});
conn1.on('open', () => {
  protocol1.add(conn1);
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel Chueng' });
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel The God' });
});

let peer3 = new Peer({ host: 'localhost', port: PORT, path: '/peer' });
peer3.serialization = 'none';
let conn3 = peer3.connect('server');
conn3.serialization = 'none';
conn3.on('data', data => {
  global.console.log('conn3', data);
});
conn3.on('open', () => {
  protocol1.add(conn3);
  protocol1.emit(PackageType.TRY_JOIN_LOBBY, { username: 'Daniel The God' });
});

let peer2 = new Peer({ host: 'localhost', port: PORT, path: '/peer' });
peer2.serialization = 'none';
let conn2 = peer2.connect('server');
conn2.serialization = 'none';
conn2.on('data', data => {
  global.console.log('conn2', data);
});
conn2.on('open', () => {
  global.console.log('send');
  clientProtocol.add(conn2);
  // clientProtocol.AssignId(2);
  clientProtocol.emit(PackageType.CHAT, { content: 'world' });

  clientProtocol.emit(PackageType.TRY_JOIN_LOBBY, { username: 'dipsy' });
  clientProtocol.on(PackageType.UPDATE_LOBBY, (data, conn) => {
    global.console.log(data);
    clientProtocol.emit(PackageType.TRY_START_GAME, {});
  });
  clientProtocol.on(PackageType.START_GAME, () => {
    global.console.log('start game');
    clientProtocol.emit(PackageType.CHAT, {
      content: 'hello world why it dont work',
    });
    startGameTests();
  });
  clientProtocol.on(PackageType.UPDATE_TILES, (object, conn) => {
    global.console.log(object);
  });
});

let startGameTests;

// it('placeholder',async done=>{
startGameTests = () => {
  const start = Date.now();
  const mylog = (...param) => {
    console.log(Date.now() - start, ...param);
  };
  clientProtocol.emit(PackageType.TRY_BUILD, {
    axialCoords: [new Axial(1, 0)],
    buildingType: BuildingType.STRUCT_GEN,
  });
  clientProtocol.on(PackageType.SPAWN_ENTITY, mylog);
  clientProtocol.on(PackageType.MOVE_ENTITY, mylog);
  clientProtocol.on(PackageType.BUILD, mylog);
};
// })
