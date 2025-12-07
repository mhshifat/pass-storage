"use client";

import { z } from 'zod';
import { PlusIcon } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Modal } from '@/components/shared/modal';
import FormBuilder from '@/components/shared/form-builder';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export const createProjectSchema = z.object({
    name: z.string().min(2, "Project name must be at least 2 characters long"),
    description: z.string().optional(),
    datasource: z.enum(['EXCEL']),
    connectionId: z.string().optional(),
    sheetId: z.string().optional(),
    sheetTabName: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.datasource === 'EXCEL' && !data.connectionId) {
        ctx.addIssue({
            code: "custom",
            message: "Connection is required when datasource is EXCEL",
        });
    }
    if (data.datasource === 'EXCEL' && !data.sheetId) {
        ctx.addIssue({
            code: "custom",
            message: "Sheet name is required when datasource is EXCEL",
        });
    }
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function CreateProjectBtn() {
    const trpc = useTRPC();
    const [openModal, setOpenModal] = useState(false);
    const { data: connections } = useQuery(trpc.connections.findMany.queryOptions({
        page: 1,
        perPage: 10
    }));

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onError: (err) => {
            toast.error(err.message);
        },
        onSuccess: () => {
            setOpenModal(false);
            toast.success("Project created");
        }
    }));
    
    const getSheetsMutation = useMutation(trpc.google.getSheetsMutation.mutationOptions({}));
    const [sheetOptions, setSheetOptions] = useState<{ label: string, value: string }[]>([]);

    const getSheetTabsMutation = useMutation(trpc.google.getSheetTabsMutation.mutationOptions({}));
    const [sheetTabsOptions, setSheetTabsOptions] = useState<{ label: string, value: string }[]>([]);

    return (
        <Modal
            title="Create Project" 
            description="Fill out the form to create a new project."
            trigger={(
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span>Create Project</span>
                </Button>
            )}
            open={openModal}
            onOpenChange={setOpenModal}
        >
            <FormBuilder<CreateProjectFormData>
                schema={createProjectSchema}
                defaultValues={{
                    name: '',
                    description: "",
                    connectionId: "",
                    sheetId: "",
                    sheetTabName: "",
                }}
                onSubmit={(values) => {
                    createProject.mutateAsync({
                        ...values,
                        connectionId: +(values.connectionId || "0"),
                    })
                }}
                loading={createProject.isPending}
                multiStep
                fields={[
                    {
                        step: 1,
                        fields: [
                            {
                                name: 'name',
                                label: 'Project Name',
                                node: {
                                    type: 'TEXT',
                                    placeholder: 'Enter project name',
                                },
                            }
                        ]
                    },
                    {
                        step: 1,
                        fields: [
                            {
                                name: 'description',
                                label: 'Project Description',
                                node: {
                                    type: 'TEXTAREA',
                                    placeholder: 'Enter project description',
                                },
                            }
                        ]
                    },
                    {
                        step: 2,
                        fields: [
                            {
                                name: 'datasource',
                                label: 'Data Source',
                                node: {
                                    type: 'SELECT',
                                    options: [
                                        { label: 'Excel File', value: 'EXCEL' },
                                    ],
                                    placeholder: 'Select data source',
                                },
                                hook: {
                                    afterChange: () => {}
                                }
                            },
                            {
                                name: 'connectionId',
                                label: 'Connection',
                                node: {
                                    type: 'SELECT',
                                    options: connections?.items?.map(conn => ({
                                        label: conn.name,
                                        value: conn.id + ""
                                    })) || [],
                                    placeholder: 'Select connection',
                                    createOptionLink: '/admin/connections',
                                },
                                shouldShowOn: (formValues) => formValues.datasource === 'EXCEL',
                                hook: {
                                    async afterChange(formValues) {
                                        const data = await getSheetsMutation.mutateAsync({
                                            connectionId: parseInt(formValues.connectionId || "0", 10)
                                        });

                                        setSheetOptions(data?.map(item => ({
                                            label: item.name,
                                            value: item.id
                                        })) || [])
                                    },
                                }
                            }
                        ]
                    },
                    {
                        step: 2,
                        fields: [
                            {
                                name: 'sheetId',
                                label: 'Sheet',
                                node: {
                                    type: 'SELECT',
                                    options: sheetOptions,
                                    placeholder: 'Select sheet',
                                },
                                shouldShowOn: (formValues) => !!formValues.connectionId,
                                hook: {
                                    async afterChange(formValues) {
                                        const data = await getSheetTabsMutation.mutateAsync({
                                            connectionId: parseInt(formValues.connectionId || "0", 10),
                                            sheetId: formValues.sheetId || ""
                                        });

                                        setSheetTabsOptions(data?.map(item => ({
                                            label: item.properties.title,
                                            value: item.properties.title
                                        })) || [])
                                    },
                                }
                            },
                            {
                                name: 'sheetTabName',
                                label: 'Sheet Tab',
                                node: {
                                    type: 'SELECT',
                                    options: sheetTabsOptions,
                                    placeholder: 'Select tab',
                                },
                                shouldShowOn: (formValues) => !!formValues.sheetId,
                            }
                        ]
                    },
                ]}
                name='create-project'
            />
        </Modal>
    )
}