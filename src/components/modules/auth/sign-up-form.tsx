"use client";

import { useAuth } from "@/components/providers/auth";
import Translate from "@/components/shared/translate";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signUpFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function SignUpForm() {
  const { onRegister, loading } = useAuth();

	const form = useForm({
    resolver: zodResolver(signUpFormSchema)
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onRegister)}>
        <div className="mt-5 flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel />
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel />
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} loading={loading} type="submit" variant="default">
            <Translate>Sign Up</Translate>
          </Button>
        </div>
      </form>
    </Form>
  )
}
