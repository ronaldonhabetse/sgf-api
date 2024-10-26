import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import AccountPlanBudject from './account_plan_budject.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AccountPlan from './account_plan.js'
import AccountPlanBudjectEntryEntry from './account_plan_budject_entry_entry.js'
import MutableAbstractModel from '../utility/MutableAbstractModel.js'

export default class AccountPlanBudjectEntry extends MutableAbstractModel {

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
  declare accountPlanNumber: string

  @column()
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @column()
  declare parentId: number

  @belongsTo(() => AccountPlanBudjectEntry)
  declare parent: BelongsTo<typeof AccountPlanBudjectEntry>

  @hasMany(() => AccountPlanBudjectEntryEntry, {
    foreignKey: 'entryId', // defaults to entryId
  })
  declare entriesEntry: HasMany<typeof AccountPlanBudjectEntryEntry>
}