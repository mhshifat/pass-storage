import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PropsWithChildren, ReactNode } from "react"

interface ModalProps {
    title: ReactNode;
    description: ReactNode;
    trigger: ReactNode;
    showFooter?: boolean;
}

export function Modal({ children, title, description, trigger, showFooter = false }: PropsWithChildren<ModalProps>) {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                    {showFooter && (
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </form>
        </Dialog>
    )
}
