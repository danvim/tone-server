/// <reference types="peerjs" />
import { Player } from './Player';
import { Protocol } from 'tone-core/dist/lib';
import Conn = PeerJs.DataConnection;
import { Game } from './Game';
export declare class Lobby {
    players: Array<Player>;
    started: boolean;
    protocol: Protocol;
    game: Game | undefined;
    constructor(protocol: Protocol);
    initProtocol: (protocol: Protocol) => void;
    isUsernameExist: (username: string) => boolean;
    isConnExist: (conn: Conn) => boolean;
    playerUpdateConn: (username: string, conn: Conn) => number;
    playerUpdateUsername: (username: string, conn: Conn) => number;
    join: (username: string, conn: Conn) => void;
    genPlayerId: () => number;
    tryStart: () => void;
}
