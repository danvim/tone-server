"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var v4_1 = __importDefault(require("uuid/v4"));
var Thing = /** @class */ (function () {
    function Thing(game, playerId, hp) {
        this.game = game;
        this.playerId = playerId;
        this.hp = hp || 100;
        this.uuid = v4_1.default();
    }
    Thing.prototype.frame = function (prevTick, currTick) {
        //
    };
    return Thing;
}());
exports.Thing = Thing;
