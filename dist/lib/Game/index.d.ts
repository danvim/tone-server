/// <reference types="peerjs" />
/// <reference types="node" />
import { Map } from './MapGen';
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, PackageType } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
export declare class Game {
    players: Player[];
    protocol?: Protocol;
    buildings: {
        [uuid: string]: Building;
    };
    entities: {
        [uuid: string]: Entity;
    };
    units: {
        [uuid: string]: Unit;
    };
    map: Map;
    frameTimer: NodeJS.Timeout;
    prevTicks: number;
    constructor(players: Player[], protocol?: Protocol);
    emit(packageType: PackageType, object: object): void;
    mapConnToPlayer(conn: Conn): Player;
    initProtocol(protocol: Protocol): void;
    rejoin(player: Player): void;
    terminate(): void;
    /**
     * Make the id of players start from 0 without holes
     */
    reassignPlayerId(): void;
    /**
     * assign clusters to players
     */
    initClusterTiles(): void;
    frame(prevTicks: number, currTicks: number): void;
    test(): void;
}
