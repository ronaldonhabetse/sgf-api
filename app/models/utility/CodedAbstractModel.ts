import {column } from '@adonisjs/lucid/orm'
import AbstractModel from './AbstractModel.js'

/*
* Model abstracto que com atributos 'code e description'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CodedAbstractModel extends AbstractModel {

  @column()
  declare code: string 

  @column()
  declare description: string
}