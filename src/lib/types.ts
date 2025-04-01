import { z } from "zod";
import { signInFormSchema, signUpFormSchema, tokenCreateFormSchema, tokensApiRequestSchema } from "./validations";

export type SignUpFormPayload = z.infer<typeof signUpFormSchema>;
export type SignInFormPayload = z.infer<typeof signInFormSchema>;
export type AddTokenFormPayload = z.infer<typeof tokenCreateFormSchema>;
export type TokensApiRequestData = z.infer<typeof tokensApiRequestSchema>;

export type UserDto = {
  id: string;
  email: string
}

export type IUser = {
  id: string;
  email: string
}

export type IToken = {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: number;
  period: number;
  serviceUrl: string;
  username: string;
  password: string;
}

export type TokenDto = {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: number;
  period: number;
  service_url: string;
  username: string;
  password: string;
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
