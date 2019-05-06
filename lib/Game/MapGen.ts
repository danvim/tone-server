import { TileMap, TileType, Axial } from 'tone-core/dist/lib';

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
  '10,11': {
    type: TileType.INFORMATION_CLUSTER,
    height: 1,
  },
};

export function HexGen(size: number) {
  const tm: TileMap = {};

  const points: Axial[] = [];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      points.push(new Axial(i, j));
    }
  }

  for (const pt of points) {
    const height = Math.floor(Math.random() * 4);
    tm[pt.asString] = {
      type: TileType.EMPTY,
      height,
    };
  }
  points.forEach((pt: Axial) => {
    const heights = pt
      .range(1)
      .filter((ppt: Axial) => ppt.asString in tm)
      .map((ppt: Axial) => tm[ppt.asString].height)
      .sort();
    const height = heights[Math.floor(heights.length / 2)];
    tm[pt.asString].height = height;
    if (height === 0) {
      tm[pt.asString].type = TileType.VOID;
    }
  });
  tm[new Axial(-1, 0).asString] = {
    type: TileType.INFORMATION_CLUSTER,
    height: 1,
  };
  tm[new Axial(0, 0).asString] = {
    type: TileType.EMPTY,
    height: 1,
  };

  tm[new Axial(size - 1, size).asString] = {
    type: TileType.INFORMATION_CLUSTER,
    height: 1,
  };
  tm[new Axial(size - 1, size - 1).asString] = {
    type: TileType.EMPTY,
    height: 1,
  };

  return tm;
}

export function MapGen(size: number = 30) {
  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 10; j++) {
  //     const key = `${i},${j}`;
  //     if (!map[key]) {
  //       map[key] = {
  //         type: TileType.EMPTY,
  //         height: 1,
  //       };
  //     }
  //   }
  // }
  // return map;
  return HexGen(size);
}
