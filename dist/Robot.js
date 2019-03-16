"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerConfigs_1 = require("./ServerConfigs");
var P = require("peerjs-nodejs");
var Robot = /** @class */ (function () {
    // private connections: Array<PeerJs.DataConnection>;
    function Robot() {
        // this.connections = [];
        var _this = this;
        this.peer = new P("server", {
            host: "localhost",
            port: ServerConfigs_1.port,
            path: "/peer"
        });
        this.peer.on("connection", function (conn) {
            console.log("Robot connected with " + conn.peer + "!");
            // console.log(conn);
            // this.connections.push(conn);
            // @ts-ignore
            global.conn = conn;
            conn.on("data", function (data) {
                // console.log(data);
                conn.send(data);
                _this.broadcast(data);
            });
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
    Robot.prototype.broadcast = function (data) {
        // console.log(data);
        // console.log(this.peer.connections);
        // Object.values(this.peer.connections).forEach((conns: any) => {
        //   // console.log(conns);
        //   conns.forEach((conn: any) => {
        //     conn.send(data);
        //   });
        // });
    };
    return Robot;
}());
exports.default = Robot;
