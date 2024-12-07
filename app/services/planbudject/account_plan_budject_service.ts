  import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
  import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
  import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
  import AccountPlanYearValidator from "../../validators/planbudject/accountPlanYearValidator.js";
  import AccountPlanEntryService from "./account_plan_entry_service.js";
  import { AccountPlanYearDTO, AccountPlanEntryDTO } from "./utils/dtos.js";
  import { inject } from "@adonisjs/core";
import FinancialBudgetAssociations from "#models/planbudject/financial_budget_associations";
import AccountPlan from "#models/planbudject/account_plan";
import { EntryEntryType } from "#models/utility/Enums";

  /*
  * Servicos para o plano de contas
  * Gautchi R. Chambe (chambegautchi@gmail.com)
  */
  @inject()
  export default class AccountPlanBudjectService {

    constructor(
      private accountPlanEntryService: AccountPlanEntryService
    ) { }

    public async createAccountPlanYear(data: AccountPlanYearDTO) {
      await AccountPlanYearValidator.validateOnCreate(data);
      const accountPlanYear = new AccountPlanYear();
      accountPlanYear.fill({ year: data.year, description: data.description, })
      return await AccountPlanYear.create(accountPlanYear);
    }

    public async createAccountPlanEntry(data: AccountPlanEntryDTO) {
      return await this.accountPlanEntryService.createAccountPlanEntryTest(data);
    }

    public async associateFinancialAccountWithBujectAccounts(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
      return await this.accountPlanEntryService.associateFinancialAccountWithBujectAccounts(data);

    }
    public async initialAllocationAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
      return await this.accountPlanEntryService.initialAllocationAccountPlanEntry(data);
    }

    public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
      return this.accountPlanEntryService.reinforceAccountPlanEntry(data);
    }

    public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
      return this.accountPlanEntryService.annulAccountPlanEntry(data);
    }

    public async redistribuitioReinforcimentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
      return this.accountPlanEntryService.redistribuitioReinforcimentAccountPlanEntry(data);
    }

    public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
      return this.accountPlanEntryService.redistributeAnnulmentAccountPlanEntry(data);
    }

    /**------------------------------------------------------------------------*/
    /** Servicos de pesquisa de informacao relativa ao plano de contas */
    /**------------------------------------------------------------------------*/
    public async findAllAccountPlanYear() {
      return await AccountPlanYear.all();
    }

    public async findAccountPlanYearByYear(year: number) {
      return await AccountPlanYear.findByOrFail('year', year);
    }

    public async findAllAccountPlanEntriesEntry(year: number) {
      return await AccountPlanEntryEntry.query()
        .whereHas('accountPlanYear', (builder) => {
          builder.where('year', year);
        })
        .preload('accountPlanYear')
        .preload('entry')
        .preload('targetEntrieEntry')
    }
    public async fetchAllAccountPlanEntriesInitial(year: number) {
      const query = AccountPlanEntryEntry.query()
        .where('type', EntryEntryType.INITIAL_ALLOCATION) // Filtra pelo tipo "Initial"
        .whereHas('accountPlanYear', (builder) => {
          builder.where('year', year); // Filtra pelo ano no relacionamento
        });
    
      // Imprime a consulta SQL nos logs
      console.log(query.toSQL().sql);
    
      // Executa a consulta
      return await query.exec();
    }
    
    
    public async findAllAccountPlanEntries(year: number) {
      return await AccountPlanEntry.query()
        .whereHas('accountPlanYear', (builder) => {
          builder.where('year', year);
        })
        .preload('accountPlan')
        .preload('accountPlanYear')
        .preload('accountPlanfinancial')
    }

    public async fetchAllAccountPlanEntries(year: number) {
      return await AccountPlanEntry.query()
        .whereHas('accountPlanYear', (builder) => {
          builder.where('year', year);
        })
        .preload('accountPlan')
        .preload('accountPlanYear')
        .preload('entriesEntry')
        .preload('accountPlanfinancial')
    }

    public async fetchAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: number) {
      return await AccountPlanEntry.query()
        .whereHas('accountPlanYear', (builder) => {
          builder.where('year', year);
        }).whereHas('accountPlan', (builder) => {
          builder.where('number', accountPlanNumber);
        })
        .preload('accountPlan')
        .preload('accountPlanYear')
        .preload('accountPlanfinancial')
        .preload('entriesEntry')
    }

    public async fetchInitialAllocationsByParentId(year: number) {
      const query = AccountPlanEntryEntry.query()
        .select('account_plan_entries.parent_id')
        .sum('account_plan_entries_entry.allocation as total_allocation')  // Soma das alocações
        .join('account_plan_entries', 'account_plan_entries_entry.entry_id', '=', 'account_plan_entries.id')
        .join('account_plans', 'account_plan_entries.account_plan_id', '=', 'account_plans.id')
        .where('account_plan_entries_entry.type', EntryEntryType.INITIAL_ALLOCATION)  // Filtra por "INITIAL_ALLOCATION"
        .where('account_plan_entries_entry.allocation', '!=', 0)  // Exclui alocações zero
        .where('account_plans.type', 'budject')  // Filtra por tipo "budject"
        .groupBy('account_plan_entries.parent_id')  // Agrupa por parent_id
        .orderBy('account_plan_entries.parent_id');  // Ordena por parent_id
    
      // Imprimir a consulta SQL no console
      console.log("Consulta SQL: ", query.toSQL());
    
      const allocations = await query;
    
      // Criando o array com base nos dados
      const resultArray = allocations.map(item => {
        return {
          parent_id: item.$extras.parent_id,
          total_allocation: item.$extras.total_allocation
        };
      });
    
      // Imprimir o array resultante
      console.log("Array de alocações: ", resultArray);
    
      return resultArray;
    }
    
    
    


    public async findAllFinancialAccountsAndAssociatedBudgets() {
      // Buscar todas as contas financeiras que possuem associações de orçamento
      const financialAccountsWithAssociations = await AccountPlan.query()
        .whereExists(function (this: any) {  // Anotando explicitamente o tipo de 'this' como 'any'
          this.from('financial_budget_associations')
            .whereRaw('financial_budget_associations.financial_account_id = account_plan.id')
        }.bind(AccountPlan.query()))  // Usando 'bind' para garantir que 'this' se refere ao contexto correto
      
      const result = []
    
      // Para cada conta financeira, buscar suas associações de orçamento
      for (const account of financialAccountsWithAssociations) {
        // Buscar todas as associações de orçamento associadas à conta financeira
        const associatedBudgets = await FinancialBudgetAssociations.query()
          .where('financial_account_id', account.id)  // Filtrar pela conta financeira
          .preload('budgetAccount')  // Carregar as contas orçamentárias associadas
        
        // Adicionar os dados no resultado com a estrutura desejada
        result.push({
          financialAccount: account,    // A conta financeira
          budgetAssociations: associatedBudgets  // As associações orçamentárias
        })
      }
    
      return result
    }
    

    
    
  }