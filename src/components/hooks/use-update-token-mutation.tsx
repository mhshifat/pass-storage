import { toast } from "@/lib/toast";
import { AddTokenFormPayload, IToken } from "@/lib/types";
import { tokenApiService } from "@/services/token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type ResponseType = IToken;
type RequestType = Partial<AddTokenFormPayload> & { id: string };

export default function useUpdateTokenMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({id, ...json}) => {
      const data = await tokenApiService.update(id, json);
      return data || {};
    },
    onSuccess: () => {
      toast.success(t("Successfully updated the token!"));
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-tokens");
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
