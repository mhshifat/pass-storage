import { PropsWithChildren } from "react";

import Logo from "./logo";
import ProfileMenu from "./profile-menu";

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

      <ProfileMenu />
    </header>
  )
}

Header.Dashboard = HeaderDashboard;
