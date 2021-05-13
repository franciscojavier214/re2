"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Combatesinfo2s = void 0;
const mongoose_1 = require("mongoose");
const combatesinfo2Schemas = new mongoose_1.Schema({
    fecha: Date,
    batalla: String,
    ejercitoMercenarioDefensor: {
        milicia: Number,
        caballeria: Number,
        tropaElite: Number
    },
    arsenalDefensorBonus: Number,
    puntuacionTotalDefensor: Number,
    ejercitoMercenarioAtacante: {
        milicia: Number,
        caballeria: Number,
        tropaElite: Number
    },
    arsenalAtacanteBonus: Number,
    puntuacionTotalAtacante: Number
});
exports.Combatesinfo2s = mongoose_1.model('combatesinfo2', combatesinfo2Schemas);
