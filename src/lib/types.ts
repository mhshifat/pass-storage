import { z } from "zod";
import { signInFormSchema, signUpFormSchema } from "./validations";

export type SignUpFormPayload = z.infer<typeof signUpFormSchema>;
export type SignInFormPayload = z.infer<typeof signInFormSchema>;

export type UserDto = {
  id: string;
  email: string
}

export type IUser = {
  id: string;
  email: string
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
