import { AuthCard } from "@/modules/auth/client/auth-card"
import { RegisterForm } from "@/modules/auth/client/register-form"

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Enter your information to get started"
    >
      <RegisterForm />
    </AuthCard>
  )
}
