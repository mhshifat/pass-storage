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
import useDeleteMemberMutation from "@/components/hooks/use-delete-member-mutation";
import useGetMembersQuery from "@/components/hooks/use-get-members-query";
import Translate from "@/components/shared/translate";
import { useTranslation } from "react-i18next";

export default function MemberList() {
	const { t } = useTranslation();
	const deleteMember = useDeleteMemberMutation();
  const { orgId } = useParams<{ orgId: string }>();
	const [page, setPage] = useState(1);
	const { data: members, isLoading } = useGetMembersQuery({
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
						{members?.data?.map((member) => (
							<TableRow key={member.id} className="group">
								<TableCell className="font-medium">
									{member.email}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
										<ConfirmationDialog
											onConfirm={() => deleteMember.mutateAsync({ id: member.id, orgId })}
										>
											<Button
												variant="ghost"
												size="icon"
												disabled={deleteMember.isPending}
												className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
												title={t("Delete member")}
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
				total={members?.total || 0}
				perPage={members?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
