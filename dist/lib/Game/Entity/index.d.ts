import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
export declare class Entity extends Thing implements EntityInterface {
    target: Thing | undefined;
    readonly cartesianPos: Cartesian;
    type: EntityType;
    position: Cartesian;
    sentPosition: Cartesian;
    rotation: XyzEuler;
    velocity: Cartesian;
    speed: number;
    arriveRange: number;
    yaw: number;
    private mtarget?;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, rotation: XyzEuler);
    frame(prevTicks: number, currTicks: number): void;
    travelByVelocity(prevTick: number, currTick: number): void;
    moveToTarget(prevTicks: number, currTicks: number, target?: Thing): void;
    setTarget(target: Thing): void;
    updateVelocity(): void;
    /**
     * execute when this is at the target thing
     * to be overrided by children class
     */
    arrive(prevTicks: number, currTicks: number): void;
}
