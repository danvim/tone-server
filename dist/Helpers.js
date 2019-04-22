"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function now(unit) {
    var hrTime = process.hrtime();
    switch (unit) {
        case 'milli':
            return hrTime[0] * 1000 + hrTime[1] / 1000000;
        case 'micro':
            return hrTime[0] * 1000000 + hrTime[1] / 1000;
        case 'nano':
            return hrTime[0] * 1000000000 + hrTime[1];
        default:
            return now('nano');
    }
}
exports.now = now;
