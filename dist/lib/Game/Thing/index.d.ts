import { ThingInterface } from 'tone-core/dist/lib/Game';
import { Game } from '..';
import { Cartesian } from 'tone-core/dist/lib';
import { Player } from '../Player';
export declare class Thing implements ThingInterface {
    game: Game;
    uuid: string;
    playerId: number;
    private mhp;
    constructor(game: Game, playerId: number, hp?: number);
    readonly cartesianPos: Cartesian;
    readonly player: Player;
    hp: number;
    readonly name: string;
    frame(prevTick: number, currTick: number): void;
    onDie(): void;
}
