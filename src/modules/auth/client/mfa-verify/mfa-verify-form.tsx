"use client"

import { useState, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { MfaVerifyAlert } from "./mfa-verify-alert"
import { verifyMfaAction } from "@/app/(auth-mfa)/mfa-verify/actions"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel, FormDescription } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/trpc/client"
import { Separator } from "@/components/ui/separator"

export function createMfaVerifyFormSchema(t: (key: string) => string) {
  return z.object({
    code: z.string().min(1, t("mfa.codeRequired")),
  })
}

export function MfaVerifyForm() {
  const { t } = useTranslation()
  const router = useRouter();
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<"code" | "recovery">("code")
  const verifyRecoveryCode = trpc.auth.verifyRecoveryCode.useMutation({
    onSuccess: () => {
      router.push("/admin")
    },
    onError: (error) => {
      setError(error.message || "Invalid recovery code")
    },
  })

  const mfaVerifyFormSchema = createMfaVerifyFormSchema(t)
  type MfaVerifyFormData = z.infer<typeof mfaVerifyFormSchema>

  const form = useForm<MfaVerifyFormData>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      code: "",
    },
    resolver: zodResolver(mfaVerifyFormSchema),
  })

  async function handleSubmit(values: MfaVerifyFormData) {
    setError(null)
    
    if (tab === "recovery") {
      // Handle recovery code verification via tRPC
      // Remove dashes and normalize to uppercase
      const normalizedCode = values.code.replace(/-/g, "").toUpperCase()
      verifyRecoveryCode.mutate({ code: normalizedCode })
      return
    }

    // Handle regular MFA code verification
    const formData = new FormData()
    formData.append("code", values.code)
    formData.append("useRecoveryCode", "false")
    startTransition(async () => {
      const res = await verifyMfaAction(null, formData)
      if (!res.success) {
        setError(res.error || t("mfa.invalidCode"))
      } else {
         router.push("/admin");
      }
    })
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "code" | "recovery")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">{t("mfa.mfaCode")}</TabsTrigger>
                <TabsTrigger value="recovery">{t("mfa.recoveryCode")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mfa.enterCode")}</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6} 
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          {...field}
                        >
                          <InputOTPGroup
                            className="[&>div]:flex-1 w-full"
                          >
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="recovery" className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mfa.enterRecoveryCode")}</FormLabel>
                      <FormDescription>
                        {t("mfa.recoveryCodeFormat")}
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="XXXX-XXXX-XXXX"
                          {...field}
                          className="font-mono uppercase"
                          maxLength={14}
                          onChange={(e) => {
                            // Format as XXXX-XXXX-XXXX
                            let value = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase()
                            if (value.length > 4) {
                              value = value.slice(0, 4) + "-" + value.slice(4, 8)
                            }
                            if (value.length > 9) {
                              value = value.slice(0, 9) + "-" + value.slice(9, 13)
                            }
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <MfaVerifyAlert error={error} />
            <Button type="submit" className="w-full" disabled={isPending || verifyRecoveryCode.isPending}>
                {isPending || verifyRecoveryCode.isPending ? t("mfa.verifying") : t("mfa.verifyCode")}
            </Button>
        </form>
    </Form>
  )
}
