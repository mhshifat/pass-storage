import { toast } from "@/lib/toast";
import { IToken } from "@/lib/types";
import { tokenApiService } from "@/services/token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = IToken;
type RequestType = { id: string };

export default function useDeleteTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const data = await tokenApiService.delete(id);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully deleted the token!");
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-tokens");
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
