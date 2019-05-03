import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import { Cartesian, FightingStyle, XyzEuler, EntityType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';
export declare class Unit extends Entity implements UnitInterface {
    fightingStyle: FightingStyle;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, rotation: XyzEuler);
    onDie(): void;
}
