import {TileMap, TileType} from 'tone-core/dist/lib';

const map: TileMap = {
  '1,2': {
    type: TileType.EMPTY,
    height: 1,
  },
  '0,0': {
    type: TileType.EMPTY,
    height: 2,
  },
  '0,1': {
    type: TileType.EMPTY,
    height: 3,
  },
  '0,2': {
    type: TileType.EMPTY,
    height: 3,
  },
  '-1,0': {
    type: TileType.INFORMATION_CLUSTER,
    height: 0,
  },
  '-1,2': {
    type: TileType.EMPTY,
    height: 3,
  },
  '1,0': {
    type: TileType.VOID,
    height: 0,
  },
  '1,1': {
    type: TileType.EMPTY,
    height: 1,
  },
};

export function MapGen() {
  return map;
}
