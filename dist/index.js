"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
// @ts-ignore
global.Blob = require("blob-polyfill").Blob;
// @ts-ignore
global.FileReader = require("filereader");
var ServerConfigs_1 = require("./ServerConfigs");
var Connection_1 = require("./Connection");
var Protocol_1 = require("tone-core/dist/Protocol");
var ExpressPeerServer = require("peer").ExpressPeerServer;
var app = express_1.default();
var server = app.listen(ServerConfigs_1.port, function () {
    console.log("listening on PORT", ServerConfigs_1.port);
});
// @ts-ignore
global.postMessage = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return console.log(arg);
};
app.use("/peer", ExpressPeerServer(server, {
    debug: true
}));
app.use("/", express_1.default.static("views"));
// app.get("/connected-players", (req, res) =>
//   res.json(<OptionsJson>Object.keys(robot.getPeer().connections))
// );
// console.log(process.env.PORT);
// // @ts-ignore
// global.robot = robot;
Connection_1.protocol.on(Protocol_1.PackageType.MESSAGE, function (data) {
    console.log(data);
});
