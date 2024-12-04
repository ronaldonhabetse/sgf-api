// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from "@adonisjs/core/http";
import AccountPlanBudjectService from "../../services/planbudject/account_plan_budject_service.js";
import AccountPlanEntryValidator from "../../validators/planbudject/accountPlanEntryValidator.js";
import AccountPlanYearValidator from "../../validators/planbudject/accountPlanYearValidator.js";
import { inject } from "@adonisjs/core";

@inject()
export default class AccountPlanBudjectsController {

  constructor(
    private accountPlanBudjectService: AccountPlanBudjectService
  ) { }

  public async createAccountPlanYear({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanYearValidator.validateFields())

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanYear(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano orçamento',
        error: error.message,
      });
    }
  }

  public async associateFinancialAccountWithBujectAccounts({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsAssociateAccounts());

    try {
      return response.created(await this.accountPlanBudjectService.associateFinancialAccountWithBujectAccounts(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao associa o plano de conta orçamental e o plano financeiro',
        error: error.message,
      });
    }
  }

  public async createAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFields());

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }



  public async initialAllocationAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.initialAllocationAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }

  public async reinforceAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.reinforceAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar o reforço do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }

  public async annulAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.annulAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a anulação do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }

  public async redistribuitioReinforcimentAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());

    try {
      return response.created(await this.accountPlanBudjectService.redistribuitioReinforcimentAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao do reforço do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }

  public async redistributeAnnulmentAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());

    try {
      return response.created(await this.accountPlanBudjectService.redistributeAnnulmentAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao da anulação do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }

  public async findAllAccountPlanYear({ response }: HttpContext) {
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanYear());
  }

  public async findAccountPlanYearByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAccountPlanYearByYear(year));
  }

  public async findAccountPlanEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanEntries(year));
  }

  public async findAccountPlanEntriesEntryByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanEntriesEntry(year));
  }

  public async fetchAccountPlanEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchAllAccountPlanEntries(year));
  }

  public async fetchAccountPlanEntriesByYearAndNumber({ request, response }: HttpContext) {
    const year = request.param('year');
    const accountPlanNumber = request.param('accountPlanNumber');
    return response.ok(await this.accountPlanBudjectService.fetchAccountPlanEntriesByYearAndNumber(year, accountPlanNumber));
  }


public async fetchAllFinancialAccountsAndAssociations({ params, response }: HttpContext) {

  try {
    const financialAccountsWithAssociations =
      await this.accountPlanBudjectService.findAllFinancialAccountsAndAssociatedBudgets();
    return response.ok(financialAccountsWithAssociations);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: 'Erro ao buscar todas as associações de contas financeiras.',
      error: error.message,
    });
  }
}

  
  
}