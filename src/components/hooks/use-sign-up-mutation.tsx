import { toast } from "@/lib/toast";
import { SignUpDto, SignUpFormPayload } from "@/lib/types";
import { authApiService } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = SignUpDto;
type RequestType = SignUpFormPayload;

export default function useSignUpMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const data = await authApiService.signUp(json);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully created an account!");
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-me");
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
