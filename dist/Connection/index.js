"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
global.Blob = require("blob-polyfill").Blob;
// @ts-ignore
global.File = false;
var peerjs = require("peerjs-nodejs");
var ServerConfigs_1 = require("../ServerConfigs");
var Protocol_1 = require("tone-core/dist/Protocol");
// console.log(Protocol);
// @ts-ignore
global.postMessage = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return console.log(arg);
};
var Peer = peerjs("server", {
    host: "localhost",
    port: ServerConfigs_1.port,
    path: "/peer"
});
var _protocol = new Protocol_1.Protocol();
Peer.on("connection", function (conn) {
    conn.serialization = "none";
    _protocol.add(conn);
});
exports.protocol = _protocol;
