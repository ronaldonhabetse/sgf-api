import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccessProfile from '../../app/models/accessprofile.js'

export default class extends BaseSeeder {
  async run() {
    await AccessProfile.createMany([
      {
        id: 1,
        code: '001',
        description: 'Administrador de sistema',
      },
      {
        id: 2,
        code: '002',
        description: 'Apoio funcional',
      },
    ])
  }
}