import { toast } from "@/lib/toast";
import { InviteMemberFormPayload } from "@/lib/types";
import { invitationApiService } from "@/services/invitation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = void;
type RequestType = InviteMemberFormPayload;

export default function useAddInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      await invitationApiService.create(json);
    },
    onSuccess: () => {
      toast.success("Successfully sent the invitation!");
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-invitations");
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
