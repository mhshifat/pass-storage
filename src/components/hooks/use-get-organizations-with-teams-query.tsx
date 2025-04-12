import { organizationApiService } from '@/services/organization';
import { useQuery } from '@tanstack/react-query';

export default function useGetOrganizationsWithTeamsQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-organizations-with-teams`, params],
    queryFn: async () => {
      const data = await organizationApiService.find({
        ...params,
        teams: true
      });
      return data;
    },
  })
}
