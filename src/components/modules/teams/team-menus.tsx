"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTE_PATHS } from "@/lib/constants";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TeamMenus() {
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <Tabs defaultValue="teams" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="members" asChild>
          <Link href={ROUTE_PATHS.ORGANIZATION_MEMBERS(orgId)}>Members</Link>
        </TabsTrigger>
        <TabsTrigger value="invitations" asChild>
          <Link href={ROUTE_PATHS.ORGANIZATION_INVITATIONS(orgId)}>Invitations</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
