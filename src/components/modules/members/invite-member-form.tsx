"use client";

import useGetTeamsQuery from "@/components/hooks/use-get-teams-query";
import Translate from "@/components/shared/translate";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InviteMemberFormPayload } from "@/lib/types";
import { inviteMemberFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface InviteMemberFormProps {
  onSubmit: (values: InviteMemberFormPayload) => void;
}

function InviteMemberForm({ onSubmit }: InviteMemberFormProps, ref: ForwardedRef<{ onSubmit: () => Promise<void> }>) {
  const { orgId } = useParams<{ orgId: string }>();
  const { t } = useTranslation();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery({
		params: {
			page: String(1),
      orgId
		},
	});

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
                <FormLabel><Translate>Email</Translate>*</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@example.com" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><Translate>Team</Translate>*</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={isTeamsLoading} id="edit-algorithm" className="w-full">
                      <SelectValue placeholder={isTeamsLoading ? t("Loading...") : t("Select Team")} />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.data.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
