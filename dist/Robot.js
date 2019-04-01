"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerConfigs_1 = require("./ServerConfigs");
var lib_1 = require("tone-core/dist/lib");
var P = require("peerjs-nodejs");
var Robot = /** @class */ (function () {
    function Robot() {
        this.protocol = new lib_1.Protocol();
        this.peer = new P("server", {
            host: "localhost",
            port: ServerConfigs_1.port,
            path: "/peer"
        });
        this.peer.on('connection', function (conn) {
            console.log("Robot connected with " + conn.peer + "!");
            // @ts-ignore
            global.conn = conn;
            conn.on("data", console.log);
            var map = lib_1.Protocol.encode(lib_1.PackageType.UPDATE_TILES, {
                '1,0': {
                    type: lib_1.TileType.EMPTY,
                    height: 2
                },
                '1,1': {
                    type: lib_1.TileType.EMPTY,
                    height: 1
                }
            });
            console.log(map);
            conn.send(map);
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
    return Robot;
}());
exports.default = Robot;
