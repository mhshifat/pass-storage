import { AuthCard } from "@/modules/auth/client/auth-card"
import { LoginForm } from "@/modules/auth/client/login-form"

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account"
    >
      <LoginForm />
    </AuthCard>
  )
}
