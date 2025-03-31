import { PropsWithChildren } from "react";

import Protected from "@/components/shared/protected";
import Header from "@/components/shared/header";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return (
    <Protected>
      <Header>
        <Header.Dashboard />
      </Header>
      <main>
        {children}
      </main>
    </Protected>
  )
}
