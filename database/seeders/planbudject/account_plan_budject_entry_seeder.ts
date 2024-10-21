import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccountPlanBudjectEntry from '../../../app/models/planbudject/account_plan_budject_entry.js'
import AccountPlan from '../../../app/models/planbudject/account_plan.js'
import AccountPlanBudject from '../../../app/models/planbudject/account_plan_budject.js'

export default class extends BaseSeeder {
  async run() {

    const currentYear = new Date().getFullYear()
    const currentAccountPlanBudject = await AccountPlanBudject.findBy('year', currentYear);
  
    await AccountPlanBudjectEntry.createMany([
      {
        startPostingMonth: 1,
        endPostingMonth: 12,
        reservePercent:0,
        initialAllocation:1000000,
        accountPlanBudjectId: currentAccountPlanBudject?.id,
        accountPlanId: (await AccountPlan.findBy('number', '1.0.0.0.00'))?.id,
      },
      {
        startPostingMonth: 1,
        endPostingMonth: 12,
        reservePercent:0,
        initialAllocation:1000000,
        accountPlanBudjectId: currentAccountPlanBudject?.id,
        accountPlanId: (await AccountPlan.findBy('number', '1.1.0.0.00'))?.id,
      },
    ])
  }
}

