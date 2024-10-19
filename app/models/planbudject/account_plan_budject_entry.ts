import { beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import AccountPlanBudject from './account_plan_budject.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccountPlan from './account_plan.js'
import AbstractModel from '../utility/AbstractModel.js'

export default class AccountPlanBudjectEntry extends AbstractModel {

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

  @column()
  declare parentId: number

  @belongsTo(() => AccountPlanBudjectEntry)
  declare parent: BelongsTo<typeof AccountPlanBudjectEntry>

  @beforeSave()
  static async setFinalAllocation(accountPlanBudjectEntry: AccountPlanBudjectEntry) {
    accountPlanBudjectEntry.finalAllocation = accountPlanBudjectEntry.initialAllocation;
  }
}