import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import AccountPlanYearValidator from "../../validators/planbudject/accountPlanYearValidator.js";
import AccountPlanEntryService from "./account_plan_entry_service.js";
import { AccountPlanYearDTO, AccountPlanEntryDTO } from "./utils/dtos.js";
import { inject } from "@adonisjs/core";

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanBudjectService {

  constructor(
    private accountPlanEntryService: AccountPlanEntryService
  ) { }

  public async createAccountPlanYear(data: AccountPlanYearDTO) {
    await AccountPlanYearValidator.validateOnCreate(data);
    const accountPlanYear = new AccountPlanYear();
    accountPlanYear.fill({ year: data.year, description: data.description, })
    return await AccountPlanYear.create(accountPlanYear);
  }

  public async createAccountPlanEntry(data: AccountPlanEntryDTO) {
    return await this.accountPlanEntryService.createAccountPlanEntryTest(data);
  }

  public async associateFinancialAccountWithBujectAccounts(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
    return await this.accountPlanEntryService.associateFinancialAccountWithBujectAccounts(data);

  }
  public async initialAllocationAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return await this.accountPlanEntryService.initialAllocationAccountPlanEntry(data);
  }

  public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanEntryService.reinforceAccountPlanEntry(data);
  }

  public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanEntryService.annulAccountPlanEntry(data);
  }

  public async redistribuitioReinforcimentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
    return this.accountPlanEntryService.redistribuitioReinforcimentAccountPlanEntry(data);
  }

  public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
    return this.accountPlanEntryService.redistributeAnnulmentAccountPlanEntry(data);
  }

  /**------------------------------------------------------------------------*/
  /** Servicos de pesquisa de informacao relativa ao plano de contas */
  /**------------------------------------------------------------------------*/
  public async findAllAccountPlanYear() {
    return await AccountPlanYear.all();
  }

  public async findAccountPlanYearByYear(year: number) {
    return await AccountPlanYear.findByOrFail('year', year);
  }

  public async findAllAccountPlanEntriesEntry(year: number) {
    return await AccountPlanEntryEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlanYear')
      .preload('entry')
      .preload('targetEntrieEntry')
  }

  public async findAllAccountPlanEntries(year: number) {
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('accountPlanfinancial')
  }

  public async fetchAllAccountPlanEntries(year: number) {
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('entriesEntry')
      .preload('accountPlanfinancial')
  }

  public async fetchAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: number) {
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', year);
      }).whereHas('accountPlan', (builder) => {
        builder.where('number', accountPlanNumber);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('accountPlanfinancial')
      .preload('entriesEntry')
  }
}