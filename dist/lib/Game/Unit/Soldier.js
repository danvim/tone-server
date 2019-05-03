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
var _1 = require(".");
var WorkerState;
(function (WorkerState) {
    WorkerState[WorkerState["IDLE"] = 0] = "IDLE";
    WorkerState[WorkerState["GRABBING"] = 1] = "GRABBING";
    WorkerState[WorkerState["DELIVERING"] = 2] = "DELIVERING";
})(WorkerState = exports.WorkerState || (exports.WorkerState = {}));
var Soldier = /** @class */ (function (_super) {
    __extends(Soldier, _super);
    function Soldier(game, playerId, type, position, barrack) {
        var _this = _super.call(this, game, playerId, type, position, new lib_1.XyzEuler(0, 0, 0)) || this;
        _this.barrack = barrack;
        return _this;
    }
    return Soldier;
}(_1.Unit));
exports.Soldier = Soldier;
