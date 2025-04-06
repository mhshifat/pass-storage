"use client";

import useGetMembersQuery from "@/components/hooks/use-get-members-query";
import useGetTeamsQuery from "@/components/hooks/use-get-teams-query";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddTeamMemberFormPayload } from "@/lib/types";
import { teamMemberCreateFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

interface AddMemberToTeamFormProps {
  onSubmit: (values: AddTeamMemberFormPayload) => void;
}

function AddMemberToTeamForm({ onSubmit }: AddMemberToTeamFormProps, ref: ForwardedRef<{ onSubmit: () => Promise<void> }>) {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: members, isLoading: isMembersLoading } = useGetMembersQuery({
		params: {
			page: String(1),
      orgId
		},
	});
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery({
		params: {
			page: String(1),
      orgId
		},
	});

	const form = useForm({
    resolver: zodResolver(teamMemberCreateFormSchema),
    defaultValues: {
      teamId: "",
      memberId: "",
      orgId
    }
  });

  useImperativeHandle(ref, () => ({
    async onSubmit() {
      const isValid = await form.trigger();
      if (!isValid) return;
      const values = form.getValues();
      onSubmit(values as AddTeamMemberFormPayload);
    },
  }), [form, onSubmit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values as AddTeamMemberFormPayload))}>
        <div className="mt-5 flex flex-col gap-5">
          <FormField
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member*</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={isMembersLoading} id="edit-algorithm" className="w-full">
                      <SelectValue placeholder={isMembersLoading ? "Loading..." : "Select Member"} />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.data.map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <FormLabel>Team*</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={isTeamsLoading} id="edit-algorithm" className="w-full">
                      <SelectValue placeholder={isTeamsLoading ? "Loading..." : "Select Team"} />
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

export default forwardRef(AddMemberToTeamForm);
