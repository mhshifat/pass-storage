"use client";

import { PropsWithChildren } from "react";
import { Loader2Icon } from "lucide-react";

import { useAuth } from "../providers/auth";
import { ROUTE_PATHS } from "@/lib/constants";
import Navigate from "./navigate";

export default function Protected({ children }: PropsWithChildren) {
  const { loading, user } = useAuth();

  if (loading) return (
    <div className="h-screen flex flex-col justify-center items-center w-screen">
      <Loader2Icon className="size-10 animate-spin" />
    </div>
  );
  if (!user || !user?.id) return <Navigate to={ROUTE_PATHS.SIGN_IN} />;
  return (
    <>
      {children}
    </>
  );
}
