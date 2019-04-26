import { Game } from '..';
import { Building } from '.';
export declare abstract class BuildingStrategy {
    game: Game;
    building: Building;
    constructor(game: Game, building: Building);
    abstract frame(prevTicks: number, currTicks: number): void;
}
