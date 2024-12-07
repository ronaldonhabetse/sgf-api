import { DateTime } from 'luxon'
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { EntryEntryType, OperatorType } from '../utility/Enums.js'
import AccountPlanYear from './account_plan_year.js'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import AccountPlanEntry from './account_plan_entry.js'

/*
* Model que representa lancamentos do plano de contas para um ano especifico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanEntryEntry extends CreatableAbstractModel {
  public static table = 'account_plan_entries_entry' // Custom table name

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare type: EntryEntryType

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
  declare allocation: number

  @column()
  declare lastFinalAllocation: number

  @column()
  declare entryId: number //accountPlanBudjectEntry.id

  // Relacionamento com AccountPlanEntry
  @belongsTo(() => AccountPlanEntry, {
    foreignKey: 'entry_id', // Chave estrangeira
  })
  public entry: BelongsTo<typeof AccountPlanEntry>

  @column()
  declare targetEntrieEntryId: number // accountPlanBudjectEntryEntry.id

  // Relacionamento hasOne com AccountPlanEntryEntry
  @hasOne(() => AccountPlanEntryEntry, {
    foreignKey: 'target_entrie_entry_id', // Corrigir para 'target_entrie_entry_id' (verifique se corresponde à coluna no banco)
  })
  declare targetEntrieEntry: HasOne<typeof AccountPlanEntryEntry>
}
