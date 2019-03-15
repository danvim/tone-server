import express from "express";
import {OptionsJson} from "body-parser";
import Peer = PeerJs.Peer;
import {port} from "./ServerConfigs";
import Robot from "./Robot";

const {ExpressPeerServer} = require("peer");
const P = require("peerjs-nodejs");

const robot = Robot.getInstance();

const app = express();
const server = app.listen(port);

// @ts-ignore
global.postMessage = (...arg) => console.log(arg);

app.use("/peer", ExpressPeerServer(server, {
    debug: true
}));

app.get("/connected-players", (req, res) => res.json(
    <OptionsJson> Object.keys(robot.getPeer().connections)
));

// @ts-ignore
global.robot = robot;
