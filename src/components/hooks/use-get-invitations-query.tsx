import { invitationApiService } from '@/services/invitation';
import { useQuery } from '@tanstack/react-query';

export default function useGetInvitationsQuery({
  params,
}: {
  params: Record<string, string>,
}) {
  return useQuery({
    queryKey: [`get-invitations`, params],
    queryFn: async () => {
      const data = await invitationApiService.find(params);
      return data;
    },
  })
}
