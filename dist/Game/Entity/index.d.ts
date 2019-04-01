import { EntityInterface } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
export declare class Entity extends Thing implements EntityInterface {
    position: Cartesian;
    rotation: XyzEuler;
    velocity: Cartesian;
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
    frame(prevTick: number, currTick: number): void;
}
