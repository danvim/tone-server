import { BuildingInterface } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
export declare class SpawnPoint extends Building implements BuildingInterface {
    periodStrategy: PeriodStrategy;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    spawn: () => void;
}
