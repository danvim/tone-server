import { ThingInterface } from 'tone-core/dist/lib/Game';
import { Game } from '..';
import { Cartesian } from 'tone-core/dist/lib';
export declare class Thing implements ThingInterface {
    game: Game;
    uuid: string;
    hp: number;
    playerId: number;
    constructor(game: Game, playerId: number, hp?: number);
    readonly cartesianPos: Cartesian;
    frame(prevTick: number, currTick: number): void;
}
