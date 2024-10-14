import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Menu from '../../app/models/security/menu.js'
import Transaction from '../../app/models/security/transaction.js'

export default class extends BaseSeeder {
  async run() {
    await Menu.createMany([
      {
        id: 1,
        code: '100',
        type: 'MENU',
        description: 'Utilizadores',
        applicationId: 1
      },
      {
        id: 2,
        code: '101',
        type: 'ITEM',
        parentId: 1,
        description: 'Manter utilizadores',
      },
      {
        id: 3,
        code: '200',
        type: 'MENU',
        description: 'Relatorios',
        applicationId: 1
      },

      {
        id: 4,
        code: '201',
        type: 'ITEM',
        parentId: 2,
        description: 'Ver Utilizadores',
      },
    ])


    await Transaction.createMany([
      {
        id: 1,
        code: '001',
        description: 'Manter utilizadores',
      },
      {
        id: 2,
        code: '002',
        description: 'Apoio funcional',
      },
    ])
  }

}