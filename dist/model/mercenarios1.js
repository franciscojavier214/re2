"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mercenarios1s = void 0;
const mongoose_1 = require("mongoose");
const mercenarios1Schemas = new mongoose_1.Schema({
    pueblo: String,
    unidades: [{
            milicia: Number,
            caballeria: Number,
            tropasElite: Number,
        }],
});
exports.Mercenarios1s = mongoose_1.model('mercenarios1', mercenarios1Schemas);
