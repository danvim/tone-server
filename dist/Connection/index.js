"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-var-requires
var p = require('peerjs-nodejs');
var ServerConfigs_1 = require("../ServerConfigs");
var lib_1 = require("tone-core/dist/lib");
var peer = p(ServerConfigs_1.serverPeerName, {
    host: 'localhost',
    port: ServerConfigs_1.port,
    path: '/peer',
});
exports.protocol = new lib_1.Protocol();
peer.on('connection', function (conn) {
    conn.serialization = 'none';
    exports.protocol.add(conn);
});
