import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import MutableAbstractModel from '../utility/MutableAbstractModel.js'
import AccountPlan from '../planbudject/account_plan.js'
import AccountPlanBudject from '../planbudject/account_plan_budject.js'
import AccountPlanFinancialEntryEntry from './account_plan_financial_entry_entry.js'
import AccountPlanBudjectEntry from '../planbudject/account_plan_budject_entry.js'

/*
* Model que representa a entrada do objecto e plano financeiro'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanFinancialEntry extends MutableAbstractModel {

  @column()
  declare startPostingMonth: number

  @column()
  declare endPostingMonth: number

  @column()
  declare reservePercent: number

  @column()
  declare initialAllocation: number

  @column()
  declare finalAllocation: number

  @column()
  declare accountPlanBudjectId: number

  @belongsTo(() => AccountPlanBudject)
  declare accountPlanBudject: BelongsTo<typeof AccountPlanBudject>

  @column()
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @hasMany(() => AccountPlanFinancialEntryEntry, {
    foreignKey: 'entryId', // defaults to entryId
  })
  declare entriesEntry: HasMany<typeof AccountPlanFinancialEntryEntry>

//RELACIONAMENTO COM O PLANO ORCAMENTAL
  @hasMany(() => AccountPlanBudjectEntry, {
    foreignKey: 'budjectEntryId', // defaults to budjcetEntryId
  })
  declare budjectEntries: HasMany<typeof AccountPlanBudjectEntry>
}