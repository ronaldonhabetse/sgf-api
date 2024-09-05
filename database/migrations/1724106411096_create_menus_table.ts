import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menus'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 4).notNullable()
      table.string('description', 64).notNullable()
      table.string('type', 4).notNullable().checkIn(['MENU','ITEM'])

      table.integer('application_id').unsigned().references('applications.id')
      table.integer('parent_id').unsigned().references('menus.id')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}