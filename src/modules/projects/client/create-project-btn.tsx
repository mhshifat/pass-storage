"use client";

import { z } from 'zod';
import { PlusIcon } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Modal } from '@/components/shared/modal';
import FormBuilder from '@/components/shared/form-builder';

export const createProjectSchema = z.object({
    name: z.string().min(2, "Project name must be at least 2 characters long"),
    description: z.string().optional(),
    datasource: z.enum(['EXCEL']),
    connection: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.datasource === 'EXCEL' && !data.connection) {
        ctx.addIssue({
            code: "custom",
            message: "Connection is required when datasource is EXCEL",
        });
    }
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function CreateProjectBtn() {
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
        >
            <FormBuilder<CreateProjectFormData>
                schema={createProjectSchema}
                defaultValues={{
                    name: '',
                    description: "",
                    connection: "",
                }}
                onSubmit={(values) => {
                    console.log("Form Submitted:", values);
                }}
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
                                name: 'connection',
                                label: 'Connection',
                                node: {
                                    type: 'SELECT',
                                    options: [
                                        // TODO: Dynamically load available connections
                                    ],
                                    placeholder: 'Select connection',
                                    createOptionLink: '/admin/connections',
                                },
                                shouldShowOn: (formValues) => formValues.datasource === 'EXCEL',
                            }
                        ]
                    },
                ]}
                name='create-project'
            />
        </Modal>
    )
}