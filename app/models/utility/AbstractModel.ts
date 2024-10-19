import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, scope } from '@adonisjs/lucid/orm'
import { LifeclicleState } from './Enums.js'

/*
* Model abstracto que que representa um objecto criavel
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AbstractModel extends BaseModel {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare state: LifeclicleState.ACTIVE

  @column()
  declare createdBy: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare updatedBy: Number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static active = scope((query) => {
    query.where('state', '=', LifeclicleState.ACTIVE)
  })

  static inactiveActive = scope((query) => {
    query.where('state', '=', LifeclicleState.INACTIVE)
  })

  @beforeSave()
   static async presSave(model: AbstractModel) {
  //  model.state = LifeclicleState.ACTIVE;
  }
}