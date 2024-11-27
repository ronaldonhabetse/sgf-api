import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'



/*
* Model que representa um provedor 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Bank extends CreatableAbstractModel {

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare nuit: string

  @column()
  declare nib: string

  @column()
  declare accountPlanFinancialNumber: string
}