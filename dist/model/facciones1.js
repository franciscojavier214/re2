"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facciones1s = void 0;
const mongoose_1 = require("mongoose");
const facciones1Schemas = new mongoose_1.Schema({
    nombre: String,
    modMilicia: Number,
    modcabellria: Number,
    modElite: Number,
    fundacion: Date,
});
exports.Facciones1s = mongoose_1.model('facciones1', facciones1Schemas);
