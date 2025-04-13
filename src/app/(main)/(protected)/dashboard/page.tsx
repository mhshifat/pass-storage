import { AddTokenDialog } from "@/components/modules/token/add-token-dialog";
import TokenList from "@/components/modules/token/token-list";
import Container from "@/components/shared/container";
import Translate from "@/components/shared/translate";

export default function DashboardPage() {
  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Translate as="h3" className="text-2xl font-semibold">Personal Tokens</Translate>
          <Translate as="p" className="text-sm font-normal">Secure TOTP Authentication Manager</Translate>
        </div>
        <AddTokenDialog />
      </div>

      <div className="mt-10">
        <TokenList />
      </div>
    </Container>
  )
}
