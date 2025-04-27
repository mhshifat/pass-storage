"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MailIcon } from "lucide-react";
import { useRef, useState } from "react";
import InviteMemberForm from "./invite-member-form";
import useAddInvitationMutation from "@/components/hooks/use-add-invitation-mutation";
import Translate from "@/components/shared/translate";

interface InviteMemberDialogProps {
  variant?: "link" | "outline" | "default" | "primary" | "destructive" | "secondary" | "ghost" | null | undefined
}

export default function InviteMemberDialog({ variant }: InviteMemberDialogProps) {
  const isMobile = useIsMobile();
  const inviteMember = useAddInvitationMutation();
  const [open, setOpen] = useState(false);

  const formRef = useRef<{ onSubmit: () => Promise<void> }>({
    onSubmit: async () => {}
  });

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
      <Button variant={variant || "outline"}>
        <MailIcon className="h-4 w-4 mr-2" />
        <Translate>Invite Member</Translate>
      </Button>
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent><Translate>Invite Member</Translate></DialogTitleComponent>
					<DialogDescriptionComponent>
						<Translate>Add a new member</Translate>.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={inviteMember.isPending} />
				</DialogHeaderComponent>

				<InviteMemberForm
          ref={formRef}
          onSubmit={(values) => inviteMember.mutateAsync(values).then(() => setOpen(false))}
        />

				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={inviteMember.isPending} variant="outline" className="w-full">
								<Translate>Cancel</Translate>
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={inviteMember.isPending} variant="outline" onClick={() => setOpen(false)}>
							<Translate>Cancel</Translate>
						</Button>
					)}
					<Button
						type="button"
            onClick={() => formRef.current?.onSubmit()}
            disabled={inviteMember.isPending}
            loading={inviteMember.isPending}
					>
						<Translate>Add Member</Translate>
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
  )
}
