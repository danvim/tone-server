"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("tone-core/dist/lib/Game");
var _1 = require(".");
var Reclaimer = /** @class */ (function (_super) {
    __extends(Reclaimer, _super);
    function Reclaimer(game, playerId, tilePosition) {
        var _this = _super.call(this, game, playerId, Game_1.BuildingType.RECLAIMATOR, tilePosition) || this;
        _this.amount = 0;
        _this.capacity = 1;
        _this.territoryRadius = Game_1.TERRITORY_RADIUS[Game_1.BuildingType.RECLAIMATOR];
        _this.game.claimTile(playerId, tilePosition, _this.territoryRadius);
        return _this;
    }
    Reclaimer.prototype.onDie = function () {
        _super.prototype.onDie.call(this);
        this.game.evaluateTerritory();
    };
    return Reclaimer;
}(_1.Building));
exports.Reclaimer = Reclaimer;
