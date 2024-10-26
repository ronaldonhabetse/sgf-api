import { DateTime } from 'luxon'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { EntryEntryType, OperatorType } from '../utility/Enums.js'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import AccountPlanBudject from '../planbudject/account_plan_budject.js'
import AccountPlanFinancialEntry from './account_plan_financial_entry.js'

/*
* Model que representa a operacao de entrada do objecto no plano financeiro'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanFinancialEntryEntry extends CreatableAbstractModel {
  public static table = 'account_plan_financial_entries_entry' // table name

  @column()
  declare accountPlanBudjectId: number

  @belongsTo(() => AccountPlanBudject)
  declare accountPlanBudject: BelongsTo<typeof AccountPlanBudject>

  @column()
  declare type: EntryEntryType

  @column()
  declare operator: OperatorType

  @column()
  declare postingMonth: number

  @column.dateTime({ autoCreate: true })
  declare postingDate: DateTime

  @column()
  declare allocation: number

  @column()
  declare lastFinalAllocation: number

  @column()
  declare entryId: number //accountPlanFinancialEntry.id

  @belongsTo(() => AccountPlanFinancialEntry)
  declare entry: BelongsTo<typeof AccountPlanFinancialEntry>

  @column()
  declare targetEntrieEntryId: number // accountPlanFinancialEntryEntry.id

  @hasOne(() => AccountPlanFinancialEntryEntry, {
    foreignKey: 'targetEntrieEntryId', // defaults to userId
  })
  declare targetEntrieEntry: HasOne<typeof AccountPlanFinancialEntryEntry>
}

