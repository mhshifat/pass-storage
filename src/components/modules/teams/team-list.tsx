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
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import useDeleteTeamMutation from "@/components/hooks/use-delete-team-mutation";
import useGetTeamsQuery from "@/components/hooks/use-get-teams-query";
import AddEditTeamDialog from "./add-edit-team-dialog";
import { Badge } from "@/components/ui/badge";
import useDeleteTeamMemberMutation from "@/components/hooks/use-delete-team-member-mutation";
import { useTranslation } from "react-i18next";
import Translate from "@/components/shared/translate";
import EmptyList from "@/components/shared/empty-list";

export default function TeamList() {
	const { t } = useTranslation();
	const deleteTeam = useDeleteTeamMutation();
	const deleteTeamMember = useDeleteTeamMemberMutation();
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
					<Translate as="p">Loading...</Translate>
				</>,
			]}
		>
      {((teams?.total || 0) > 0) && (
        <>
          <div className="w-full border border-foreground rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]"><Translate>Name</Translate></TableHead>
                  <TableHead className="w-[120px]"><Translate>Description</Translate></TableHead>
                  <TableHead className="w-[120px]"><Translate>Members</Translate></TableHead>
                  <TableHead className="w-[100px] text-right"><Translate>Actions</Translate></TableHead>
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
                    <TableCell className="font-medium">
                      {team?.members?.map(m => <Badge variant="secondary" className="flex items-center gap-2" key={m.id}>
                        {m.email}
                        <Button title={t("Remove member")} disabled={deleteTeamMember.isPending} loading={deleteTeamMember.isPending} onClick={() => deleteTeamMember.mutateAsync({ id: m.id, teamId: team.id, orgId })} variant="ghost" size="none">
                          <Trash2Icon className="size-4" />
                        </Button>
                      </Badge>)}
    
                      {!team?.members?.length && "None"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <AddEditTeamDialog team={team} />
                        <ConfirmationDialog
                          onConfirm={() => deleteTeam.mutateAsync({ id: team.id, orgId })}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteTeam.isPending}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title={t("Delete team")}
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
        </>
      )}
      {((teams?.total || 0) === 0) && (
        <EmptyList
          title={t("translations.No teams yet")}
          description={t("translations.Get started by creating your first team")}
          createBtn={(
            <div className="mt-6">
              <AddEditTeamDialog variant="primary" />
            </div>
          )}
        />
      )}
		</RenderView>
	);
}
