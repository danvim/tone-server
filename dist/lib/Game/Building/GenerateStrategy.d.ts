import { BuildingStrategy } from './BuildingStrategy';
import { Game } from '..';
import { Building } from '.';
export declare class GeneratorStrategy extends BuildingStrategy {
    struct: number;
    trainingData: number;
    primeData: number;
    structCapacity: number;
    trainingDataCapacity: number;
    primeDataCapacity: number;
    private period;
    private prevGenerateTicks;
    constructor(game: Game, building: Building);
    setGeneratePeriod(period: number): void;
    frame(prevTicks: number, currTicks: number): void;
    generate(): void;
}
