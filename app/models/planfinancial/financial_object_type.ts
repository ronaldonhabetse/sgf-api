import { column } from '@adonisjs/lucid/orm'
import CodedAbstractModel from '../utility/CodedAbstractModel.js';


/*
* Model que representa o tipo de objecto financeiro'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class FinancialObjectType extends CodedAbstractModel {

  @column()
  declare config: string;
}