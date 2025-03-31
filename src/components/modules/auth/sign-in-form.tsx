"use client";

import { useAuth } from "@/components/providers/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signInFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function SignInForm() {
  const { onLogin, loading } = useAuth();

	const form = useForm({
    resolver: zodResolver(signInFormSchema)
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onLogin)}>
        <div className="mt-5 flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel />
                <FormControl>
                  <Input placeholder="example@ecample.com" {...field} />
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

          <Button disabled={loading} loading={loading} type="submit" variant="default">Sign In</Button>
        </div>
      </form>
    </Form>
  )
}
