import express from 'express';
// @ts-ignore
global.File = false;
// @ts-ignore
// tslint:disable-next-line:no-var-requires
global.Blob = require('blob-polyfill').Blob;
// @ts-ignore
// tslint:disable-next-line:no-var-requires
global.FileReader = require('filereader');
import { port } from './ServerConfigs';
import { protocol } from './Connection';
import { PackageType } from 'tone-core/dist/lib';
import { Lobby } from './Game/Lobby';

// tslint:disable-next-line:no-var-requires
const { ExpressPeerServer } = require('peer');

const app = express();
const server = app.listen(port, () => {
  global.console.log('listening on PORT', port);
});

// @ts-ignore
global.postMessage = (...arg) => global.console.log(arg);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use(
  '/peer',
  ExpressPeerServer(server, {
    debug: true,
  }),
);

app.use('/', express.static('views'));

// app.get("/connected-players", (req, res) =>
//   res.json(<OptionsJson>Object.keys(robot.getPeer().connections))
// );

// console.log(process.env.PORT);

// // @ts-ignore
// global.robot = robot;

protocol.on(PackageType.CHAT, (data) => {
  global.console.log(data);
});

const lobby = new Lobby(protocol);
