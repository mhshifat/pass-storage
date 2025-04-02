import { toast } from "@/lib/toast";
import { AddOrganizationFormPayload, IOrganization } from "@/lib/types";
import { organizationApiService } from "@/services/organization";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = IOrganization;
type RequestType = AddOrganizationFormPayload;

export default function useAddOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const data = await organizationApiService.create(json);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully created a organization!");
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (query.queryKey?.[0] as string)?.startsWith("get-organizations");
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
