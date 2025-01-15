import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { AccoutPlanType } from "../../models/utility/Enums.js";
import { inject } from "@adonisjs/core";
import { InternalRequestDTO } from "./utils/dtos.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import InternalRequest from "../../models/request/internal_request.js";
import { DateTime } from "luxon";
import Provider from "../../models/person/provider.js";
import InternalRequestItem from "../../models/request/internal_request_item.js";
import InternalRequestValidator from "../../validators/request/internalRequestValidator.js";

/*
* Servicos para requisicoes internas
* Gautchi R. Chambe (chambegautchi@gmail.com)
* Cipriano P. Sagene (ciprianosagene@gmail.com)
*/
@inject()
export default class InternalRequestService {

  public async generateNextRequestNumber(accountPlanYear: AccountPlanYear) {
    const sequenceArry = await InternalRequest.query()
      .where('accountPlanYearId', accountPlanYear.id);
    const nextSequence = sequenceArry.length + 1;
    return nextSequence;
  }

  public async createInternalRequest(data: InternalRequestDTO) {
    // Validação do campo 'bank' e outros já ocorre no validador
    await InternalRequestValidator.validateOnCreate(data);

    // Validação adicional para itens
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("A lista de itens está vazia ou mal formatada.");
    }

    let totalItemsValue = 0;

    // Cálculo do valor total dos itens com validação
    for (const itemData of data.items) {
      if (!itemData.quantity || !itemData.unitPrice) {
        throw new Error(`Item inválido: ${JSON.stringify(itemData)}`);
      }
      const itemValue = itemData.quantity * itemData.unitPrice;
      totalItemsValue += itemValue;
    }

    const currentDate = new Date();
    const parsedDate = new Date(data.operationDate); // Converte string para Date
    if (isNaN(parsedDate.getTime())) {
        throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
    }
    
    const operationDate = DateTime.local(
        parsedDate.getFullYear(),
        parsedDate.getMonth() + 1, // Ajusta o mês
        parsedDate.getDate()
    );

