"use client";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddTeamFormPayload, ITeam } from "@/lib/types";
import { teamCreateFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

interface TeamFormProps {
  team?: ITeam;
  onCreate: (values: AddTeamFormPayload) => void;
  onUpdate: (values: Partial<AddTeamFormPayload> & { id: string }) => void;
}

function TeamForm({ team, onCreate, onUpdate }: TeamFormProps, ref: ForwardedRef<{ onSubmit: () => Promise<void> }>) {
  const { orgId } = useParams<{ orgId: string }>();

	const form = useForm({
    resolver: zodResolver(team?.id ? teamCreateFormSchema.partial() : teamCreateFormSchema),
    defaultValues: {
      orgId,
      description: ""
    }
  });

  useImperativeHandle(ref, () => ({
    async onSubmit() {
      const isValid = await form.trigger();
      if (!isValid) return;
      const values = form.getValues();
      if (team?.id) onUpdate({...values, id: team.id});
      else onCreate(values as AddTeamFormPayload);
    },
  }), [form, onCreate, onUpdate, team?.id])

  useEffect(() => {
    if (team?.id) {
      form.reset({
        name: team.name,
        description: team.description || "",
        orgId
      });
    }
  }, [form, team, orgId])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => team?.id ? onUpdate({...values, id: team.id}) : onCreate(values as AddTeamFormPayload))}>
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

export default forwardRef(TeamForm);
