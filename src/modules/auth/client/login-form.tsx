"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { LoginFormFields } from "./login-form-fields"
import { loginAction } from "@/app/(auth)/login/actions"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export function LoginForm() {
  const { t } = useTranslation()
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <>
      <CardContent>
        <LoginFormFields formAction={formAction} isPending={isPending} state={state} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isPending} form="login-form">
          {isPending ? t("auth.signingIn") : t("auth.login")}
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          {t("auth.dontHaveAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            {t("auth.register")}
          </Link>
        </div>
      </CardFooter>
    </>
  )
}
