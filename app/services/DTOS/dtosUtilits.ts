import { DateTime } from "luxon";

/*
* Model que representa um 'DTO do utilizador'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
 interface DomainDTO {
  id: number;
  createdAt: DateTime | undefined;
  updatedAt: DateTime;
}

export interface AuthDTO {
  email: String;
  password: string;
}

export interface OrganicDTO extends DomainDTO{
  code: String;
  description: string;
}

export interface AccessProfileDTO extends DomainDTO{
  code: String;
  description: string;
}

export interface UserDTO extends DomainDTO{
  username: String;
  fullName: string;
  email: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  organic: OrganicDTO;
  accessProfile: AccessProfileDTO;
}