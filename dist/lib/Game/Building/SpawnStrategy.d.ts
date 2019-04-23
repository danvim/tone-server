import { BuildingStrategy } from './BuildingStrategy';
import { Game } from '..';
import { Building } from '.';
export declare class SpawnStrategy extends BuildingStrategy {
    private period;
    private prevSpawnTicks;
    constructor(game: Game, building: Building);
    setSpawnPeriod(period: number): void;
    frame(prevTicks: number, currTicks: number): void;
}
