"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var Building_1 = require("../lib/Game/Building");
var lib_1 = require("tone-core/dist/lib");
var Worker_1 = require("../lib/Game/Unit/Worker");
var test_1 = require("tone-core/dist/test");
var conn1c = new test_1.StubConn();
var conn1s = new test_1.StubConn();
conn1c.connect(conn1s);
var conn2c = new test_1.StubConn();
var conn2s = new test_1.StubConn();
conn2c.connect(conn2s);
var protocol1c = new lib_1.Protocol();
var protocol1s = new lib_1.Protocol();
var protocol = new lib_1.Protocol();
protocol1c.add(conn1c);
protocol1s.add(conn1s);
protocol1s.add(conn2s);
protocol.add(conn1s);
var animationObject = {};
protocol1c.on(lib_1.PackageType.SET_ANIMATION, function (object) {
    var obj = Object(object);
    animationObject = {
        uid: obj.uid,
        animType: obj.animType,
    };
});
var player1 = new Player_1.Player(conn1s);
var player2 = new Player_1.Player(conn2s);
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';
var game = new Game_1.Game([player1, player2], protocol1s);
game.terminate();
var entityTest = [];
protocol1c.on(lib_1.PackageType.MOVE_ENTITY, function (object) {
    entityTest = [
        Object(object),
        game.entities[Object(object).uid].position.clone(),
    ];
});
game.frame(2000, 2000); // spawn a new work
var worker = Object.values(game.myUnits(0))[0];
var spawnPoint = Object.values(game.myBuildings(0)).filter(function (building) { return building.buildingType === lib_1.BuildingType.SPAWN_POINT; })[0];
var base = game.bases[0];
var strucGen = new Building_1.Building(game, 0, lib_1.BuildingType.STRUCT_GENERATOR, new lib_1.Axial(1, 0));
var oldDist = worker.position.euclideanDistance(base.cartesianPos);
describe('grab struct from base and deliver to construction site', function () {
    describe('init, 2000', function () {
        it('base location', function () {
            expect(base.cartesianPos).toStrictEqual(new lib_1.Axial(0, 0).toCartesian(lib_1.TILE_SIZE));
        });
        it('worker location', function () {
            expect(worker.position).toStrictEqual(spawnPoint.tilePosition.toCartesian(lib_1.TILE_SIZE));
        });
        it('worker target is base', function () {
            expect(worker.target && worker.target.uuid).toBe(base.uuid);
        });
        it('the velocity', function () {
            expect(worker.velocity).toStrictEqual(new lib_1.Cartesian(worker.speed, 0));
        });
        it('update entity protocol', function () {
            console.log(entityTest);
            expect(entityTest[0].location.x).toBe(entityTest[1].x);
            expect(entityTest[0].location.z).toBe(entityTest[1].y);
        });
    });
    describe('2100', function () {
        it('the velocity', function () {
            game.frame(2000, 2100);
            expect(worker.velocity).toStrictEqual(new lib_1.Cartesian(worker.speed, 0));
        });
        it('worker state is GRABBING', function () {
            expect(worker.state).toBe(Worker_1.WorkerState.GRABBING);
        });
        it('move closer', function () {
            var newDist = worker.position.euclideanDistance(base.cartesianPos);
            expect(newDist).toBeLessThan(oldDist);
        });
    });
    var timeNeeded = oldDist / worker.speed;
    var t = 2000 + Math.ceil(timeNeeded);
    describe('just arrive ' + timeNeeded, function () {
        it('same location as base', function () {
            game.frame(2100, t);
            var newDist = worker.position.euclideanDistance(base.cartesianPos);
            expect(newDist).toBe(0);
        });
        it('worker state is DELIVERING', function () {
            expect(worker.state).toBe(Worker_1.WorkerState.DELIVERING);
        });
        it('worker target is the struct gen', function () {
            expect(worker.target && worker.target.uuid).toBe(strucGen.uuid);
        });
        it('recieved animationObject to be carrying', function () {
            expect(animationObject).toStrictEqual({
                uid: worker.uuid,
                animType: lib_1.AnimType.CARRYING,
            });
        });
    });
    describe('put struct', function () {
        it('worker gone to struct gen', function () {
            if (worker.target) {
                var t2 = t +
                    worker.position.euclideanDistance(worker.target.cartesianPos) /
                        worker.speed;
                t2 = Math.ceil(t2);
                game.frame(t, t2);
                expect(worker.position).toStrictEqual(strucGen.cartesianPos);
            }
            else {
                expect(worker.target).toBeTruthy();
            }
        });
        it('struct gen gain progress', function () {
            expect(strucGen.structProgress).toBe(1);
        });
        it('worker want to get struct from base', function () {
            if (worker.target) {
                expect(worker.target.uuid).toBe(base.uuid);
            }
            else {
                expect(worker.target).toBeTruthy();
            }
        });
        it('recieved animationObject to be default', function () {
            expect(animationObject).toStrictEqual({
                uid: worker.uuid,
                animType: lib_1.AnimType.DEFAULT,
            });
        });
    });
});
