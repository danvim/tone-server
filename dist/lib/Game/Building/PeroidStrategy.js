"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PeriodStrategy = /** @class */ (function () {
    function PeriodStrategy(period, onPeroid) {
        this.period = period;
        this.prevTriggerTicks = 0;
        this.onPeriod = onPeroid;
    }
    PeriodStrategy.prototype.frame = function (prevTicks, currTicks) {
        if (this.period !== -1 &&
            currTicks - this.prevTriggerTicks >= this.period) {
            this.prevTriggerTicks = currTicks;
            this.onPeriod();
        }
    };
    return PeriodStrategy;
}());
exports.PeriodStrategy = PeriodStrategy;
