import { column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import { DateTime } from 'luxon'
import AccountingJournalEntry from './accounting_journal_entry.js'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import { OperatorType } from '../utility/Enums.js'

/*
* Model que representa lancamento do diario contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanJournalItem extends LifecycleAbstractModel {

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy')
  })
  declare operationDate: DateTime

  @column()
  declare operator: OperatorType

  @column()
  declare value: number

  @column()
  declare description: string

  @column()
  declare accountPlanNumber: string

  @column()
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare entryId: number //AccountingJournalEntry.id

  @belongsTo(() => AccountingJournalEntry)
  declare entry: BelongsTo<typeof AccountingJournalEntry>
}