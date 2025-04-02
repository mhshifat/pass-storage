"use client";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddOrganizationFormPayload, IOrganization } from "@/lib/types";
import { organizationCreateFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

interface OrganizationFormProps {
  organization?: IOrganization;
  onCreate: (values: AddOrganizationFormPayload) => void;
  onUpdate: (values: Partial<AddOrganizationFormPayload> & { id: string }) => void;
}

function OrganizationForm({ organization, onCreate, onUpdate }: OrganizationFormProps, ref: ForwardedRef<{ onSubmit: () => Promise<void> }>) {
	const form = useForm({
    resolver: zodResolver(organization?.id ? organizationCreateFormSchema.partial() : organizationCreateFormSchema)
  });

  useImperativeHandle(ref, () => ({
    async onSubmit() {
      const isValid = await form.trigger();
      if (!isValid) return;
      const values = form.getValues();
      if (organization?.id) onUpdate({...values, id: organization.id});
      else onCreate(values as AddOrganizationFormPayload);
    },
  }), [form, onCreate, onUpdate, organization?.id])

  useEffect(() => {
    if (organization?.id) {
      form.reset({
        name: organization.name,
        description: organization.description,
      });
    }
  }, [form, organization])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => organization?.id ? onUpdate({...values, id: organization.id}) : onCreate(values as AddOrganizationFormPayload))}>
        <div className="mt-5 flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="xyz" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short description" {...field} />
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

export default forwardRef(OrganizationForm);
