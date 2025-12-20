import { AuthCard } from "@/modules/auth/client/auth-card"
import { RegisterForm } from "@/modules/auth/client/register-form"
import { RegisterPageHeader } from "./register-page-header"

export default function RegisterPage() {
  return (
    <RegisterPageHeader>
      <RegisterForm />
    </RegisterPageHeader>
  )
}
