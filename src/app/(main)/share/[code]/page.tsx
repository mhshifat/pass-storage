import AcceptInvitationView from "@/components/modules/members/accept-invitation-view";
import Container from "@/components/shared/container";

export default async function ShareCodeDetails({ params }: { params: { code: string } }) {
  const { code } = await params;

  return (
    <Container>
      <AcceptInvitationView code={code} />
    </Container>
  )
}
