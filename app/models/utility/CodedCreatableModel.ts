import {column } from '@adonisjs/lucid/orm'
import CreatableModel from './CreatableModel.js'

/*
* Model abstracto que com atributos 'code e description'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CodedCreatableModel extends CreatableModel {

  @column()
  declare code: string 

  @column()
  declare description: string
}