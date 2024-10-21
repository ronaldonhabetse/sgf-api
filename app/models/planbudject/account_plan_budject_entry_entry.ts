import { DateTime } from 'luxon'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import AccountPlanBudjectEntry from './account_plan_budject_entry.js'
import { EntryEntryType, OperatorType } from '../utility/Enums.js'
import AccountPlanBudject from './account_plan_budject.js'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'

export default class AccountPlanBudjectEntryEntry extends CreatableAbstractModel {
  public static table = 'account_plan_budject_entries_entry' // Custom table name

  @column({ isPrimary: true })
  declare id: number

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
  declare entryId: number //accountPlanBudjectEntry.id

  @belongsTo(() => AccountPlanBudjectEntry)
  declare entry: BelongsTo<typeof AccountPlanBudjectEntry>

  @column()
  declare targetEntrieEntryId: number // accountPlanBudjectEntryEntry.id

  @hasOne(() => AccountPlanBudjectEntryEntry, {
    foreignKey: 'targetEntrieEntryId', // defaults to userId
  })
  declare targetEntrieEntry: HasOne<typeof AccountPlanBudjectEntryEntry>
}

