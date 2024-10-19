// import type { HttpContext } from '@adonisjs/core/http'

import AccountPlanBudjectService from "../../services/planbudject/account_plan_budject_service.js";


export default class AccountPlanBudjectsController {

    constructor(
        private accountPlanBudjectService: AccountPlanBudjectService
      ) { }
    
      async createAccountPlanBudject({ request, response }: HttpContext) {
       // const data = await request.validateUsing(accountPlanValidator)
        //response.created(await this.accountPlanBudjectService.create(data));
      }
    
      async findAllActiveAccountPlanBudject({ request, response }: HttpContext) {
       // return response.created(await this.accountPlanBudjectService.findAllActive());
      }
}