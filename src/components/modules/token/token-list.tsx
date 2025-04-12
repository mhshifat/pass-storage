"use client";

import useCopyToClipboard from "@/components/hooks/use-copy-to-clipboard";
import useGetTokensQuery from "@/components/hooks/use-get-tokens-query";
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
import TOTPView from "./totp-view";
import { EditTokenDialog } from "./edit-token-dialog";
import useDeleteTokenMutation from "@/components/hooks/use-delete-token-mutation";
import { ShareTokenDialog } from "./share-token-dialog";
import { useAuth } from "@/components/providers/auth";
import { Badge } from "@/components/ui/badge";

export default function TokenList() {
  const { user } = useAuth();
	const copyToClipboard = useCopyToClipboard();
	const deleteToken = useDeleteTokenMutation();
	const [page, setPage] = useState(1);
	const { data: tokens, isLoading } = useGetTokensQuery({
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
							<TableHead className="w-[120px]">Username</TableHead>
							<TableHead className="w-[100px]">Password</TableHead>
							<TableHead className="w-[100px]">URL</TableHead>
							<TableHead className="w-[100px]">TOTP</TableHead>
							<TableHead className="w-[100px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tokens?.data?.map((token) => (
							<TableRow key={token.id} className="group">
								<TableCell className="font-medium">
									{token.name}
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex items-center">
                    <Button
                      className="p-0"
                      variant="ghost"
                      onClick={() => copyToClipboard(token.username)}
                      title="Copy"
                    >
                      {token.username}
                    </Button>
                  </div>
								</TableCell>
								<TableCell className="font-medium">
                  <div className="flex items-center">
                    <Button
                      className="p-0"
                      variant="ghost"
                      onClick={() => copyToClipboard(token.password)}
                      title="Copy"
                    >
                      {token.password}
                    </Button>
                  </div>
								</TableCell>
								<TableCell className="font-medium">
                  <div className="flex items-center">
                    <Button
                      className="p-0"
                      variant="ghost"
                      onClick={() => copyToClipboard(token.serviceUrl)}
                      title="Copy"
                    >
                      {token.serviceUrl}
                    </Button>
                  </div>
								</TableCell>
                <TableCell className="font-medium">
                  <TOTPView token={token} />
                </TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
										{user?.id === token.userId ? (
                      <>
                        <ShareTokenDialog token={token} />
                        <EditTokenDialog token={token} />
                        <ConfirmationDialog
                          onConfirm={() => deleteToken.mutateAsync({ id: token.id })}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteToken.isPending}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete collection"
                          >
                            <Trash2Icon size={16} />
                          </Button>
                        </ConfirmationDialog>
                      </>
                    ) : <Badge variant="outline">Shared</Badge>}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<PaginationView
				page={page}
				total={tokens?.total || 0}
				perPage={tokens?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
