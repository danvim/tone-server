"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
global.File = false;
// tslint:disable-next-line:no-var-requires
global.Blob = require('blob-polyfill').Blob;
// tslint:disable-next-line:no-var-requires
global.FileReader = require('filereader');
global.postMessage = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return global.console.log(arg);
};
global.test = false;
var express_1 = __importDefault(require("express"));
var ServerConfigs_1 = require("./ServerConfigs");
var lib_1 = require("tone-core/dist/lib");
var Robot_1 = __importDefault(require("./Robot"));
var Lobby_1 = require("./Game/Lobby");
// tslint:disable-next-line:no-var-requires
var ExpressPeerServer = require('peer').ExpressPeerServer;
var robot = Robot_1.default.getInstance();
// Express Server
var app = express_1.default();
var server = app.listen(ServerConfigs_1.peerPort, function () {
    global.console.log('listening on PORT', ServerConfigs_1.peerPort);
});
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use('/peer', ExpressPeerServer(server, { debug: true }));
app.use('/', express_1.default.static('views'));
// Game Logic
var protocol = robot.getProtocol();
protocol.on(lib_1.PackageType.CHAT, function (object, conn) {
    return global.console.log('chat', conn.peer, object);
});
var lobby = new Lobby_1.Lobby();
