"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const combates1_1 = require("./model/combates1");
const combatesinfo2_1 = require("./model/combatesinfo2");
const database_1 = require("./database/database");
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const port = 3000;

//constantes
const valorMilicia = 1;
const valorCaballeria = 3;
const valorElite = 5;
const fun00 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(mensaje);
        const query3 = yield combates1_1.Combates1s.aggregate([
            //uniones de colecciones
            //Defensores
            {
                $lookup: {
                    from: "facciones1",
                    localField: "defensor.nombreFaccion",
                    foreignField: "nombre",
                    as: "faccionDefensora"
                }
            },
            {
                $lookup: {
                    from: "mercenarios1",
                    localField: "defensor.ejercito",
                    foreignField: "pueblo",
                    as: "efectivosDefensor"
                }
            },
            {
                $lookup: {
                    from: "arsenal1",
                    localField: "defensor.equipamiento.nombre",
                    foreignField: "nombre",
                    as: "equipoDefensor"
                }
            },
            //Atacantes 
            {
                $lookup: {
                    from: "facciones1",
                    localField: "atacante.nombreFaccion",
                    foreignField: "nombre",
                    as: "faccionAtacante"
                }
            },
            {
                $lookup: {
                    from: "mercenarios1",
                    localField: "atacante.ejercito",
                    foreignField: "pueblo",
                    as: "efectivosAtacante"
                }
            },
            {
                $lookup: {
                    from: "arsenal1",
                    localField: "atacante.equipamiento.nombre",
                    foreignField: "nombre",
                    as: "equipoAtacante"
                }
            },
            //procesamiento de datos.
            { $unwind: "$efectivosDefensor" },
            { $unwind: "$faccionDefensora" },
            { $unwind: "$efectivosAtacante" },
            { $unwind: "$faccionAtacante" },
            //simplificacion de informacion y calculos de puntuaciones
            {
                $set: {
                    //Datos Defensor
                    datosDefensor: {
                        nombreFaccionDefensora: "$faccionDefensora.nombre",
                        ejercitoMercenarioDefensor: "$efectivosDefensor.pueblo",
                        arsenalDefensor: {
                            espacioEquipo1: { $arrayElemAt: ["$equipoDefensor.nombre", 0] },
                            espacioEquipo2: { $arrayElemAt: ["$equipoDefensor.nombre", 1] },
                            espacioEquipo3: { $arrayElemAt: ["$equipoDefensor.nombre", 2] }
                        },
                        puntuacionTotalDefensor: {
                            $sum: [
                                { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.milicia", valorMilicia] }, "$faccionDefensora.modMilicia"] },
                                { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.caballeria", valorCaballeria] }, "$faccionDefensora.modCaballeria"] },
                                { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.tropasElite", valorElite] }, "$faccionDefensora.modElite"] },
                                {
                                    $multiply: [
                                        {
                                            $sum: [
                                                { $arrayElemAt: ["$equipoDefensor.bonus", 0] },
                                                { $arrayElemAt: ["$equipoDefensor.bonus", 1] },
                                                { $arrayElemAt: ["$equipoDefensor.bonus", 2] }
                                            ]
                                        },
                                        {
                                            $sum: [
                                                "$efectivosDefensor.unidades.milicia",
                                                "$efectivosDefensor.unidades.caballeria",
                                                "$efectivosDefensor.unidades.tropasElite"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    //Datos Atacante
                    datosAtacante: {
                        nombreFaccionAtacante: "$faccionAtacante.nombre",
                        ejercitoMercenarioAtacante: "$efectivosAtacante.pueblo",
                        arsenalAtacante: {
                            espacioEquipo1: { $arrayElemAt: ["$equipoAtacante.nombre", 0] },
                            espacioEquipo2: { $arrayElemAt: ["$equipoAtacante.nombre", 1] },
                            espacioEquipo3: { $arrayElemAt: ["$equipoAtacante.nombre", 2] }
                        },
                        puntuacionTotalAtacante: {
                            $sum: [
                                { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.milicia", valorMilicia] }, "$faccionAtacante.modMilicia"] },
                                { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.caballeria", valorCaballeria] }, "$faccionAtacante.modCaballeria"] },
                                { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.tropasElite", valorElite] }, "$faccionAtacante.modElite"] },
                                {
                                    $multiply: [
                                        {
                                            $sum: [
                                                { $arrayElemAt: ["$equipoAtacante.bonus", 0] },
                                                { $arrayElemAt: ["$equipoAtacante.bonus", 1] },
                                                { $arrayElemAt: ["$equipoAtacante.bonus", 2] }
                                            ]
                                        },
                                        {
                                            $sum: [
                                                "$efectivosAtacante.unidades.milicia",
                                                "$efectivosAtacante.unidades.caballeria",
                                                "$efectivosAtacante.unidades.tropasElite"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            //Datos de batalla
            {
                $set: {
                    vencedor: {
                        $cond: {
                            if: { $gt: ["$datosAtacante.puntuacionTotalAtacante", "$datosDefensor.puntuacionTotalDefensor"] },
                            then: "$datosAtacante.nombreFaccionAtacante",
                            else: "$datosDefensor.nombreFaccionDefensora"
                        },
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    defensor: 0,
                    atacante: 0,
                    efectivosDefensor: 0,
                    faccionDefensora: 0,
                    equipoDefensor: 0,
                    efectivosAtacante: 0,
                    faccionAtacante: 0,
                    equipoAtacante: 0
                }
            }
        ]);
        res.json(query3);
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const funP01 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(mensaje);
        const query3 = yield combates1_1.Combates1s.aggregate([
            //uniones de colecciones
            //Defensores
            {
                $lookup: {
                    from: "facciones1",
                    localField: "defensor.nombreFaccion",
                    foreignField: "nombre",
                    as: "faccionDefensora"
                }
            },
            {
                $lookup: {
                    from: "mercenarios1",
                    localField: "defensor.ejercito",
                    foreignField: "pueblo",
                    as: "efectivosDefensor"
                }
            },
            {
                $lookup: {
                    from: "arsenal1",
                    localField: "defensor.equipamiento.nombre",
                    foreignField: "nombre",
                    as: "equipoDefensor"
                }
            },
            //Atacantes 
            {
                $lookup: {
                    from: "facciones1",
                    localField: "atacante.nombreFaccion",
                    foreignField: "nombre",
                    as: "faccionAtacante"
                }
            },
            {
                $lookup: {
                    from: "mercenarios1",
                    localField: "atacante.ejercito",
                    foreignField: "pueblo",
                    as: "efectivosAtacante"
                }
            },
            {
                $lookup: {
                    from: "arsenal1",
                    localField: "atacante.equipamiento.nombre",
                    foreignField: "nombre",
                    as: "equipoAtacante"
                }
            },
            //procesamiento de datos.
            { $unwind: "$efectivosDefensor" },
            { $unwind: "$faccionDefensora" },
            { $unwind: "$efectivosAtacante" },
            { $unwind: "$faccionAtacante" },
            //simplificacion de informacion y calculos de puntuaciones
            {
                $set: {
                    ejercitoMercenarioDefensor: {
                        milicia: "$efectivosDefensor.unidades.milicia",
                        caballeria: "$efectivosDefensor.unidades.caballeria",
                        tropaElite: "$efectivosDefensor.unidades.tropasElite"
                    },
                    arsenalDefensorBonus: { $sum: [
                            { $arrayElemAt: ["$equipoDefensor.bonus", 0] },
                            { $arrayElemAt: ["$equipoDefensor.bonus", 1] },
                            { $arrayElemAt: ["$equipoDefensor.bonus", 2] }
                        ] },
                    puntuacionTotalDefensor: { $sum: [
                            { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.milicia", valorMilicia] }, "$faccionDefensora.modMilicia"] },
                            { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.caballeria", valorCaballeria] }, "$faccionDefensora.modCaballeria"] },
                            { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.tropasElite", valorElite] }, "$faccionDefensora.modElite"] },
                            { $multiply: [
                                    { $sum: [
                                            { $arrayElemAt: ["$equipoDefensor.bonus", 0] },
                                            { $arrayElemAt: ["$equipoDefensor.bonus", 1] },
                                            { $arrayElemAt: ["$equipoDefensor.bonus", 2] }
                                        ] },
                                    { $sum: [
                                            "$efectivosDefensor.unidades.milicia",
                                            "$efectivosDefensor.unidades.caballeria",
                                            "$efectivosDefensor.unidades.tropasElite"
                                        ]
                                    }
                                ] }
                        ] },
                    ejercitoMercenarioAtacante: {
                        milicia: "$efectivosAtacante.unidades.milicia",
                        caballeria: "$efectivosAtacante.unidades.caballeria",
                        tropaElite: "$efectivosAtacante.unidades.tropasElite"
                    },
                    arsenalAtacanteBonus: { $sum: [
                            { $arrayElemAt: ["$equipoAtacante.bonus", 0] },
                            { $arrayElemAt: ["$equipoAtacante.bonus", 1] },
                            { $arrayElemAt: ["$equipoAtacante.bonus", 2] }
                        ] },
                    puntuacionTotalAtacante: { $sum: [
                            { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.milicia", valorMilicia] }, "$faccionAtacante.modMilicia"] },
                            { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.caballeria", valorCaballeria] }, "$faccionAtacante.modCaballeria"] },
                            { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.tropasElite", valorElite] }, "$faccionAtacante.modElite"] },
                            { $multiply: [
                                    { $sum: [
                                            { $arrayElemAt: ["$equipoAtacante.bonus", 0] },
                                            { $arrayElemAt: ["$equipoAtacante.bonus", 1] },
                                            { $arrayElemAt: ["$equipoAtacante.bonus", 2] }
                                        ] },
                                    { $sum: [
                                            "$efectivosAtacante.unidades.milicia",
                                            "$efectivosAtacante.unidades.caballeria",
                                            "$efectivosAtacante.unidades.tropasElite"
                                        ] }
                                ] }
                        ] }
                }
            },
            {
                $project: {
                    _id: 0,
                    defensor: 0,
                    atacante: 0,
                    efectivosDefensor: 0,
                    faccionDefensora: 0,
                    equipoDefensor: 0,
                    efectivosAtacante: 0,
                    faccionAtacante: 0,
                    equipoAtacante: 0
                }
            },
            {
                $merge: {
                    into: { db: "proyecot3v2", coll: "combatesinfo2" }, on: "_id", whenMatched: "replace", whenNotMatched: "insert"
                }
            }
        ]);
        res.json(query3);
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const fun01 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let arrayCombates;
    const nomBat = req.params.batalla;
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        let arrayCombates;
        const query = yield combatesinfo2_1.Combatesinfo2s.find({ "batalla": { $eq: nomBat } }, { _id: 0, batalla: 1, fecha: 1, ejercitoMercenarioDefensor: 1, arsenalDefensorBonus: 1, puntuacionTotalDefensor: 1, ejercitoMercenarioAtacante: 1, arsenalAtacanteBonus: 1, puntuacionTotalAtacante: 1 });
        arrayCombates = query;
        let bonusA = 0;
        let bajasA = 1;
        let dmgA = 1;
        let bonusD = 1;
        let bajasD = 1;
        let dmgD = 1;
        let combatesinfo2;
        for (combatesinfo2 of arrayCombates) {
            bonusA = combatesinfo2.arsenalAtacanteBonus;
            bajasA = 0;
            if ((combatesinfo2.puntuacionTotalAtacante - combatesinfo2.puntuacionTotalDefensor) > 0) {
                dmgA = combatesinfo2.puntuacionTotalDefensor;
                dmgD = combatesinfo2.puntuacionTotalAtacante;
            }
            else {
                dmgA = combatesinfo2.puntuacionTotalAtacante;
                dmgD = combatesinfo2.puntuacionTotalDefensor;
            }
            while (dmgA > 0) {
                if (bajasA > combatesinfo2.ejercitoMercenarioAtacante.milicia) {
                    if (bajasA > combatesinfo2.ejercitoMercenarioAtacante.caballeria) {
                        dmgA = dmgA - (valorElite + bonusA);
                        bajasA++;
                    }
                    else {
                        dmgA = dmgA - (valorCaballeria + bonusA);
                        bajasA++;
                    }
                }
                else {
                    dmgA = dmgA - (valorMilicia + bonusA);
                    bajasA++;
                }
            }
            bonusD = combatesinfo2.arsenalDefensorBonus;
            bajasD = 0;
            while (dmgD > 0) {
                if (bajasD > combatesinfo2.ejercitoMercenarioDefensor.milicia) {
                    if (bajasD > combatesinfo2.ejercitoMercenarioDefensor.caballeria) {
                        dmgD = dmgD - (valorElite + bonusD);
                        bajasD++;
                    }
                    else {
                        dmgD = dmgD - (valorCaballeria + bonusD);
                        bajasD++;
                    }
                }
                else {
                    dmgD = dmgD - (valorMilicia + bonusD);
                    bajasD++;
                }
            }
        }
        res.json({ "bajasFaccionAtacante": bajasA, "bajasFaccionDefensora": bajasD });
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const fun02 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let arrayCombates;
    const nomBat = req.params.batalla;
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        let arrayCombates;
        let totalA = 0;
        let totalD = 0;
        const query = yield combatesinfo2_1.Combatesinfo2s.find({ "batalla": { $eq: nomBat } }, { _id: 0, batalla: 1, fecha: 1, ejercitoMercenarioDefensor: 1, arsenalDefensorBonus: 1, puntuacionTotalDefensor: 1, ejercitoMercenarioAtacante: 1, arsenalAtacanteBonus: 1, puntuacionTotalAtacante: 1 });
        arrayCombates = query;
        let combatesinfo2;
        for (combatesinfo2 of arrayCombates) {
            totalA = combatesinfo2.ejercitoMercenarioAtacante.milicia + combatesinfo2.ejercitoMercenarioAtacante.caballeria + combatesinfo2.ejercitoMercenarioAtacante.tropaElite;
            totalD = combatesinfo2.ejercitoMercenarioDefensor.milicia + combatesinfo2.ejercitoMercenarioDefensor.caballeria + combatesinfo2.ejercitoMercenarioDefensor.tropaElite;
        }
        res.json({ "numeroUnidadesAtacante": totalA, "numeroUnidadesDefensoras": totalD });
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const funm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.conectarBD();
    res.send("Este Proyecto simula enfrentamientos belicos ficticios abientados en la edad media y antigua, con un atacante y un defensor");
    database_1.db.desconectarBD();
});
app.get('/', funm);
app.get('/0', fun00);
app.get('/1/:batalla', fun01);
app.get('/Cargar', funP01);
app.get('/2/:batalla', fun02);

app.listen(port, () => {
    console.log(`Listening...`);
});