import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import AccountPlanBudjectEntry from "../../models/planbudject/account_plan_budject_entry.js";
import AccountPlanBudjectEntryEntry from "../../models/planbudject/account_plan_budject_entry_entry.js";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanBudjectEntryValidator from "../../validators/planbudject/accountPlanBudjectEntryRuleValidator.js";
import { AccountPlanBudjectEntryDTO } from "./utils/dtos.js";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";

export default class AccountPlanBudjectEntryService {

    public async createAccountPlanBudjectEntry(data: AccountPlanBudjectEntryDTO, accountPlan: AccountPlan, trx: TransactionClientContract) {

        await AccountPlanBudjectEntryValidator.validateOnCreate(data);
        const currentDate = new Date();
        const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());
        const parentEntry = await AccountPlanBudjectEntry.findBy('accountPlanNumber', data.parentAccountPlanNumber);

        if (!parentEntry) {
            throw Error("Entrada do Plano de conta de controle não encontrado no sistema para a conta " + data.accountPlanNumber);
        }

        const createdEntry = await new AccountPlanBudjectEntry().fill({
            accountPlanNumber: data.accountPlanNumber,
            startPostingMonth: data.startPostingMonth,
            endPostingMonth: data.endPostingMonth,
            reservePercent: 0,
            initialAllocation: data.initialAllocation,
            finalAllocation: data.initialAllocation,
            accountPlanBudjectId: currentPlanbudject.id,
            accountPlanId: accountPlan.id,
            parentId: parentEntry.id,
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

        return createdCreditEntryEntry;
    }

    public async createAccountPlanBudjectEntryTest(data: AccountPlanBudjectEntryDTO) {

        await AccountPlanBudjectEntryValidator.validateOnCreate(data);

        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {
            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());
            const accountPlan = await AccountPlan.findByOrFail('number', data.accountPlanNumber);

            const createdEntry = await new AccountPlanBudjectEntry().fill({
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

            console.log(createdCreditEntryEntry);
            await trx.commit();
            return createdCreditEntryEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async initialAllocationAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {

        const entry = await AccountPlanBudjectEntry.findBy('accountPlanNumber', data.accountPlanNumber);

        if (entry && entry.finalAllocation !== 0) {
            throw Error("A dotacao inicial ja foi carregada para o plano de conta " + entry.finalAllocation);
        }

        return this.reinforceOrAnnulmentAccountPlanBudjectEntry(data, true, true);
    }

    public async reinforceAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
        return this.reinforceOrAnnulmentAccountPlanBudjectEntry(data, true, false);
    }

    public async annulAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
        return this.reinforceOrAnnulmentAccountPlanBudjectEntry(data, false, false);
    }

    public async redistribuitioReinforcimentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {

        return this.redistributeReinforeOrAnnulmentAccountPlanBudjectEntry(data, true);
    }

    public async redistributeAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanBudjectEntry(data, false);
    }

    private async reinforceOrAnnulmentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }, isReinforce: boolean, isInitialAlocation: boolean) {

        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {

            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());

            let entry = await this.findAccountPlanBudjectEntriesByYearAndNumber(currentDate.getFullYear(), data.accountPlanNumber);

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

            await new AccountPlanBudjectEntryEntry()
                .fill(
                    {
                        type: entryEntryType,
                        operator: entryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        allocation: data.value,
                        lastFinalAllocation: entry.finalAllocation,
                        entryId: entry.id,
                        accountPlanBudjectId: currentPlanbudject.id,
                    }).useTransaction(trx).save();

            entry.finalAllocation = entryfinalAllocation
            const updatedEntry = await entry.useTransaction(trx)
                .save();

            await this.updateParentsAccountPlanBudjectEntriesByChild(updatedEntry, data.value, isReinforce, trx);

            await trx.commit();
            return updatedEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    private async redistributeReinforeOrAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }, isRedistributeReinforcement: boolean) {

        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {

            if (data.originAccountPlanNumber === data.targetAccountPlanNumber) {
                throw Error("O Plano de conta origem deve ser difernte do plano de conta destino ");
            }
            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear());

            let originEntry = await this.findAccountPlanBudjectEntriesByYearAndNumber(currentDate.getFullYear(), data.originAccountPlanNumber);

            if (!originEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.originAccountPlanNumber);
            }

            let targetEntry = await this.findAccountPlanBudjectEntriesByYearAndNumber(currentDate.getFullYear(), data.targetAccountPlanNumber);

            if (!targetEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.targetAccountPlanNumber);
            }

            let originEntryEntryType, originEntryEntryOperator, originEntryfinalAllocation;
            let targetEntryEntryType, targetEntryEntryOperator, targetEntryfinalAllocation;

            if (isRedistributeReinforcement) {
                originEntryEntryType = EntryEntryType.REDISTRIBUTION_REINFORCEMENT;
                originEntryEntryOperator = OperatorType.CREDTI;
                originEntryfinalAllocation = originEntry.finalAllocation + data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUTION_ANNULMENT;
                targetEntryEntryOperator = OperatorType.DEBIT;
                targetEntryfinalAllocation = targetEntry.finalAllocation - data.value;

                if (targetEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a redistribuição do reforço para a conta " + data.originAccountPlanNumber + ", o valor da conta destino "
                        + data.targetAccountPlanNumber + " é insuficiente para anular " + data.value
                        + ". O valor actual é " + targetEntry.finalAllocation)
                }

            } else {
                originEntryEntryType = EntryEntryType.REDISTRIBUTION_ANNULMENT;
                originEntryEntryOperator = OperatorType.DEBIT;
                originEntryfinalAllocation = originEntry.finalAllocation - data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUTION_REINFORCEMENT;
                targetEntryEntryOperator = OperatorType.CREDTI;
                targetEntryfinalAllocation = targetEntry.finalAllocation + data.value;

                if (originEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a redistribuição da anulação para a conta " + data.originAccountPlanNumber + ", no valor de "
                        + data.value + ". O valor actual é " + originEntry.finalAllocation)
                }
            }

            const createdOriginEntryEntry = await new AccountPlanBudjectEntryEntry().fill
                (
                    {
                        type: originEntryEntryType,
                        operator: originEntryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        allocation: data.value,
                        lastFinalAllocation: originEntry.finalAllocation,
                        entryId: originEntry.id,
                        accountPlanBudjectId: currentPlanbudject.id,
                    }).useTransaction(trx).save();
            /**
            * The relationship will implicitly reference the
            * targetEntrieEntry from the OriginEntryEntry instance
            */
            const createdTargetEntryEntry = await createdOriginEntryEntry.related('targetEntrieEntry').create(
                {
                    type: targetEntryEntryType,
                    operator: targetEntryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    allocation: data.value,
                    lastFinalAllocation: originEntry.finalAllocation,
                    entryId: targetEntry.id,
                    accountPlanBudjectId: currentPlanbudject.id,
                    targetEntrieEntryId: createdOriginEntryEntry.id
                }
            )

            //Actualizamos o targetEntrieEntryId na entrada origem
            createdOriginEntryEntry.targetEntrieEntryId = createdTargetEntryEntry.id;
            await createdOriginEntryEntry.useTransaction(trx).save();

            originEntry.finalAllocation = originEntryfinalAllocation;
            targetEntry.finalAllocation = targetEntryfinalAllocation;
            const updatedOriginEntry = await originEntry
                .useTransaction(trx)
                .save();

            await targetEntry
                .useTransaction(trx)
                .save();

            await this.updateParentsAccountPlanBudjectEntriesByChild(updatedOriginEntry, data.value, isRedistributeReinforcement, trx);
            await this.updateParentsAccountPlanBudjectEntriesByChild(targetEntry, data.value, !isRedistributeReinforcement, trx);

            // Commit the transaction if everything is successful
            await trx.commit();
            return updatedOriginEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public async updateParentsAccountPlanBudjectEntriesByChild(child: AccountPlanBudjectEntry, value: number, isReinforce: boolean, trx: TransactionClientContract) {
        const parentId = child.parentId;
        if (parentId) {
            const parent = await AccountPlanBudjectEntry.query().where('id', child.parentId).first();
            if (parent) {
                parent.finalAllocation = isReinforce ? parent.finalAllocation + value : parent.finalAllocation - value;
                console.log(parent.finalAllocation);
                await parent.useTransaction(trx).save();
                await this.updateParentsAccountPlanBudjectEntriesByChild(parent, value, isReinforce, trx);
            } else return;
        }
    }

    public async findParentsAccountPlanBudjectEntriesByChild(child: AccountPlanBudjectEntry, parents: AccountPlanBudjectEntry[]) {
        const parentId = child.parentId;
        if (parentId) {
            const parent = await AccountPlanBudjectEntry.query().where('id', parentId).first();
            if (parent) {
                console.log('com parent', parent.accountPlanNumber)
                parents.fill(parent);
                await this.findParentsAccountPlanBudjectEntriesByChild(parent, parents)
            } else {
                console.log('sem parente')
                return
            };
        }
        return parents;
    }

    public async findAccountPlanBudjectEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
        return await AccountPlanBudjectEntry.query()
            .whereHas('accountPlanBudject', (accountPlanBudjectBuilder) => {
                accountPlanBudjectBuilder.where('year', year);
            }).whereHas('accountPlan', (accountPlanBuilder) => {
                accountPlanBuilder.where('number', accountPlanNumber);
            }).first()
    }
}