import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AccountPlanEntryDTO } from '../../services/planbudject/utils/dtos.js';
import AccountPlanEntry from '../../models/planbudject/account_plan_entry.js';
import { AccoutPlanType } from '../../models/utility/Enums.js';

export default class AccountPlanEntryValidator {

    private static schemaFieldsAssociateAccounts = vine.object({
        accountPlanFinancialNumber: vine.string(),
        accountPlanBujectsNumber: vine.array(
            vine.object({ accountPlanBujectNumber: vine.string() })
        ),
    });

    private static schemaFieldsReinforceOrAnnul = vine.object({
        accountPlanNumber: vine.string(),
        value: vine.number(),
        operationDate: vine.date(),
    });

    private static schemaFieldsRedistributeReinforcementOrAnnulment = vine.object({
        originAccountPlanNumber: vine.string(),
        targetAccountPlanNumber: vine.string(),
        value: vine.number(),
        operationDate: vine.date(),
    });

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        startPostingMonth: vine.number(),
        endPostingMonth: vine.number(),
        reservePercent: vine.number().optional(),
        initialAllocation: vine.number(),
        finalAllocation: vine.number().optional(),
        accountPlanYearId: vine.number().optional(),
        accountPlanNumber: vine.string(),
        accountPlanId: vine.number().optional(),
        parentId: vine.number().optional(),
        parentAccountPlanNumber: vine.string(),
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
        'accountPlanEntry.database.exists': 'O plano de conta com o numero da conta [{{ value }}] já existe no sistema',
        'accountPlanEntry.database.not.exists': 'A entrada do plano conta pai o numero da conta [{{ value }}] não existe no sistema',
        'only.moviment.valid': ' Operacoes permitidas somente em contas de movimento [{{ value }}]',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static validateFieldsAssociateAccounts = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsAssociateAccounts)
    });

    public static validateFieldsReinforceOrAnnul = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsReinforceOrAnnul)
    });

    public static validateFieldsRedistributeReinforcementOrAnnulment = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsRedistributeReinforcementOrAnnulment)
    });

    public static async validateOnCreate(data: AccountPlanEntryDTO) {
        const exist = await AccountPlanEntry.query()
            .where('accountPlanNumber', data.accountPlanNumber)
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.accountPlanNumber);
            })
            .first();

        if (exist) {
            throw new Error(this.messagesLabels['accountPlanEntry.database.exists'].replace('value', data.accountPlanNumber));
        }

        const query = AccountPlanEntry.query()
            .where('accountPlanNumber', data.parentAccountPlanNumber)
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.parentAccountPlanNumber);
            });

        // Imprimir a consulta SQL gerada
        console.log(query.toSQL().sql); // Adicione esta linha para imprimir a consulta

        const existParent = await query.first();

        if (!existParent) {
            throw new Error(this.messagesLabels['accountPlanEntry.database.not.exists'].replace('value', data.parentAccountPlanNumber));
        }
    }

    public static async validateOnAssociate(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {

        const existFinancialAccountEntry = await AccountPlanEntry.query()
            .where('accountPlanNumber', data.accountPlanFinancialNumber)
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.accountPlanFinancialNumber)
                builder.where('type', AccoutPlanType.FINANCIAL);
            })
            .first();

        if (existFinancialAccountEntry) {
            throw new Error(this.messagesLabels['accountPlanEntry.database.not.exists'].replace('value', data.accountPlanFinancialNumber+" , "+AccoutPlanType.FINANCIAL.toString()));
        }

        data.accountPlanBujectsNumber.forEach(async (budjectAccountNumber) => {
            try {
                const budjectAccountPlanEntry = await AccountPlanEntry.query()
                    .where('accountPlanNumber', budjectAccountNumber.accountPlanBujectNumber)
                    .whereHas('accountPlan', (builder) => {
                        builder.where('number', budjectAccountNumber.accountPlanBujectNumber)
                        builder.where('type', AccoutPlanType.BUDJECT);
                    })
                    .first();

                if (budjectAccountPlanEntry) {
                    throw new Error(this.messagesLabels['accountPlanEntry.database.not.exists'].replace('value', budjectAccountNumber.accountPlanBujectNumber +" , "+AccoutPlanType.BUDJECT.toString()));
                }

            } catch (error) {
                throw error;
            }
        })
    }
}