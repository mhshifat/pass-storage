import { AuthCard } from "@/modules/auth/client/auth-card"
import { LoginForm } from "@/modules/auth/client/login-form"
import { LoginPageHeader } from "./login-page-header"

export default function LoginPage() {
  return (
    <LoginPageHeader>
      <LoginForm />
    </LoginPageHeader>
  )
}
