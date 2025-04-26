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
import { useCallback, useMemo, useState } from "react";
import TOTPView from "./totp-view";
import { EditTokenDialog } from "./edit-token-dialog";
import useDeleteTokenMutation from "@/components/hooks/use-delete-token-mutation";
import { ShareTokenDialog } from "./share-token-dialog";
import { useAuth } from "@/components/providers/auth";
import { Badge } from "@/components/ui/badge";
import Translate from "@/components/shared/translate";
import { useTranslation } from "react-i18next";
import { decryptEntry, decryptVaultKey, encryptEntry } from "@/lib/encryption";
import { IToken, ITokenFormPayload } from "@/lib/types";
import { toast } from "@/lib/toast";
import useShareTokenMutation from "@/components/hooks/use-share-token-mutation";

export default function TokenList() {
	const { user, vaultKey } = useAuth();
	const copyToClipboard = useCopyToClipboard();
	const { t } = useTranslation();
	const deleteToken = useDeleteTokenMutation();
  const shareToken = useShareTokenMutation();
	const [page, setPage] = useState(1);
	const { data: tokens, isLoading } = useGetTokensQuery({
		params: {
			page: String(page),
		},
	});
	const decryptTokenEntry = useCallback(
		(token: IToken) => {
			const payloadToken = token;
			let vaultKeyToUse = vaultKey;
			if (token?.teamId) {
				const teamVault = user?.vaultKeys.find(
					(key) => key.teamId === token.teamId
				);
				if (!teamVault) throw new Error("Invalid team vault");
				const teamVaultKey = decryptVaultKey(
					teamVault.encryptedVaultKey,
					teamVault.teamId,
					teamVault.salt,
					teamVault.vaultKeyIv
				);
				vaultKeyToUse = teamVaultKey;
			}
			const tokenData = decryptEntry(
				payloadToken.entry,
				vaultKeyToUse!,
				payloadToken.iv
			);
			try {
				const data = JSON.parse(tokenData);
				return { ...token, ...data } as ITokenFormPayload;
			} catch (err) {
				console.log(err);
				return null;
			}
		},
		[vaultKey, user]
	);
	const parsedTokens = useMemo(() => {
		return tokens?.data
			?.map((token) => ({
				...decryptTokenEntry(token),
				teamId: token.teamId,
				team: token.team,
			}))
			?.filter(Boolean) as ITokenFormPayload[];
	}, [decryptTokenEntry, tokens?.data]);

  async function handleRemoveTeam(id: string, token: string) {
    if (!user) return toast.error("Something went wrong");
    const encryptedToken = encryptEntry(token, vaultKey!);

    await shareToken.mutateAsync({
      id,
      teamId: "",
      entry: encryptedToken.encryptedEntry,
      iv: encryptedToken.iv,
    });
  }
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
							<TableHead className="w-[200px]">
								<Translate>Name</Translate>
							</TableHead>
							<TableHead className="w-[120px]">
								<Translate>Username</Translate>
							</TableHead>
							<TableHead className="w-[100px]">
								<Translate>Password</Translate>
							</TableHead>
							<TableHead className="w-[100px]">
								<Translate>URL</Translate>
							</TableHead>
							<TableHead className="w-[100px]">
								<Translate>TOTP</Translate>
							</TableHead>
							<TableHead className="w-[100px]">
								<Translate>Team</Translate>
							</TableHead>
							<TableHead className="w-[100px] text-right">
								<Translate>Actions</Translate>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{parsedTokens?.map((token) => (
							<TableRow key={token.id} className="group">
								<TableCell className="font-medium">{token.name}</TableCell>
								<TableCell className="font-medium">
									<div className="flex items-center">
										<Button
											className="p-0"
											variant="ghost"
											onClick={() => copyToClipboard(token.username)}
											title={t("Copy")}
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
											title={t("Copy")}
										>
											{token.password
												?.split("")
												.map(() => "*")
												.join("")}
										</Button>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex items-center">
										<Button
											className="p-0"
											variant="ghost"
											onClick={() => copyToClipboard(token.serviceUrl)}
											title={t("Copy")}
										>
											{token.serviceUrl}
										</Button>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<TOTPView token={token} />
								</TableCell>
								<TableCell className="font-medium">
									{token?.teamId ? (
										<Badge
											variant="secondary"
											className="flex items-center gap-2"
										>
											{token?.team?.name}
											{user?.id === token.userId && <Button
												title={t("Remove team")}
												disabled={shareToken.isPending}
												loading={shareToken.isPending}
												onClick={() => handleRemoveTeam(token.id, JSON.stringify({
                          ...token,
                          id: undefined,
                          entry: undefined,
                          iv: undefined,
                          userId: undefined,
                        }))}
												variant="ghost"
												size="none"
											>
												<Trash2Icon className="size-4" />
											</Button>}
										</Badge>
									) : (
										"N/A"
									)}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end space-x-2">
										{user?.id === token.userId ? (
											<>
												{!token.teamId && <ShareTokenDialog token={token} />}
												<EditTokenDialog token={token} />
												<ConfirmationDialog
													onConfirm={() =>
														deleteToken.mutateAsync({ id: token.id })
													}
												>
													<Button
														variant="ghost"
														size="icon"
														disabled={deleteToken.isPending}
														className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
														title={t("Delete collection")}
													>
														<Trash2Icon size={16} />
													</Button>
												</ConfirmationDialog>
											</>
										) : (
											<Badge variant="outline">
												<Translate>Shared</Translate>
											</Badge>
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
				total={tokens?.total || 0}
				perPage={tokens?.perPage || 10}
				onPagination={(page) => setPage(page)}
			/>
		</RenderView>
	);
}
