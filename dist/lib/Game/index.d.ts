/// <reference types="peerjs" />
/// <reference types="node" />
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, PackageType, Axial, TileMap, TryBuildMessage } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
import { Base } from './Building/Base';
import { Message } from 'protobufjs';
import { WorkerJob } from './Unit/WorkerJob';
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
    bases: {
        [playerId: number]: Base;
    };
    map: TileMap;
    frameTimer?: NodeJS.Timeout;
    playerClaimTile: {
        [playerId: number]: {
            [axialString: string]: boolean;
        };
    };
    workerJobs: {
        [workerJobId: string]: WorkerJob;
    };
    prevTicks: number;
    constructor(players: Player[], protocol: Protocol, unitTest?: boolean);
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
     * assign clusters to players and spawn inital workers
     */
    initClusterTiles(initialWorkerCount?: number): void;
    initBase(): void;
    evaluateTerritory(): void;
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
    build: (object: Message<TryBuildMessage>, conn: Conn) => boolean;
    claimTile(playerId: number, axialLocation: Axial, radius: number): void;
    isTileClaimedBy(playerId: number, axialLocation: Axial): boolean;
    frame(prevTicks: number, currTicks: number): void;
    test(): void;
}
