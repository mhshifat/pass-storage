import { organizationApiService } from '@/services/organization';
import { useQuery } from '@tanstack/react-query';

export default function useGetOrganizationsQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-organizations`, params],
    queryFn: async () => {
      const data = await organizationApiService.find(params);
      return data;
    },
  })
}
