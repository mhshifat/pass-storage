"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { RegisterFormFields } from "./register-form-fields"
import { registerAction } from "@/app/(auth)/register/actions"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export function RegisterForm() {
  const { t } = useTranslation()
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <>
      <CardContent>
        <RegisterFormFields formAction={formAction} isPending={isPending} state={state} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isPending} form="register-form">
          {isPending ? t("auth.signingUp") : t("auth.createAccount")}
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t("auth.login")}
          </Link>
        </div>
      </CardFooter>
    </>
  )
}
