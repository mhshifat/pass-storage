import { toast } from "@/lib/toast";
import { ShareTokenFormPayload } from "@/lib/types";
import { tokenApiService } from "@/services/token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = void;
type RequestType = Partial<ShareTokenFormPayload>;

export default function useShareTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (values) => {
      await tokenApiService.share(values);
    },
    onSuccess: () => {
      toast.success("Successfully shared the token!");
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
