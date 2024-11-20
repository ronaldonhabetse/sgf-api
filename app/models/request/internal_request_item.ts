import { DateTime } from 'luxon'
import {belongsTo, column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import { QuantificationType } from '../utility/Enums.js'
import InternalRequest from './internal_request.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


/*
* Model que um item da requisicao interna
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class InternalRequestItem extends CreatableAbstractModel {

  @column()
  declare quantification: QuantificationType

  @column()
  declare quantity: number

  @column()
  declare description: string

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Custom format
  })
  declare operationDate: DateTime
 
  @column()
  declare unitPrice : number

  @column()
  declare internalRequestId: number

  @belongsTo(() => InternalRequest)
  declare internalRequest: BelongsTo<typeof InternalRequest>
}