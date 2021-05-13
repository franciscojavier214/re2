import {Schema, model } from 'mongoose'

const combates1Schemas = new Schema({
    fecha: Date,
    batalla: String,
    atacante: 
    [{
      nombreFaccion: String,
      ejercito: String,
      equipamiento:
        [{
          tipo: String,
          nombre: String,
        }]
    }],
  defensor: 
    [{
      nombreFaccion: String,
      ejercito: String,
      equipamiento:
        [{
          tipo: String,
          nombre: String,
        }]
    }]
})

export interface Combates1 {
    fecha: Date,
    batalla: string,   
    atacante: [{

      nombreFaccion: string,
      ejercito: string,

      equipamiento:[{

        tipo: string,
        nombre: string,

        }]

    }],
      defensor: 
    [{
      nombreFaccion: string,
      ejercito: string,
      equipamiento:
        [{
          tipo: string,
          nombre: string,
        }]
    }]
}

export const Combates1s = model('combates1', combates1Schemas)
