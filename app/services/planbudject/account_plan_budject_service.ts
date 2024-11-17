import { DateTime } from "luxon";
import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import AccountPlanBudjectEntry from "../../models/planbudject/account_plan_budject_entry.js";
import AccountPlanBudjectEntryEntry from "../../models/planbudject/account_plan_budject_entry_entry.js";
import AccountPlanBudjectValidator from "../../validators/planbudject/accountPlanBudjectValidator.js";
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
    await AccountPlanBudjectValidator.validateOnCreate(data);
    const accountPlanBudject = new AccountPlanBudject();
    accountPlanBudject.fill({ year: data.year, description: data.description, })
    return await AccountPlanBudject.create(accountPlanBudject);
  }

  public async createAccountPlanBudjectEntry(data: AccountPlanBudjectEntryDTO) {
    return await this.accountPlanBudjectEntryService.createAccountPlanBudjectEntryTest(data);
  }

  public async initialAllocationAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return await this.accountPlanBudjectEntryService.initialAllocationAccountPlanBudjectEntry(data);
  }

  public async reinforceAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanBudjectEntryService.reinforceAccountPlanBudjectEntry(data);
  }

  public async annulAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanBudjectEntryService.annulAccountPlanBudjectEntry(data);
  }

  public async redistribuitioReinforcimentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
    return this.accountPlanBudjectEntryService.redistribuitioReinforcimentAccountPlanBudjectEntry(data);
  }

  public async redistributeAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
    return this.accountPlanBudjectEntryService.redistributeAnnulmentAccountPlanBudjectEntry(data);
  }

  /**------------------------------------------------------------------------*/
  /** Servicos de pesquisa de informacao relativa ao plano de contas */
  /**------------------------------------------------------------------------*/
  public async findAllAccountPlanBudject() {
    return await AccountPlanBudject.all();
  }

  public async findAccountPlanBudjectByYear(year: number) {
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

  public async fetchAccountPlanBudjectEntriesByYearAndNumber(year: number, accountPlanNumber: number) {
    return await AccountPlanBudjectEntry.query()
      .whereHas('accountPlanBudject', (builder) => {
        builder.where('year', year);
      }).whereHas('accountPlan', (builder) => {
        builder.where('number', accountPlanNumber);
      })
      .preload('accountPlan')
      .preload('accountPlanBudject')
      .preload('entriesEntry')
  }
}