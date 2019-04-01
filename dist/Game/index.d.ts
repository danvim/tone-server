import { Map } from './MapGen';
import { Player } from '../Player';
import { Protocol } from 'tone-core/dist/lib';
export declare class Game {
    players: Array<Player>;
    protocol: Protocol;
    map: Map;
    constructor(players: Array<Player>, protocol: Protocol);
    test(): void;
}
