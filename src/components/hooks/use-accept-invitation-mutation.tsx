import { toast } from "@/lib/toast";
import { AcceptInviteFormPayload } from "@/lib/types";
import { invitationApiService } from "@/services/invitation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type ResponseType = void;
type RequestType = AcceptInviteFormPayload;

export default function useAcceptInvitationMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      await invitationApiService.accept(json);
    },
    onSuccess: () => {
      toast.success(t("Invitation accepted!"));
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-invitations");
        }
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(t(err?.response?.data?.message) || t("Something went wrong!"));
      } else {
        toast.error(t(err?.message) || t("Something went wrong!"));
      }
    },
  })
}
