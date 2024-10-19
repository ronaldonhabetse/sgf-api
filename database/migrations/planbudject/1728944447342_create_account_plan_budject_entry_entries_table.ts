import { BaseSchema } from '@adonisjs/lucid/schema'
import { LifeclicleState, OperatorType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'acc_plan_budject_entries_entry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type').notNullable().checkIn(['reinforcement', 'annulment', 'redistribution_reinforcement', 'redistribution_annulment'])
      table.integer('entry_id').notNullable().unsigned().references('account_plan_budject_entries.id')
      table.enum('operator', Object.values(OperatorType))
        .notNullable().checkIn([OperatorType.DEBIT, OperatorType.CREDTI])
      table.double('allocation').notNullable()
      table.double('last_final_allocation').notNullable()
      table.integer('entrie_entry_id').unsigned().references('acc_plan_budject_entries_entry.id')

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
    }  }
}