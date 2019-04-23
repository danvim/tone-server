declare global {
  namespace NodeJS {
    interface Global {
      File: any;
      Blob: any;
      FileReader: any;
      postMessage: (k: any[]) => any;
    }
  }
}

global.File = false;
// tslint:disable-next-line:no-var-requires
global.Blob = require('blob-polyfill').Blob;
// tslint:disable-next-line:no-var-requires
global.FileReader = require('filereader');
global.postMessage = (...arg) => global.console.log(arg);

import express from 'express';
import { peerPort } from './ServerConfigs';
import { PackageType } from 'tone-core/dist/lib';
import Robot from './Robot';
import { Lobby } from './Game/Lobby';
// tslint:disable-next-line:no-var-requires
const { ExpressPeerServer } = require('peer');

const robot = Robot.getInstance();

// Express Server
const app = express();
const server = app.listen(peerPort, () => {
  global.console.log('listening on PORT', peerPort);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use('/peer', ExpressPeerServer(server, { debug: true }));

app.use('/', express.static('views'));

// Game Logic
const protocol = robot.getProtocol();

protocol.on(PackageType.CHAT, global.console.log);

const lobby = new Lobby();
