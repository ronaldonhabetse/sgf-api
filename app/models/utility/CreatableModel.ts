import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/*
* Model que representa uma 'Aplicacao/sistema ou modulo'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CreatableModel extends BaseModel {
  
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare  createdBy: Number
}