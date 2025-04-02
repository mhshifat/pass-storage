import { toast } from "@/lib/toast";
import { IOrganization } from "@/lib/types";
import { organizationApiService } from "@/services/organization";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ResponseType = IOrganization;
type RequestType = { id: string };

export default function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const data = await organizationApiService.delete(id);
      return data || {};
    },
    onSuccess: () => {
      toast.success("Successfully deleted the organization!");
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
