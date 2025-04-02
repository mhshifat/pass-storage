import { PropsWithChildren } from "react";

import Logo from "./logo";
import ProfileMenu from "./profile-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTE_PATHS } from "@/lib/constants";
import { BuildingIcon } from "lucide-react";

export default function Header({ children }: PropsWithChildren) {
  return (
    <>
      {children}
    </>
  )
}

function HeaderDashboard({ children }: PropsWithChildren) {
  return (
    <header className="flex items-center justify-between py-2 px-4 shadow-xs">
      <div>
        <Logo size="md" />

        {children}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm">
          <Link href={ROUTE_PATHS.ORGANIZATIONS} className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            Organizations
          </Link>
        </Button>
        <ProfileMenu />
      </div>
    </header>
  )
}

Header.Dashboard = HeaderDashboard;
