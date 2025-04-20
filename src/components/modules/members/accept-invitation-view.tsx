"use client";

import useAcceptInvitationMutation from "@/components/hooks/use-accept-invitation-mutation";
import { useAuth } from "@/components/providers/auth";
import Translate from "@/components/shared/translate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_PATHS } from "@/lib/constants";
import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface AcceptInvitationViewProps {
  code: string;
}

export default function AcceptInvitationView({ code }: AcceptInvitationViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const acceptInvite = useAcceptInvitationMutation();

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Card className="min-w-[300px]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ShieldCheckIcon className="h-10 w-10" />
          </div>
          <CardTitle><Translate>Organization Invitation</Translate></CardTitle>
          <CardDescription>
            {t("You've")} <Translate>been invited to join an organization</Translate>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.id ? (
            <Button
              className="w-full"
              onClick={() => acceptInvite.mutateAsync({ code }).then(() => router.push(ROUTE_PATHS.DASHBOARD))}
              disabled={acceptInvite.isPending}
              loading={acceptInvite.isPending}
            >
              <Translate>Accept Invitation</Translate>
            </Button>
          ) : (
            <div className="space-y-3">
              <Translate as="p" className="text-center text-sm text-muted-foreground mb-2">
                You need to sign in or create an account to accept this invitation.
              </Translate>
              <Button
                className="w-full"
                disabled={acceptInvite.isPending}
              >
                <Link href={ROUTE_PATHS.SIGN_IN}><Translate>Sign In</Translate></Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={acceptInvite.isPending}
              >
                <Link href={ROUTE_PATHS.SIGN_UP}><Translate>Create Account</Translate></Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
