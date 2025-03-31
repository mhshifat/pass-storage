import prisma from "@/lib/db";
import { AuthService } from "./auth/service";
import { UserRepo } from "./user/repo";
import { UserService } from "./user/service";

const userRepo = new UserRepo(prisma);
export const userService = new UserService(
  userRepo
);

export const authService = new AuthService(
  userService
);
