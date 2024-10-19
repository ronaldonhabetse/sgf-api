import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import AccountPlan from '../../models/planbudject/account_plan.js'
import { AccountTypeWritableType, AccoutPlanClassType, AccoutPlanType } from '../../models/utility/Enums.js'

/** Valida os campos do objecto que vem da request */
const schemaFields = vine.object({
    id: vine.number(),
    number: vine.string().minLength(1),
    description: vine.string().minLength(1),
    writable: vine.enum(Object.values(AccountTypeWritableType)),
    type: vine.enum(Object.values(AccoutPlanType)),
    class: vine.enum(Object.values(AccoutPlanClassType))
})

/** Efectua a validação da criação dos dados conforme a regra de  */
const schemaCreate = vine.object({
    //O numero da conta deve ser unico
    number: vine.string().unique(async (db, value) => {
        const match = await db.from(AccountPlan.table).select('number').where('number', value).first()
        return !match
    }), schema: schemaFields
})

/** Efectua a validação da actualizacao dos dados */
let foundPlan: any;
const schemaUpdate = vine.object({
    id: vine.number().unique(async (db, value) => {
        foundPlan = await db.from(AccountPlan.table).select('id').where('id', value).first()
        return foundPlan;
    })
})

vine.messagesProvider = new SimpleMessagesProvider({
    required: 'O campo [{{ field }}] é obrigatorio',
    minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
    date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
    enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
    // Error message for the username field
    'number.database.unique': 'O numero da conta [{{ value }}] já existe no sistema',
    'id.database.unique': 'O id [{{ value }}] não existe no sistema',
})

export const accountPlanValidatorFields = vine.compile(schemaFields)

export const accountPlanValidatorCreate = (data: any) => {
    vine.compile(schemaCreate).validate(schemaCreate, data);
}
export const accountPlanValidatorUpdate = (data: any) => {
    vine.compile(schemaUpdate).validate(schemaUpdate, data);
}