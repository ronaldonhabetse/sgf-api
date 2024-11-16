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

  async initialAllocationAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.initialAllocationAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }

  async reinforceAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.reinforceAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar o reforço do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }

  async annulAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.annulAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a anulação do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }

  async redistribuitioReinforcimentAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());

    try {
      return response.created(await this.accountPlanBudjectService.redistribuitioReinforcimentAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao do reforço do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }

  async redistributeAnnulmentAccountPlanBudjectEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanBudjectEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());

    try {
      return response.created(await this.accountPlanBudjectService.redistributeAnnulmentAccountPlanBudjectEntry(data));
    } catch (error) {

      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao da anulação do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }

  


  async findAllAccountPlanBudject({response }: HttpContext) {
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

  async findAccountPlanBudjectEntriesEntryByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanBudjectEntriesEntry(year));
  }

  async fetchAccountPlanBudjectEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchAllAccountPlanBudjectEntries(year));
  }

  async fetchAccountPlanBudjectEntriesByYearAndNumber({ request, response }: HttpContext) {
    const year = request.param('year');
    const accountPlanNumber = request.param('accountPlanNumber');
    return response.ok(await this.accountPlanBudjectService.fetchAccountPlanBudjectEntriesByYearAndNumber(year, accountPlanNumber));
  }








}