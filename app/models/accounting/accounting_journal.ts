import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import AccountingDocument from './accounting_document.js'

/*
* Model que representa um diario contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccoutingJournal extends LifecycleAbstractModel {

  @column()
  declare journal_number: number

  @hasMany(() => AccountingDocument, {
    foreignKey: 'accounting_document_id'
  })
  declare documents: HasMany<typeof AccountingDocument>
}