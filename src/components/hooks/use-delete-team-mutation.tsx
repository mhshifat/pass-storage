import { toast } from "@/lib/toast";
import { ITeam } from "@/lib/types";
import { teamApiService } from "@/services/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = ITeam;
type RequestType = { id: string, orgId: string };

export default function useDeleteTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ id, orgId }) => {
      const data = await teamApiService.delete(id, { orgId });
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully deleted the team!");
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-teams");
        }
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message || "Something went wrong!");
      } else {
        toast.error(err?.message || "Something went wrong!");
      }
    },
  })
}
