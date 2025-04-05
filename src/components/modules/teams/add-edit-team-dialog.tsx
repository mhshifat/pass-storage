"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ITeam } from "@/lib/types";
import { EditIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import TeamForm from "./team-form";
import useAddTeamMutation from "@/components/hooks/use-add-team-mutation";
import useUpdateTeamMutation from "@/components/hooks/use-update-team-mutation";

interface AddEditTeamDialogProps {
  team?: ITeam;
}

export default function AddEditTeamDialog({ team }: AddEditTeamDialogProps) {
  const isMobile = useIsMobile();
  const addTeam = useAddTeamMutation();
  const updateTeam = useUpdateTeamMutation();
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
			<DialogTriggerComponent disabled={addTeam.isPending} asChild>
				{ team?.id ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit collection"
            disabled={updateTeam.isPending}
          >
            <EditIcon size={16} />
          </Button>
        ) : (
          <Button variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        ) }
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent>{team?.id ? "Edit" : "Add New"} Team</DialogTitleComponent>
					<DialogDescriptionComponent>
						{team?.id ? "Edit" : "Add a new"} team.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={addTeam.isPending || updateTeam.isPending} />
				</DialogHeaderComponent>

				<TeamForm
          ref={formRef}
          onCreate={(values) => addTeam.mutateAsync(values).then(() => setOpen(false))}
          onUpdate={(values) => updateTeam.mutateAsync(values).then(() => setOpen(false))}
          team={team}
        />

				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={addTeam.isPending || updateTeam.isPending} variant="outline" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={addTeam.isPending || updateTeam.isPending} variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
					)}
					<Button
						type="button"
            onClick={() => formRef.current?.onSubmit()}
            disabled={addTeam.isPending || updateTeam.isPending}
            loading={addTeam.isPending || updateTeam.isPending}
					>
						{team?.id ? "Save Changes" : "Add Team"}
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
  )
}
