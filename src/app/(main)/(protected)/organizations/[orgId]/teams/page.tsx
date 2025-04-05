import AddEditTeamDialog from "@/components/modules/teams/add-edit-team-dialog";
import TeamList from "@/components/modules/teams/team-list";
import TeamMenus from "@/components/modules/teams/team-menus";
import Container from "@/components/shared/container";
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
            Back to Organizations
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <TeamMenus />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-2xl font-semibold">Teams</h3>
          <p className="text-sm font-normal">Manager your teams</p>
        </div>
        <AddEditTeamDialog />
      </div>

      <div className="mt-6">
        <TeamList />
      </div>
    </Container>
  )
}
