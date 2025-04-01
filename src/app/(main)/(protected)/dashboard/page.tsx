import { AddTokenDialog } from "@/components/modules/token/add-token-dialog";
import TokenList from "@/components/modules/token/token-list";
import Container from "@/components/shared/container";

export default function DashboardPage() {
  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Personal Tokens</h3>
          <p className="text-sm font-normal">Secure TOTP Authentication Manager</p>
        </div>
        <AddTokenDialog />
      </div>

      <div className="mt-10">
        <TokenList />
      </div>
    </Container>
  )
}
