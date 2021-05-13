"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heroes_1 = require("../model/v2");
const database_1 = require("../database/database");
class MisRutas {
    constructor() {
        this.get = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD()
                .then((mensaje) => __awaiter(this, void 0, void 0, function* () {
                console.log(mensaje);
                const query = yield v2_1.V2.find();
                res.json(query);
            }))
                .catch((mensaje) => {
                res.send(mensaje);
                console.log(mensaje);
            });
            database_1.db.desconectarBD();
        });
        this.fun2 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.send("Hola Mundo desde dato.");
        });
        this.fun1 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.send("Hola Mundo.");
        });
        this._router = express_1.Router();
    }
    get router() {
        return this._router;
    }
    misRutas() {
        this._router.get('/v2', this.get);
        this._router.get('/', this.fun1);
        this._router.get('/dato', this.fun2);
    }
}
const obj = new MisRutas();
obj.misRutas();
exports.rutas = obj.router;
