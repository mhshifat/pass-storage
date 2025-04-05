import { memberApiService } from '@/services/member';
import { useQuery } from '@tanstack/react-query';

export default function useGetMembersQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-members`, params],
    queryFn: async () => {
      const data = await memberApiService.find(params);
      return data;
    },
  })
}
