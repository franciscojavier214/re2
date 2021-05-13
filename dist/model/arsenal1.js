"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arsenal1s = void 0;
const mongoose_1 = require("mongoose");
const arsenal1Schemas = new mongoose_1.Schema({
    nombre: String,
    tipo: String,
    bonus: Number,
});
exports.Arsenal1s = mongoose_1.model('arsenal1', arsenal1Schemas);
