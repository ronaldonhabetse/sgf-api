import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanEntryValidator from "../../validators/planbudject/accountPlanEntryValidator.js";
import { AccountPlanEntryDTO as AccountPlanEntryDTO } from "./utils/dtos.js";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";

export default class AccountPlanEntryService {

    public async createAccountPlanEntry(data: AccountPlanEntryDTO, accountPlan: AccountPlan, trx: TransactionClientContract) {

        await AccountPlanEntryValidator.validateOnCreate(data);
        const currentDate = new Date();
        const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

        const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
        const parentEntry = await AccountPlanEntry.findBy('accountPlanNumber', data.parentAccountPlanNumber);

        if (!parentEntry) {
            throw Error("Entrada do Plano de conta de controle não encontrado no sistema para a conta " + data.accountPlanNumber);
        }

        const createdEntry = await new AccountPlanEntry().fill({
            accountPlanNumber: data.accountPlanNumber,
            startPostingMonth: data.startPostingMonth,
            endPostingMonth: data.endPostingMonth,
            reservePercent: 0,
            initialAllocation: data.initialAllocation,
            finalAllocation: data.initialAllocation,
            accountPlanYearId: currentPlanYear.id,
            accountPlanId: accountPlan.id,
            parentId: parentEntry.id,
        }).useTransaction(trx).save();

        const createdCreditEntryEntry = await new AccountPlanEntryEntry()
            .fill(
                {
                    type: EntryEntryType.INITIAL,
                    operator: OperatorType.CREDTI,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: data.initialAllocation,
                    lastFinalAllocation: 0,
                    entryId: createdEntry.id,
                    accountPlanYearId: currentPlanYear.id,
                }).useTransaction(trx).save();

        return createdCreditEntryEntry;
    }
    public async associateFinancialAccountWithBujectAccounts(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
        // Validar os dados de associação
        await AccountPlanEntryValidator.validateOnAssociate(data);

        // Buscar a conta financeira pelo número
        const foundAccountPlanFinancial = await AccountPlan.findByOrFail('number', data.accountPlanFinancialNumber);

        // Iniciar transação
        const trx = await db.transaction();

        try {
            // Loop para associar cada conta orçamentária
            for (const budjectAccount of data.accountPlanBujectsNumber) {
                // Garantir que o número do orçamento seja utilizado
                const budjectAccountPlan = await AccountPlan.findByOrFail('number', budjectAccount.accountPlanBujectNumber);

                // Verificar se a conta orçamentária já está associada a uma conta financeira
                const existingAssociation = await trx
                    .from('financial_budget_associations')
                    .where('budget_account_id', budjectAccountPlan.id)
                    .first();

                if (existingAssociation) {
                    throw new Error(`A conta orçamentária ${budjectAccount.accountPlanBujectNumber} já está associada a uma conta financeira.`);
                }

                // Registrar a associação na tabela 'financial_budget_associations' dentro da transação
                await trx
                    .table('financial_budget_associations')
                    .insert({
                        financial_account_id: foundAccountPlanFinancial.id,
                        budget_account_id: budjectAccountPlan.id,
                    });
            }

            // Commit da transação
            await trx.commit();
            return data;

        } catch (error) {
            // Reverter transação em caso de erro
            await trx.rollback();
            throw error;
        }
    }

    public async createAccountPlanEntryTest(data: AccountPlanEntryDTO) {

        await AccountPlanEntryValidator.validateOnCreate(data);

        const currentDate = new Date();
        const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        const trx = await db.transaction()  // Start transaction
        try {
            const currentPlanbudject = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
            const accountPlan = await AccountPlan.findByOrFail('number', data.accountPlanNumber);

            const createdEntry = await new AccountPlanEntry().fill({
                startPostingMonth: data.startPostingMonth,
                endPostingMonth: data.endPostingMonth,
                reservePercent: 0,
                initialAllocation: data.initialAllocation,
                finalAllocation: data.initialAllocation,
                accountPlanYearId: currentPlanbudject.id,
                accountPlanId: accountPlan.id
            }).useTransaction(trx).save();

            const createdCreditEntryEntry = await new AccountPlanEntryEntry()
                .fill(
                    {
                        type: EntryEntryType.INITIAL,
                        operator: OperatorType.CREDTI,
                        postingMonth: currentDate.getMonth(),
                        operationDate: operationDate,
                        allocation: data.initialAllocation,
                        lastFinalAllocation: 0,
                        entryId: createdEntry.id,
                        accountPlanYearId: currentPlanbudject.id,
                    }).useTransaction(trx).save();

            await trx.commit();
            return createdCreditEntryEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async initialAllocationAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {

        const entry = await AccountPlanEntry.findBy('accountPlanNumber', data.accountPlanNumber);

        if (entry && entry.finalAllocation !== 0) {
            throw Error("A dotacao inicial ja foi carregada para o plano de conta " + entry.finalAllocation);
        }

        return this.reinforceOrAnnulmentAccountPlanEntry(data, true, true);
    }

    public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, true, false);
    }

