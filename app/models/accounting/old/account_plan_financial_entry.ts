import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import AccountPlanYear from '../../planbudject/account_plan_year.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AccountPlan from '../../planbudject/account_plan.js'
import MutableAbstractModel from '../../utility/MutableAbstractModel.js'
import AccountPlanFinancialEntryEntry from './account_plan_financial_entry_entry.js'


/*
* Model que representa saldos de planos de conta financeiro para um ano especifico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanFinancialEntry extends MutableAbstractModel {

  @column()
  declare balance: number

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare accountPlanNumber: string

  @column()
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @column()
  declare parentId: number

  @belongsTo(() => AccountPlanFinancialEntry)
  declare parent: BelongsTo<typeof AccountPlanFinancialEntry>

  @hasMany(() => AccountPlanFinancialEntryEntry, {
    foreignKey: 'entryId', // defaults to entryId
  })
  declare entriesEntry: HasMany<typeof AccountPlanFinancialEntryEntry>
}