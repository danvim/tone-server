import Peer = PeerJs.Peer;
import DataConnection = PeerJs.DataConnection;
// tslint:disable-next-line:no-var-requires
const P = require('peerjs-nodejs');
import {peerPort, peerName, peerHost, peerPath} from '../ServerConfigs';
import { Protocol } from 'tone-core/dist/lib';

export const protocol = new Protocol();

const peer = new P(peerName, {
  host: peerHost,
  port: peerPort,
  path: peerPath,
  debug: 3,
}) as Peer;

peer.on('connection', (conn: DataConnection) => {
  global.console.log(`Server has connected with ${conn.peer}`);
  // @ts-ignore
  global.conn = conn;
  conn.on('data', global.console.log);
  // protocol.add(conn);
});
