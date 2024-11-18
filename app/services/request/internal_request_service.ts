import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { AccoutPlanType } from "../../models/utility/Enums.js";
import { inject } from "@adonisjs/core";
import { InternalRequestDTO } from "./utils/dtos.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import InternalRequest from "../../models/request/internal_request.js";
import { DateTime } from "luxon";
import Provider from "../../models/person/provider.js";
import InternalRequestItem from "../../models/request/internal_request_item.js";

/*
* Servicos para requisicoes internas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class InternalRequestService {

  public async generateNextRequestNumber(accountPlanYear: AccountPlanYear) {

    const sequenceArry = await InternalRequest.query().select("sequence")
      .max("sequence")
      .where('accountPlanYearId', accountPlanYear.id);

    const sequence = sequenceArry[0];

    const nextSequence = !sequence ? 1 : sequenceArry[0].sequence + 1;

    return nextSequence;
  }
  public async createInternalRequest(data: InternalRequestDTO) {

    const currentDate = new Date();
    const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate())

    const trx = await db.transaction()  // Start transaction
    try {
      const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

      const provider = await Provider.findByOrFail('accountPlanFinancialNumber', data.provideCode);

      const accountPlanBudject = await AccountPlan.findByOrFail(
        {
          'number': data.accountPlanBudjectNumber,
          'type': AccoutPlanType.BUDJECT
        }
      );

      //Saldo da conta orcamental
      const accountPlanBudjectEntry = await AccountPlanEntry.findByOrFail({
        'accountPlanNumber': data.accountPlanBudjectNumber,
      })

      const accountPlanFinancial = await AccountPlan.findByOrFail(
        {
          'number': data.accountPlanFinancialNumber,
          'type': AccoutPlanType.FINANCIAL
        }
      );

      const nextSequence = await this.generateNextRequestNumber(currentPlanYear);

      const createdInternalRequest = await new InternalRequest().fill({
        sequence: nextSequence,
        requestNumber: nextSequence + "" + currentDate.getFullYear(),
        requestorName: data.requestorName,
        requestorDepartment: data.requestorDepartment,
        operationDate: operationDate,
        initialAvailabilityAccountBuject: accountPlanBudjectEntry.finalAllocation,
        currentAccountBudjectBalance: accountPlanBudjectEntry.finalAllocation,
        finalAccountBujectBalance: (accountPlanBudjectEntry.finalAllocation - (data.totalRequestedValue ? data.totalRequestedValue : 0)),
        totalRequestedValue: data.totalRequestedValue,
        justification: data.justification,
        sectorBudject: data.sectorBudject,
        chapterBudject: data.chapterBudject,
        clauseBudject: data.clauseBudject,
        clauseNumberBudject: data.clauseNumberBudject,
        accountPlanYearId: currentPlanYear.id,
        provideId: provider.id,
        accountPlanBudjectId: accountPlanBudject.id,
        accountPlanFinancialId: accountPlanFinancial.id,
      }).useTransaction(trx).save();

      let createdItems = [];

      data.items.forEach(async (itemData) => {
        const item = await new InternalRequestItem()
          .fill(
            {
              quantification: itemData.quantification,
              quantity: itemData.quantity,
              description: itemData.description,
              operationDate: operationDate,
              unitPrice: itemData.unitPrice,
              internalRequestId: createdInternalRequest.id,

            }).useTransaction(trx).save();

        createdItems.push(item);
        createdInternalRequest.items.push(item);
      });

      await trx.commit();
      return createdInternalRequest;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async findAll() {
    return (await InternalRequest.query()
      .withScopes((scopes) => scopes.active()))
  }

  public async findById(id: number) {
    return await InternalRequest.findOrFail(id);
  }

  public async findByRequestNumber(requestNumber: string) {
    return await InternalRequest.query().where("requestNumber", requestNumber)
      .withScopes((scopes) => scopes.active()).firstOrFail();
  }
}