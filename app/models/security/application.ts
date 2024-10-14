import { column } from "@adonisjs/lucid/orm";
import CodedCreatableModel from "../utility/CodedCreatableModel.js";


/*
* Model que representa uma 'Aplicacao/sistema ou modulo'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Application extends CodedCreatableModel {

  /*
  * Define o tipo (SYSTEM ou MODULE)
  */
  @column()
  declare type: string 

}