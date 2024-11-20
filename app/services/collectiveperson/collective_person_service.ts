import db from "@adonisjs/lucid/services/db";
import { inject } from "@adonisjs/core";
import { ProviderDTO } from "./utils/dtos.js";
import Provider from "../../models/person/provider.js";

/*
* Servicos para Pessoas colectiva: Provedor, Bancos, Caixa e clientes
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class CollectivePersonService {

  public async createProvider(data: ProviderDTO) {

    const trx = await db.transaction()  // Start transaction
    try {

      const createdProvider= await Provider
     
      await trx.commit();
      return createdProvider;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async findAllProviders() {
    return (await Provider.all())
  }

  public async findById(id: number) {
    return await Provider.findOrFail(id);
  }

  public async findProviderByAccountFinancialNumber(accountPlanFinancialNumber: string) {
    return await Provider.query().where("accountPlanFinancialNumber", accountPlanFinancialNumber).firstOrFail();
  }
}