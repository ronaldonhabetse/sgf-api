import { DateTime } from "luxon";
import { AccountPlanTypeWritableType, AccoutPlanType, AccoutPlanClassType } from "../../../models/utility/Enums.js";

/*
* Interfaces que representam todos 'DTO' do modulo plano e orcamento'
* Estes DTO provem das requests Externas para a API
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
interface DomainDTO {
  id: number | undefined;
  createtBy: number | undefined;
  updatedBy: number | null | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | null | undefined;
}

export interface AccountPlanDTO extends DomainDTO {
  number: string;
  description: string;
  writable: AccountPlanTypeWritableType;
  type: AccoutPlanType;
  class: AccoutPlanClassType;
}

export interface AccountPlanBudjectDTO extends DomainDTO {
  year: number;
  description: string;
}

export interface AccountPlanBudjectEntryDTO extends DomainDTO {
  startPostingMonth: number,
  endPostingMonth: number,
  reservePercent: number | undefined,
  initialAllocation: number,
  finalAllocation: number | undefined,
  accountPlanBudjectId: number | undefined
  accountPlanId: number | undefined,
  accountPlanNumber: string,

}

export interface AccountPlanBudjectEntrieEntryDTO extends DomainDTO {
}