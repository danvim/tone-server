import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
export declare class Reclaimer extends Building {
    amount: number;
    capacity: number;
    territoryRadius: number;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    onDie(): void;
}
