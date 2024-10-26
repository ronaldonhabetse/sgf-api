import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanValidator from "../../validators/planbudject/accountPlanValidator.js";
import AccountPlanBudjectEntryService from "./account_plan_budject_entry_service.js";
import { AccountPlanBudjectEntryDTO, AccountPlanDTO } from "./utils/dtos.js";
import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import { inject } from "@adonisjs/core";

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/

@inject()
export default class AccountPlanService {

    constructor(
        private accountPlanBudjectEntryService: AccountPlanBudjectEntryService
    ) { }

    public async update(data: AccountPlanDTO) {
        AccountPlanValidator.validateOnCreate(data);
        const found = await AccountPlan.findByOrFail('id', data.id);
        found.description = data.description;
        return await found.save();
    }

    public async create(data: AccountPlanDTO) {
        await AccountPlanValidator.validateOnCreate(data);
        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {
            const accountPlan = new AccountPlan();
            accountPlan.fill({ number: data.number, description: data.description, })
            accountPlan.setClass(data.class);
            accountPlan.setType(data.type);
            accountPlan.setWritable(data.writable);

            const createdAccountPlan = await accountPlan.useTransaction(trx).save();

            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());
            const entry: AccountPlanBudjectEntryDTO = {
                accountPlanNumber: createdAccountPlan.number,
                startPostingMonth: currentDate.getMonth(),
                endPostingMonth: 12,
                reservePercent: 0,
                initialAllocation: 0,
                finalAllocation: 0,
                accountPlanBudjectId: currentPlanbudject.id,
                accountPlanId: createdAccountPlan.id,
                id: undefined,
                createtBy: undefined,
                updatedBy: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                parentId: undefined,
                parentAccountPlanNumber: data.parentAccountPlanNumber
            }
            await this.accountPlanBudjectEntryService.createAccountPlanBudjectEntry(entry, createdAccountPlan, trx)
            await trx.commit();
            return createdAccountPlan;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    /**------------------------------------------------------------------------*/
    /** Servicos de pesquisa de informacao relativa ao plano de contas */
    /**------------------------------------------------------------------------*/
    public async findAny() {
        return await AccountPlan.all();
    }

    public async findAll() {
        return (await AccountPlan.query()
            .withScopes((scopes) => scopes.active()))
    }

    public async findById(id: number) {
        return await AccountPlan.findOrFail(id);
    }

    public async findByNumber(accountNumber: string) {
        return await AccountPlan.query().where("number", accountNumber)
            .withScopes((scopes) => scopes.active()).firstOrFail();
    }

    public async findAnyByNumber(accountNumber: string) {
        return await AccountPlan.findByOrFail("number", accountNumber);
    }
    /**------------------------------------------------------------------------*/
}