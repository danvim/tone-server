import { TileInfo } from 'tone-core/dist/lib';
export declare type Map = {
    [k in string]: TileInfo;
};
export declare function MapGen(): Map;
