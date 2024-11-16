import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import AccountPlanBudjectEntry from '../../models/planbudject/account_plan_budject_entry.js';
import { AccountPlanBudjectEntryDTO } from '../../services/planbudject/utils/dtos.js';

export default class AccountPlanBudjectEntryValidator {

    private static schemaFieldsReinforceOrAnnul = vine.object({
        accountPlanNumber: vine.string(),
        value: vine.number(),
    });

    private static schemaFieldsRedistributeReinforcementOrAnnulment = vine.object({
        originAccountPlanNumber: vine.string(),
        targetAccountPlanNumber: vine.string(),
        value: vine.number(),
    });

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        startPostingMonth: vine.number(),
        endPostingMonth: vine.number(),
        reservePercent: vine.number().optional(),
        initialAllocation: vine.number(),
        finalAllocation: vine.number().optional(),
        accountPlanBudjectId: vine.number().optional(),
        accountPlanNumber: vine.string(),
        accountPlanId: vine.number().optional(),
        

        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
    })

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
        // Error message for the username field
        'number.database.unique': 'O numero da conta [{{ value }}] já existe no sistema',
        'id.database.existe': 'O id [{{ value }}] não existe no sistema',
        'accountPlanNumber.database.notexists': 'O numero da conta [{{ value }}] não existe no sistema',
        'accountPlanBudjectEntry.database.exists': 'O plano orçamental com o numero da conta [{{ value }}] já existe no sistema',
        'only.moviment.valid': ' Operacoes permitidas somente em contas de movimento [{{ value }}]',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static validateFieldsReinforceOrAnnul = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsReinforceOrAnnul)
    });

    public static validateFieldsRedistributeReinforcementOrAnnulment = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsRedistributeReinforcementOrAnnulment)
    });

    public static async validateOnCreate(data: AccountPlanBudjectEntryDTO) {
/*
        const existAccount = await AccountPlan.findBy("number", data.accountPlanNumber);

        if (!existAccount) {
            throw new Error(this.messagesLabels['accountPlanNumber.database.notexists'].replace('value', data.accountPlanNumber))
        }

        if (AccountPlanTypeWritableType.MOVIMENT != data.) { 
            throw new Error(this.messagesLabels['only.moviment.valid'].replace('value', data.accountPlanNumber))
         }
*/
        const exist = await AccountPlanBudjectEntry.query()
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.accountPlanNumber);
            }).first();

        if (exist) {
            throw new Error(this.messagesLabels['accountPlanBudjectEntry.database.exists'].replace('value', data.accountPlanNumber))
        }

            const existParent = await AccountPlanBudjectEntry.query()
                .whereHas('accountPlan', (builder) => {
                    builder.where('number', data.parentAccountPlanNumber);
                }).first();

            if (!existParent) {
                throw new Error(this.messagesLabels['accountPlanBudjectEntry.database.exists'].replace('value', data.accountPlanNumber))
            }


    }
}