global.Blob = require("blob-polyfill").Blob;
var express = require("express");
var app = express();
var http = require("http").Server(app);
// var ioServer = require("socket.io")(http);
const peerjs = require("peerjs-nodejs");

const { ExpressPeerServer } = require("peer");

const Protocol = require("tone-core/dist/Protocol/").default;
const ProtoBuf = require("tone-core/dist/Protocol/Protobuf").default;
const PackageType = require("tone-core/dist/Protocol/PackageType").PackageType;

const Game = require("tone-core/dist/Game").default;
console.log(Game);
const ToneCore = require("tone-core/dist");
console.log(ToneCore, ToneCore.Protocol, ToneCore.Axial);
// @ts-ignore
global.postMessage = (...arg) => console.log(arg);

const PORT = 30000;

const clientProcotocol = new Protocol();

let peer2 = peerjs({ host: "localhost", port: PORT, path: "/peer" });
peer2.serialization = "none";
let conn2 = peer2.connect("server");
conn2.serialization = "none";
conn2.on("data", data => {
  console.log("conn2", data);
});
conn2.on("open", () => {
  console.log("send");
  clientProcotocol.add(conn2);
  // clientProcotocol.AssignId(2);
  clientProcotocol.Message("hello");
  clientProcotocol.emit(PackageType.MESSAGE, { content: "world" });
});
