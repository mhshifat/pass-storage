"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { MfaVerifyAlert } from "./mfa-verify-alert"
import { verifyMfaAction } from "@/app/(auth-mfa)/mfa-verify/actions"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

const mfaVerifyFormSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

type MfaVerifyFormData = z.infer<typeof mfaVerifyFormSchema>;

export function MfaVerifyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    const formData = new FormData()
    formData.append("code", values.code)
    startTransition(async () => {
      const res = await verifyMfaAction(null, formData)
      if (!res.success) {
        setError(res.error || "Invalid code")
      } else {
         router.push("/admin");
      }
    })
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
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
            <MfaVerifyAlert error={error} />
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Verifying..." : "Verify MFA"}
            </Button>
        </form>
    </Form>
  )
}
