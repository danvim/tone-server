import { BuildingInterface, ResourceType } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
export declare class Base extends Building implements BuildingInterface {
    static structGenPeriod: number;
    periodStrategy: PeriodStrategy;
    structStorage: number;
    trainingDataStorage: number;
    primeDataStorage: number;
    territoryRadius: number;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    generateStruct: () => void;
    onResouceDelivered(type: ResourceType, amount: number): number;
    tryGiveResource(type: ResourceType, amount: number): number;
    emitStorage(): void;
}
