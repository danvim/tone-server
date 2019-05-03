import { Game } from '..';
import { BuildingType, Axial } from 'tone-core/dist/lib';
import { Base } from './Base';
import { SpawnPoint } from './SpawnPoint';
import { StructGenerator } from './StructGenerator';
import { Building } from '.';
import { Reclaimer } from './Reclaimer';
import { TrainingDataGenerator } from './TrainingDataGenerator';
import { Barrack } from './Barrack';

export function buildingFactory(
  game: Game,
  playerId: number,
  buildingType: BuildingType,
  tilePosition: Axial,
) {
  switch (buildingType) {
    case BuildingType.BASE:
      return new Base(game, playerId, tilePosition);
    case BuildingType.SPAWN_POINT:
      return new SpawnPoint(game, playerId, tilePosition);
    case BuildingType.STRUCT_GENERATOR:
      return new StructGenerator(game, playerId, tilePosition);
    case BuildingType.RECLAIMATOR:
      return new Reclaimer(game, playerId, tilePosition);
    case BuildingType.TRAINING_DATA_GENERATOR:
      return new TrainingDataGenerator(game, playerId, tilePosition);
    case BuildingType.BARRACK:
      return new Barrack(game, playerId, tilePosition);
    default:
      return new Building(game, playerId, buildingType, tilePosition);
  }
}
