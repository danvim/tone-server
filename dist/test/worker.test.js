"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var Building_1 = require("../lib/Game/Building");
var lib_1 = require("tone-core/dist/lib");
var player1 = new Player_1.Player();
var player2 = new Player_1.Player();
player1.id = 1;
player2.id = 2;
player1.username = 'Player1';
player2.username = 'Player2';
var game = new Game_1.Game([player1, player2]);
game.terminate();
game.frame(2000, 2000); // spawn a new work
var worker = Object.values(game.myUnits(0))[0];
var spawnPoint = Object.values(game.myBuildings(0)).filter(function (building) { return building.buildingType === lib_1.BuildingType.SPAWN_POINT; })[0];
var base = game.bases[0];
var strucGen = new Building_1.Building(game, 0, lib_1.BuildingType.STRUCT_GENERATOR, new lib_1.Axial(1, 0));
var oldDist = worker.position.euclideanDistance(base.cartesianPos);
console.log('oldDist', oldDist, worker.position);
worker.speed = 0.001;
// const totalDist =
describe('grab struct from base and deliver to construction site', function () {
    describe('init, 2000', function () {
        it('base location', function () {
            expect(base.cartesianPos).toStrictEqual(new lib_1.Axial(0, 0).toCartesian(lib_1.TILE_SIZE));
        });
        it('worker location', function () {
            expect(worker.position).toStrictEqual(new lib_1.Axial(-1, 0).toCartesian(lib_1.TILE_SIZE));
        });
        it('worker location', function () {
            expect(worker.position).toStrictEqual(spawnPoint.tilePosition.toCartesian(lib_1.TILE_SIZE));
        });
        it('worker target is base', function () {
            console.log(worker.position, base.cartesianPos);
            expect(worker.target && worker.target.uuid).toBe(base.uuid);
        });
        it('the velocity', function () {
            expect(worker.velocity).toStrictEqual(new lib_1.Cartesian(34.64101615137754 * worker.speed, 0));
        });
    });
    // describe('2030', () => {
    //   // game.frame(2000, 2030);
    //   it('worker state is GRABBING', () => {
    //     expect(worker.state).toBe(WorkerState.GRABBING);
    //   });
    //   it('move closer', () => {
    //     const newDist = worker.position.euclideanDistance(base.cartesianPos);
    //     expect(newDist).toBeLessThan(oldDist);
    //   });
    // });
    // const timeNeeded = oldDist / worker.speed;
    // describe('just arrive', () => {
    //   // game.frame(2030, 2000 + Math.ceil(timeNeeded));
    //   it('worker state is DELIVERING', () => {
    //     expect(worker.state).toBe(WorkerState.DELIVERING);
    //   });
    //   it('worker target is the struct gen', () => {
    //     expect(worker.target && worker.target.uuid).toBe(strucGen.uuid);
    //   });
    // });
});
