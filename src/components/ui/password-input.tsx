"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onGenerate?: () => void
  showGenerateButton?: boolean
}

/**
 * Generates a strong password with:
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * - Default length: 16 characters
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?"
  const allChars = lowercase + uppercase + numbers + special

  let password = ""

  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password to avoid predictable pattern
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")

  return password
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onGenerate, showGenerateButton = true, type = "password", ...props }, ref) => {
    const handleGenerate = () => {
      if (onGenerate) {
        onGenerate()
      }
    }

    if (!showGenerateButton) {
      return <Input ref={ref} type={type} className={className} {...props} />
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={type}
          className={cn("pr-10", className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleGenerate}
          disabled={props.disabled}
          title="Generate strong password"
        >
          <Key className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
