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
import useGetInvitationsQuery from "@/components/hooks/use-get-invitations-query";
import useDeleteInvitationMutation from "@/components/hooks/use-delete-invitation-mutation";
import ShareInvitationDialog from "./share-invitation-dialog";
import Translate from "@/components/shared/translate";

export default function InvitationList() {
	const cancelInvitation = useDeleteInvitationMutation();
  const { orgId } = useParams<{ orgId: string }>();
	const [page, setPage] = useState(1);
	const { data: invitations, isLoading } = useGetInvitationsQuery({
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
			<div className="w-full border border-foreground rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]"><Translate>Email</Translate></TableHead>
							<TableHead className="w-[100px] text-right"><Translate>Actions</Translate></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invitations?.data?.map((invitation) => (
							<TableRow key={invitation.id} className="group">
								<TableCell className="font-medium">
									{invitation.email}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
                    <ShareInvitationDialog invitation={invitation} />
										<ConfirmationDialog
											onConfirm={() => cancelInvitation.mutateAsync({ id: invitation.id, orgId })}
										>
											<Button
												variant="ghost"
												size="icon"
												disabled={cancelInvitation.isPending}
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
				total={invitations?.total || 0}
				perPage={invitations?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
