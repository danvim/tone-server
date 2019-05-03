"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var Building_1 = require("../lib/Game/Building");
var lib_1 = require("tone-core/dist/lib");
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
var player1 = new Player_1.Player(conn1s);
var player2 = new Player_1.Player(conn2s);
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';
describe('client side tests on initialization', function () {
    it('well connected', function () {
        expect(protocol1s.conns[0]).toBe(conn1s);
        expect(protocol1s.conns[0].peerConnection).toBe(protocol1c.conns[0]);
        expect(protocol1s.conns[0]).toBe(protocol1c.conns[0].peerConnection);
    });
    var tileRecievedFlag = 0;
    protocol1c.on(lib_1.PackageType.UPDATE_TILES, function () { return (tileRecievedFlag = 1); });
    it('received map', function () {
        expect(tileRecievedFlag).toBe(1);
    });
    var buildObjects = [];
    protocol1c.on(lib_1.PackageType.BUILD, function (data) { return buildObjects.push(Object(data)); });
    it('received 2 players\' spawnpoint and base', function () {
        expect(buildObjects.length).toBe(4);
    });
});
var game = new Game_1.Game([player2, player1], protocol1s);
game.terminate();
describe('game initialize', function () {
    it('constructed', function () {
        expect(game).toBeTruthy();
    });
    it('reassigned playerIds', function () {
        expect(game.players[0].id).toBe(0);
        expect(game.players[1].id).toBe(1);
    });
    describe('assigned initial clusters(spawn point)', function () {
        var spawnPointKeys = Object.keys(game.buildings).filter(function (key) {
            var building = game.buildings[key];
            return building.buildingType === lib_1.BuildingType.SPAWN_POINT;
        });
        var spawnpoint0 = game.buildings[spawnPointKeys[0]];
        it('key mataches building.uuid', function () {
            expect(spawnpoint0.uuid).toBe(spawnPointKeys[0]);
        });
        it('player id assigned', function () {
            expect(spawnpoint0.playerId).toBe(0);
        });
    });
    var initLength = Object.keys(game.units).length;
    it('initially no units', function () {
        expect(initLength).toBe(0);
    });
    describe('after 2000ms', function () {
        var units;
        var entityCount = 0;
        protocol1c.on(lib_1.PackageType.SPAWN_ENTITY, function () {
            entityCount++;
        });
        it('one entity with player id 0', function () {
            var structGen = new Building_1.Building(game, 0, lib_1.BuildingType.STRUCT_GENERATOR, new lib_1.Axial(1, 2));
            game.frame(0, 2000);
            units = Object.values(game.units).filter(function (entity) {
                return entity.playerId === 0;
            });
            expect(units.length).toBe(1);
        });
        it('the newly spawned worker would want to grab from the base', function () {
            if (units.length !== 1) {
                expect(units.length).toBe(1);
            }
            else {
                var worker = units[0];
                console.log(worker.job && worker.job.target.name);
                expect(worker.target && worker.target.uuid).toBe(game.bases[0].uuid);
            }
        });
        it('client recieve two spawn entity events', function () {
            expect(entityCount).toBe(2);
        });
    });
});
// it('dummie', () => {
//   expect(1).toBe(1);
// });
