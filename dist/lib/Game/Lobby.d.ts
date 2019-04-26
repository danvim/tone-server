/// <reference types="peerjs" />
import { Player } from './Player';
import { Protocol } from 'tone-core/dist/lib';
import { Game } from '.';
import DataConnection = PeerJs.DataConnection;
export declare class Lobby {
    players: Player[];
    started: boolean;
    protocol: Protocol;
    game: Game | undefined;
    constructor();
    initProtocol(): void;
    isUsernameExist(username: string): boolean;
    isConnExist(conn: DataConnection): boolean;
    /**
     * Checks if a given username is among the existing players. If so, updates the stored connection to the new incoming
     * connection. If the player exists, return its player id.
     * @param {string} username User input username
     * @param {DataChannelEventHandler} conn Incoming data connection
     */
    playerUpdateConn(username: string, conn: DataConnection): number;
    playerUpdateUsername(username: string, conn: DataConnection): number;
    join(username: string, conn: DataConnection): void;
    genPlayerId(): number;
    tryStart(): void;
}
