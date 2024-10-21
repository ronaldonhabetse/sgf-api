import { BaseSchema } from '@adonisjs/lucid/schema'
import { EntryEntryType, LifeclicleState, OperatorType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'account_plan_budject_entries_entry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', Object.values(EntryEntryType))
        .notNullable()
        .checkIn([EntryEntryType.INITIAL, EntryEntryType.REINFORCEMENT, EntryEntryType.ANNULMENT, EntryEntryType.REDISTRIBUTION_REINFORCEMENT, EntryEntryType.REDISTRIBUTION_ANNULMENT,])
      table.enum('operator', Object.values(OperatorType))
        .notNullable()
        .checkIn([OperatorType.DEBIT, OperatorType.CREDTI])
      table.double('allocation').notNullable()
      table.double('last_final_allocation').notNullable()
      table.integer('posting_month').notNullable()
      table.timestamp('posting_date').notNullable()

      table.integer('entry_id').notNullable().unsigned()
        .references('account_plan_budject_entries.id')
        .withKeyName('fk_entry_id')
      table.integer('target_entrie_entry_id').unsigned()
        .references('account_plan_budject_entries_entry.id')
        .withKeyName('fk_target_entrie_entry_id')
      table.integer('account_plan_budject_id').notNullable().unsigned()
        .references('account_plan_budjects.id')
        .withKeyName('fk_account_plan_budject_id')

      table.integer('state').notNullable().defaultTo(LifeclicleState.ACTIVE)
      table.timestamp('created_by')
      table.timestamp('created_at')
      table.timestamp('updated_by')
      table.timestamp('updated_at')
    })
  }

  async down() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) {
      this.schema.dropTable(this.tableName)
    }
  }
}