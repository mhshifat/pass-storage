import AddEditOrganizationDialog from "@/components/modules/organization/add-edit-organization-dialog";
import OrganizationList from "@/components/modules/organization/organization-list";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/lib/constants";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function OrganizationsPage() {
  return (
    <Container>
      <div className="flex items-center">
        <Button variant="outline" size="sm">
          <Link href={ROUTE_PATHS.DASHBOARD} className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-2xl font-semibold">Organizations</h3>
          <p className="text-sm font-normal">Manager your organizations</p>
        </div>
        <AddEditOrganizationDialog />
      </div>

      <div className="mt-6">
        <OrganizationList />
      </div>
    </Container>
  )
}
