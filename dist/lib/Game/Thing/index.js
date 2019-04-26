"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var v4_1 = __importDefault(require("uuid/v4"));
var lib_1 = require("tone-core/dist/lib");
var Thing = /** @class */ (function () {
    function Thing(game, playerId, hp) {
        this.game = game;
        this.playerId = playerId;
        this.hp = hp || 100;
        this.uuid = v4_1.default();
    }
    Object.defineProperty(Thing.prototype, "cartesianPos", {
        get: function () {
            return new lib_1.Cartesian(0, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Thing.prototype, "player", {
        get: function () {
            return this.game.players[this.playerId];
        },
        enumerable: true,
        configurable: true
    });
    Thing.prototype.frame = function (prevTick, currTick) {
        //
    };
    return Thing;
}());
exports.Thing = Thing;
