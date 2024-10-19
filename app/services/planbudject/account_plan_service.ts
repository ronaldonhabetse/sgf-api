import vine from "@vinejs/vine";
import AccountPlan from "../../models/planbudject/account_plan.js";
import { AccountTypeWritableType, AccoutPlanClassType, AccoutPlanType } from "../../models/utility/Enums.js";
import { AccountPlanDTO } from "./dtos/dtosUtilits.js";
import { accountPlanValidatorCreate, accountPlanValidatorUpdate } from "../../validators/planbudject/accountPlanValidator.js";

interface NewType {
    id: number;
    number: string;
    description: string;
    writable: AccountTypeWritableType;
    type: AccoutPlanType;
    class: AccoutPlanClassType;
}

/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanService {

    public async update(data: AccountPlanDTO) {
        accountPlanValidatorUpdate(data);
        const accountPlan = new AccountPlan();
        accountPlan.fill(data);
        return await accountPlan.save();

    }

    public async create(data: AccountPlanDTO) {
        accountPlanValidatorCreate(data);
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
    public async findAll() {
        return await AccountPlan.all();
    }

    public async findAllActive() {
        return (await AccountPlan.query().withScopes((scopes) => scopes.active()))
    }

    public async findById(id: number) {
        return await AccountPlan.findOrFail(id);
    }

    public async findActiveBy() {
        return (await AccountPlan.query().withScopes((scopes) => scopes.active()))
    }
    /**------------------------------------------------------------------------*/
}