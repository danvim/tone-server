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
var lib_1 = require("tone-core/dist/lib");
var Thing_1 = require("../Thing");
var Helpers_1 = require("../../Helpers");
var WorkerJob_1 = require("../Unit/WorkerJob");
// // export {} from './';
var Building = /** @class */ (function (_super) {
    __extends(Building, _super);
    function Building(game, playerId, buildingType, tilePosition) {
        var _this = _super.call(this, game, playerId, 100) || this;
        // for construction
        _this.structProgress = 0;
        _this.structNeeded = 0;
        _this.game.buildings[_this.uuid] = _this;
        _this.buildingType = buildingType;
        _this.tilePosition = tilePosition;
        _this.structNeeded = Game_1.BuildingProperty[buildingType].struct;
        if (_this.structNeeded > 0) {
            var j = new WorkerJob_1.WorkerJob(playerId, _this, Helpers_1.ResourceType.STRUCT, WorkerJob_1.JobPriority.MEDIUM, false);
        }
        _this.game.emit(lib_1.PackageType.BUILD, {
            playerId: playerId,
            uid: _this.uuid,
            buildingType: buildingType,
            axialCoords: tilePosition,
            progress: _this.structProgress,
        });
        return _this;
    }
    Object.defineProperty(Building.prototype, "cartesianPos", {
        get: function () {
            return this.tilePosition.toCartesian(Game_1.TILE_SIZE);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Building.prototype, "name", {
        get: function () {
            return (Helpers_1.SNAKE2Normal(Game_1.BuildingType[this.buildingType]) +
                ' ' +
                this.uuid.substr(0, 6));
        },
        enumerable: true,
        configurable: true
    });
    Building.prototype.isFunctional = function () {
        return this.structProgress >= this.structNeeded && this.hp > 0;
    };
    Building.prototype.frame = function (prevTicks, currTicks) {
        //
    };
    /**
     * By default only on construction building can get struct resource
     * @param type resource type
     * @param amount amount of resource trying to get
     * @return amount that this building really get
     */
    Building.prototype.onResouceDelivered = function (type, amount) {
        if (type === Helpers_1.ResourceType.STRUCT &&
            this.structProgress < this.structNeeded) {
            this.structProgress += amount;
            this.game.emit(lib_1.PackageType.BUILD, {
                playerId: this.playerId,
                uid: this.uuid,
                buildingType: this.buildingType,
                axialCoords: this.tilePosition,
                progress: this.structProgress,
            });
            if (this.isFunctional()) {
                this.doneConstruction();
            }
            return amount;
        }
        return 0;
    };
    /**
     * By defaul building cannot give resource
     * @param type resource type
     * @param amount request amount
     * @return real amount given out
     */
    Building.prototype.tryGiveResource = function (type, amount) {
        return 0;
    };
    /**
     * Call when done construction
     */
    Building.prototype.doneConstruction = function () {
        // To be overriden
    };
    return Building;
}(Thing_1.Thing));
exports.Building = Building;
