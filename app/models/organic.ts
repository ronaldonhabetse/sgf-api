import { column } from '@adonisjs/lucid/orm'
import CodedCreatableModel from './utility/CodedCreatableModel.js'

/*
* Model que representa um 'Organico'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Organic extends CodedCreatableModel {
    @column()
    declare name: string 
}