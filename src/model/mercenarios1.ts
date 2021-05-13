import {Schema, model } from 'mongoose'

const mercenarios1Schemas = new Schema({
    pueblo: String,
    unidades: [{
      milicia: Number,
      caballeria: Number,
      tropasElite: Number,
    }],
})

export interface Mercenarios1 {
   pueblo: string,
    unidades: [{
      milicia: number,
      caballeria: number,
      tropasElite: number,
    }],
}

export const Mercenarios1s = model('mercenarios1', mercenarios1Schemas)

