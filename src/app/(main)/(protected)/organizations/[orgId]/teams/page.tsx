import AddEditTeamDialog from "@/components/modules/teams/add-edit-team-dialog";
import AddMemberToTeamDialog from "@/components/modules/teams/add-member-to-team-dialog";
import TeamList from "@/components/modules/teams/team-list";
import TeamMenus from "@/components/modules/teams/team-menus";
import Container from "@/components/shared/container";
import Translate from "@/components/shared/translate";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/lib/constants";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function TeamsPage() {
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
        <TeamMenus />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <Translate as="h3" className="text-2xl font-semibold">Teams</Translate>
          <Translate as="p" className="text-sm font-normal">Manager your teams</Translate>
        </div>

        <div className="flex items-center gap-2">
          <AddMemberToTeamDialog />
          <AddEditTeamDialog />
        </div>
      </div>

      <div className="mt-6">
        <TeamList />
      </div>
    </Container>
  )
}
