"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ServerConfigs_1 = require("./ServerConfigs");
var Robot_1 = __importDefault(require("./Robot"));
var ExpressPeerServer = require("peer").ExpressPeerServer;
var P = require("peerjs-nodejs");
// @ts-ignore
global.Blob = require("blob-polyfill").Blob;
var robot = Robot_1.default.getInstance();
var app = express_1.default();
var server = app.listen(ServerConfigs_1.port);
// @ts-ignore
global.postMessage = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return console.log(arg);
};
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use("/peer", ExpressPeerServer(server, {
    debug: true
}));
app.get("/connected-players", function (req, res) { return res.json(Object.keys(robot.getPeer().connections)); });
// @ts-ignore
global.robot = robot;
