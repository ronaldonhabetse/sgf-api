import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeSave, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import AccessProfile from './accessprofile.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organic from './organic.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/*
* Model que representa um 'Utilizador'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class User extends compose(BaseModel, AuthFinder) {

  currentAccessToken?: AccessToken;

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare organicId: number

  @belongsTo(() => Organic)
  declare organic: BelongsTo<typeof Organic>

  @column()
  declare accessProfileId: number

  @belongsTo(() => AccessProfile)
  declare accessProfile: BelongsTo<typeof AccessProfile>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      /* O codco abaixo esta comentado por que ate este ponto o resultado é a password encriptada como Hash*/
      //console.log('user1 create .password_plan', user.password);
      //console.log('user1 create verified password_plan', await hash.verify(user.password, "sebadora123"))
     // user.password = await hash.make(user.password)
     // console.log('user1 create verified hash', await hash.verify(user.password, "sebadora123"))
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}