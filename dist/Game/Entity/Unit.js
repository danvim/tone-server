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
var Entity_1 = require("../Entity");
var Unit = /** @class */ (function (_super) {
    __extends(Unit, _super);
    function Unit(game, playerId, position, rotation) {
        return _super.call(this, game, playerId, position, rotation) || this;
    }
    Unit.prototype.frame = function (prevTick, currTick) {
        this.position = this.position.add(this.velocity.scale(currTick - prevTick));
    };
    return Unit;
}(Entity_1.Entity));
exports.Unit = Unit;
