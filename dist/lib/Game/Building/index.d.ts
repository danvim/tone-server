import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial, Cartesian } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { ResourceType } from '../../Helpers';
import { Worker } from '../Unit/Worker';
export declare class Building extends Thing implements BuildingInterface {
    readonly cartesianPos: Cartesian;
    readonly name: string;
    buildingType: BuildingType;
    tilePosition: Axial;
    structProgress: number;
    structNeeded: number;
    waitingWorkers: {
        [id: string]: boolean;
    };
    constructor(game: Game, playerId: number, buildingType: BuildingType, tilePosition: Axial);
    isFunctional(): boolean;
    frame(prevTicks: number, currTicks: number): void;
    /**
     * By default only on construction building can get struct resource
     * @param type resource type
     * @param amount amount of resource trying to get
     * @return amount that this building really get
     */
    onResouceDelivered(type: ResourceType, amount: number, worker?: Worker): number;
    /**
     * By defaul building cannot give resource
     * @param type resource type
     * @param amount request amount
     * @return real amount given out
     */
    tryGiveResource(type: ResourceType, amount: number, worker: Worker): number;
    /**
     * Call when done construction
     */
    doneConstruction(): void;
}
