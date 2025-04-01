import { toast } from "@/lib/toast";
import { AddTokenFormPayload, IToken } from "@/lib/types";
import { tokenApiService } from "@/services/token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = IToken;
type RequestType = Partial<AddTokenFormPayload> & { id: string };

export default function useUpdateTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({id, ...json}) => {
      const data = await tokenApiService.update(id, json);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully updated the token!");
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
