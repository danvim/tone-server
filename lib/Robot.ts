import Peer = PeerJs.Peer;
import {port} from "./ServerConfigs"
import {Protocol, PackageType, TileMap, TileType} from "tone-core/dist/lib";

const P = require("peerjs-nodejs");

export default class Robot {

    private peer: Peer;
    private static instance: Robot;
    private protocol: Protocol = new Protocol();

    private constructor() {
        this.peer = <Peer> new P("server", {
            host: "localhost",
            port: port,
            path: "/peer"
        });

        this.peer.on('connection', (conn) => {
            console.log(`Robot connected with ${conn.peer}!`);
            // @ts-ignore
            global.conn = conn;
            conn.on("data", console.log);

            const map = Protocol.encode(PackageType.UPDATE_TILES, <TileMap> {
                '1,0': {
                    type: TileType.EMPTY,
                    height: 2
                },
                '1,1': {
                    type: TileType.EMPTY,
                    height: 1
                }
            });

            console.log(map);

            conn.send(map);
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
