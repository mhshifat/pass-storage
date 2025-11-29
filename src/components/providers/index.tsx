import { TRPCReactProvider } from "@/trpc/client";
import { PropsWithChildren } from "react";

export default function Providers({ children }: PropsWithChildren) {
    return (
        <TRPCReactProvider>
            {children}
        </TRPCReactProvider>
    )
}