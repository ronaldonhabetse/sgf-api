import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, scope } from '@adonisjs/lucid/orm'
import { LifeclicleState } from './Enums.js'

/*
* Model abstracto que que representa um objecto com ID, chave primaria
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class DomainAbstractModel extends BaseModel {

  @column({ isPrimary: true })
  declare id: number
}