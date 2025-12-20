"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { RegisterFormFields } from "./register-form-fields"
import { registerAction } from "@/app/(auth)/register/actions"
import { useTranslation } from "react-i18next"
import { CompanyLoginDialog } from "./company-login-dialog"

export function RegisterForm() {
  const { t } = useTranslation()
  const [state, formAction, isPending] = useActionState(registerAction, null)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)

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
          <button
            type="button"
            onClick={() => setShowCompanyDialog(true)}
            className="text-primary hover:underline font-medium"
          >
            {t("auth.login")}
          </button>
        </div>
      </CardFooter>
      <CompanyLoginDialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog} />
    </>
  )
}
