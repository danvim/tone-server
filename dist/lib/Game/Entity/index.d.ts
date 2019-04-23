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
    target?: Thing;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, rotation: XyzEuler);
    readonly cartesianPos: Cartesian;
    frame(prevTicks: number, currTicks: number): void;
    travelByVelocity(prevTick: number, currTick: number): void;
    moveToTarget(prevTicks: number, currTicks: number, target?: Thing): void;
    setTarget(target: Thing): void;
    /**
     * execute when this is at the target thing
     * to be overrided by children class
     */
    arrive(): void;
}
