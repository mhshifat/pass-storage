import { z } from "zod";

export const signUpFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
})

export const signInFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
})
