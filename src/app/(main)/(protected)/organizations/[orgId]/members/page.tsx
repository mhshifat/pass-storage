import InvitationList from "@/components/modules/members/invitation-list";
import InviteMemberDialog from "@/components/modules/members/invite-member-dialog";
import MemberList from "@/components/modules/members/member-list";
import MemberMenus from "@/components/modules/members/member-menus";
import Container from "@/components/shared/container";
import Translate from "@/components/shared/translate";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/lib/constants";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function MembersPage() {
  return (
    <Container>
      <div className="flex items-center">
        <Button variant="outline" size="sm">
          <Link href={ROUTE_PATHS.ORGANIZATIONS} className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            <Translate>Back to Organizations</Translate>
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <MemberMenus />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <Translate as="h3" className="text-2xl font-semibold">Members</Translate>
          <Translate as="p" className="text-sm font-normal">Manager your members</Translate>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="mt-6">
        <MemberList />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <Translate as="h3" className="text-2xl font-semibold">Active Invitations</Translate>
          <Translate as="p" className="text-sm font-normal">Manager your invitations</Translate>
        </div>
      </div>

      <div className="mt-6">
        <InvitationList />
      </div>
    </Container>
  )
}
