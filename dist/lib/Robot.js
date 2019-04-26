"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerConfigs_1 = require("./ServerConfigs");
var lib_1 = require("tone-core/dist/lib");
// tslint:disable-next-line:no-var-requires
var P = require('peerjs-nodejs');
var Robot = /** @class */ (function () {
    function Robot() {
        var _this = this;
        this.protocol = new lib_1.Protocol();
        this.peer = new P(ServerConfigs_1.peerName, {
            host: ServerConfigs_1.peerHost,
            port: ServerConfigs_1.peerPort,
            path: ServerConfigs_1.peerPath,
            debug: 3,
        });
        this.peer.on('connection', function (conn) {
            global.console.log("Server has connected with " + conn.peer);
            // @ts-ignore
            global.conn = conn;
            conn.on('data', global.console.log);
            _this.protocol.add(conn);
        });
    }
    Robot.getInstance = function () {
        if (!Robot.instance) {
            Robot.instance = new Robot();
        }
        return Robot.instance;
    };
    Robot.prototype.getPeer = function () {
        return this.peer;
    };
    Robot.prototype.getProtocol = function () {
        return this.protocol;
    };
    return Robot;
}());
exports.default = Robot;
