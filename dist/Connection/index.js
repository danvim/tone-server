"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-var-requires
var P = require('peerjs-nodejs');
var ServerConfigs_1 = require("../ServerConfigs");
var lib_1 = require("tone-core/dist/lib");
exports.protocol = new lib_1.Protocol();
var peer = new P(ServerConfigs_1.peerName, {
    host: ServerConfigs_1.peerHost,
    port: ServerConfigs_1.peerPort,
    path: ServerConfigs_1.peerPath,
    debug: 3,
});
peer.on('connection', function (conn) {
    global.console.log("Server has connected with " + conn.peer);
    // @ts-ignore
    global.conn = conn;
    conn.on('data', global.console.log);
    // protocol.add(conn);
});
