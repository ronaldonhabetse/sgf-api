import vine from '@vinejs/vine'

const password = vine.string().minLength(9)

export default class UserValidator {
  // Método que compila o validador
  static createUserValidator() {
    return vine.compile(
      vine.object({
        email: vine.string()
          .email()
          .normalizeEmail()
          .unique(async (db, value) => {
            const match = await db.from('users').select('id').where('email', value).first()
            return !match
          }),
        password,
      })
    )
  }

  // Definição do validador de campos
  static validateFields() {
    return vine.compile(  // Compila o validador para o formato esperado
      vine.object({
        name: vine.string().minLength(1), // Verifica que o nome não é vazio
        email: vine.string().email().minLength(1), // Verifica que o email é válido e não vazio
        password: vine.string().minLength(6), // Verifica que a senha tem pelo menos 6 caracteres
        phone: vine.string().optional(), // Telefone opcional, apenas números
        birthDate: vine.string(), // Data no formato ISO (YYYY-MM-DD)
        profile: vine.string(), // Data no formato ISO (YYYY-MM-DD)
        isTech: vine.boolean(), // Data no formato ISO (YYYY-MM-DD)
        isAdmin: vine.boolean(), // Data no formato ISO (YYYY-MM-DD)
        isSuperAdmin: vine.boolean(), // Data no formato ISO (YYYY-MM-DD)
        permissions: vine.object({
          planoOrcamento: vine.boolean(),
          requisoesFundos: vine.boolean(),
          contasReceberPagar: vine.boolean(),
          disponivel: vine.boolean(),
          reconBancaria: vine.boolean(),
          relatoriosGlobais: vine.boolean(),
        }), 
      })
    )
  }
}
