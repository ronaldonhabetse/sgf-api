import AccountPlan from "../../models/planbudject/account_plan.js";
import { AccountPlanTypeWritableType, AccoutPlanClassType, AccoutPlanType } from "../../models/utility/Enums.js";
import AccountPlanValidator from "../../validators/planbudject/accountPlanValidator.js";
import { AccountPlanDTO } from "./utils/dtos.js";

interface NewType {
    id: number;
    number: string;
    description: string;
    writable: AccountPlanTypeWritableType;
    type: AccoutPlanType;
    class: AccoutPlanClassType;
}

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanService {

    public async update(data: AccountPlanDTO) {
        AccountPlanValidator.validateOnCreate(data);
        const found = await AccountPlan.findByOrFail('id', data.id);
        found.fill({ description: data.description, });
        return await found.save();
    }

    public async create(data: AccountPlanDTO) {
        await AccountPlanValidator.validateOnCreate(data);
        const accountPlan = new AccountPlan();
        accountPlan.fill({ number: data.number, description: data.description, })
        accountPlan.setClass(data.class);
        accountPlan.setType(data.type);
        accountPlan.setWritable(data.writable);
        return await AccountPlan.create(accountPlan);
    }

    /**------------------------------------------------------------------------*/
    /** Servicos de pesquisa de informacao relativa ao plano de contas */
    /**------------------------------------------------------------------------*/
    public async findAny() {
        return await AccountPlan.all();
    }

    public async findAll() {
        return (await AccountPlan.query()
            .withScopes((scopes) => scopes.active()))
    }

    public async findById(id: number) {
        return await AccountPlan.findOrFail(id);
    }

    public async findByNumber(accountNumber: string) {
        return await AccountPlan.query().where("number", accountNumber)
            .withScopes((scopes) => scopes.active()).firstOrFail();
    }

    public async findAnyByNumber(accountNumber: string) {
        return await AccountPlan.findByOrFail("number", accountNumber);
    }
    /**------------------------------------------------------------------------*/
}