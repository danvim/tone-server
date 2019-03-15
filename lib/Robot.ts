import Peer = PeerJs.Peer;
import {port} from "./ServerConfigs"

const P = require("peerjs-nodejs");

export default class Robot {

    private peer: Peer;
    private static instance: Robot;

    private constructor() {
        this.peer = <Peer> new P("server", {
            host: "localhost",
            port: port,
            path: "/peer"
        });

        this.peer.on('connection', function(conn) {
            console.log(`Robot connected with ${conn.peer}!`);
            console.log(conn);
            conn.on("data", data => console.log)
        });
    }

    public static getInstance() {
        if (!Robot.instance) {
            Robot.instance = new Robot();
        }

        return Robot.instance;
    }

    public getPeer() {
        return this.peer;
    }
}
