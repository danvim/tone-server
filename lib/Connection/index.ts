import Peer = PeerJs.Peer;
import DataConnection = PeerJs.DataConnection;
// tslint:disable-next-line:no-var-requires
const p = require('peerjs-nodejs');
import {port, serverPeerName} from '../ServerConfigs';
import { PackageType, Protocol } from 'tone-core/dist/lib';

const peer = p(serverPeerName, {
  host: 'localhost',
  port,
  path: '/peer',
}) as Peer;

export const protocol = new Protocol();

peer.on('connection', (conn: DataConnection) => {
  conn.serialization = 'none';
  protocol.add(conn);
});
