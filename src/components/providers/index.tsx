"use client";

import { Toaster } from 'sonner';
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthProvider from "./auth";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Toaster />
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
