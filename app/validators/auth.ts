import vine from '@vinejs/vine'


const password = vine.string().minLength(9);

export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail()
        , password
    })
)


