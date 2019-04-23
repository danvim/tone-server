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
var lib_1 = require("tone-core/dist/lib");
var Entity_1 = require("../Entity");
var Unit = /** @class */ (function (_super) {
    __extends(Unit, _super);
    function Unit(game, playerId, type, position, rotation) {
        var _this = _super.call(this, game, playerId, type, position, rotation) || this;
        _this.game.units[_this.uuid] = _this;
        _this.fightingStyle = lib_1.FightingStyle.PASSIVE;
        return _this;
    }
    return Unit;
}(Entity_1.Entity));
exports.Unit = Unit;
