import Image from "next/image"

export function MfaSetupQr({ qr }: { qr: string | null }) {
  if (!qr) return null
  return (
        <div>
            <Image width={228} height={228} src={qr} alt="MFA QR Code" className="mx-auto mb-4" />
        </div>
    )
}
