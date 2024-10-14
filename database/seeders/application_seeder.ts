import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Application from '../../app/models/security/application.js'

export default class extends BaseSeeder {
  async run() {

    await Application.createMany([
      {
        id: 1,
        code: '001',
        type: 'SYSTEM',
        description: 'Sistema de Gestão financeira',
      },
      {
        id: 2,
        code: '002',
        type: 'MODULE',
        description: 'Apoio funcional',
      },
    ])
  }
}