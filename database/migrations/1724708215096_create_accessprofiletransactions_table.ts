import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'access_profile_transaction'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('access_profile_id').unsigned().references('access_profiles.id').primary()
      table.integer('transaction_id').unsigned().references('transactions.id').primary()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}