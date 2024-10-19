import { column } from '@adonisjs/lucid/orm'
import { AccoutPlanClassType, AccoutPlanType, AccountTypeWritableType as AccountPlanWritableType } from '../utility/Enums.js'
import CreatableModel from '../utility/AbstractModel.js'

export default class AccountPlan extends CreatableModel {

  @column()
  declare number: string

  @column()
  declare description: string

  @column()
  declare writable: AccountPlanWritableType

  @column()
  declare class: AccoutPlanClassType

  @column()
  declare type: AccoutPlanType

  setClass(classValue: string) {
    this.class = Object.values(AccoutPlanClassType).filter((k) => (k.valueOf() === classValue))[0];
  }
  setType(typeValue: string) {
    this.type = Object.values(AccoutPlanType).filter((k) => (k.valueOf() === typeValue))[0];
  }
  setWritable(writableValue: string) {
    this.writable = Object.values(AccountPlanWritableType).filter((k) => (k.valueOf() === writableValue))[0];
  }
}

