
/*
* Model abstracto que que representa um objecto criavel
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export enum MenuType {
  ROOT = 'root',
  SUBMENU = 'sub_menu',
  ITEM = 'item',
}

export enum LifeclicleState {
  INACTIVE = 0,
  ACTIVE = 1,
  DELETED = 2,
}

export enum OperatorType {
  DEBIT = 'debit',
  CREDTI = 'credit',
}

export enum AccountTypeWritableType {
  MOVIMENT = 'moviment',
  CONTROLL = 'controll',
}

export enum AccoutPlanType {
  BUDJECT = 'budject',
  FINANCIAL = 'financial',
}

export enum AccoutPlanClassType {
  A = 'A', //'X.0.0.0.00'
  B = 'B', //'X.X.0.0.00'
  C = 'C', //'X.X.X.0.00'
  D = 'D', //'X.X.X.X.00'
  E = 'E', //'X.X.X.X.XX'
}