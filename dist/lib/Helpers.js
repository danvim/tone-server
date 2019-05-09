"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function now(unit) {
    var hrTime = process.hrtime();
    switch (unit) {
        case 'milli':
        case 'ms':
            return hrTime[0] * 1000 + hrTime[1] / 1000000;
        case 'micro':
        case 'us':
            return hrTime[0] * 1000000 + hrTime[1] / 1000;
        case 'nano':
        case 'ns':
            return hrTime[0] * 1000000000 + hrTime[1];
        default:
            return now('nano');
    }
}
exports.now = now;
function SNAKE2Normal(SNAKE_CASE) {
    return SNAKE_CASE.split('_')
        .map(function (_a) {
        var h = _a[0], t = _a.slice(1);
        return [h].concat(t.toLocaleLowerCase()).join('');
    })
        .join(' ');
}
exports.SNAKE2Normal = SNAKE2Normal;
exports.MAX_UNIT_CNT = 15;
