"use client";

import Translate from "@/components/shared/translate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTE_PATHS } from "@/lib/constants";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MemberMenus() {
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <Tabs defaultValue="members" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="teams" asChild>
          <Link href={ROUTE_PATHS.ORGANIZATION_TEAMS(orgId)}><Translate>Teams</Translate></Link>
        </TabsTrigger>
        <TabsTrigger value="members"><Translate>Members</Translate></TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
