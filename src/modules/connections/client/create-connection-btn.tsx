"use client";

import { z } from 'zod';
import { PlusIcon } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Modal } from '@/components/shared/modal';
import FormBuilder from '@/components/shared/form-builder';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';

export const createConnectionSchema = z.object({
    name: z.string().min(2, "Connection name must be at least 2 characters long"),
    type: z.enum(["EXCEL"]),
    description: z.string().optional(),
});

export type CreateConnectionFormData = z.infer<typeof createConnectionSchema>;

export default function CreateConnectionBtn() {
    const trpc = useTRPC();
    const [loading, setLoading] = useState(false);
    const connectToConnection = useMutation(trpc.connections.connect.mutationOptions({
        onError: (err) => {
            toast.error(err.message);
        },
        onSuccess: (data) => {
            if ("url" in data) {
                window.open(data.url, "_self");
            }
        }
    }));

    return (
        <Modal
            title="Create Connection" 
            description="Fill out the form to create a new connection."
            trigger={(
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span>Create Connection</span>
                </Button>
            )}
        >
            <FormBuilder<CreateConnectionFormData>
                schema={createConnectionSchema}
                defaultValues={{
                    name: '',
                    description: "",
                    type: "EXCEL"
                }}
                onSubmit={(values) => {
                    setLoading(true);
                    connectToConnection.mutateAsync(values);
                }}
                footer={{
                    submitLabel: "Connect",
                    submitLoading: loading
                }}
                fields={[
                    {
                        fields: [
                            {
                                name: 'name',
                                label: 'Connection Name',
                                node: {
                                    type: 'TEXT',
                                    placeholder: 'Enter connection name',
                                },
                            }
                        ]
                    },
                    {
                        fields: [
                            {
                                name: 'description',
                                label: 'Connection Description',
                                node: {
                                    type: 'TEXTAREA',
                                    placeholder: 'Enter description',
                                },
                            }
                        ]
                    },
                    {
                        fields: [
                            {
                                name: 'type',
                                label: 'Connection Type',
                                node: {
                                    type: 'SELECT',
                                    placeholder: 'Select type',
                                    options: [
                                        { label: "Excel", value: "EXCEL" }
                                    ]
                                },
                            }
                        ]
                    },
                ]}
                name='create-connection'
            />
        </Modal>
    )
}