import {Schema, model } from 'mongoose'

const arsenal1Schemas = new Schema({
    nombre: String,
    tipo: String,
    bonus: Number,
})

export interface Arsenal1 {
    nombre: string,
    tipo: string,
    bonus: number,
}

export const Arsenal1s = model('arsenal1', arsenal1Schemas)
