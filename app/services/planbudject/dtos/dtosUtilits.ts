import { DateTime } from "luxon";
import { AccountTypeWritableType, AccoutPlanType, AccoutPlanClassType } from "../../../models/utility/Enums.js";

/*
* Model que representa um 'DTO do modulo plano e orcamento'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
 interface DomainDTO {
  id: number;
  createdAt: DateTime | undefined;
  updatedAt: DateTime;
}

export interface OrganicDTO extends DomainDTO{
  code: String;
  description: string;
}

export interface AccountPlanDTO {
  id: number;
  number: string;
  description: string;
  writable: AccountTypeWritableType;
  type: AccoutPlanType;
  class: AccoutPlanClassType;
}