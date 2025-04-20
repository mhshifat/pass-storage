import { toast } from "@/lib/toast";
import { AddTeamMemberFormPayload } from "@/lib/types";
import { teamMemberApiService } from "@/services/team-member";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type ResponseType = void;
type RequestType = AddTeamMemberFormPayload;

export default function useAddTeamMemberMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      await teamMemberApiService.create(json);
    },
    onSuccess: () => {
      toast.success(t("Successfully added a member to the team!"));
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-teams");
        }
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(t(err?.response?.data?.message || "Something went wrong!"));
      } else {
        toast.error(t(err?.message || "Something went wrong!"));
      }
    },
  })
}
