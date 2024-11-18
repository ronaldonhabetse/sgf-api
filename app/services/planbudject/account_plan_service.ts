import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanValidator from "../../validators/planbudject/accountPlanValidator.js";
import AccountPlanBalanceService from "./account_plan_entry_service.js";
import { AccountPlanEntryDTO, AccountPlanDTO } from "./utils/dtos.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { inject } from "@adonisjs/core";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/

@inject()
export default class AccountPlanService {

    constructor(
        private accountPlanEntryService: AccountPlanBalanceService
    ) { }

    public async update(data: AccountPlanDTO) {
        // Encontrar a conta existente pelo ID
        const found = await AccountPlan.findByOrFail('id', data.id);
        
        // Atualizar os campos necessários
        found.description = data.description;
        // Você pode adicionar mais campos para atualizar conforme necessário
        
        // Salvar a conta atualizada
        return await found.save();
    }

    public async remove(data: AccountPlanDTO) {
        // Encontrar a conta existente pelo ID
        const foundAccountPlan = await AccountPlan.findByOrFail('id', data.id);
    
        // Encontrar o registro em AccountPlanBudjectEntry associado à conta
        const foundAccountPlanEntry = await AccountPlanEntry.findByOrFail('accountPlanId', data.id);
    
        // Encontrar o registro em AccountPlanBudjectEntriesEntry associado ao BudjectEntry
        const foundAccountPlanEntriesEntry = await AccountPlanEntryEntry.findByOrFail('entryId', foundAccountPlanEntry.id);
    
        // Remover primeiro o AccountPlanBudjectEntriesEntry
        await foundAccountPlanEntriesEntry.delete();
        
        // Remover segundo o AccountPlanBudjectEntry
        await foundAccountPlanEntry.delete();
    
        // E por fim AccountPlan
        return await foundAccountPlan.delete();
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

            const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
           
            const entry: AccountPlanEntryDTO = {
                accountPlanNumber: createdAccountPlan.number,
                startPostingMonth: currentDate.getMonth(),
                endPostingMonth: 12,
                reservePercent: 0,
                initialAllocation: 0,
                finalAllocation: 0,
                accountPlanYearId: currentPlanYear.id,
                accountPlanId: createdAccountPlan.id,
                id: undefined,
                createtBy: undefined,
                updatedBy: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                parentId: undefined,
                parentAccountPlanNumber: data.parentAccountPlanNumber
            }
            await this.accountPlanEntryService.createAccountPlanEntry(entry, createdAccountPlan, trx)
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