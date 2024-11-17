import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanBudjectEntry from "#models/planbudject/account_plan_budject_entry";
import AccountPlanBudjectEntryEntry from "#models/planbudject/account_plan_budject_entry_entry";
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
        // Encontrar a conta existente pelo ID
        const found = await AccountPlan.findByOrFail('id', data.id);
        
        // Atualizar os campos necessários
        found.description = data.description;
        // Você pode adicionar mais campos para atualizar conforme necessário
        
        // Salvar a conta atualizada
        return await found.save();
    }
    public async remove(data: AccountPlanDTO) {
        const trx = await db.transaction();  // Iniciar a transação

        try {
            // Encontrar a conta existente pelo ID
            const foundAccountPlan = await AccountPlan.findBy('id', data.id);
            if (!foundAccountPlan) {
                throw new Error('Plano de contas não encontrado.');
            }

            // Encontrar o registro em AccountPlanBudjectEntry associado à conta
            const foundAccountPlanBudjectEntry = await AccountPlanBudjectEntry.findBy('accountPlanId', data.id);
            if (!foundAccountPlanBudjectEntry) {
                throw new Error('Registro em AccountPlanBudjectEntry não encontrado.');
            }

            // Encontrar o registro em AccountPlanBudjectEntriesEntry associado ao BudjectEntry
            const foundAccountPlanBudjectEntriesEntry = await AccountPlanBudjectEntryEntry.findBy('entryId', foundAccountPlanBudjectEntry.id);
            if (!foundAccountPlanBudjectEntriesEntry) {
                throw new Error('Registro em AccountPlanBudjectEntriesEntry não encontrado.');
            }

            // Logs para depuração
            console.log('Found AccountPlan:', foundAccountPlan);
            console.log('Found AccountPlanBudjectEntry:', foundAccountPlanBudjectEntry);
            console.log('Found AccountPlanBudjectEntriesEntry:', foundAccountPlanBudjectEntriesEntry);

            // Remover os registros na ordem correta
            if (typeof foundAccountPlanBudjectEntriesEntry.delete === 'function') {
                await foundAccountPlanBudjectEntriesEntry.useTransaction(trx).delete();
            } else {
                console.warn('Não foi possível remover AccountPlanBudjectEntriesEntry, método delete não encontrado.');
            }

            if (typeof foundAccountPlanBudjectEntry.delete === 'function') {
                await foundAccountPlanBudjectEntry.useTransaction(trx).delete();
            } else {
                console.warn('Não foi possível remover AccountPlanBudjectEntry, método delete não encontrado.');
            }

            if (typeof foundAccountPlan.delete === 'function') {
                await foundAccountPlan.useTransaction(trx).delete();
            } else {
                console.warn('Não foi possível remover AccountPlan, método delete não encontrado.');
            }

            // Commit da transação se tudo correr bem
            await trx.commit();

            // Retorno do status de sucesso
            return { status: 200, code: 'SUCCESS' };
        } catch (error) {
            // Rollback da transação em caso de erro
            await trx.rollback();
            console.error('Erro ao remover o plano de contas:', error);
            return { status: 500, code: 'ERROR', message: error.message };
        }
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