import {  belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Applications from './application.js'
import CodedAbstractModel from '../utility/CodedAbstractModel.js'

/*
* Model que representa um 'Menu'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Menu extends CodedAbstractModel {

  @column()
  declare type: String

  @column()
  declare applicationId: number

  @belongsTo(() => Applications)
  declare application: BelongsTo<typeof Applications>

  @column()
  declare parentId: number | null

  @belongsTo(() => Menu)
  declare parent: BelongsTo<typeof Menu>
}