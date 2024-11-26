import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import AccountingDocument from './accounting_document.js'
import { DateTime } from 'luxon'
import AccountingJournal from './accounting_journal.js'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import AccountPlanJournalItem from './accounting_journal_item.js'
import InternalRequest from '../request/internal_request.js'

/*
* Model que representa lancamento do diario contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountingJournalEntry extends LifecycleAbstractModel {

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Custom format
  })
  declare operationDate: DateTime

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare accountingJournalId: number

  @belongsTo(() => AccountingJournal)
  declare accountingJournal: BelongsTo<typeof AccountingJournal>

  @column()
  declare accountingDocumentId: number

  @belongsTo(() => AccountingDocument)
  declare accountingDocument: BelongsTo<typeof AccountingDocument>

  @column()
  declare internalRequestId: number

  @belongsTo(() => InternalRequest)
  declare internalRequest: BelongsTo<typeof InternalRequest>

  @hasMany(() => AccountPlanJournalItem, {
    foreignKey: 'entryId', // defaults to entryId
  })
  declare entriesEntry: HasMany<typeof AccountPlanJournalItem>
}