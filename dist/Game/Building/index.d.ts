import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
export declare class Building extends Thing implements BuildingInterface {
    buildingType: BuildingType;
    tilePosition: Axial;
    constructor(game: Game, playerId: number, buildingType: BuildingType, tilePosition: Axial);
}
