import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import AccountPlanBudjectEntry from "../../models/planbudject/account_plan_budject_entry.js";
import AccountPlanBudjectEntryEntry from "../../models/planbudject/account_plan_budject_entry_entry.js";
import AccountPlanBudjectEntryService from "./account_plan_budject_entry_service.js";
import { AccountPlanBudjectDTO, AccountPlanBudjectEntryDTO } from "./utils/dtos.js";
import { inject } from "@adonisjs/core";

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanBudjectService {

  constructor(
    private accountPlanBudjectEntryService: AccountPlanBudjectEntryService
  ) { }

  public async createAccountPlanBudject(data: AccountPlanBudjectDTO) {
    const accountPlanBudject = new AccountPlanBudject();
    accountPlanBudject.fill({ year: data.year, description: data.description, })
    return await AccountPlanBudject.create(accountPlanBudject);
  }

  public async createAccountPlanBudjectEntry(data: AccountPlanBudjectEntryDTO) {
    return await this.accountPlanBudjectEntryService.createAccountPlanBudjectEntry(data);
  }

  public async reinforcimentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
    return this.accountPlanBudjectEntryService.reinforcimentAccountPlanBudjectEntry(data);
  }

  public async annulmentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
    return this.accountPlanBudjectEntryService.annulmentAccountPlanBudjectEntry(data);
  }

  public async redistribuitioReinforcimentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {
    return this.accountPlanBudjectEntryService.redistribuitioReinforcimentAccountPlanBudjectEntry(data);
  }

  public async redistribuitioAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {
    return this.accountPlanBudjectEntryService.redistribuitioAnnulmentAccountPlanBudjectEntry(data);
  }

  /**------------------------------------------------------------------------*/
  /** Servicos de pesquisa de informacao relativa ao plano de contas */
  /**------------------------------------------------------------------------*/
  public async findAllAccountPlanBudject() {
    return await AccountPlanBudject.all();
  }

  public async findAllAccountPlanBudjectByYear(year: number) {
    return await AccountPlanBudject.findByOrFail('year', year);
  }

  public async findAllAccountPlanBudjectEntriesEntry(year: number) {
    return await AccountPlanBudjectEntryEntry.query()
      .whereHas('accountPlanBudject', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlanBudject').preload('entry')
      .preload('targetEntrieEntry')
  }

  public async findAllAccountPlanBudjectEntries(year: number) {
    return await AccountPlanBudjectEntry.query()
      .whereHas('accountPlanBudject', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlan')
      .preload('accountPlanBudject')
  }

  public async fetchAllAccountPlanBudjectEntries(year: number) {
    return await AccountPlanBudjectEntry.query()
      .whereHas('accountPlanBudject', (builder) => {
        builder.where('year', year);
      })
      .preload('accountPlan')
      .preload('accountPlanBudject')
      .preload('entriesEntry')
  }
}