import { EntityType } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { Worker } from '../Unit/Worker';
import { ResourceType } from '../../Helpers';
import { WorkerJob } from '../Unit/WorkerJob';
import { Soldier } from '../Unit/Soldier';
export declare class Barrack extends Building {
    trainingDataStorage: number;
    storageJob?: WorkerJob;
    soldierVariant: EntityType;
    soldierQuota: number;
    soldiers: Soldier[];
    recruitmentJob?: WorkerJob;
    trainingCount: number;
    trainingTime: number;
    trainStartTime: number;
    nowTraining: boolean;
    constructor(game: Game, playerId: number, tilePosition: Axial);
    frame(prevTicks: number, currTicks: number): void;
    doneConstruction(): void;
    onDie(): void;
    onResouceDelivered(type: ResourceType, amount: number, worker?: Worker): number;
    callForRecuitment(): WorkerJob;
}
