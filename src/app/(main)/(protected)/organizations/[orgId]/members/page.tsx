import InvitationList from "@/components/modules/members/invitation-list";
import InviteMemberDialog from "@/components/modules/members/invite-member-dialog";
import MemberList from "@/components/modules/members/member-list";
import MemberMenus from "@/components/modules/members/member-menus";
import Container from "@/components/shared/container";
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
            Back to Organizations
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <MemberMenus />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-2xl font-semibold">Members</h3>
          <p className="text-sm font-normal">Manager your members</p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="mt-6">
        <MemberList />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-2xl font-semibold">Active Invitations</h3>
          <p className="text-sm font-normal">Manager your invitations</p>
        </div>
      </div>

      <div className="mt-6">
        <InvitationList />
      </div>
    </Container>
  )
}
