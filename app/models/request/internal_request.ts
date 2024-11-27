import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import InternalRequestItem from './internal_request_item.js'
import Provider from '../person/provider.js'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import Bank from '../person/bank.js'

/*
* Model que representa uma requisicao interna
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class InternalRequest extends LifecycleAbstractModel {

  @column()
  declare sequence: number

  @column()
  declare requestNumber: string

  @column()
  declare requestorName: string

  @column()
  declare requestorDepartment: string

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Custom format
  })
  declare operationDate: DateTime
 
  @column()
  declare initialAvailabilityAccountBuject : number

  @column()
  declare currentAccountBudjectBalance: number

  @column()
  declare finalAccountBujectBalance: number

  @column()
  declare totalRequestedValue: number

  @column()
  declare justification: string

  @column()
  declare sectorBudject: string  //sector

  @column()
  declare chapterBudject: string  //capitulo

  @column()
  declare clauseBudject: string  //artigo

  @column()
  declare clauseNumberBudject: string  //numero do artigo

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare providerId: number

  @belongsTo(() => Provider)
  declare provider: BelongsTo<typeof Provider>

  @column()
  declare bankId: number

  @belongsTo(() => Bank)
  declare bank: BelongsTo<typeof Bank>

  @column()
  declare accountPlanBudjectId: number

  @belongsTo(() => AccountPlan)
  declare accountPlanBudject: BelongsTo<typeof AccountPlan>

  @column()
  declare accountPlanFinancialId: number

  @belongsTo(() => AccountPlan)
  declare accountPlanFinancial: BelongsTo<typeof AccountPlan>

  @hasMany(() => InternalRequestItem, {
    foreignKey: 'internalRequestId', // defaults to requestId
  })
  declare items: HasMany<typeof InternalRequestItem>
}