import { InboxIcon } from "lucide-react";
import { ReactElement } from "react";

interface EmptyListProps {
  title: string;
  description: string;
  createBtn: ReactElement;
}

export default function EmptyList({ title, description, createBtn }: EmptyListProps) {
  return (
    <div className="flex flex-col justify-center items-center bg-muted py-12 px-2.5 rounded-lg">
      <span className="w-20 h-20 bg-background flex items-center justify-center rounded-full">
        <InboxIcon className="size-8" />
      </span>
      <div className="flex flex-col gap-3 justify-center items-center mt-5">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {createBtn}
    </div>
  )
}
