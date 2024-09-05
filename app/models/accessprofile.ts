import { manyToMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import CodedCreatableModel from './utility/CodedCreatableModel.js'

/*
* Model que representa um 'Perfil de utilizador'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccessProfile extends CodedCreatableModel {
 
  @manyToMany(() => Transaction,  {
    localKey: 'id',
    pivotForeignKey: 'access_profile_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'transaction_id',
  })
  declare transactions: ManyToMany<typeof Transaction>
}