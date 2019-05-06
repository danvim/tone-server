import { TileMap, TileType } from 'tone-core/dist/lib';

const map: TileMap = {
  '-1,0': {
    type: TileType.INFORMATION_CLUSTER,
    height: 1,
  },
  '-1,1': {
    type: TileType.EMPTY,
    height: 3,
  },
  '-1,2': {
    type: TileType.EMPTY,
    height: 3,
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
  '1,0': {
    type: TileType.VOID,
    height: 0,
  },
  '1,1': {
    type: TileType.EMPTY,
    height: 1,
  },
  '1,2': {
    type: TileType.EMPTY,
    height: 1,
  },
  '10,1': {
    type: TileType.INFORMATION_CLUSTER,
    height: 0,
  },
};

export function MapGen() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const key = `${i},${j}`;
      if (!map[key]) {
        map[key] = {
          type: TileType.EMPTY,
          height: 1,
        };
      }
    }
  }
  return map;
}
