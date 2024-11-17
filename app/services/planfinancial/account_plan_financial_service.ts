import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import AccountPlanBudjectEntryEntry from "../../models/planbudject/account_plan_budject_entry_entry.js";
import { AccoutPlanType, EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import { FinancialEntryDTO } from "./utils/dtos.js";
import { inject } from "@adonisjs/core";
import AccountPlanFinancialEntry from "../../models/planfinancial/account_plan_financial_entry.js";

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanFinancialService {


  public async createInitialFinancialEntry(data: FinancialEntryDTO) {

    //await AccountPlanBudjectEntryValidator.validateOnCreate(data);

    const currentDate = new Date();
    const trx = await db.transaction()  // Start transaction
    try {
      const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());
      const accountPlan = await AccountPlan.findByOrFail(
        {
          'number': data.accountPlanNumber,
          'type': AccoutPlanType.FINANCIAL
        }
      );

      const createdEntry = await new AccountPlanFinancialEntry().fill({
        startPostingMonth: data.startPostingMonth,
        endPostingMonth: data.endPostingMonth,
        reservePercent: 0,
        initialAllocation: data.initialAllocation,
        finalAllocation: data.initialAllocation,
        accountPlanBudjectId: currentPlanbudject.id,
        accountPlanId: accountPlan.id
      }).useTransaction(trx).save();

      const createdCreditEntryEntry = await new AccountPlanBudjectEntryEntry()
        .fill(
          {
            type: EntryEntryType.INITIAL,
            operator: OperatorType.CREDTI,
            postingMonth: currentDate.getMonth(),
            allocation: data.initialAllocation,
            lastFinalAllocation: 0,
            entryId: createdEntry.id,
            accountPlanBudjectId: currentPlanbudject.id,
          }).useTransaction(trx).save();

      await trx.commit();
      return createdCreditEntryEntry;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}