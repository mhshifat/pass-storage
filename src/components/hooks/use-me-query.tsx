import { authApiService } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function useMeQuery() {
  const pathname = usePathname();
  const pathnameRef = useRef("");

  return useQuery({
    queryKey: ["get-me"],
    queryFn: async () => {
      try {
        const data = await authApiService.getMe();
        pathnameRef.current = pathname;
        return data;
      } catch (err) {
        console.log(err);
        pathnameRef.current = pathname;
        return null;
      }
    },
    enabled: pathnameRef.current !== pathname
  })
}
