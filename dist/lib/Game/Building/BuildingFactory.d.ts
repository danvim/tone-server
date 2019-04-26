import { Game } from '..';
import { BuildingType, Axial } from 'tone-core/dist/lib';
import { Base } from './Base';
import { SpawnPoint } from './SpawnPoint';
export declare function buildingFactory(game: Game, playerId: number, buildingType: BuildingType, tilePosition: Axial): Base | SpawnPoint | undefined;
