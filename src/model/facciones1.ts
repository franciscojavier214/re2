import {Schema, model } from 'mongoose'

const facciones1Schemas = new Schema({
    nombre: String,
    modMilicia: Number,
    modcabellria: Number,
    modElite: Number,
    fundacion: Date,
})

export interface Facciones1 {
    nombre: string,
    modMilicia: number,
    modcabellria: number,
    modElite: number,
    fundacion: Date,
}

export const Facciones1s = model('facciones1', facciones1Schemas)
