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
import { useParams, useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/lib/constants";
import useDeleteTeamMutation from "@/components/hooks/use-delete-team-mutation";
import useGetTeamsQuery from "@/components/hooks/use-get-teams-query";
import AddEditTeamDialog from "./add-edit-team-dialog";

export default function TeamList() {
  const router = useRouter();
	const deleteTeam = useDeleteTeamMutation();
  const { orgId } = useParams<{ orgId: string }>();
	const [page, setPage] = useState(1);
	const { data: teams, isLoading } = useGetTeamsQuery({
		params: {
			page: String(page),
      orgId
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
						{teams?.data?.map((team) => (
							<TableRow key={team.id} className="group">
								<TableCell className="font-medium">
									{team.name}
								</TableCell>
								<TableCell className="font-medium">
									{team?.description || "N/A"}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Manage collection"
                      onClick={() => router.push(ROUTE_PATHS.TEAM_DETAILS(orgId, team.id))}
                    >
                      <NotebookTextIcon size={16} />
                    </Button>
										<AddEditTeamDialog team={team} />
										<ConfirmationDialog
											onConfirm={() => deleteTeam.mutateAsync({ id: team.id, orgId })}
										>
											<Button
												variant="ghost"
												size="icon"
												disabled={deleteTeam.isPending}
												className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
												title="Delete collection"
											>
												<Trash2Icon size={16} />
											</Button>
										</ConfirmationDialog>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<PaginationView
				page={page}
				total={teams?.total || 0}
				perPage={teams?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
