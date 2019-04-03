import Peer = PeerJs.Peer;
import DataConnection = PeerJs.DataConnection;
import {peerPort, peerName, peerHost, peerPath} from './ServerConfigs';
import { Protocol } from 'tone-core/dist/lib';
// tslint:disable-next-line:no-var-requires
const P = require('peerjs-nodejs');

export default class Robot {

  public static getInstance() {
    if (!Robot.instance) {
      Robot.instance = new Robot();
    }

    return Robot.instance;
  }

  private static instance: Robot;
  private readonly peer: Peer;
  private readonly protocol: Protocol;

  private constructor() {
    this.protocol = new Protocol();

    this.peer = new P(peerName, {
      host: peerHost,
      port: peerPort,
      path: peerPath,
      debug: 3,
    }) as Peer;

    this.peer.on('connection', (conn: DataConnection) => {
      global.console.log(`Server has connected with ${conn.peer}`);
      // @ts-ignore
      global.conn = conn;
      conn.on('data', global.console.log);
      this.protocol.add(conn);
    });
  }

  public getPeer() {
    return this.peer;
  }

  public getProtocol() {
    return this.protocol;
  }
}

