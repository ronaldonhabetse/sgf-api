import {hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import CodedCreatableModel from '../utility/CodedCreatableModel.js'
import Menu from './menu.js'

/*
* Model que representa uma 'Transação'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Transaction extends CodedCreatableModel {

  @hasOne(() => Menu, {
    foreignKey: 'menuItemId',
  })
  declare menuItem: HasOne<typeof Menu>
}