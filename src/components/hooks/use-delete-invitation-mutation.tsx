import { toast } from "@/lib/toast";
import { IInvitation } from "@/lib/types";
import { invitationApiService } from "@/services/invitation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = IInvitation;
type RequestType = { id: string, orgId: string };

export default function useDeleteInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ id, orgId }) => {
      const data = await invitationApiService.delete(id, { orgId });
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully deleted the invitation!");
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
