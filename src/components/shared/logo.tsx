import { ROUTE_PATHS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "md";
}

export default function Logo({ size }: LogoProps) {
  return (
    <Link
      href={ROUTE_PATHS.DASHBOARD}
      className="flex items-center gap-1"
    >
      <ShieldCheckIcon className={cn("h-7 w-7", {
        "w-6 h-6": size === "md"
      })} />
      <span className={cn("text-2xl font-bold", {
        "text-lg font-semibold": size === "md"
      })}>PassStorage</span>
    </Link>
  )
}
