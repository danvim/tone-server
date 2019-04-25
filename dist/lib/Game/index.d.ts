/// <reference types="peerjs" />
/// <reference types="node" />
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, PackageType, TileMap, TryBuildMessage } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
import { Base } from './Building/Base';
import { Message } from 'protobufjs';
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
    bases: {
        [playerId: number]: Base;
    };
    map: TileMap;
    frameTimer?: NodeJS.Timeout;
    prevTicks: number;
    constructor(players: Player[], protocol?: Protocol);
    emit(packageType: PackageType, object: object): void;
    mapConnToPlayer(conn: Conn): Player | undefined;
    initProtocol(protocol: Protocol): void;
    rejoin(player: Player): void;
    terminate(): void;
    /**
     * Make the id of players start from 0 without holes
     */
    reassignPlayerId(players: Player[]): void;
    /**
     * assign clusters to players
     */
    initClusterTiles(): void;
    initBase(): void;
    myBuildings(playerId: number): {
        [uuid: string]: Building;
    };
    opponentBuildings(playerId: number): {
        [uuid: string]: Building;
    };
    myEntities(playerId: number): {
        [uuid: string]: Entity;
    };
    opponentEntities(playerId: number): {
        [uuid: string]: Entity;
    };
    myUnits(playerId: number): {
        [uuid: string]: Unit;
    };
    opponentUnits(playerId: number): {
        [uuid: string]: Unit;
    };
    build: (object: Message<TryBuildMessage>, conn: Conn) => void;
    frame(prevTicks: number, currTicks: number): void;
    test(): void;
}