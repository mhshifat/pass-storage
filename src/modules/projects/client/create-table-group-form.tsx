import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlusCircleIcon, XIcon, TableIcon, Layers } from "lucide-react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import z from "zod";
import { Card, CardContent } from "@/components/ui/card";

const createTableGroupFormSchema = z.object({
    groups: z.array(
        z.object({
            name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
            columnIndices: z.array(z.string()).min(1, "At least one column must be selected"),
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
                    columnIndices: [],
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
            })} className="space-y-6">
                
                {/* Header Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span>Create and manage table groups by selecting columns to organize your data</span>
                    </div>
                </div>

                <Separator />
                
                {/* Groups List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {fields.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <TableIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No groups created yet</p>
                            <p className="text-xs mt-1">Click the button below to create your first group</p>
                        </div>
                    )}
                    {fields.map((field, index) => {
                        return <GroupColumns key={field.id} groupIndex={index} onRemove={() => remove(index)} columns={columns} totalGroups={fields.length} />;
                    })}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => append({
                            name: "",
                            columnIndices: [],
                        })}
                        className="w-full border-dashed border-2 hover:border-primary/60 hover:bg-primary/5"
                    >
                        <PlusCircleIcon className="mr-2 h-4 w-4" />
                        <span>Add New Table Group</span>
                    </Button>

                    <Button 
                        disabled={upsertTableGroupsMutation.isPending || fields.length === 0} 
                        loading={upsertTableGroupsMutation.isPending} 
                        type="submit" 
                        className="w-full shadow-sm"
                        size="lg"
                    >
                        {upsertTableGroupsMutation.isPending ? "Saving..." : `Save ${fields.length} Group${fields.length !== 1 ? 's' : ''}`}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

interface GroupColumnsProps {
    groupIndex: number;
    onRemove: () => void;
    columns: string[];
    totalGroups: number;
}

function GroupColumns({ groupIndex, onRemove, columns, totalGroups }: GroupColumnsProps) {
    const { control } = useFormContext();

    // Create options with column index and name (showing duplicates with index)
    const columnOptions = columns.map((col, index) => {
        // Count occurrences of this column name
        const occurrences = columns.filter(c => c === col);
        
        return {
            label: occurrences.length > 1 ? `${col} (Column ${index + 1})` : col,
            value: index + "",
        };
    });

    return (
        <Card className="border-border/40 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                    {/* Header with Group Number and Delete */}
                    <div className="flex items-center justify-between pb-3 border-b">
                        <div className="flex items-center gap-3">
                            <div className="rounded-md bg-primary/10 p-2">
                                <TableIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">Group {groupIndex + 1}</h4>
                                <p className="text-xs text-muted-foreground">Configure table group settings</p>
                            </div>
                        </div>
                        {totalGroups > 1 && (
                            <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                onClick={onRemove}
                                className="hover:bg-destructive/10 hover:text-destructive"
                            >
                                <XIcon className="h-4 w-4 mr-1" />
                                Remove
                            </Button>
                        )}
                    </div>

                    {/* Group Name Field */}
                    <FormField
                        control={control}
                        name={`groups.${groupIndex}.name`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Group Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter a descriptive name for this group..."
                                        {...field}
                                        className="h-10"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Columns Selection Field */}
                    <FormField
                        control={control}
                        name={`groups.${groupIndex}.columnIndices`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Columns 
                                    {field.value?.length > 0 && (
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            ({field.value.length} selected)
                                        </span>
                                    )}
                                </FormLabel>
                                <FormControl>
                                    <InputTags
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select columns to include in this group..."
                                        onSearch={() => {}}
                                        disabled={false}
                                        options={columnOptions}
                                        onDisplayItemRender={(item) => columnOptions.find(opt => opt.value === item)?.label || item}
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Columns with the same name show their position number for clarity
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}