import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccountPlanBudjectEntry from './account_plan_budject_entry.js'
import { OperatorType } from '../utility/Enums.js'

export default class AccountPlanBudjectEntryEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: string

  @column()
  declare operator: OperatorType

  @column()
  declare postingMonth: number

  @column()
  declare postingDate: number

  @column()
  declare allocation: number

  @column()
  declare lastFinalAllocation: number

  @column()
  declare entryId: number //accountPlanBudjectEntry

  @belongsTo(() => AccountPlanBudjectEntry)
  declare accountPlanBudjectEntry: BelongsTo<typeof AccountPlanBudjectEntry>

  @column()
  declare entrieEntryId: number // accountPlanBudjectEntryEntry.id

  @belongsTo(() => AccountPlanBudjectEntryEntry)
  declare accountPlanBudjectEntryEntry: BelongsTo<typeof AccountPlanBudjectEntryEntry>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}