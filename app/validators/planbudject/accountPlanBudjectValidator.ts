import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import AccountPlanBudject from '../../models/planbudject/account_plan_budject.js'

export default class AccountPlanBudjectValidator {

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        year: vine.number().range([2024, new Date().getFullYear() + 1]), // Ensures year is between 2024 and the current year
        description: vine.string().minLength(1),
        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
    })
    
    private static schemaCreate = vine.object({
        number: vine.string().exists(async (db, value) => {
            const exists = await db.from(AccountPlanBudject.table).select('year').where('year', value).first()
            return !exists
        })
    })

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider({
            'year.range': 'O Ano deve ser entre 2024 ate ao ano corrente',
        })
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static validateOnCreate = (data: any) => {
        this.setMessages();
        vine.compile(this.schemaCreate).validate(this.schemaCreate, data);
    }
}