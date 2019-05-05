import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
export declare class SpawnPoint extends Building {
    static spawnPeriod: number;
    periodStrategy: PeriodStrategy;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    spawn: () => void;
}
