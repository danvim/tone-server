import { Game } from '..';
import { BuildingType, Axial } from 'tone-core/dist/lib';
import { Base } from './Base';
import { SpawnPoint } from './SpawnPoint';

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
  }
}
