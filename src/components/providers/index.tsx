"use client";

import '.././../lib/i18n/i18n';
import { Toaster } from 'sonner';
import { PropsWithChildren, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthProvider from "./auth";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Toaster />
      <Suspense>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Suspense>
    </QueryClientProvider>
  )
}
