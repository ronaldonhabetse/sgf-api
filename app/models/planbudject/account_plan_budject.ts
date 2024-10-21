import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'

export default class AccountPlanBudject extends CreatableAbstractModel {

  @column()
  declare year: number

  @column()
  declare description: string

}