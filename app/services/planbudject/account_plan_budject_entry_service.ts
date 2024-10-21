import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanBudject from "../../models/planbudject/account_plan_budject.js";
import AccountPlanBudjectEntry from "../../models/planbudject/account_plan_budject_entry.js";
import AccountPlanBudjectEntryEntry from "../../models/planbudject/account_plan_budject_entry_entry.js";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanBudjectEntryValidator from "../../validators/planbudject/accountPlanBudjectEntryRuleValidator.js";
import { AccountPlanBudjectEntryDTO } from "./utils/dtos.js";

export default class AccountPlanBudjectEntryService {

    public async createAccountPlanBudjectEntry(data: AccountPlanBudjectEntryDTO) {

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

    public async reinforcimentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
        return this.reinforcimentOrAnnulmentAccountPlanBudjectEntry(data, true);
    }

    public async annulmentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }) {
        return this.reinforcimentOrAnnulmentAccountPlanBudjectEntry(data, false);
    }

    public async redistribuitioReinforcimentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {

        return this.redistribuitioReinforcimentOrAnnulmentAccountPlanBudjectEntry(data, true);
    }

    public async redistribuitioAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }) {
        return this.redistribuitioReinforcimentOrAnnulmentAccountPlanBudjectEntry(data, false);
    }

    private async reinforcimentOrAnnulmentAccountPlanBudjectEntry(data: { accountPlanNumber: string, value: number }, isReiforciment: boolean) {

        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {
            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear);
            const accountPlan = await AccountPlan.findByOrFail('number', data.accountPlanNumber);

            const entry = await AccountPlanBudjectEntry.findOrFail({
                'accountPlanBudjectId': currentPlanbudject.id,
                'accountPlanId': accountPlan.id
            });

            let entryEntryType;
            let entryEntryOperator;
            let entryfinalAllocation;

            if (isReiforciment) {
                entryEntryType = EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;
            } else {
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;

                if (entryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a anulação, o valor da conta ${data.accountPlanNumber} é insuficiente para anular  ${data.value} ")
                }
            }

            const createdEntryEntry = await new AccountPlanBudjectEntryEntry()
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

            console.log(createdEntryEntry);

            const updatedEntry = await entry
                .fill({ finalAllocation: entryfinalAllocation })
                .useTransaction(trx)
                .save();

            await trx.commit();
            return updatedEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    private async redistribuitioReinforcimentOrAnnulmentAccountPlanBudjectEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string }, isReiforcimentRedistribuition: boolean) {

        const currentDate = new Date();
        const trx = await db.transaction()  // Start transaction
        try {
            const currentPlanbudject = await AccountPlanBudject.findByOrFail('year', currentDate.getFullYear);
            const originAccountPlan = await AccountPlan.findByOrFail('number', data.originAccountPlanNumber);
            const targetAccountPlan = await AccountPlan.findByOrFail('number', data.targetAccountPlanNumber);

            const originEntry = await AccountPlanBudjectEntry.findOrFail({
                'accountPlanBudjectId': currentPlanbudject.id,
                'accountPlanId': originAccountPlan.id
            });

            const targetEntry = await AccountPlanBudjectEntry.findOrFail({
                'accountPlanBudjectId': currentPlanbudject.id,
                'accountPlanId': targetAccountPlan.id
            });

            let originEntryEntryType, originEntryEntryOperator, originEntryfinalAllocation;
            let targetEntryEntryType, targetEntryEntryOperator, targetEntryfinalAllocation;

            if (isReiforcimentRedistribuition) {
                originEntryEntryType = EntryEntryType.REDISTRIBUTION_REINFORCEMENT;
                originEntryEntryOperator = OperatorType.CREDTI;
                originEntryfinalAllocation = originEntry.finalAllocation + data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUTION_ANNULMENT;
                targetEntryEntryOperator = OperatorType.DEBIT;
                targetEntryfinalAllocation = targetEntry.finalAllocation - data.value;

                if (targetEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar o reforço, o valor da conta ${data.targetAccountPlanNumber} é insuficiente para anular  ${data.value} ")
                }

            } else {
                originEntryEntryType = EntryEntryType.REDISTRIBUTION_ANNULMENT;
                originEntryEntryOperator = OperatorType.DEBIT;
                originEntryfinalAllocation = originEntry.finalAllocation - data.value;

                targetEntryEntryType = EntryEntryType.REDISTRIBUTION_REINFORCEMENT;
                targetEntryEntryOperator = OperatorType.CREDTI;
                targetEntryfinalAllocation = targetEntry.finalAllocation + data.value;

                if (originEntryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a redistribuição do reforço, o valor da conta ${data.originEntryfinalAllocation} é insuficiente para anular  ${data.value} ")
                }
            }

            const createdOriginEntryEntry = await new AccountPlanBudjectEntryEntry()
                .fill(
                    {
                        type: originEntryEntryType,
                        operator: originEntryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        allocation: data.value,
                        lastFinalAllocation: originEntry.finalAllocation,
                        entryId: originEntry.id,
                        accountPlanBudjectId: currentPlanbudject.id,
                    }).useTransaction(trx).save();

            const createdTargetEntryEntry = await new AccountPlanBudjectEntryEntry()
                .fill(
                    {
                        type: targetEntryEntryType,
                        operator: targetEntryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        allocation: data.value,
                        lastFinalAllocation: originEntry.finalAllocation,
                        entryId: targetEntry.id,
                        accountPlanBudjectId: currentPlanbudject.id,
                        targetEntrieEntryId: createdOriginEntryEntry.id,

                    }).useTransaction(trx).save();

            console.log(createdTargetEntryEntry);

            const updatedOriginEntry = await originEntry
                .fill({ finalAllocation: originEntryfinalAllocation })
                .useTransaction(trx)
                .save();

            const updatedTargetEntry = await targetEntry
                .fill({ finalAllocation: targetEntryfinalAllocation })
                .useTransaction(trx)
                .save();

            await trx.commit();
            return updatedOriginEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }



}