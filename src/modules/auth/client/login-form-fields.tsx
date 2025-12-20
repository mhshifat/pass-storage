"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Lock, Mail, AlertCircle } from "lucide-react"

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("errors.invalidEmail")),
    password: z.string().min(1, t("errors.passwordRequired")),
  })
}

interface LoginFormFieldsProps {
  formAction: (payload: FormData) => void
  isPending: boolean
  state: { error?: string; fieldErrors?: { [key: string]: string } } | null
}

export function LoginFormFields({ formAction, isPending, state }: LoginFormFieldsProps) {
  const { t } = useTranslation()
  const loginSchema = createLoginSchema(t)
  type LoginFormValues = z.infer<typeof loginSchema>
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Sync server errors to form state
  useEffect(() => {
    if (state?.error) {
      form.setError("root", {
        type: "server",
        message: state.error,
      })
    }
    
    // Set field-specific errors
    if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof LoginFormValues, {
          type: "server",
          message,
        })
      })
    }
  }, [state, form])

  return (
    <Form {...form}>
      <form action={formAction} id="login-form">
        {form.formState.errors.root && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.email")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      className="pl-10"
                      disabled={isPending}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      disabled={isPending}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form submit is handled by the parent component */}
      </form>
    </Form>
  )
}
