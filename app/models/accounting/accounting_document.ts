import { belongsTo, column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccoutingJournal from './accounting_journal.js'


/*
* Model que representa um documento
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountingDocument extends CreatableAbstractModel {

  @column()
  declare document_number: string

  @column()
  declare description: string

  @column()
  declare accoutingJournalId: number

  @belongsTo(() => AccoutingJournal)
  declare accoutingJournal: BelongsTo<typeof AccoutingJournal>
}