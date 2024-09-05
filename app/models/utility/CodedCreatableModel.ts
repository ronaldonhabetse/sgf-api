import {column } from '@adonisjs/lucid/orm'
import CreatableModel from './CreatableModel.js'

/*
* Model que representa uma 'Aplicacao/sistema ou modulo'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CodedCreatableModel extends CreatableModel {

  @column()
  declare code: string 

  @column()
  declare description: string
}