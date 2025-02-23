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
import InternalRequest from "#models/request/internal_request";

export default class AccountPlanEntryService {

    public async createAccountPlanEntry(data: AccountPlanEntryDTO, accountPlan: AccountPlan, trx: TransactionClientContract) {

        await AccountPlanEntryValidator.validateOnCreate(data);
        const currentDate = new Date();

        const parsedDate = new Date(); // Converte string para Date
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }
        
        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Ajusta o mês
            parsedDate.getDate()
        );
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
    public async conformInitialAllocation(data: any) {
        const trx = await db.transaction(); // Inicia a transação para garantir a atomicidade

        console.log("Dados recebidos para atualização:", data);

        try {
            // Verificar se já existe conformidade para o 'type' específico
            const existingEntry = await AccountPlanEntryEntry
                .query()
                .where('type', 'initial_allocation')
                .andWhere('complianceStatus', 'CONFORMANCE')
                .first();


            if (existingEntry) {
                console.log("Tem dados já conformados", existingEntry);
                // Se já existe uma conformidade CONFORMANCE, lança um erro para interromper o processo
                throw new Error('A conformidade já está definida como CONFORMANCE. Não é necessário atualizar.');
            }
            // Preparar a consulta para a atualização
            const query = AccountPlanEntryEntry
                .query()
                .where('type', 'initial_allocation')  // Incluindo a cláusula WHERE
                .update({
                    complianceStatus: 'CONFORMANCE', // Alterando para 'CONFORMANCE'
                    descriptionCompliance: data.observation, // Usando o campo 'observation' como descrito
                    approvedBy: data.userId
                });

            // Obter a consulta gerada com knexQuery()
            const sql = query.knexQuery.toString();
            console.log("Consulta gerada para execução:", sql);

            // Executar a consulta
            const updatedEntries = await query;

            console.log("Número de entradas atualizadas:", updatedEntries);

            if (updatedEntries.length > 0) {  // Verifica se há registros atualizados
                // Comitar a transação
                await trx.commit();
                return { message: `Conformidade de alocação inicial foi atualizada com sucesso em ${updatedEntries} entradas.` };
            } else {
                // Não há registros atualizados
                await trx.rollback();
                return { message: 'Nenhuma entrada foi atualizada. Verifique os critérios da consulta.' };
            }
        } catch (error) {
            // Se algo falhar, reverte a transação
            await trx.rollback();
            console.error("Erro durante a atualização:", error);
            throw new Error(`Erro ao atualizar a conformidade de alocação inicial: ${error.message}`);
        }
    }

    public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, true, false);
    }

    public async annullmentRequestEntry(data: { accountPlanNumber: string, value: number, operationDate: Date, requestNumber: string }) {
        return this.annullmentRequestEntryPaid(data, true, false);
    }

    public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, false, false);
    }

    public async redistribuitioReinforcimentAccountPlanEntry(data: {
        destinationAccounts: {
            targetAccountPlanNumber: string,
            value: number
        }[],
        totalValue: number,
        type: string,
        motivo?: string,
        originAccountPlanNumber: string,
        operationDate: Date
    }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, true);
    }


    public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, false);
    }

    private async reinforceOrAnnulmentAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }, isReinforce: boolean, isInitialAlocation: boolean) {

        const currentDate = new Date();
        // const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate());
        const parsedDate = new Date(data.operationDate); // Converte string para Date
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }
        
        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Ajusta o mês
            parsedDate.getDate()
        );
        console.log("Data Local", operationDate)
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
            let availableAllocation;

            if (isReinforce) {
                entryEntryType = isInitialAlocation ? EntryEntryType.INITIAL_ALLOCATION : EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;

                const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05)
                const saldoAposReforco = entryfinalAllocation - (entryfinalAllocation * 0.05)
                const resultAddAvaliaveAllocation = saldoAposReforco - saldoExistente;

                const percent = entryfinalAllocation * 0.05;
                const availableAllocationNumber = Number(entry.availableAllocation);
                availableAllocation = availableAllocationNumber + resultAddAvaliaveAllocation


            } else {
                // Anulação
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;

                // Cálculo do saldo existente e novo saldo após a anulação
                const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05);
                const saldoAposAnulacao = entryfinalAllocation - (entryfinalAllocation * 0.05);
                const resultReduceAvailableAllocation = saldoExistente - saldoAposAnulacao;

                const availableAllocationNumber = Number(entry.availableAllocation);
                availableAllocation = availableAllocationNumber - resultReduceAvailableAllocation;

                console.log("entryfinalAllocation antes do cálculo:", entryfinalAllocation);
                console.log("saldoExistente", saldoExistente);
                console.log("saldoAposAnulacao:", saldoAposAnulacao);
                console.log("resultAddAvaliaveAllocation", resultReduceAvailableAllocation);
                console.log("availableAllocationNumber:", availableAllocationNumber);
                console.log("availableAllocation:", availableAllocation);

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
            entry.availableAllocation = availableAllocation

            console.log("dados", availableAllocation, entryfinalAllocation)
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


    private async annullmentRequestEntryPaid(data: { accountPlanNumber: string, value: number, operationDate: Date,  requestNumber: string }, isReinforce: boolean, isInitialAlocation: boolean) {

        const currentDate = new Date();
        // const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate());
        const parsedDate = new Date(data.operationDate); // Converte string para Date
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }
        
        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Ajusta o mês
            parsedDate.getDate()
        );
        console.log("Data Local", operationDate)
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
            let availableAllocation;

            if (isReinforce) {
                entryEntryType = isInitialAlocation ? EntryEntryType.INITIAL_ALLOCATION : EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;

                const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05)
                const saldoAposReforco = entryfinalAllocation - (entryfinalAllocation * 0.05)
                const resultAddAvaliaveAllocation = saldoAposReforco - saldoExistente;

                const percent = entryfinalAllocation * 0.05;
                const availableAllocationNumber = Number(entry.availableAllocation);
                availableAllocation = availableAllocationNumber + resultAddAvaliaveAllocation


            } else {
                // Anulação
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;

                // Cálculo do saldo existente e novo saldo após a anulação
                const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05);
                const saldoAposAnulacao = entryfinalAllocation - (entryfinalAllocation * 0.05);
                const resultReduceAvailableAllocation = saldoExistente - saldoAposAnulacao;

                const availableAllocationNumber = Number(entry.availableAllocation);
                availableAllocation = availableAllocationNumber - resultReduceAvailableAllocation;

                console.log("entryfinalAllocation antes do cálculo:", entryfinalAllocation);
                console.log("saldoExistente", saldoExistente);
                console.log("saldoAposAnulacao:", saldoAposAnulacao);
                console.log("resultAddAvaliaveAllocation", resultReduceAvailableAllocation);
                console.log("availableAllocationNumber:", availableAllocationNumber);
                console.log("availableAllocation:", availableAllocation);

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

                    if (!data.requestNumber) {
                        throw new Error('requestNumber não pode ser vazio');
                    }

                    const query = InternalRequest
                    .query()
                    .where('requestNumber', data.requestNumber) 
                    .update({
                        isAnnulled: true
                    });

                    // Obter a consulta gerada com knexQuery()
            const sql = query.knexQuery.toString();
            console.log("Consulta gerada para execução:", sql);

            // Executar a consulta
            const updatedEntries = await query;

            console.log("Número de entradas atualizadas:", updatedEntries);

            entry.finalAllocation = entryfinalAllocation
            entry.availableAllocation = availableAllocation

            console.log("dados", availableAllocation, entryfinalAllocation)
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


    

    public async redistributeReinforeOrAnnulmentAccountPlanEntry(data: {
        originAccountPlanNumber: string,
        value: number,
        destinationAccounts: {
            targetAccountPlanNumber: string,
            value: number
        }[],
        operationDate: Date,
        motivo: string
    }, isRedistributeReinforcement: boolean) {

        console.log("Data", data)
        if (!data.operationDate) {
            throw new Error("A data de operação é obrigatória e não pode ser nula ou indefinida.");
        }


        const currentDate = new Date();
        const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth() + 1, data.operationDate.getDate());
        const trx = await db.transaction();  // Start transaction

        try {
            if (!data.destinationAccounts || data.destinationAccounts.length === 0) {
                throw Error("Deve haver pelo menos uma conta de destino.");
            }

            const currentPlanbudject = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

            let originEntry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.originAccountPlanNumber);
            if (!originEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.originAccountPlanNumber);
            }

            // Verificar se todas as contas de destino existem
            for (const destination of data.destinationAccounts) {
                let targetEntry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), destination.targetAccountPlanNumber);
                if (!targetEntry) {
                    throw Error("Plano de conta não encontrado no sistema com a conta " + destination.targetAccountPlanNumber);
                }
            }
            for (const destination of data.destinationAccounts) {
                let originEntryEntryType, originEntryEntryOperator, originEntryfinalAllocation;
                let targetEntryEntryType, targetEntryEntryOperator;
                let targetEntryfinalAllocation: number;  // A variável deve ser inicializada adequadamente

                const valueToTransfer = destination.value;

                // Certifique-se de que targetEntry é carregado corretamente
                const targetEntry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), destination.targetAccountPlanNumber);
                if (!targetEntry) {
                    throw new Error("A conta de destino não foi encontrada para o número: " + destination.targetAccountPlanNumber);
                }

                if (isRedistributeReinforcement) {
                    // Para a origem
                    // Para a origem
                    originEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                    originEntryEntryOperator = OperatorType.DEBIT;  // A origem irá ser debitada
                    originEntryfinalAllocation = originEntry.finalAllocation - valueToTransfer;  // A origem anula o valor

                    const saldoOrigemExistente = Number(originEntry.finalAllocation) - (Number(originEntry.finalAllocation) * 0.05);
                    const saldoOrigemAposReforco = originEntryfinalAllocation - (originEntryfinalAllocation * 0.05);
                    const resultOrigemAvaliableAllocation = saldoOrigemAposReforco - saldoOrigemExistente;

                    const availableAllocationT = valueToTransfer * 0.05;
                    const availableAllocationVl = valueToTransfer - availableAllocationT;
                    const availableAllocationOrigemNumber = Number(originEntry.availableAllocation);
                    originEntry.availableAllocation = availableAllocationOrigemNumber - availableAllocationVl;  // Subtrai o valor da origem

                    console.log("passou daqui");
                    // Verifica se a conta origem tem saldo suficiente
                    if (originEntryfinalAllocation < 0) {
                        throw Error("Não pode efectuar a redistribuição para a conta " + data.originAccountPlanNumber + ", o valor atual é " + originEntry.finalAllocation);
                    }


                   
                    // Para o destino
                    targetEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                    targetEntryEntryOperator = OperatorType.CREDTI;  // A conta destino será creditada
                    targetEntryfinalAllocation = targetEntry.finalAllocation + valueToTransfer;  // A conta destino recebe o valor

                    const saldoDestinoExistente = Number(targetEntry.finalAllocation) - (Number(targetEntry.finalAllocation) * 0.05);
                    const saldoDestinoAposReforco = targetEntryfinalAllocation - (targetEntryfinalAllocation * 0.05);
                    const resultDestinoAvaliableAllocation = saldoDestinoAposReforco - saldoDestinoExistente;

                    const availableAllocationDestinoNumber = Number(targetEntry.availableAllocation);
                    targetEntry.availableAllocation = availableAllocationDestinoNumber + resultDestinoAvaliableAllocation;  // Aumenta o valor da conta destino



                    
                    // if (targetEntryfinalAllocation < 0) {
                    //     throw Error("Não pode efectuar a redistribuição do reforço para a conta " + data.originAccountPlanNumber + ", o valor da conta destino "
                    //         + destination.targetAccountPlanNumber + " é insuficiente para anular " + valueToTransfer
                    //         + ". O valor actual é " + targetEntry.finalAllocation);
                    // }
                } else {

                    console.log("entrou aqui")
                    // Para a origem
                    originEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                    originEntryEntryOperator = OperatorType.DEBIT;
                    originEntryfinalAllocation = originEntry.finalAllocation - valueToTransfer;

                    const saldoOrigemExistente = Number(originEntry.finalAllocation) - (Number(originEntry.finalAllocation) * 0.05);
                    const saldoOrigemAposAnulacao = originEntryfinalAllocation - (originEntryfinalAllocation * 0.05);
                    const resultOrigemAvaliableAllocation = saldoOrigemExistente - saldoOrigemAposAnulacao;

                    const availableAllocationOrigemNumber = Number(originEntry.availableAllocation);
                    originEntry.availableAllocation = availableAllocationOrigemNumber - resultOrigemAvaliableAllocation;

                    // Para o destino
                    targetEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                    targetEntryEntryOperator = OperatorType.CREDTI;
                    targetEntryfinalAllocation = targetEntry.finalAllocation + valueToTransfer; // Inicialize targetEntryfinalAllocation

                    const saldoDestinoExistente = Number(targetEntry.finalAllocation) - (Number(targetEntry.finalAllocation) * 0.05);
                    const saldoDestinoAposReforco = targetEntryfinalAllocation - (targetEntryfinalAllocation * 0.05);
                    const resultDestinoAvaliableAllocation = saldoDestinoAposReforco - saldoDestinoExistente;

                    const availableAllocationDestinoNumber = Number(targetEntry.availableAllocation);
                    targetEntry.availableAllocation = availableAllocationDestinoNumber + resultDestinoAvaliableAllocation;

                    if (originEntryfinalAllocation < 0) {
                        throw Error("Não pode efectuar a redistribuição da anulação para a conta " + data.originAccountPlanNumber + ", no valor de "
                            + valueToTransfer + ". O valor actual é " + originEntry.finalAllocation);
                    }
                }

                console.log("DADOS ENCVIADOS", data.operationDate);


                // Criação da entrada para origem e destino
                const createdOriginEntryEntry = await new AccountPlanEntryEntry().fill({
                    type: originEntryEntryType,
                    operator: originEntryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: valueToTransfer,
                    lastFinalAllocation: originEntry.finalAllocation,
                    entryId: originEntry.id,
                    accountPlanYearId: currentPlanbudject.id,
                    descriptionMoviment: data.motivo, // Adicionando motivo
                }).useTransaction(trx).save();

                const createdTargetEntryEntry = await createdOriginEntryEntry.related('targetEntrieEntry').create({
                    type: targetEntryEntryType,
                    operator: targetEntryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: valueToTransfer,
                    lastFinalAllocation: targetEntry.finalAllocation,
                    entryId: targetEntry.id,
                    accountPlanYearId: currentPlanbudject.id,
                    target_entrie_entry_id: createdOriginEntryEntry.id,
                    descriptionMoviment: data.motivo, // Adicionando motivo
                });

                // Atualizar os saldos finais e realizar o commit da transação
                originEntry.finalAllocation = originEntryfinalAllocation;
                targetEntry.finalAllocation = targetEntryfinalAllocation;

                await createdOriginEntryEntry.useTransaction(trx).save();
                await createdTargetEntryEntry.useTransaction(trx).save();

                await originEntry.useTransaction(trx).save();
                await targetEntry.useTransaction(trx).save();
                
                if(originEntry.id != targetEntry.id){
                    await this.updateParentsAccountPlanEntriesByChild(originEntry, valueToTransfer, false, trx); // Débito na origem
                    await this.updateParentsAccountPlanEntriesByChild(targetEntry, valueToTransfer, true, trx);  // Crédito no destino    
                    console.log("Actualizando as")
                }
          
                console.log("originEntry", originEntryfinalAllocation)
                console.log("targetEntryfinalAllocation", targetEntryfinalAllocation)
                console.log("originEntry", originEntry)
                console.log("targetEntry", targetEntry)

            }
            // Commit the transaction if everything is successful
            await trx.commit();
            return { status: 'success' };
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