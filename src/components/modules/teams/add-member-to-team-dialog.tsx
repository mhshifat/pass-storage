"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import AddMemberToTeamForm from "./add-member-to-team-form";
import useAddTeamMemberMutation from "@/components/hooks/use-add-team-member-mutation";

export default function AddMemberToTeamDialog() {
  const isMobile = useIsMobile();
  const addTeamMember = useAddTeamMemberMutation();
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
			<DialogTriggerComponent disabled={addTeamMember.isPending} asChild>
      <Button variant="outline">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Member to Team
      </Button>
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent>Add Member to Team</DialogTitleComponent>
					<DialogDescriptionComponent>
						Assign an existing member to a team.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={addTeamMember.isPending} />
				</DialogHeaderComponent>

				<AddMemberToTeamForm
          ref={formRef}
          onSubmit={(values) => addTeamMember.mutateAsync(values).then(() => setOpen(false))}
        />

				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={addTeamMember.isPending} variant="outline" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={addTeamMember.isPending} variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
					)}
					<Button
						type="button"
            onClick={() => formRef.current?.onSubmit()}
            disabled={addTeamMember.isPending}
            loading={addTeamMember.isPending}
					>
						Add Team Member
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
  )
}
