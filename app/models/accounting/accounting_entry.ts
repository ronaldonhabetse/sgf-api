import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import AccountingDocument from './accounting_document.js'
import { DateTime } from 'luxon'

/*
* Model que representa lancamento do diario contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccoutingJournal extends LifecycleAbstractModel {

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Custom format
  })
  declare operationDate: DateTime

  @column()
  declare accoutingJournalId: number

  @belongsTo(() => AccoutingJournal)
  declare accoutingJournal: BelongsTo<typeof AccoutingJournal>

  @column()
  declare accountingDocumentId: number

  @belongsTo(() => AccountingDocument)
  declare accountingDocument: BelongsTo<typeof AccountingDocument>
}