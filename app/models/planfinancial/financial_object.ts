import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AccountPlanBudject from '../planbudject/account_plan_budject.js'
import ObjectAttributesInfo from './Object_attribute_info.js'
import FinancialObjectType from './financial_object_type.js'
import CodedAbstractModel from '../utility/CodedAbstractModel.js'

/*
* Model que representa um objecto financeiro 'caixa, banco, cliente, provedor, etc'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class FinancialObject extends CodedAbstractModel {

  @column()
  declare accountPlanBudjectId: number;

  @belongsTo(() => AccountPlanBudject)
  declare accountPlanBudject: BelongsTo<typeof AccountPlanBudject>;

  @column()
  declare objectTypeId: number;

  @belongsTo(() => FinancialObjectType)
  declare objectType: BelongsTo<typeof FinancialObjectType>;

  @hasMany(() => ObjectAttributesInfo, {
    foreignKey: 'attributesInfoId', // defaults to attributesInfoId
  })
  declare attributesInfo: HasMany<typeof ObjectAttributesInfo>
}