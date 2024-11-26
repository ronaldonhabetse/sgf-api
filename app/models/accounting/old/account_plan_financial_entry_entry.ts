import { DateTime } from 'luxon'
import { FinancialEntryEntryType, OperatorType } from '../../utility/Enums.js'
import AccountPlanYear from '../../planbudject/account_plan_year.js'
import CreatableAbstractModel from '../../utility/CreatableAbstractModel.js'
import AccountPlanFinancialEntry from './account_plan_financial_entry.js'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'

/*
* Model que representa lancamentos do plano de contas financeiro para um ano especifico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanFinancialEntryEntry extends CreatableAbstractModel {
  public static table = 'account_plan_financial_entries_entry' // Custom table name

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare type: FinancialEntryEntryType

  @column()
  declare operator: OperatorType

  @column()
  declare postingMonth: number

  @column.dateTime({ autoCreate: true })
  declare postingDate: DateTime

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Custom format
  })
  declare operationDate: DateTime

  @column()
  declare value: number

  @column()
  declare entryId: number

  @belongsTo(() => AccountPlanFinancialEntry)
  declare entry: BelongsTo<typeof AccountPlanFinancialEntry>

  @column()
  declare targetEntrieEntryId: number

  @hasOne(() => AccountPlanFinancialEntryEntry, {
    foreignKey: 'targetEntrieEntryId',
  })
  declare targetEntrieEntry: HasOne<typeof AccountPlanFinancialEntryEntry>
}
