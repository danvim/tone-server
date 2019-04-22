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
    playerUpdateConn(username: string, conn: DataConnection): number;
    playerUpdateUsername(username: string, conn: DataConnection): number;
    join(username: string, conn: DataConnection): void;
    genPlayerId(): number;
    tryStart(): void;
}
