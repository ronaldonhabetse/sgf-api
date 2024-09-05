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
      user.password = await hash.make(user.password)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}