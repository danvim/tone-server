import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { SpawnStrategy } from './SpawnStrategy';
import { GeneratorStrategy } from './GeneratorStrategy';
import { ResourceType } from '../../Helpers';
export declare class Building extends Thing implements BuildingInterface {
    buildingType: BuildingType;
    tilePosition: Axial;
    spawnStrategy?: SpawnStrategy;
    structGeneratorStrategy?: GeneratorStrategy;
    trainingDataGeneratorStrategy?: GeneratorStrategy;
    primeDataGeneratorStrategy?: GeneratorStrategy;
    structProgress: number;
    structNeeded: number;
    constructor(game: Game, playerId: number, buildingType: BuildingType, tilePosition: Axial);
    isFunctional(): boolean;
    frame(prevTicks: number, currTicks: number): void;
    onResouceDelivered(type: ResourceType, amount: number): void;
    tryGiveResource(type: ResourceType, amount: number): number;
}
