import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import InternalRequest from './internal_request.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class InternalRequestItem extends CreatableAbstractModel {
  @column()
  declare quantification: string // Tipo de quantificação

  @column()
  declare quantity: number

  @column()
  declare description: string

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Formato personalizado
  })
  declare operationDate: DateTime

  @column()
  declare unitPrice: number

  @column({ columnName: 'internal_request_id' })
  declare internalRequestId: number

  @belongsTo(() => InternalRequest)
  declare internalRequest: BelongsTo<typeof InternalRequest>
}
