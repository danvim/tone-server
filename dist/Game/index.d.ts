/// <reference types="peerjs" />
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, TileMap } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
export declare class Game {
    players: Player[];
    protocol: Protocol;
    buildings: {
        [uuid: string]: Building;
    };
    entities: {
        [uuid: string]: Entity;
    };
    units: {
        [uuid: string]: Unit;
    };
    map: TileMap;
    constructor(players: Player[], protocol: Protocol);
    mapConnToPlayer(conn: Conn): Player;
    initProtocol(protocol: Protocol): void;
    rejoin(player: Player): void;
    frame(): void;
    moveAllEntitiesAndUnits(): void;
    test(): void;
}
