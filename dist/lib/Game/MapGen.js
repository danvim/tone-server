"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var map = {
    '1,2': {
        type: lib_1.TileType.EMPTY,
        height: 1,
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
    '-1,0': {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 0,
    },
    '-1,2': {
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
    '3,0': {
        type: lib_1.TileType.INFORMATION_CLUSTER,
        height: 0,
    },
};
function MapGen() {
    return map;
}
exports.MapGen = MapGen;
