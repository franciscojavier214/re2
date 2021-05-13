import {Schema, model } from 'mongoose'

const combatesinfo2Schemas = new Schema({
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
  })
  
export interface Combatesinfo2 {
    fecha: Date,
    batalla: string,
    ejercitoMercenarioDefensor: {
      milicia: number,
      caballeria: number,
      tropaElite: number
    },
    arsenalDefensorBonus: number,
    puntuacionTotalDefensor: number,
    ejercitoMercenarioAtacante: {
      milicia: number,
      caballeria: number,
      tropaElite: number
    },
    arsenalAtacanteBonus: number,
    puntuacionTotalAtacante: number
  }   


export const Combatesinfo2s = model('combatesinfo2', combatesinfo2Schemas)
