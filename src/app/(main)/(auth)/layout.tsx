import { PropsWithChildren } from "react";

import Logo from "@/components/shared/logo";
import Public from "@/components/shared/public";

export default function AuthLayout({ children }: PropsWithChildren) {
	return (
    <Public>
      <main className="flex-[1_0_0] grid grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col justify-center items-center">
          <div>
            <Logo />

            {children}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--primary-foreground)]"></div>
      </main>
    </Public>
	);
}
