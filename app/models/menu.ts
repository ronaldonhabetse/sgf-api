import {  belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Application from './application.js'
import CodedCreatableModel from './utility/CodedCreatableModel.js'

/*
* Model que representa um 'Menu'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Menu extends CodedCreatableModel {

  @column()
  declare type: String

  @column()
  declare applicationId: number | null

  @belongsTo(() => Application)
  declare application: BelongsTo<typeof Application>

  @column()
  declare parentId: number | null

  @belongsTo(() => Menu)
  declare parent: BelongsTo<typeof Menu>
}