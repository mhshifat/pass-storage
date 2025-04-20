import { ReactNode, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import Translate from "./translate";

interface ConfirmationDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  children: ReactNode;
}

export default function ConfirmationDialog({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><Translate>{title}</Translate></AlertDialogTitle>
          <AlertDialogDescription><Translate>{description}</Translate></AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}><Translate>{cancelText}</Translate></AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}><Translate>{confirmText}</Translate></AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
