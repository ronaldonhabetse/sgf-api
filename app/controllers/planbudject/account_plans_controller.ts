import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import AccountPlanService from "../../services/planbudject/account_plan_service.js";
import AccountPlanValidator from "../../validators/planbudject/accountPlanValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class AccountPlansController {

  constructor(
    private accountPlanService: AccountPlanService
  ) { }

  async createAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountPlanValidator.validateFields())

    try {
      const newLocal = await this.accountPlanService.create(data);
      return response.created(newLocal);
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao criar o plano de contas',
        error: error.message,
      });
    }
  }

  async updateAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountPlanValidator.validateFields())
    try {
      return response.created((await this.accountPlanService.update(data)).serialize());

    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao actualizar o plano de contas',
        error: error.message,
      });
    }
  }

  async findAllActiveAccountPlan({ request, response }: HttpContext) {
    return response.ok(await this.accountPlanService.findAllActive());
  }

  async findAllAccountPlan({ request, response }: HttpContext) {
    return response.ok(await this.accountPlanService.findAll());
  }
}