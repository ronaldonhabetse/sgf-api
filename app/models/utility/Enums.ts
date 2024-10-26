
/*
* Enums usados no sistemas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/

//Tipo de menu
export enum MenuType {
  ROOT = 'root',
  SUBMENU = 'sub_menu',
  ITEM = 'item',
}

//Ciclo de vida das entidades
export enum LifeclicleState {
  INACTIVE = 0,
  ACTIVE = 1,
  DELETED = 2,
}

//Operador de uma operacao financeiro/contabilistica
export enum OperatorType {
  DEBIT = 'debit',
  CREDTI = 'credit',
}

//Diz se uma conta e de controle ou movimento
export enum AccountPlanTypeWritableType {
  MOVIMENT = 'moviment',
  CONTROLL = 'controll',
}

//Representa o tipo de plano de contas
export enum AccoutPlanType {
  BUDJECT = 'budject',
  FINANCIAL = 'financial',
}

//Classe de planos de conta
export enum AccoutPlanClassType {
  A = 'A', //'X.0.0.0.00'
  B = 'B', //'X.X.0.0.00'
  C = 'C', //'X.X.X.0.00'
  D = 'D', //'X.X.X.X.00'
  E = 'E', //'X.X.X.X.XX'
}

/*
*Tipo de entrada no plano de contas: Inicial, reforco, anulacao, redistribuicao
*/
export enum EntryEntryType {
  INITIAL = 'initial',
  INITIAL_ALLOCATION = 'initial_allocation',
  REINFORCEMENT = 'reinforcement',
  ANNULMENT = 'annulment',
  REDISTRIBUTION_REINFORCEMENT = 'redistribution_reinforcement',
  REDISTRIBUTION_ANNULMENT = 'redistribution_annulment',
}

/*
*Tipo de objecto contabilistico
*/
export enum ObjectType {
  BANK = '01', //Codico do banco + SEPARADOR + NIB + ANGENCIA+ENDERECO
  BOX = '02',  //NUIT EMPRESA + SEPARADOR + SEQUENCIA_CAIXA
  CLIENT = '02',
  PROVIDER = '02',
  OTHERS = '02',
}