    public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, false, false);
    }

    public async redistribuitioReinforcimentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {

        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, true);
    }

    public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, false);
    }

    private async reinforceOrAnnulmentAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }, isReinforce: boolean, isInitialAlocation: boolean) {

        const currentDate = new Date();
        const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate())

        const trx = await db.transaction()  // Start transaction
        try {

            const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

            let entry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.accountPlanNumber);

            if (!entry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.accountPlanNumber);
            }

            let entryEntryType;
            let entryEntryOperator;
            let entryfinalAllocation;

            if (isReinforce) {
                entryEntryType = isInitialAlocation ? EntryEntryType.INITIAL_ALLOCATION : EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;
            } else {
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;

                if (entryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a anulação, o valor da conta "
                        + data.accountPlanNumber + " é insuficiente para anular " + data.value
                        + ". O valor actual é " + entry.finalAllocation)
                }
            }

            await new AccountPlanEntryEntry()
                .fill(
                    {
                        type: entryEntryType,
                        operator: entryEntryOperator,
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

            await this.updateParentsAccountPlanEntriesByChild(updatedEntry, data.value, isReinforce, trx);

            await trx.commit();
            return updatedEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    private async redistributeReinforeOrAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }, isRedistributeReinforcement: boolean) {

        const currentDate = new Date();
        const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate())
        const trx = await db.transaction()  // Start transaction
        try {

            if (data.originAccountPlanNumber === data.targetAccountPlanNumber) {
                throw Error("O Plano de conta origem deve ser difernte do plano de conta destino ");
            }
            const currentPlanbudject = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

            let originEntry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.originAccountPlanNumber);

            if (!originEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.originAccountPlanNumber);
            }

            let targetEntry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.targetAccountPlanNumber);

            if (!targetEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.targetAccountPlanNumber);
            }

            let originEntryEntryType, originEntryEntryOperator, originEntryfinalAllocation;
            let targetEntryEntryType, targetEntryEntryOperator, targetEntryfinalAllocation;

            if (isRedistributeReinforcement) {
                originEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                originEntryEntryOperator = OperatorType.CREDTI;
                originEntryfinalAllocation = originEntry.finalAllocation + data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                targetEntryEntryOperator = OperatorType.DEBIT;
                targetEntryfinalAllocation = targetEntry.finalAllocation - data.value;

                if (targetEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a redistribuição do reforço para a conta " + data.originAccountPlanNumber + ", o valor da conta destino "
                        + data.targetAccountPlanNumber + " é insuficiente para anular " + data.value
                        + ". O valor actual é " + targetEntry.finalAllocation)
                }

            } else {
                originEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                originEntryEntryOperator = OperatorType.DEBIT;
                originEntryfinalAllocation = originEntry.finalAllocation - data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                targetEntryEntryOperator = OperatorType.CREDTI;
                targetEntryfinalAllocation = targetEntry.finalAllocation + data.value;

                if (originEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a redistribuição da anulação para a conta " + data.originAccountPlanNumber + ", no valor de "
                        + data.value + ". O valor actual é " + originEntry.finalAllocation)
                }
            }

            const createdOriginEntryEntry = await new AccountPlanEntryEntry().fill
                (
                    {
                        type: originEntryEntryType,
                        operator: originEntryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        operationDate: operationDate,
                        allocation: data.value,
                        lastFinalAllocation: originEntry.finalAllocation,
                        entryId: originEntry.id,
                        accountPlanYearId: currentPlanbudject.id,
                    }).useTransaction(trx).save();
            /**
            * The relationship will implicitly reference the
            * targetEntrieEntry from the OriginEntryEntry instance
            */
            // Verifique se createdOriginEntryEntry foi salvo corretamente

            console.log("Criou com sucesso",createdOriginEntryEntry )
            if (!createdOriginEntryEntry.id) {
                throw new Error('The parent entry (createdOriginEntryEntry) must be saved before creating the related target entry.');
            }

            // Criação do target entry
            const createdTargetEntryEntry = await createdOriginEntryEntry.related('targetEntrieEntry').create({
                type: targetEntryEntryType,
                operator: targetEntryEntryOperator,
                postingMonth: currentDate.getMonth(), // Define o mês de lançamento
                operationDate: operationDate, // Data da operação
                allocation: data.value, // Valor alocado
                lastFinalAllocation: targetEntry.finalAllocation, // Última alocação final do registro de origem
                entryId: targetEntry.id, // ID de entrada do plano de contas de destino
                accountPlanYearId: currentPlanbudject.id, // ID do ano do plano de contas
                target_entrie_entry_id: createdOriginEntryEntry.id, // ID de origem para o relacionamento
            });
            


            console.log("Criou com sucesso createdTargetEntryEntry",createdTargetEntryEntry )

            //Actualizamos o targetEntrieEntryId na entrada origem
            createdOriginEntryEntry.target_entrie_entry_id = createdTargetEntryEntry.id;
            await createdOriginEntryEntry.useTransaction(trx).save();

            originEntry.finalAllocation = originEntryfinalAllocation;
            targetEntry.finalAllocation = targetEntryfinalAllocation;
            const updatedOriginEntry = await originEntry
                .useTransaction(trx)
                .save();

            await targetEntry
                .useTransaction(trx)
                .save();

            await this.updateParentsAccountPlanEntriesByChild(updatedOriginEntry, data.value, isRedistributeReinforcement, trx);
            await this.updateParentsAccountPlanEntriesByChild(targetEntry, data.value, !isRedistributeReinforcement, trx);

            // Commit the transaction if everything is successful
            await trx.commit();
            return updatedOriginEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public async updateParentsAccountPlanEntriesByChild(child: AccountPlanEntry, value: number, isCredit: boolean, trx: TransactionClientContract) {
        const parentId = child.parentId;
        if (parentId) {
            const parent = await AccountPlanEntry.query().where('id', child.parentId).first();
            if (parent) {
                parent.finalAllocation = isCredit ? parent.finalAllocation + value : parent.finalAllocation - value;
                await parent.useTransaction(trx).save();
                await this.updateParentsAccountPlanEntriesByChild(parent, value, isCredit, trx);
            } else return;
        }
    }

    public async findParentsAccountPlanEntriesByChild(child: AccountPlanEntry, parents: AccountPlanEntry[]) {
        const parentId = child.parentId;
        if (parentId) {
            const parent = await AccountPlanEntry.query().where('id', parentId).first();
            if (parent) {
                parents.fill(parent);
                await this.findParentsAccountPlanEntriesByChild(parent, parents)
            } else {
                return
            };
        }
        return parents;
    }


    public async findAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
        const entry = await AccountPlanEntry.query()
            .where('accountPlanNumber', accountPlanNumber)
            .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
                accountPlanBudjectBuilder.where('year', year);
            })
            .whereHas('accountPlan', (accountPlanBuilder) => {
                accountPlanBuilder.where('number', accountPlanNumber);
            })
            .first();

        // Carregar a relação 'accountPlan' explicitamente após a consulta
        if (entry) {
            await entry.load('accountPlan');

            // Acessar os atributos do accountPlan
            const accountPlan = entry.accountPlan;
            console.log(accountPlan.$attributes);
        }

        return entry;
    }


    // public async findAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
    //     return await AccountPlanEntry.query().where('accountPlanNumber', accountPlanNumber)
    //         .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
    //             accountPlanBudjectBuilder.where('year', year);
    //         }).whereHas('accountPlan', (accountPlanBuilder) => {
    //             accountPlanBuilder.where('number', accountPlanNumber);
    //         }).first()
    // }
}