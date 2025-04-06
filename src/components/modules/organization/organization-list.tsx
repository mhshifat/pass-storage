"use client";

import ConfirmationDialog from "@/components/shared/confirmation-dialog";
import PaginationView from "@/components/shared/pagination-view";
import RenderView from "@/components/shared/render-view";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { NotebookTextIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import useDeleteOrganizationMutation from "@/components/hooks/use-delete-organization-mutation";
import useGetOrganizationsQuery from "@/components/hooks/use-get-organizations-query";
import AddEditOrganizationDialog from "./add-edit-organization-dialog";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/lib/constants";
import { useAuth } from "@/components/providers/auth";

export default function OrganizationList() {
  const router = useRouter();
  const { user } = useAuth();
	const deleteOrganization = useDeleteOrganizationMutation();
	const [page, setPage] = useState(1);
	const { data: organizations, isLoading } = useGetOrganizationsQuery({
		params: {
			page: String(page),
		},
	});

	return (
		<RenderView
			fallback={[
				isLoading,
				<>
					<p>Loading...</p>
				</>,
			]}
		>
			<div className="w-full border border-foreground rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]">Name</TableHead>
							<TableHead className="w-[120px]">Description</TableHead>
							<TableHead className="w-[100px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{organizations?.data?.map((organization) => (
							<TableRow key={organization.id} className="group">
								<TableCell className="font-medium">
									{organization.name}
								</TableCell>
								<TableCell className="font-medium">
									{organization?.description || "N/A"}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Manage collection"
                      onClick={() => router.push(ROUTE_PATHS.ORGANIZATION_TEAMS(organization.id))}
                    >
                      <NotebookTextIcon size={16} />
                    </Button>
                    <AddEditOrganizationDialog organization={organization} />
                    {organization.userId === user?.id && (
                      <>
                        <ConfirmationDialog
                          onConfirm={() => deleteOrganization.mutateAsync({ id: organization.id })}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteOrganization.isPending}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete collection"
                          >
                            <Trash2Icon size={16} />
                          </Button>
                        </ConfirmationDialog>
                      </>
                    )}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<PaginationView
				page={page}
				total={organizations?.total || 0}
				perPage={organizations?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
