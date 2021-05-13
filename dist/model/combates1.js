"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Combates1s = void 0;
const mongoose_1 = require("mongoose");
const combates1Schemas = new mongoose_1.Schema({
    fecha: Date,
    batalla: String,
    atacante: [{
            nombreFaccion: String,
            ejercito: String,
            equipamiento: [{
                    tipo: String,
                    nombre: String,
                }]
        }],
    defensor: [{
            nombreFaccion: String,
            ejercito: String,
            equipamiento: [{
                    tipo: String,
                    nombre: String,
                }]
        }]
});
exports.Combates1s = mongoose_1.model('combates1', combates1Schemas);
