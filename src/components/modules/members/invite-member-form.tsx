"use client";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InviteMemberFormPayload } from "@/lib/types";
import { inviteMemberFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

interface InviteMemberFormProps {
  onSubmit: (values: InviteMemberFormPayload) => void;
}

function InviteMemberForm({ onSubmit }: InviteMemberFormProps, ref: ForwardedRef<{ onSubmit: () => Promise<void> }>) {
  const { orgId } = useParams<{ orgId: string }>();

	const form = useForm({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      orgId,
    }
  });

  useImperativeHandle(ref, () => ({
    async onSubmit() {
      const isValid = await form.trigger();
      if (!isValid) return;
      const values = form.getValues();
      onSubmit(values as InviteMemberFormPayload);
    },
  }), [form, onSubmit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <div className="mt-5 flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@example.com" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}

export default forwardRef(InviteMemberForm);
