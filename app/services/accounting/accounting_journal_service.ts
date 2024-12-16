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

            const journalDocNumber = Number(data.journalDocumentNumber);
            if (isNaN(journalDocNumber)) {
                throw new Error('journalDocumentNumber deve ser um número válido.');
            }
            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                    journalDocumentNumber: journalDocNumber,  // Adicionando o journalDocumentNumber
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
                    // await this.accountPlanFinancialEntryService.entryCrediteOrDebit(
                    //     {
                    //         accountPlanNumber: itemData.accountPlanNumber,
                    //         value: itemData.value,
                    //         entryEntryType: entryEntryType,
                    //         operator: itemData.operator,
                    //         operationDate: currentDate
                    //     },
                    //     trx
                    // );
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
        const trx = await db.transaction(); // Inicia a transação
        try {
            const currentDate = new Date();
            const operationDate = DateTime.local(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1, // Meses são baseados em zero no JavaScript
                currentDate.getDate()
            );
            const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);
            const journalDocNumber = Number(data.journalDocumentNumber);
            const internalRequest = String(data.internalRequestNumber);
            const receivable = Boolean(data.receivable);
            const transactionType = String(data.transactionType);



            // Realiza a consulta SQL para obter o id da requisição interna
            const internalRequestIdQuery = await db
                .from('internal_requests')
                .where('request_number', internalRequest)
                .select('id')
                .first();  // .first() retorna apenas o primeiro resultado

            if (!internalRequestIdQuery) {
                throw new Error(`Nenhuma requisição encontrada com o número ${internalRequest}`);
            }

            const internalRequestId = internalRequestIdQuery.id; // Aqui você recebe o id da requisição
            console.log(`ID da requisição interna: ${internalRequestId}`);


            if (isNaN(journalDocNumber)) {
                throw new Error('journalDocumentNumber deve ser um número válido.');
            }

            // Se a transação for "BancosSaida", verifica se já existe um lançamento de contas a pagar
            if (transactionType === "BancosSaida") {
                const query = db
                    .from('accounting_journal_entries')
                    .where('internal_request_id', internalRequestId)
                    .where('is_receivable', true) // Verifica se é um lançamento de contas a PAGAR

                // Imprime a consulta no console antes de executá-la
                console.log('Consulta SQL:', query.toSQL().sql);

                const existingPayableEntry = await query.first();

                if (!existingPayableEntry) {
                    throw new Error('Não existe um lançamento de contas a pagar para esta Requisição.');
                }
            } else {
                // Para outros tipos de transação, verifica se já existe um lançamento
                const existingEntry = await db
                    .from('accounting_journal_entries')
                    .where('internal_request_id', internalRequestId)
                    .first();

                console.log("ashdksahkd", journal.id)
                if (existingEntry) {
                    throw new Error('Já existe um lançamento para esta Requisição.');
                }
            }

            // Criação do lançamento contábil
            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                    journalDocumentNumber: journalDocNumber, // Adicionando o journalDocumentNumber
                    is_receivable: receivable,
                    internalRequestId: internalRequestId,
                })
                .useTransaction(trx)
                .save();

            // Verifica se `data.paid` é igual a 1 antes de atualizar o `internalRequest`
            if (data.paid === true) {
                await trx
                    .query()
                    .from('internal_requests')
                    .where('request_number', internalRequest)
                    .update({ paid: true });
            }

            // Processando os itens associados
            for (const itemData of data.items) {
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
                        })
                        .useTransaction(trx)
                        .save();

                    // Efectua os lançamentos e o cálculo dos saldos contabilísticos
                    await this.accountPlanFinancialEntryService.entryCrediteOrDebit(
                        {
                            accountPlanNumber: itemData.accountPlanNumber,
                            value: itemData.value,
                            entryEntryType: entryEntryType,
                            operator: itemData.operator,
                            operationDate: currentDate,
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
    }

    public async fetchAllAccountingJournalEntryItems() {
        return await AccountingJournalEntryItems.query()
            .preload('accountPlanYear')      // Carrega a relação accountPlanYear
            .preload('accountPlan')          // Carrega a relação accountPlan
            .preload('entry', (entryQuery) => { // Carrega a relação entry com suas relações internas
                entryQuery
                    .preload('accountingJournal')  // Carrega a relação accountingJournal dentro de entry
                    .preload('accountingDocument') // Carrega a relação accountingDocument dentro de entry
                    .preload('internalRequest');   // Carrega a relação internalRequest dentro de entry, se existir
            })
            .exec();
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
