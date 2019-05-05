import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { ResourceType } from '../../Helpers';
export declare class StructGenerator extends Building {
    static structGenPeriod: number;
    periodStrategy?: PeriodStrategy;
    amount: number;
    capacity: number;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    generate: () => void;
    tryGiveResource(type: ResourceType, amount: number): number;
    doneConstruction(): void;
}
