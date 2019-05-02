import { Game } from '..';
import { BuildingType, Axial } from 'tone-core/dist/lib';
import { Building } from '.';
export declare function buildingFactory(game: Game, playerId: number, buildingType: BuildingType, tilePosition: Axial): Building;
