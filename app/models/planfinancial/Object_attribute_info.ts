import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import MutableAbstractModel from '../utility/MutableAbstractModel.js'
import AccountPlanBudject from '../planbudject/account_plan_budject.js'
import FinancialObjectType from './financial_object_type.js';
import FinancialObject from './financial_object.js';

/*
* Model que representa os atributos de um objecto financeiro 'caixa, banco, cliente, provedor, etc'
* Os atributos key, value indicam o detalhaes
* exemplo para banco: 
* position=1, key=name, value=BIM,
* position=2, key=nib, value=11111111111111111,
* position=3, key=nib, value=11111111111111111,
* position=null, key=endereco, value=Maputo, cidade de maputo, etc,
* 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*
*/
export default class ObjectAttributesInfo extends MutableAbstractModel {

  @column()
  declare key: string;

  @column()
  declare value: string;

  @column()
  declare position: number | undefined;

  @column()
  declare objectTypeId: number;

  @belongsTo(() => FinancialObjectType)
  declare objectType: BelongsTo<typeof FinancialObjectType>;

  @column()
  declare financialObjectId: number;

  @belongsTo(() => FinancialObject)
  declare financialObject: BelongsTo<typeof FinancialObject>;

  @column()
  declare accountPlanBudjectId: number;

  @belongsTo(() => AccountPlanBudject)
  declare accountPlanBudject: BelongsTo<typeof AccountPlanBudject>;
}