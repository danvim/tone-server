import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';
export declare class Unit extends Entity {
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
    frame(prevTick: number, currTick: number): void;
}
