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
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["STRUCT"] = 0] = "STRUCT";
    ResourceType[ResourceType["TRAINING_DATA"] = 1] = "TRAINING_DATA";
    ResourceType[ResourceType["PRIME_DATA"] = 2] = "PRIME_DATA";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
