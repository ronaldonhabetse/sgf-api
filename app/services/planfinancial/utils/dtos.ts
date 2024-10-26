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

interface AttributeInfoDTO {
  key: string;
  name: string;
}

export interface FinancialObjectDTO extends DomainDTO {
  type: string,
  accountPlanNumber: string,
  attributes: AttributeInfoDTO[],
}

export interface FinancialEntryDTO extends DomainDTO {
  startPostingMonth: number,
  endPostingMonth: number,
  reservePercent: number | undefined,
  initialAllocation: number,
  finalAllocation: number | undefined,
  accountPlanBudjectId: number | undefined
  accountPlanId: number | undefined,
  accountPlanNumber: string,
}