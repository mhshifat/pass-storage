"use client";

import { Loader2Icon } from "lucide-react";

import { useAuth } from "../providers/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import RenderView from "./render-view";
import Translate from "./translate";

export default function ProfileMenu() {
  const { loading, onLogout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer flex items-center justify-center">
          <RenderView
            fallback={[loading, (
              <>
                <Loader2Icon className="size-4 animate-spin" />
              </>
            )]}
          >
            <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </RenderView>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-2xs"
      >
        <DropdownMenuLabel><Translate>My Account</Translate></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} role="button" className="cursor-pointer">
          <Translate>Logout</Translate>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
