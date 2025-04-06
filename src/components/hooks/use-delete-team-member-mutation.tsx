import { toast } from "@/lib/toast";
import { ITeamMember } from "@/lib/types";
import { teamMemberApiService } from "@/services/team-member";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = ITeamMember;
type RequestType = { id: string, orgId: string; teamId: string };

export default function useDeleteTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ id, orgId, teamId }) => {
      const data = await teamMemberApiService.delete(id, { orgId, teamId });
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully deleted the team member!");
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
