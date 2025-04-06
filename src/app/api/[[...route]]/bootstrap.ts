import prisma from "@/lib/db";
import { AuthService } from "./auth/service";
import { UserRepo } from "./user/repo";
import { UserService } from "./user/service";
import { TokenRepo } from "./token/repo";
import { TokenService } from "./token/service";
import { OrganizationRepo } from "./organization/repo";
import { OrganizationService } from "./organization/service";
import { TeamRepo } from "./team/repo";
import { TeamService } from "./team/service";
import { InvitationRepo } from "./invitation/repo";
import { InvitationService } from "./invitation/service";
import { MemberRepo } from "./member/repo";
import { MemberService } from "./member/service";
import { TeamMemberService } from "./team-member/service";
import { TeamMemberRepo } from "./team-member/repo";

const teamMemberRepo = new TeamMemberRepo(prisma);
export const teamMemberService = new TeamMemberService(
  teamMemberRepo
);

const memberRepo = new MemberRepo(prisma);
export const memberService = new MemberService(
  memberRepo
);

const invitationRepo = new InvitationRepo(prisma);
export const invitationService = new InvitationService(
  invitationRepo
);

const teamRepo = new TeamRepo(prisma);
export const teamService = new TeamService(
  teamRepo
);

const organizationRepo = new OrganizationRepo(prisma);
export const organizationService = new OrganizationService(
  organizationRepo
);

const tokenRepo = new TokenRepo(prisma);
export const tokenService = new TokenService(
  tokenRepo
);

const userRepo = new UserRepo(prisma);
export const userService = new UserService(
  userRepo
);

export const authService = new AuthService(
  userService
);
