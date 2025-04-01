import prisma from "@/lib/db";
import { AuthService } from "./auth/service";
import { UserRepo } from "./user/repo";
import { UserService } from "./user/service";
import { TokenRepo } from "./token/repo";
import { TokenService } from "./token/service";

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
