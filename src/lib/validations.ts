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
  teamId: z.string().optional(),
  password: z.string().min(1),
})

export const tokenShareFormSchema = z.object({
  id: z.string().min(1),
  teamId: z.string().min(1),
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

export const inviteMemberFormSchema = z.object({
  email: z.string().min(1),
  orgId: z.string().min(1),
})

export const acceptInviteFormSchema = z.object({
  code: z.string().min(1),
})

export const invitationsApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1),
    orgId: z.string().min(1),
  })
})

export const inviteDeleteRequestSchema = z.object({
  query: z.object({
    orgId: z.string().min(1),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
})

export const addMemberFormSchema = z.object({
  userId: z.string().min(1),
  orgId: z.string().min(1),
})

export const membersApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1),
    orgId: z.string().min(1),
  })
})

export const memberDeleteRequestSchema = z.object({
  query: z.object({
    orgId: z.string().min(1),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
})

export const memberUpdateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: addMemberFormSchema.partial()
})

export const teamMembersApiRequestSchema = z.object({
  query: z.object({
    page: z.number().positive().min(1),
    orgId: z.string().min(1),
  })
})

export const teamMemberCreateFormSchema = z.object({
  teamId: z.string().min(1),
  memberId: z.string().min(1),
  orgId: z.string().min(1),
})

export const teamMemberUpdateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: teamMemberCreateFormSchema.partial()
})

export const teamMemberDeleteRequestSchema = z.object({
  query: z.object({
    orgId: z.string().min(1),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
})
