import { Cartesian } from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';
import { Thing } from '../Thing';
export declare class Bullet extends Entity {
    damage: number;
    constructor(game: Game, playerId: number, position: Cartesian, target: Thing, damage: number);
    arrive(): void;
}
