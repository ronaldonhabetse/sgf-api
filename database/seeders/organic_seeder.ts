import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Organic from '../../app/models/organic.js'

export default class extends BaseSeeder {
  async run() {
    await Organic.createMany([
      {
        id: 1,
        code: '001',
        name:'EM',
        description: 'Embaixada de Mocambique',
      },
      {
        id: 2,
        code: '002',
        name:'SBD',
        description: 'SABADORE',
      },
    ])
  }
}