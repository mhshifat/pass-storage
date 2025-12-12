import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlusCircleIcon, XIcon } from "lucide-react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import z from "zod";

const createTableGroupFormSchema = z.object({
    groups: z.array(
        z.object({
            name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
            columns: z.array(z.string()).min(1, "At least one column must be selected"),
        })
    )
});

type CreateTableGroupFormData = z.infer<typeof createTableGroupFormSchema>;

interface CreateTableGroupFormProps {
    projectId: number;
    columns: string[];
    afterSubmit?: () => void;
    defaultValues?: CreateTableGroupFormData;
}

export default function CreateTableGroupForm({ projectId, columns, afterSubmit, defaultValues }: CreateTableGroupFormProps) {
    const trpc = useTRPC();
    const upsertTableGroupsMutation = useMutation(trpc.projects.upsertTableGroups.mutationOptions({
        onSuccess() {
            if (afterSubmit) {
                afterSubmit();
            }
        },
    }));
    const form = useForm<CreateTableGroupFormData>({
        defaultValues: defaultValues || {
            groups: [
                {
                    name: "",
                    columns: [],
                }
            ]
        },
        resolver: zodResolver(createTableGroupFormSchema),
    });
    const { fields, append, remove } = useFieldArray<CreateTableGroupFormData>({
        control: form.control,
        name: "groups",
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => {
                upsertTableGroupsMutation.mutate({
                    projectId,
                    groups: data.groups,
                });
            })} className="space-y-4">
                <Separator />
                
                {fields.map((field, index) => {
                    return <GroupColumns key={field.id} groupIndex={index} onRemove={() => remove(index)} columns={columns} />;
                })}

                <Separator className="mt-5" />

                <Button type="button" variant={"outline"} onClick={() => append({
                    name: "",
                    columns: [],
                })}>
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    <span>Create Table Group</span>
                </Button>

                <Button disabled={upsertTableGroupsMutation.isPending} loading={upsertTableGroupsMutation.isPending} type="submit" className="mt-4 w-full">
                    Submit
                </Button>
            </form>
        </Form>
    )
}

interface GroupColumnsProps {
    groupIndex: number;
    onRemove: () => void;
    columns: string[];
}

function GroupColumns({ groupIndex, onRemove, columns }: GroupColumnsProps) {
    const { control } = useFormContext();

    return (
        <div className="flex flex-col gap-2">
            <FormField
                control={control}
                name={`groups.${groupIndex}.name`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Group ({groupIndex + 1})</FormLabel>
                        <FormControl className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Group Name"
                                        {...field}
                                        className="flex-1"
                                    />
                                    <Button type="button" size={"icon"} variant="destructive" onClick={onRemove}>
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name={`groups.${groupIndex}.columns`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl className="flex flex-col gap-2">
                            <InputTags
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select columns to group..."
                                onSearch={() => {}}
                                disabled={false}
                                options={[...new Set(columns)].map(col => ({
                                    label: col,
                                    value: col
                                }))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}