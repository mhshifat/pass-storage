import { z } from "zod";

export const signUpFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
})

export const signInFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
})

export const tokensApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1)
  })
})

export const tokenCreateFormSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  secret: z.string().min(1),
  algorithm: z.string().min(1),
  digits: z.number().min(6),
  period: z.number().min(1),
  serviceUrl: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
})

export const tokenUpdateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: tokenCreateFormSchema.partial()
})

export const tokenDeleteRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})
