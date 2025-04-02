"use client";

import useAddOrganizationMutation from "@/components/hooks/use-add-organization-mutation";
import { useIsMobile } from "@/components/hooks/use-mobile";
import useUpdateOrganizationMutation from "@/components/hooks/use-update-organization-mutation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { IOrganization } from "@/lib/types";
import { EditIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import OrganizationForm from "./organization-form";

interface AddEditOrganizationDialogProps {
  organization?: IOrganization;
}

export default function AddEditOrganizationDialog({ organization }: AddEditOrganizationDialogProps) {
  const isMobile = useIsMobile();
  const addOrganization = useAddOrganizationMutation();
  const updateOrganization = useUpdateOrganizationMutation();
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
			<DialogTriggerComponent disabled={addOrganization.isPending} asChild>
				{ organization?.id ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit collection"
            disabled={updateOrganization.isPending}
          >
            <EditIcon size={16} />
          </Button>
        ) : (
          <Button variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        ) }
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent>{organization?.id ? "Edit" : "Add New"} Organization</DialogTitleComponent>
					<DialogDescriptionComponent>
						{organization?.id ? "Edit" : "Add a new"} organization.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={addOrganization.isPending || updateOrganization.isPending} />
				</DialogHeaderComponent>

				<OrganizationForm
          ref={formRef}
          onCreate={(values) => addOrganization.mutateAsync(values).then(() => setOpen(false))}
          onUpdate={(values) => updateOrganization.mutateAsync(values).then(() => setOpen(false))}
          organization={organization}
        />

				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={addOrganization.isPending || updateOrganization.isPending} variant="outline" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={addOrganization.isPending || updateOrganization.isPending} variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
					)}
					<Button
						type="button"
            onClick={() => formRef.current?.onSubmit()}
            disabled={addOrganization.isPending || updateOrganization.isPending}
            loading={addOrganization.isPending || updateOrganization.isPending}
					>
						{organization?.id ? "Save Changes" : "Add Organization"}
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
  )
}
