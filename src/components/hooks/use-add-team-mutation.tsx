import { toast } from "@/lib/toast";
import { AddTeamFormPayload, ITeam } from "@/lib/types";
import { teamApiService } from "@/services/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = ITeam;
type RequestType = AddTeamFormPayload;

export default function useAddTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const data = await teamApiService.create(json);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully created a team!");
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
