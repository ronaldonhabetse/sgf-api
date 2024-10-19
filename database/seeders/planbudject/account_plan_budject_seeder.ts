import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccountPlanBudject from '../../../app/models/planbudject/account_plan_budject.js'

export default class extends BaseSeeder {
  async run() {
    
    const currentYear = new Date().getFullYear()

    await AccountPlanBudject.createMany([
      {
        year: currentYear,
        description: 'Plano de contas do ano' + currentYear,
      },
    ])
  }
}

