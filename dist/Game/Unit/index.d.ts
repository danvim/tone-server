import { UnitInterface, Cartesian, FightingStyle, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';
export declare class Unit extends Entity implements UnitInterface {
    fightingStyle: FightingStyle;
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
    frame: (prevTick: number, currTick: number) => void;
}
