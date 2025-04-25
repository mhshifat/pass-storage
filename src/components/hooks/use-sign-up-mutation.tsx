import { toast } from "@/lib/toast";
import { SignUpDto, SignUpFormPayloadWithEncryptedData } from "@/lib/types";
import { authApiService } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type ResponseType = SignUpDto;
type RequestType = SignUpFormPayloadWithEncryptedData;

export default function useSignUpMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const data = await authApiService.signUp(json);
      return data || {};
    },
    onSuccess: () => {
      toast.success(t("Successfully created an account!"));
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-me");
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
