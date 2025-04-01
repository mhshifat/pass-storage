import { cn } from "@/lib/utils";
import { HTMLAttributes, PropsWithChildren } from "react";

export default function Container({ children, className, ...restProps }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("max-w-[65rem] mx-auto py-10 px-4", className)} {...restProps}>
      {children}
    </div>
  )
}
