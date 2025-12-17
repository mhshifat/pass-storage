"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { LoginFormFields } from "./login-form-fields"
import { loginAction } from "@/app/(auth)/login/actions"
import Link from "next/link"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <>
      <CardContent>
        <LoginFormFields formAction={formAction} isPending={isPending} state={state} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isPending} form="login-form">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
        <div className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </>
  )
}
