"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerConfigs_1 = require("./ServerConfigs");
var P = require("peerjs-nodejs");
var Robot = /** @class */ (function () {
    function Robot() {
        this.peer = new P("server", {
            host: "localhost",
            port: ServerConfigs_1.port,
            path: "/peer"
        });
        this.peer.on('connection', function (conn) {
            console.log("Robot connected with " + conn.peer + "!");
            console.log(conn);
            conn.on("data", function (data) { return console.log; });
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
