"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var map = {
    '-1,0': {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 1,
    },
    '-1,1': {
        type: lib_1.TileType.EMPTY,
        height: 3,
    },
    '-1,2': {
        type: lib_1.TileType.EMPTY,
        height: 3,
    },
    '0,0': {
        type: lib_1.TileType.EMPTY,
        height: 2,
    },
    '0,1': {
        type: lib_1.TileType.EMPTY,
        height: 3,
    },
    '0,2': {
        type: lib_1.TileType.EMPTY,
        height: 3,
    },
    '1,0': {
        type: lib_1.TileType.VOID,
        height: 0,
    },
    '1,1': {
        type: lib_1.TileType.EMPTY,
        height: 1,
    },
    '1,2': {
        type: lib_1.TileType.EMPTY,
        height: 1,
    },
    '10,11': {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 1,
    },
};
function HexGen(size) {
    var tm = {};
    var points = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            points.push(new lib_1.Axial(i, j));
        }
    }
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var pt = points_1[_i];
        var height = Math.floor(Math.random() * 10) - 5;
        tm[pt.asString] = {
            type: lib_1.TileType.EMPTY,
            height: height,
        };
    }
    points.forEach(function (pt) {
        var heights = pt
            .range(1)
            .filter(function (ppt) { return ppt.asString in tm; })
            .map(function (ppt) { return tm[ppt.asString].height; })
            .sort();
        var height = Math.max(heights[Math.floor(heights.length / 2)], 0);
        tm[pt.asString].height = Math.round(height / 5 * 2);
        if (height === 0) {
            delete tm[pt.asString];
        }
    });
    tm[new lib_1.Axial(-1, 0).asString] = {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 1,
    };
    tm[new lib_1.Axial(0, 0).asString] = {
        type: lib_1.TileType.EMPTY,
        height: 1,
    };
    tm[new lib_1.Axial(size - 1, size).asString] = {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 1,
    };
    tm[new lib_1.Axial(size - 1, size - 1).asString] = {
        type: lib_1.TileType.EMPTY,
        height: 1,
    };
    return tm;
}
exports.HexGen = HexGen;
function MapGen(size) {
    if (size === void 0) { size = 30; }
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
exports.MapGen = MapGen;
