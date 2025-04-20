import { toast } from "@/lib/toast";
import { InviteMemberFormPayload } from "@/lib/types";
import { invitationApiService } from "@/services/invitation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type ResponseType = void;
type RequestType = InviteMemberFormPayload;

export default function useAddInvitationMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      await invitationApiService.create(json);
    },
    onSuccess: () => {
      toast.success(t("Successfully sent the invitation!"));
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-invitations");
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
