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
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(game, playerId, position, target, damage) {
        var _this = this;
        var dir = target.cartesianPos.scaled(-1).added(position);
        var _a = dir.asArray, x = _a[0], y = _a[1], z = _a[2];
        // const rotation = new XyzEuler(Math.atan2(z,y), Math.atan2(z,x), )
        _this = _super.call(this, game, playerId, lib_1.EntityType.BULLET_0, position, new lib_1.XyzEuler(0, 0, 0)) || this;
        _this.target = target;
        _this.damage = damage;
        _this.speed = lib_1.TILE_SIZE / 100;
        return _this;
    }
    Bullet.prototype.arrive = function () {
        if (this.target) {
            this.target.hp -= this.damage;
        }
        this.hp = 0;
        _super.prototype.onDie.call(this);
    };
    return Bullet;
}(Entity_1.Entity));
exports.Bullet = Bullet;
