import vine from '@vinejs/vine'

const password = vine.string().minLength(9);

export const createUserValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail().unique(async (db, value) => {
            const match = await db.from('users').select('id').where('email', value).first()
            return !match
        }), password,
    })
)