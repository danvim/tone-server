"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v4");
var Thing = /** @class */ (function () {
    function Thing(game, playerId, hp) {
        this.game = game;
        this.playerId = playerId;
        this.hp = hp || 100;
        this.uuid = uuid();
    }
    Thing.prototype.frame = function (prevTick, currTick) {
        //
    };
    return Thing;
}());
exports.Thing = Thing;
