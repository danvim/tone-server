import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { ResourceType } from '../../Helpers';
import { WorkerJob } from '../Unit/WorkerJob';
export declare class Barrack extends Building {
    trainingDataStorage: number;
    storageJob?: WorkerJob;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    doneConstruction(): void;
    onDie(): void;
    onResouceDelivered(type: ResourceType, amount: number): number;
}
