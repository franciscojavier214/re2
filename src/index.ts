import { Facciones1s, Facciones1 } from './model/facciones1'
import { Arsenal1s, Arsenal1 } from './model/arsenal1'
import { Mercenarios1s, Mercenarios1 } from './model/mercenarios1'
import { Combates1s, Combates1 } from './model/combates1'
import { Combatesinfo2s, Combatesinfo2 } from './model/combatesinfo2'


import { db } from './database/database'
import { Request, Response } from 'express'
import express from 'express'
const app = express()
const port = 3000

//constantes
const valorMilicia = 1;
const valorCaballeria = 3;
const valorElite = 5;

const fun00 = async (req: Request, res: Response) => {
  await db.conectarBD()
    .then(
      async (mensaje) => {
        console.log(mensaje)

        const query3: any = await Combates1s.aggregate([
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

                puntuacionTotalDefensor:
                {
                  $sum:
                    [
                      { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.milicia", valorMilicia] }, "$faccionDefensora.modMilicia"] },

                      { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.caballeria", valorCaballeria] }, "$faccionDefensora.modCaballeria"] },

                      { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.tropasElite", valorElite] }, "$faccionDefensora.modElite"] },

                      {
                        $multiply: [
                          {
                            $sum: [ // solo se calcula las 3 primeras posiciones del array que corresponde con los 3 espacios de equipo que puede llevar un soldado.
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

                puntuacionTotalAtacante:
                {
                  $sum:
                    [
                      { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.milicia", valorMilicia] }, "$faccionAtacante.modMilicia"] },

                      { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.caballeria", valorCaballeria] }, "$faccionAtacante.modCaballeria"] },

                      { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.tropasElite", valorElite] }, "$faccionAtacante.modElite"] },

                      {
                        $multiply: [
                          {
                            $sum: [ // solo se calcula las 3 primeras posiciones del array que corresponde con los 3 espacios de equipo que puede llevar un soldado.
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
        ])
        res.json(query3)
      })
    .catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
      })
  db.desconectarBD()
}

const funP01 = async (req: Request, res: Response) => {
    await db.conectarBD()
      .then(
        async (mensaje) => {
          console.log(mensaje)
  
          const query3: any = await Combates1s.aggregate([
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
                  ejercitoMercenarioDefensor:{
                    milicia:"$efectivosDefensor.unidades.milicia",
                    caballeria:"$efectivosDefensor.unidades.caballeria",
                    tropaElite:"$efectivosDefensor.unidades.tropasElite"
                  },
                  arsenalDefensorBonus: {$sum:[
                    { $arrayElemAt: ["$equipoDefensor.bonus", 0] },
                    { $arrayElemAt: ["$equipoDefensor.bonus", 1] },
                    { $arrayElemAt: ["$equipoDefensor.bonus", 2] }
                  ]},
  
                  puntuacionTotalDefensor:{$sum:[
                        { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.milicia", valorMilicia] }, "$faccionDefensora.modMilicia"] },
                        { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.caballeria", valorCaballeria] }, "$faccionDefensora.modCaballeria"] },
                        { $multiply: [{ $multiply: ["$efectivosDefensor.unidades.tropasElite", valorElite] }, "$faccionDefensora.modElite"] },
                    {$multiply: [
                            {$sum: [
                                { $arrayElemAt: ["$equipoDefensor.bonus", 0] },
                                { $arrayElemAt: ["$equipoDefensor.bonus", 1] },
                                { $arrayElemAt: ["$equipoDefensor.bonus", 2] }
                           ]},
                            {$sum: [
                                "$efectivosDefensor.unidades.milicia",
                                "$efectivosDefensor.unidades.caballeria",
                                "$efectivosDefensor.unidades.tropasElite"
                              ]
                        }]}]},
                ejercitoMercenarioAtacante:{
                    milicia:"$efectivosAtacante.unidades.milicia",
                    caballeria:"$efectivosAtacante.unidades.caballeria",
                    tropaElite:"$efectivosAtacante.unidades.tropasElite"
                  },
                  arsenalAtacanteBonus: {$sum:[
                    { $arrayElemAt: ["$equipoAtacante.bonus", 0] },
                    { $arrayElemAt: ["$equipoAtacante.bonus", 1] },
                    { $arrayElemAt: ["$equipoAtacante.bonus", 2] }
                  ]},
                  puntuacionTotalAtacante:
                  {$sum:[
                        { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.milicia", valorMilicia] }, "$faccionAtacante.modMilicia"] },
                        { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.caballeria", valorCaballeria] }, "$faccionAtacante.modCaballeria"] },
                        { $multiply: [{ $multiply: ["$efectivosAtacante.unidades.tropasElite", valorElite] }, "$faccionAtacante.modElite"] },
                        {$multiply: [
                            {$sum: [ 
                                { $arrayElemAt: ["$equipoAtacante.bonus", 0] },
                                { $arrayElemAt: ["$equipoAtacante.bonus", 1] },
                                { $arrayElemAt: ["$equipoAtacante.bonus", 2] }
                              ]},
                            {$sum: [
                                "$efectivosAtacante.unidades.milicia",
                                "$efectivosAtacante.unidades.caballeria",
                                "$efectivosAtacante.unidades.tropasElite"
                  ]}]}]}
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

          ])
          res.json(query3)
        })
      .catch(
        (mensaje) => {
          res.send(mensaje)
          console.log(mensaje)
        })
    db.desconectarBD()
  }

const fun01 = async (req: Request, res: Response) => {
    let arrayCombates:Combatesinfo2
  const nomBat = req.params.batalla

  await db.conectarBD()
    .then(
      async (mensaje) => {
        let arrayCombates: Array<Combatesinfo2>
        const query:any = await Combatesinfo2s.find(
          {"batalla":{ $eq: nomBat }}, {_id:0,batalla:1,fecha:1,ejercitoMercenarioDefensor:1,arsenalDefensorBonus:1,puntuacionTotalDefensor:1,ejercitoMercenarioAtacante:1,arsenalAtacanteBonus:1,puntuacionTotalAtacante:1})
        arrayCombates = query
        
        let bonusA: number=0
        let bajasA: number =1
        let  dmgA: number =1
        let bonusD: number=1
        let bajasD: number =1
        let  dmgD: number =1
        
        let combatesinfo2: Combatesinfo2
        for (combatesinfo2 of arrayCombates) {
         bonusA = combatesinfo2.arsenalAtacanteBonus
         bajasA = 0
         if((combatesinfo2.puntuacionTotalAtacante-combatesinfo2.puntuacionTotalDefensor)>0){
          dmgA = combatesinfo2.puntuacionTotalDefensor
          dmgD = combatesinfo2.puntuacionTotalAtacante
         }else{
          dmgA = combatesinfo2.puntuacionTotalAtacante
          dmgD = combatesinfo2.puntuacionTotalDefensor
         }

          while(dmgA>0){
            if(bajasA>combatesinfo2.ejercitoMercenarioAtacante.milicia){
              if(bajasA>combatesinfo2.ejercitoMercenarioAtacante.caballeria){
                dmgA = dmgA - ( valorElite+bonusA)
                bajasA++
              }else{
                dmgA =  dmgA - ( valorCaballeria+bonusA)
                bajasA++
            }
            }else{
            dmgA = dmgA - ( valorMilicia+bonusA)
            bajasA++
            }
          }
          bonusD  = combatesinfo2.arsenalDefensorBonus
          bajasD  = 0

              while(dmgD>0){
            if(bajasD>combatesinfo2.ejercitoMercenarioDefensor.milicia){
              if(bajasD>combatesinfo2.ejercitoMercenarioDefensor.caballeria){
                dmgD = dmgD - (valorElite+bonusD)
                bajasD++
              }else{
                dmgD = dmgD - ( valorCaballeria+bonusD)
                bajasD++
            }
            }else{
            dmgD = dmgD - ( valorMilicia+bonusD)
            bajasD++
            }
          }  
        }
     res.json({"bajasFaccionAtacante":bajasA, "bajasFaccionDefensora":bajasD})
      })
    .catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
      })
  db.desconectarBD()
}

const fun02 = async (req: Request, res: Response) => {
    let arrayCombates:Combatesinfo2
  const nomBat = req.params.batalla

  await db.conectarBD()
    .then(
      async (mensaje) => {
        let arrayCombates: Array<Combatesinfo2>
        let totalA: number=0
        let totalD: number=0
        const query:any = await Combatesinfo2s.find(
          {"batalla":{ $eq: nomBat }}, {_id:0,batalla:1,fecha:1,ejercitoMercenarioDefensor:1,arsenalDefensorBonus:1,puntuacionTotalDefensor:1,ejercitoMercenarioAtacante:1,arsenalAtacanteBonus:1,puntuacionTotalAtacante:1})
        arrayCombates = query
       
        let combatesinfo2: Combatesinfo2
        for (combatesinfo2 of arrayCombates) {
          totalA=combatesinfo2.ejercitoMercenarioAtacante.milicia+combatesinfo2.ejercitoMercenarioAtacante.caballeria+combatesinfo2.ejercitoMercenarioAtacante.tropaElite
          totalD=combatesinfo2.ejercitoMercenarioDefensor.milicia+combatesinfo2.ejercitoMercenarioDefensor.caballeria+combatesinfo2.ejercitoMercenarioDefensor.tropaElite
        }
     res.json({"numeroUnidadesAtacante":totalA,"numeroUnidadesDefensoras":totalD  })
      })
    .catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
      })
  db.desconectarBD()
}
const funm = async (req: Request, res: Response) => {
    await db.conectarBD()
   res.send("Este Proyecto simula enfrentamientos belicos ficticios abientados en la edad media y antigua, con un atacante y un defensor")
  db.desconectarBD()
}
app.get('/', funm)
app.get('/0', fun00)
app.get('/1/:batalla', fun01)
app.get('/Cargar', funP01)
app.get('/2/:batalla', fun02)

app.listen(process.env.PORT || port, () => {
  console.log(`Listening...`)
})
