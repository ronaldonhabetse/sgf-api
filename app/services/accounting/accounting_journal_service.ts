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
import InternalRequest from "#models/request/internal_request";
import AccountPlanEntry from "#models/planbudject/account_plan_entry";

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
        return await this.createFinancialAccountingJournalWithInternalRequestExit(data);
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

            // const journalDocNumber = Number(data.journalDocumentNumber);
            // if (isNaN(journalDocNumber)) {
            //     throw new Error('journalDocumentNumber deve ser um número válido.');
            // }
            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                    // journalDocumentNumber: journalDocNumber,  // Adicionando o journalDocumentNumber
                }).useTransaction(trx).save();



                for (const itemData of data.items) {  
                    try {
                        // Verifica se o plano de contas existe
                        const financial = await AccountPlan.findBy('number', itemData.accountPlanNumber);
                        
                        if (!financial) {
                            throw new Error(`Plano de Contas com número ${itemData.accountPlanNumber} não encontrado.`);
                        }
                
                        // Criar entrada contábil
                        await new AccountingJournalEntryItems()
                            .fill({
                                operator: itemData.operator,
                                value: itemData.value,
                                description: itemData.description,
                                accountPlanNumber: itemData.accountPlanNumber,
                                accountPlanId: financial.id,
                                accountPlanYearId: currentPlanYear.id,
                                entryId: createdAccountingEntry.id,
                            })
                            .useTransaction(trx)
                            .save();
                
                    } catch (error) {
                        console.log("Erro ao processar item:", itemData, error.message);
                        await trx.rollback();
                        throw error;
                    }
                }
                
            console.log("879187298")

            await trx.commit();
            return createdAccountingEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async createFinancialAccountingJournalWithInternalRequestExit(data: AccountingJounalEntryDTO) {
        const trx = await db.transaction(); // Inicia a transação

        try {
            if (!data.tableDataBudject || !data.items || !data.internalRequestNumber) {
                throw new Error('Os campos tableDataBudject, items e internalRequestNumber são obrigatórios.');
            }

            // Processar os itens de orçamento
            for (const budgetItem of data.tableDataBudject) {
                if (budgetItem.debit === undefined) {
                    throw new Error(`O valor de debit para o item de orçamento ${budgetItem.account} não está definido.`);
                }

                const accountPlan = await AccountPlan.query()
                    .useTransaction(trx)
                    .where('number', budgetItem.account)
                    .firstOrFail();

                const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
                const newBalance = currentBalance - budgetItem.debit;

                await InternalRequest.query()
                .useTransaction(trx)
                .where('request_number', data.internalRequestNumber)
                .update({
                    paidReq: true,
                    is_parcial: data.is_parcial,
                    payment_type: data.payment_type,
                    remaining_balance: data.remaining_balance
                });

                await AccountPlanEntry.query()
                    .useTransaction(trx)
                    .where('account_plan_id', accountPlan.id)
                    .update({ available_allocation: newBalance });
            }

            // Processar os itens de lançamento
            for (const item of data.items) {
                const accountPlan = await AccountPlan.query()
                    .useTransaction(trx)
                    .where('number', item.accountPlanNumber)
                    .firstOrFail();

                const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
                const operation = item.operator === 'debit' ? -item.value : item.value;
                const newBalance = currentBalance + operation;

                // Atualizar a requisição interna
                await AccountPlanEntry.query()
                    .useTransaction(trx)
                    .where('account_plan_id', accountPlan.id)
                    .update({ available_allocation: newBalance });
            }

            

            await trx.commit(); // Confirma a transação
        } catch (error) {
            await trx.rollback(); // Reverte a transação em caso de erro
            throw error;
        }
    }


    // Função para obter o saldo atual da conta
    private async getAccountPlanBalance(accountPlanId: number): Promise<number> {
        const accountPlan = await db
            .from('account_plan_entries') // Usando a tabela de entradas do plano de contas
            .where('account_plan_id', accountPlanId)
            .select('available_allocation')
            .first();

        if (!accountPlan) {
            throw new Error(`Conta não encontrada com ID ${accountPlanId}`);
        }

        return accountPlan.available_allocation || 0; // Retorna o saldo disponível
    }

    // Função para atualizar o saldo da conta
    private async updateAccountPlanBalance(accountPlanId: number, newBalance: number, trx: any): Promise<void> {
        await trx('account_plan_entries') // Usando a transação para realizar a atualização
            .where('account_plan_id', accountPlanId)
            .update({ available_allocation: newBalance });
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
            // const journalDocNumber = Number(data.journalDocumentNumber);
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
            // console.log("journalDocNumber", journalDocNumber)

            // if (isNaN(journalDocNumber)) {
            //     throw new Error('journalDocumentNumber deve ser um número válido.');
            // }

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
                    // journalDocumentNumber: journalDocNumber, // Adicionando o journalDocumentNumber
                    is_receivable: receivable,
                    internalRequestId: internalRequestId,
                })
                .useTransaction(trx)
                .save();

            if (data.receivable === true) {
                    await trx
                        .query()
                        .from('internal_requests')
                        .where('request_number', internalRequest)
                        .update({ is_receivable: true });
            }
            // Verifica se `data.paid` é igual a 1 antes de atualizar o `internalRequest`
            if (data.paid === true) {
                await trx
                    .query()
                    .from('internal_requests')
                    .where('request_number', internalRequest)
                    .update({ paid: false });

                    console.log("Pagou aqui")
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
