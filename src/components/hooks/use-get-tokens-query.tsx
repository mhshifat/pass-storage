import { tokenApiService } from '@/services/token';
import { useQuery } from '@tanstack/react-query';

export default function useGetTokensQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-tokens`, params],
    queryFn: async () => {
      const data = await tokenApiService.find(params);
      return data;
    },
  })
}
