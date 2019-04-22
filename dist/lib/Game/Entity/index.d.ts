import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { WorkerStrategy } from './WorkerStrategy';
export declare class Entity extends Thing implements EntityInterface {
    type: EntityType;
    position: Cartesian;
    rotation: XyzEuler;
    velocity: Cartesian;
    workerStrategy?: WorkerStrategy;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, rotation: XyzEuler);
    setType(type: EntityType): void;
    frame(prevTick: number, currTick: number): void;
}
