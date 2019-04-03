declare global {
  namespace NodeJS {
    interface Global {
      File: any;
      Blob: any;
      FileReader: any;
      postMessage: ((k: any[]) => any);
    }
  }
}

global.File = false;
global.Blob = require('blob-polyfill').Blob;
global.FileReader = require('filereader');
global.postMessage = (...arg) => global.console.log(arg);

import express from 'express';
import { port } from './ServerConfigs';
import { protocol } from './Connection';
import { PackageType } from 'tone-core/dist/lib';
import { Lobby } from './Game/Lobby';
// tslint:disable-next-line:no-var-requires
const { ExpressPeerServer } = require('peer');


// Express Server
const app = express();
const server = app.listen(port, () => {
  global.console.log('listening on PORT', port);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use('/peer', ExpressPeerServer(server, {debug: true}));

app.use('/', express.static('views'));


// Game Logic
protocol.on(PackageType.CHAT, (data: any) => {
  global.console.log(data);
});

const lobby = new Lobby(protocol);
