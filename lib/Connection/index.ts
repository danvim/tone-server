// @ts-ignore
global.Blob = require("blob-polyfill").Blob;
// @ts-ignore
global.File = false;

import Peer = PeerJs.Peer;
import DataConnection = PeerJs.DataConnection;
const peerjs = require("peerjs-nodejs");
import { port } from "../ServerConfigs";
import { PackageType, Protocol } from "tone-core/dist/Protocol";

// console.log(Protocol);

// @ts-ignore
global.postMessage = (...arg) => console.log(arg);

let Peer = peerjs("server", {
  host: "localhost",
  port: port,
  path: "/peer"
});

const _protocol = new Protocol();

Peer.on("connection", (conn: DataConnection) => {
  conn.serialization = "none";
  _protocol.add(conn);
});

export const protocol = _protocol;
