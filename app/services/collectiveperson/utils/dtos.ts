import { QuantificationType } from "../../../models/utility/Enums.js";

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


export interface ProviderDTO extends DomainDTO {
  name: string
  accountPlanFinancialNumber: string | undefined;
}