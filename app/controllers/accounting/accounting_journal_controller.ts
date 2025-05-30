import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import AccountingJournalService from "../../services/accounting/accounting_journal_service.js";
import AccountingJournalEntryValidator from "../../validators/accounting/accountingJournalEntryValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class AccountingJournalController {

  constructor(
    private accountingJournalService: AccountingJournalService
  ) { }

  async openAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())
    if (!data.journalDocumentNumber) {
      data.journalDocumentNumber = '';  // ou outro valor padrão
    }
    try {
      return response.created(await this.accountingJournalService.openAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução do lancamento de abertura  das contas financeiras',
        error: error.message,
      });
    }
  }

  async billToPayAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.billToPayAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por pagar do plano de contas',
        error: error.message,
      });
    }
  }

  async billToReceiveAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.billToReceiveAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }

  async bankInAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.bankInAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }

  async bankOutAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.bankOutAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }

  async regulationAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.regulationAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }


  async fetchAllAccountingJournalEntry({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalEntry());
  }

  async fetchAllAccountingJournalEntryItems({ response }: HttpContext) {
    const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItems();
    return response.ok(items); // Retorna os itens carregados com as relações
  }

  async fetchAllAccountingJournalEntryItemsByFilters({ request, response }: HttpContext) {

    const { startDate, endDate, accountPlanId } = request.qs();


    const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItemsByFilters({
      startDate,
      endDate,
      accountPlanId
    });

    return response.ok(items);
  }


  async fetchAllBalanceteByFilters({ request, response }: HttpContext) {

    const { startDate, endDate, accountPlanId } = request.qs();
    console.log("Meus Filtros", startDate, endDate, accountPlanId);

    const items = await this.accountingJournalService.fetchAllBalanceteByFiltersSearch({
      startDate,
      endDate,
      accountPlanId
    });

    return response.ok(items);
  }


  async fetchGeneralFolioAccountByFilter({ request, response }: HttpContext) {

    const { startDate, endDate, accountPlanId } = request.qs();
    console.log("Meus Filtros", startDate, endDate, accountPlanId);

    const items = await this.accountingJournalService.fetchGeneralFolioAccountByFilterData({
      startDate,
      endDate,
      accountPlanId
    });

    return response.ok(items);
  }






  async findAllAccountingJournalEntry({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalEntry());
  }

  async fetchAllAccountingJournal({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournal());
  }

  async fetchAllAccountingJournalByJournalNumber({ request, response }: HttpContext) {
    const journalNumber = request.param('number');
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalByJournalNumber(journalNumber));
  }
}