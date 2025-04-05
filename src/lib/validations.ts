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

export const organizationsApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1)
  })
})

export const organizationCreateFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const organizationUpdateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: organizationCreateFormSchema.partial()
})

export const organizationDeleteRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

export const teamsApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1),
    orgId: z.string().min(1),
  })
})

export const teamCreateFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  orgId: z.string().min(1),
})

export const teamUpdateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: teamCreateFormSchema.partial()
})

export const teamDeleteRequestSchema = z.object({
  query: z.object({
    orgId: z.string().min(1),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
})
