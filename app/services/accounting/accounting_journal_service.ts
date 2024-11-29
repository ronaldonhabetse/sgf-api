import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { DateTime } from "luxon";
import { AccountingJounalEntryDTO } from "./utils/dtos.js";
import AccountingJournalEntryValidator from "../../validators/accounting/accountingJournalEntryValidator.js";
import AccountingJournalEntry from "../../models/accounting/accounting_journal_entry.js";
import AccountingJournal from "../../models/accounting/accounting_journal.js";
import AccountingDocument from "../../models/accounting/accounting_document.js";
import AccountingJournalEntryItems from "../../models/accounting/accounting_journal_entry_items.js";
import { inject } from "@adonisjs/core";
import AccountPlanFinancialEntryService from "./account_plan_financial_entry_service.js";
import { EntryEntryType } from "../../models/utility/Enums.js";
import db from "@adonisjs/lucid/services/db";

@inject()
export default class AccountingJournalService {

    constructor(
        private accountPlanFinancialEntryService: AccountPlanFinancialEntryService
    ) { }

    public async openAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.OPENING);
        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_OPENING);
    }

    public async billToPayAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.BILLS_TO_PAY);
        return await this.criateFinancialAccountingJournalWithInternalRequest(data, EntryEntryType.ENTRY_BILLS_TO_PAY);
    }

    public async billToReceiveAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.BILLS_TO_RECEIVE);
        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_BILLS_TO_RECEIVER);
    }

    public async bankInAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.BANK_IN);
        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_BANK_IN);
    }

    public async bankOutAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.BANK_OUT);
        return await this.criateFinancialAccountingJournalWithInternalRequest(data, EntryEntryType.ENTRY_BANK_OUT);
    }

    public async regulationAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.REGULARIZATION);
        return await this.criateFinancialAccountingJournalWithInternalRequest(data, EntryEntryType.ENTRY_REGULARIZATION);
    }

    public async criateFinancialAccountingJournalWithoutinternalRequest(data: AccountingJounalEntryDTO, entryEntryType: EntryEntryType) {
        const trx = await db.transaction();  // Start transaction

        try {
            const currentDate = new Date();
            const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);

            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                }).useTransaction(trx).save();

            for (const itemData of data.items) {  // Use for...of to await async operations
                try {
                    const financial = await AccountPlan.findByOrFail('number', itemData.accountPlanNumber);

                    await new AccountingJournalEntryItems()
                        .fill({
                            operator: itemData.operator,
                            value: itemData.value,
                            description: itemData.description,
                            accountPlanNumber: itemData.accountPlanNumber,
                            accountPlanId: financial.id,
                            accountPlanYearId: currentPlanYear.id,
                            entryId: createdAccountingEntry.id,
                        }).useTransaction(trx).save();

                    // Efectua os lançamentos e o cálculo dos saldos contabilísticos 
                    await this.accountPlanFinancialEntryService.entryCrediteOrDebit(
                        {
                            accountPlanNumber: itemData.accountPlanNumber,
                            value: itemData.value,
                            entryEntryType: entryEntryType,
                            operator: itemData.operator,
                            operationDate: currentDate
                        },
                        trx
                    );
                } catch (error) {
                    await trx.rollback();
                    throw error;
                }
            }

            await trx.commit();
            return createdAccountingEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public async criateFinancialAccountingJournalWithInternalRequest(data: AccountingJounalEntryDTO, entryEntryType: EntryEntryType) {
        const trx = await db.transaction();  // Start transaction
        try {
            const currentDate = new Date();
            const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);

            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                }).useTransaction(trx).save();

            for (const itemData of data.items) {  // Use for...of to await async operations
                try {
                    const accountPlan = await AccountPlan.findByOrFail('number', itemData.accountPlanNumber);
                    await new AccountingJournalEntryItems()
                        .fill({
                            operator: itemData.operator,
                            value: itemData.value,
                            description: itemData.description,
                            accountPlanNumber: itemData.accountPlanNumber,
                            accountPlanId: accountPlan.id,
                            accountPlanYearId: currentPlanYear.id,
                            entryId: createdAccountingEntry.id,
                        }).useTransaction(trx).save();

                    // Efectua os lançamentos e o cálculo dos saldos contabilísticos 
                    await this.accountPlanFinancialEntryService.entryCrediteOrDebit(
                        {
                            accountPlanNumber: itemData.accountPlanNumber,
                            value: itemData.value,
                            entryEntryType: entryEntryType,
                            operator: itemData.operator,
                            operationDate: currentDate
                        },
                        trx
                    );
                } catch (error) {
                    await trx.rollback();
                    throw error;
                }
            }

            await trx.commit();
            return createdAccountingEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public async fetchAllAccountingJournalEntry() {
        return await AccountingJournalEntry.query()
            .preload('internalRequest')
            .preload('accountPlanYear')
            .preload('accountingDocument')
            .preload('accountingJournal')
            .preload('entriesEntry')
            .first();
    }

    public async fetchAllAccountingJournal() {
        return await AccountingJournal.query()
            .preload('documents')
            .first();
    }

    public async fetchAllAccountingJournalByJournalNumber(journalNumber: string) {
        return await AccountingJournal.query().where('journalNumber', journalNumber)
            .preload('documents')
            .first();
    }
}
