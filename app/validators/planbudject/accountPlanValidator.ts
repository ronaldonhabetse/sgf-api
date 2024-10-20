import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AccountPlanTypeWritableType, AccoutPlanType, AccoutPlanClassType } from '../../models/utility/Enums.js'
import AccountPlan from '../../models/planbudject/account_plan.js'
import { AccountPlanDTO } from '../../services/planbudject/utils/dtos.js'

export default class AccountPlanValidator {

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        number: vine.string().minLength(1),
        description: vine.string().minLength(1),
        writable: vine.enum(Object.values(AccountPlanTypeWritableType)),
        type: vine.enum(Object.values(AccoutPlanType)),
        class: vine.enum(Object.values(AccoutPlanClassType)),
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
        'id.database.unique': 'O id [{{ value }}] não existe no sistema',
        'number.database.exists': 'O numero da conta [{{ value }}] já existe no sistema',
    }

    private static schemaCreate = vine.object({
        //O numero da conta deve ser unico e não deve existir na base
        number: vine.string().fixedLength(10).exists(async (db, value) => {
            const found = await db.from(AccountPlan.table).select('number').where('number', value).first()
            console.log("objecto encontrado", found)
            return false
        }),
    })

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields);
    });

    public static async validateOnCreate(data: AccountPlanDTO) {
        //valida o tipo de dados e enums
         vine.compile(this.schemaFields).validate(data);

        const exist = await AccountPlan.findBy("number", data.number);

        if (exist) {
            throw new Error(this.messagesLabels['number.database.exists'].replace('value', data.number))
        }
    }
}