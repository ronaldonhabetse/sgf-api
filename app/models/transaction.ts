import {hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import CodedCreatableModel from './utility/CodedCreatableModel.js'
import Menu from './menu.js'

/*
* Model que representa uma 'Transaction'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Transaction extends CodedCreatableModel {

  @hasOne(() => Menu, {
    foreignKey: 'menuItemId', // defaults to userId
  })
  declare menuItem: HasOne<typeof Menu>
}