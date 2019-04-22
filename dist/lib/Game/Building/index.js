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
var Thing_1 = require("../Thing");
var Building = /** @class */ (function (_super) {
    __extends(Building, _super);
    function Building(game, playerId, buildingType, tilePosition) {
        var _this = _super.call(this, game, playerId, 100) || this;
        _this.buildingType = buildingType;
        _this.tilePosition = tilePosition;
        return _this;
    }
    return Building;
}(Thing_1.Thing));
exports.Building = Building;
