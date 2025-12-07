import { TRPCReactProvider } from "@/trpc/client";
import { PropsWithChildren } from "react";
import { Toaster } from 'sonner';

export default function Providers({ children }: PropsWithChildren) {
    return (
        <TRPCReactProvider>
            <Toaster />
            {children}
        </TRPCReactProvider>
    )
}