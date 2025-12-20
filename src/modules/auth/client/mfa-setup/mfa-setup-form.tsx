"use client"

import { useState, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { MfaSetupAlert } from "./mfa-setup-alert"
import { setupMfaAction } from "@/app/(auth-mfa)/mfa-setup/actions"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

export function createMfaFormSchema(t: (key: string) => string) {
  return z.object({
    code: z.string().length(6, t("mfa.codeMustBe6Digits")).regex(/^\d+$/, t("mfa.codeMustBeNumeric")),
  })
}

export function MfaSetupForm() {
    const { t } = useTranslation()
    const router = useRouter();
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition();
    const mfaFormSchema = createMfaFormSchema(t)
    type MfaFormData = z.infer<typeof mfaFormSchema>

    const form = useForm<MfaFormData>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            code: "",
        },
        resolver: zodResolver(mfaFormSchema),
    });

    async function handleSubmit(values: MfaFormData) {
        setError(null)
        setSuccess(false)
        const formData = new FormData()
        formData.append("code", values.code)
        startTransition(async () => {
            const res = await setupMfaAction(null, formData)
            if (res.success) {
                router.push("/admin");
            } else {
                setError(res.error || "Invalid code")
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
                <MfaSetupAlert error={error} success={success} />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? t("mfa.verifying") : t("mfa.verifyAndEnable")}
                </Button>
            </form>
        </Form>
    )
}
