import { TemporaryPasswordShareView } from "@/modules/passwords/client/temporary-share-view"

export default async function SharePasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params
  return <TemporaryPasswordShareView token={resolvedParams.token} />
}

