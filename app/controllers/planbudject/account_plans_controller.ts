import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import AccountPlanService from "../../services/planbudject/account_plan_service.js";
import { accountPlanValidatorFields } from "../../validators/planbudject/accountPlanValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class AccountPlansController {

  constructor(
    private accountPlanService: AccountPlanService
  ) { }

  async createAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(accountPlanValidatorFields)
    response.created(await this.accountPlanService.create(data));
  }

  async updateAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(accountPlanValidatorFields)
    response.created(await this.accountPlanService.update(data));
  }

  async findAllActiveAccountPlan({ request, response }: HttpContext) {
    return response.created(await this.accountPlanService.findAllActive());
  }

  async findAllAccountPlan({ request, response }: HttpContext) {
    return response.created(await this.accountPlanService.findAll());
  }
}