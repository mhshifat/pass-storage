import { teamApiService } from '@/services/team';
import { useQuery } from '@tanstack/react-query';

export default function useGetTeamsQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-teams`, params],
    queryFn: async () => {
      const data = await teamApiService.find(params);
      return data;
    },
  })
}
