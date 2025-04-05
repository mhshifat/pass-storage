"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Share2Icon } from "lucide-react";
import { useState } from "react";
import useAddInvitationMutation from "@/components/hooks/use-add-invitation-mutation";
import { Input } from "@/components/ui/input";
import { IInvitation } from "@/lib/types";
import useCopyToClipboard from "@/components/hooks/use-copy-to-clipboard";

interface ShareInvitationDialogProps {
  invitation: IInvitation;
}

export default function ShareInvitationDialog({ invitation }: ShareInvitationDialogProps) {
  const isMobile = useIsMobile();
  const inviteMember = useAddInvitationMutation();
  const copyToClipboard = useCopyToClipboard();
  const [open, setOpen] = useState(false);

  const inviteLink = `${process.env.NEXT_PUBLIC_CLIENT_URL}/share/${invitation.id}`;

  const DialogComponent = isMobile ? Drawer : Dialog;
	const DialogTriggerComponent = isMobile ? DrawerTrigger : DialogTrigger;
	const DialogContentComponent = isMobile ? DrawerContent : DialogContent;
	const DialogHeaderComponent = isMobile ? DrawerHeader : DialogHeader;
	const DialogFooterComponent = isMobile ? DrawerFooter : DialogFooter;
	const DialogTitleComponent = isMobile ? DrawerTitle : DialogTitle;
	const DialogDescriptionComponent = isMobile
		? DrawerDescription
		: DialogDescription;
	const DialogCloseComponent = isMobile ? DrawerClose : "button";

  return (
    <DialogComponent open={open} onOpenChange={setOpen}>
			<DialogTriggerComponent disabled={inviteMember.isPending} asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Share link"
        >
          <Share2Icon size={16} />
        </Button>
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent>Share Invitation</DialogTitleComponent>
					<DialogDescriptionComponent>
						Share link to someone.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={inviteMember.isPending} />
				</DialogHeaderComponent>

				<Input value={inviteLink} readOnly />

				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={inviteMember.isPending} variant="outline" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={inviteMember.isPending} variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
					)}
					<Button
						type="button"
            onClick={() => copyToClipboard(inviteLink)}
            disabled={inviteMember.isPending}
            loading={inviteMember.isPending}
					>
						Copy
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
  )
}
