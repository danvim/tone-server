"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var lib_1 = require("tone-core/dist/lib");
var test_1 = require("tone-core/dist/test");
var BuildingFactory_1 = require("../lib/Game/Building/BuildingFactory");
var Helpers_1 = require("../lib/Helpers");
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
var game = new Game_1.Game([player1, player2], protocol1s);
game.terminate();
describe('original claim and not claimed', function () {
    it('origin', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(2, 0))).toBe(true);
    });
    it('spread enclosed', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(3, 3))).toBe(true);
    });
    it('not reached', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(10, 0))).toBe(false);
    });
});
describe('build criteria', function () {
    it('cannot build on non territory', function () {
        var msg = lib_1.TryBuildMessage.create({
            axialCoords: [new lib_1.Axial(10, 0)],
            buildingType: lib_1.BuildingType.STRUCT_GENERATOR,
        });
        expect(game.build(msg, conn1s)).toBe(false);
    });
    it('cannot build on tile that already build building', function () {
        var msg = lib_1.TryBuildMessage.create({
            axialCoords: [new lib_1.Axial(0, 0)],
            buildingType: lib_1.BuildingType.STRUCT_GENERATOR,
        });
        expect(game.build(msg, conn1s)).toBe(false);
    });
    it('can build normally', function () {
        var msg = lib_1.TryBuildMessage.create({
            axialCoords: [new lib_1.Axial(2, 0)],
            buildingType: lib_1.BuildingType.STRUCT_GENERATOR,
        });
        expect(game.build(msg, conn1s)).toBe(true);
    });
});
var reclaimer;
describe('claimer claim the new tile', function () {
    it('built', function () {
        reclaimer = BuildingFactory_1.buildingFactory(game, 0, lib_1.BuildingType.RECLAIMATOR, new lib_1.Axial(8, 0));
        reclaimer.onResouceDelivered(Helpers_1.ResourceType.STRUCT, 5);
        expect(reclaimer.isFunctional()).toBe(true);
    });
    it('claimed', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(10, 0))).toBe(true);
    });
});
describe('claimer destroyed lose territory', function () {
    it('reclaimer die', function () {
        reclaimer.hp = 0;
        expect(reclaimer.isFunctional()).toBe(false);
        expect(game.buildings[reclaimer.uuid]).toBeFalsy();
    });
    it('remain territoy', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(0, 0))).toBe(true);
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(3, 3))).toBe(true);
    });
    it('lose territory', function () {
        expect(game.isTileClaimedBy(player1.id, new lib_1.Axial(10, 0))).toBe(false);
    });
});
