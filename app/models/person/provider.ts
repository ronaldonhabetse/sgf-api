import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'



/*
* Model que representa um provedor 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Provider extends CreatableAbstractModel {

  @column()
  declare name: string

  @column()
  declare accountPlanFinancialNumber: string
}