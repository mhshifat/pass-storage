import { z } from "zod";
import { acceptInviteFormSchema, addMemberFormSchema, invitationsApiRequestSchema, inviteMemberFormSchema, membersApiRequestSchema, organizationCreateFormSchema, organizationsApiRequestSchema, signInFormSchema, signUpFormSchema, signUpFormSchemaWithEncryptedData, teamCreateFormSchema, teamMemberCreateFormSchema, teamMembersApiRequestSchema, teamsApiRequestSchema, tokenCreateFormSchema, tokenShareFormSchema, tokensApiRequestSchema } from "./validations";

export type SignUpFormPayload = z.infer<typeof signUpFormSchema>;
export type SignUpFormPayloadWithEncryptedData = z.infer<typeof signUpFormSchemaWithEncryptedData>;
export type SignInFormPayload = z.infer<typeof signInFormSchema>;
export type AddTokenFormPayload = z.infer<typeof tokenCreateFormSchema>;
export type ShareTokenFormPayload = z.infer<typeof tokenShareFormSchema>;
export type TokensApiRequestData = z.infer<typeof tokensApiRequestSchema>;
export type AddOrganizationFormPayload = z.infer<typeof organizationCreateFormSchema>;
export type OrganizationsApiRequestData = z.infer<typeof organizationsApiRequestSchema>;
export type AddTeamFormPayload = z.infer<typeof teamCreateFormSchema>;
export type TeamsApiRequestData = z.infer<typeof teamsApiRequestSchema>;
export type InviteMemberFormPayload = z.infer<typeof inviteMemberFormSchema>;
export type AcceptInviteFormPayload = z.infer<typeof acceptInviteFormSchema>;
export type InvitationsApiRequestData = z.infer<typeof invitationsApiRequestSchema>;
export type AddMemberFormPayload = z.infer<typeof addMemberFormSchema>;
export type MembersApiRequestData = z.infer<typeof membersApiRequestSchema>;
export type TeamMembersApiRequestData = z.infer<typeof teamMembersApiRequestSchema>;
export type AddTeamMemberFormPayload = z.infer<typeof teamMemberCreateFormSchema>;

export type UserDto = {
  id: string;
  email: string;
  salt: string;
  vault_key_iv: string;
  encrypted_vault_key: string;
}

export type IUser = {
  id: string;
  email: string
  salt: string;
  vaultKeyIv: string;
  encryptedVaultKey: string;
}

export type OrganizationDto = {
  id: string;
  name: string;
  user_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
  teams: TeamDto[];
}

export type TeamDto = {
  id: string;
  name: string;
  description?: string;
  members?: { id: string; email: string }[];
  created_at: string;
  updated_at: string;
}

export type MemberDto = {
  id: string;
  email: string
}

export type InvitationDto = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type TeamMemberDto = {
  id: string;
  team_id: string;
  member_id: string;
  created_at: string;
  updated_at: string;
}

export type IOrganization = {
  id: string;
  name: string;
  userId: string;
  description?: string;
  createdAt: string;
  teams: ITeam[]
}

export type ITeam = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members?: { id: string; email: string }[];
}

export type IMember = {
  id: string;
  email: string
}

export type ITeamMember = {
  id: string;
  teamId: string
  memberId: string
}

export type IInvitation = {
  id: string;
  email: string;
  createdAt: string;
}

export type IToken = {
  id: string;
  entry: string;
  iv: string;
  userId: string;
}

export type ITokenFormPayload = {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: number;
  period: number;
  serviceUrl: string;
  userId: string;
  username: string;
  password: string;
}

export type TokenDto = {
  id: string;
  entry: string;
  iv: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface IPagination<T> {
  total: number;
  page: number;
  perPage: number;
  data: T;
}

export type SignUpDto = object;
export type SignInDto = {
  access_token: string;
  user: UserDto;
};

export type ISession = {
  accessToken: string;
  user: IUser;
};

export type IAuthJwt = {
  uid: string;
};

export type SuccessAPIResponse<T> = {
  success: true;
  message?: string;
  data: T;
}

export type FailureAPIResponse = {
  success: false;
  message: string;
  errors?: { path: string | string[]; message: string }[]
}

export type APIResponse<T> = SuccessAPIResponse<T> | FailureAPIResponse;

export interface TOTPToken {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  period: number;
  digits: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  createdAt: string;
  lastUsed?: string;
  icon?: string;
  serviceUrl: string;
  username: string;
  password: string;
  teamIds?: string[];
}
