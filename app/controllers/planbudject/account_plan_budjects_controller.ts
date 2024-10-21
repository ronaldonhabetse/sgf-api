// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from "@adonisjs/core/http";
import AccountPlanBudjectService from "../../services/planbudject/account_plan_budject_service.js";
import AccountPlanBudjectEntryValidator from "../../validators/planbudject/accountPlanBudjectEntryRuleValidator.js";
import AccountPlanBudjectValidator from "../../validators/planbudject/accountPlanBudjectValidator.js";
import { inject } from "@adonisjs/core";

@inject()
export default class AccountPlanBudjectsController {

  constructor(
    private accountPlanBudjectService: AccountPlanBudjectService
  ) { }

  public async createAccountPlanBudject({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectValidator.validateFields())

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanBudject(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano orçamento',
        error: error.message,
      });
    }
  }

  async createAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFields());

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }

  async findAllAccountPlanBudject({ request, response }: HttpContext) {
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanBudject());
  }

  async findAccountPlanBudjectByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAccountPlanBudjectByYear(year));
  }

  async findAccountPlanBudjectEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanBudjectEntries(year));
  }

  async fetchAccountPlanBudjectEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchAllAccountPlanBudjectEntries(year));
  }

 
  async findAccountPlanBudjectEntriesEntryByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanBudjectEntriesEntry(year));
  }


}