    // Início da transação
    const trx = await db.transaction();
    try {
      // Busca o plano de conta do ano corrente
      const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

      // Busca o fornecedor com base no código
      const provider = await Provider.findByOrFail('accountPlanFinancialNumber', data.provideCode);

      // Tenta buscar o accountPlanFinancialNumber, caso seja `null` ou não encontrado, trata a exceção
      let accountPlanFinancial: { id: number } | undefined = undefined;
      try {
        accountPlanFinancial = await AccountPlan.findByOrFail({
          number: data.accountPlanFinancialNumber,
          type: AccoutPlanType.FINANCIAL,
        });
      } catch (error) {
        // Trate o erro se necessário, ex.: logar, lançar exceção customizada ou definir valor padrão
        console.warn(
          'Account Plan Financial Number não encontrado ou é undefined:',
          data.accountPlanFinancialNumber
        );
      }

      // Geração do número de sequência da requisição
      const nextSequence = await this.generateNextRequestNumber(currentPlanYear);

      const paid = data.paid ?? 0;

      // Criação da requisição interna
      // const currentDate = new Date();
      const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Ajusta e formata o mês
      const formattedYear = currentDate.getFullYear();
      
      const createdInternalRequest = await new InternalRequest()
        .fill({
          sequence: nextSequence,
          requestNumber: `${nextSequence}-${formattedMonth}${formattedYear}`, // Formatação correta do mês e ano
          requestorName: data.requestorName,
          requestorDepartment: data.requestorDepartment,
          operationDate: operationDate,
          totalRequestedValue: totalItemsValue,
          justification: data.justification,
          sectorBudject: data.sectorBudject,
          chapterBudject: data.chapterBudject,
          clauseBudject: data.clauseBudject,
          clauseNumberBudject: data.clauseNumberBudject,
          accountPlanYearId: currentPlanYear.id,
          accountPlanFinancialId: accountPlanFinancial?.id, // Usa undefined se não encontrado
          providerId: provider.id,
          bankValue: data.bank,
          paid: paid,
          documentNumber: data.documentNumber,
          document: data.document,
          transactionType: data.transactionType,
        })
        .useTransaction(trx)
        .save();
      
      console.log("Número de requisição gerado:", createdInternalRequest.requestNumber);
      

      // Processamento dos itens da requisição
      for (const itemData of data.items) {
        console.log("Iniciando processamento do item");

        // Busca o plano de orçamento correspondente
        const accountPlanBudject = await AccountPlan.findByOrFail({
          number: itemData.orcamento,
          type: AccoutPlanType.BUDJECT,
        });

        console.log("Plano de orçamento encontrado:", accountPlanBudject);

        // Definir beneficiaryName como undefined caso não exista ou ocorra um erro na busca
        let beneficiaryName: { id: number } | undefined = undefined;

        if (itemData.beneficiaryName) {
          try {
            beneficiaryName = await AccountPlan.findByOrFail({
              number: itemData.beneficiaryName,
              type: AccoutPlanType.FINANCIAL,
            });
            console.log("Beneficiário encontrado:", beneficiaryName);
          } catch (error) {
            console.warn(
              "Erro ao buscar beneficiário. Continuando o processo sem beneficiário.",
              error.message
            );
          }
        }

        // Busca a entrada do plano de orçamento
        let entry = await this.findAccountPlanEntriesByYearAndNumber(
          currentDate.getFullYear(),
          itemData.orcamento
        );

        if (!entry) {
          throw new Error(
            `Plano de conta com id informado não encontrado no sistema. Id: ${itemData.orcamento}`
          );
        }

        let financiamentoView: { id: number } | undefined = undefined;

        if (itemData.financiamentoView) {
          try {
            financiamentoView = await AccountPlan.findByOrFail({
              number: itemData.financiamentoView,
              type: AccoutPlanType.FINANCIAL,
            });
            console.log("Beneficiário encontrado:", financiamentoView);
          } catch (error) {
            console.warn(
              "Erro ao buscar beneficiário. Continuando o processo sem beneficiário.",
              error.message
            );
          }
        }

        console.log("LOSASLKS:", financiamentoView);

        // Criação do item da requisição interna
        await new InternalRequestItem()
          .fill({
            quantification: itemData.quantification,
            quantity: itemData.quantity,
            description: itemData.description,
            operationDate: operationDate,
            unitPrice: itemData.unitPrice,
            internalRequestId: createdInternalRequest.id,
            accountPlanBudjectId: accountPlanBudject.id,
            totalAmount: itemData.importancia,
            beneficiaryNameId: beneficiaryName ? beneficiaryName.id : undefined, // Definido como undefined se não encontrado
            accountPlanFinancialAssociationId: financiamentoView ? financiamentoView.id : undefined
          })
          .useTransaction(trx)
          .save();

        console.log("Item da requisição interna criado com sucesso");

        // Atualização da alocação disponível
        const round = totalItemsValue / 2.5;
        const availableAllocation = entry.availableAllocation - round;

        entry.availableAllocation = availableAllocation;

        console.log("round", round);
        console.log("availableAllocation", availableAllocation);



        // Salvando a entrada atualizada
        await entry.useTransaction(trx).save();

        console.log("Entrada do plano de orçamento atualizada:", entry);
      }


      // Commit da transação após processar todos os itens
      await trx.commit();

      return createdInternalRequest;
    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback();
      throw error;
    }
  }


  // public async createInternalRequest(data: InternalRequestDTO) {

  //   // Validação do campo 'bank' já ocorre no validador
  //   await InternalRequestValidator.validateOnCreate(data);

  //   let totalItemsValue = 0;
  //   // Corrigir o cálculo de totalItemsValue para garantir que a função assíncrona aguarde
  //   for (const itemData of data.items) {
  //     const itemValue = itemData.quantity * itemData.unitPrice;
  //     totalItemsValue += itemValue;
  //   }

  //   const currentDate = new Date();
  //   const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate());
  //   console.log("Chegou11133333 ")

  //   let entry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.accountPlanBudjectNumber);

  //   if (!entry) {
  //     throw Error("Plano de conta com id informado não encontrado no sistema Id: " + data.accountPlanBudjectNumber);
  //   }
  //       console.log("Chegou111 ")


  //   const trx = await db.transaction(); // Start transaction
  //   try {
  //     const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

  //     const provider = await Provider.findByOrFail('accountPlanFinancialNumber', data.provideCode);

  //     // const accountPlanBudject = await AccountPlan.findByOrFail(
  //     //   {
  //     //     'number': data.accountPlanBudjectNumber,
  //     //     'type': AccoutPlanType.BUDJECT
  //     //   }
  //     // );

  //     // Saldo da conta orcamental
  //     const accountPlanBudjectEntry = await AccountPlanEntry.findByOrFail({
  //       'accountPlanNumber': data.accountPlanBudjectNumber,
  //     });

  //     const accountPlanFinancial = await AccountPlan.findByOrFail(
  //       {
  //         'number': data.accountPlanFinancialNumber,
  //         'type': AccoutPlanType.FINANCIAL
  //       }
  //     );
  //     console.log("Chegou ", data.accountPlanFinancialAssociation)

  //     // const accountPlanFinancialAssociation = await AccountPlan.findByOrFail(
  //     //   {
  //     //     'number': data.accountPlanFinancialAssociation,
  //     //     'type': AccoutPlanType.FINANCIAL
  //     //   });


  //     console.log("Chegou111 ")

  //     const nextSequence = await this.generateNextRequestNumber(currentPlanYear);
  //     const paid = data.paid ?? 0;
  //     const createdInternalRequest = await new InternalRequest().fill({
  //       sequence: nextSequence,
  //       requestNumber: `${nextSequence}-${currentDate.getMonth()}${currentDate.getFullYear()}`,
  //       requestorName: data.requestorName,
  //       requestorDepartment: data.requestorDepartment,
  //       operationDate: operationDate,
  //       initialAvailabilityAccountBuject: accountPlanBudjectEntry.finalAllocation,
  //       currentAccountBudjectBalance: accountPlanBudjectEntry.finalAllocation,
  //       finalAccountBujectBalance: (accountPlanBudjectEntry.finalAllocation - (data.totalRequestedValue || 0)),
  //       totalRequestedValue: totalItemsValue,
  //       justification: data.justification,
  //       sectorBudject: data.sectorBudject,
  //       chapterBudject: data.chapterBudject,
  //       clauseBudject: data.clauseBudject,
  //       clauseNumberBudject: data.clauseNumberBudject,
  //       accountPlanYearId: currentPlanYear.id,
  //       providerId: provider.id,
  //       // accountPlanBudjectId: accountPlanBudject.id,
  //       accountPlanFinancialId: accountPlanFinancial.id,
  //       // accountPlanFinancialAssociationId: accountPlanFinancialAssociation.id,
  //       // Novo campo 'bank' sendo salvo
  //       bankValue: data.bank,  // Inclui o banco na requisição
  //       paid: paid
  //     }).useTransaction(trx).save();

  //     // Substituir o forEach por for...of para garantir que o item seja processado de forma assíncrona
  //     for (const itemData of data.items) {
  //       const accountPlanBudject = await AccountPlan.findByOrFail(
  //         {
  //           'number': itemData.orcamento,
  //           'type': AccoutPlanType.BUDJECT
  //         });
  //       try {
  //         await new InternalRequestItem().fill({
  //           quantification: itemData.quantification,
  //           quantity: itemData.quantity,
  //           description: itemData.description,
  //           operationDate: operationDate,
  //           unitPrice: itemData.unitPrice,
  //           internalRequestId: createdInternalRequest.id,
  //           accountPlanBudjectId: accountPlanBudject.id,

  //         }).useTransaction(trx).save();

  //         const round = (totalItemsValue / 2.5);

  //         let availableAllocation =
  //           (entry.availableAllocation - round);

  //         console.log(availableAllocation, entry.availableAllocation, round);

  //         // Atualiza o `availableAllocation` no entry
  //         entry.availableAllocation = availableAllocation;

  //         // Salva a entrada com a transação
  //         const updatedEntry = await entry.useTransaction(trx).save();

  //         await trx.commit();
  //         return updatedEntry;
  //       } catch (error) {
  //         await trx.rollback();
  //         throw error;
  //       }
  //     }

  //     await trx.commit();
  //     return createdInternalRequest;

  //   } catch (error) {
  //     await trx.rollback();
  //     throw error;
  //   }
  // }



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

  // public async findAll() {
  //   return (await InternalRequest.query()
  //     .withScopes((scopes) => scopes.active()))
  // }

  public async updateStatus(
    requestNumber: string,
    conformanceStatus: boolean,
    justification?: string // Justificativa opcional
  ) {
    const internalRequest = await InternalRequest.findByOrFail('requestNumber', requestNumber);

    // Mapeamento dos valores booleanos para os estados esperados
    const statusMapping: Record<string, "CONFORMED" | "WITHOUT_CONFORMANCE"> = {
      true: "CONFORMED",
      false: "WITHOUT_CONFORMANCE",
    };

    // Atualize o status de conformidade
    internalRequest.conformance = statusMapping[String(conformanceStatus)];

    // Atualize a justificativa se fornecida
    if (justification !== undefined) {
      internalRequest.justification = justification;
    }

    await internalRequest.save();

    return internalRequest;
  }



  public async findAll() {
    return await InternalRequest.query()
      .preload('accountPlanBudject') // Preload do orçamento
      .preload('accountPlanFinancial') // Preload financeiro
      .preload('items') // Preload dos itens relacionados
      .orderBy('operationDate', 'desc') // Exemplo: Ordenação por data
  }


  public async feacthAll() {
    return await InternalRequest.query()
      .preload('accountPlanBudject') // Preload do orçamento
      .preload('accountPlanFinancial') // Preload financeiro
      .preload('items') // Preload dos itens relacionados
      .leftJoin('account_plans', 'account_plan.id', 'internal_requests.account_plan_id') // Junção à esquerda com o plano de contas
      .orderBy('operationDate', 'desc') // Ordenação por data
  }


  public async fetchAll() {
    const result = await InternalRequestItem.query()
      .preload('beneficiaryName')
      .preload('accountPlanFinancialAssociation')
      .preload('accountPlanBudject') // Carrega a relação
      .preload('internalRequest', (internalRequestQuery) => {
        internalRequestQuery
          .select([
            'id',
            'sequence',
            'request_number',
            'requestor_name',
            'requestor_department',
            'operation_date',
            'paid',
            'conformance',
            'total_requested_value',
            'bank_Value', // Inclua explicitamente o campo desejado
            'account_plan_budject_id',
            'account_plan_financial_id',
            'account_plan_financial_association_id',
            'transaction_type',
            'document'
          ])
          .preload('accountPlanFinancial') // Carrega a relação
          .preload('accountPlanFinancialAssociation')
      });

    console.log(
      result.map((item) => ({
        internalRequestId: item.internalRequestId,
        bankValue: item.internalRequest?.bankValue,
      }))
    ); // Debug para garantir que 'bankValue' está presente

    return result;
  }




  public async findById(id: number) {
    return await InternalRequest.findOrFail(id);
  }

  public async findByRequestNumber(requestNumber: string) {
    return await InternalRequest.findByOrFail('requestNumber', requestNumber);
  }
}
