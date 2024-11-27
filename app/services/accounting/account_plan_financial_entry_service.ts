import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import { inject } from "@adonisjs/core";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanEntryService from "../planbudject/account_plan_entry_service.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";

/*
* Servicos para o plano de contas financeiro
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanFinancialEntryService {

  constructor(
    private accountPlanEntryService: AccountPlanEntryService
  ) { }

  public async entryCrediteOrDebit(
    data: {
      accountPlanNumber: string, value: number, entryEntryType: EntryEntryType, operator: OperatorType, operationDate: Date
    }, trx: TransactionClientContract) {

    const currentDate = new Date();
    const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate())
    const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

    let entry = await this.accountPlanEntryService.
      findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.accountPlanNumber);

    if (!entry) {
      throw Error("Entrada do plano de conta não encontrado no sistema com a conta " + data.accountPlanNumber);
    }

    const isCredit = (data.operator == OperatorType.CREDTI) ? true : false;
    const entryfinalAllocation = isCredit ?
      entry.finalAllocation + data.value :
      entry.finalAllocation - data.value;

    if (entryfinalAllocation < 0) {
      throw Error(" Não pode efectuar a anulação, o valor da conta "
        + data.accountPlanNumber + " é insuficiente para anular " + data.value
        + ". O valor actual é " + entry.finalAllocation)
    }

    await new AccountPlanEntryEntry()
      .fill(
        {
          type: data.entryEntryType,
          operator: data.operator,
          postingMonth: currentDate.getMonth(),
          operationDate: operationDate,
          allocation: data.value,
          lastFinalAllocation: entry.finalAllocation,
          entryId: entry.id,
          accountPlanYearId: currentPlanYear.id,
        }).useTransaction(trx).save();

    entry.finalAllocation = entryfinalAllocation
    const updatedEntry = await entry.useTransaction(trx)
      .save();

    await this.accountPlanEntryService
      .updateParentsAccountPlanEntriesByChild(updatedEntry, data.value, isCredit, trx);
    return updatedEntry;
  }
}