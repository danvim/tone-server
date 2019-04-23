import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
export declare class Entity extends Thing implements EntityInterface {
    type: EntityType;
    position: Cartesian;
    rotation: XyzEuler;
    velocity: Cartesian;
    speed: number;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, rotation: XyzEuler);
    frame(prevTick: number, currTick: number): void;
    travelByVelocity(prevTick: number, currTick: number): void;
}
