import { ControllerRenderProps, DefaultValues, FieldValues, useForm, useWatch } from "react-hook-form";
import { ZodObject } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Step from "../ui/step";
import { Fragment } from "react/jsx-runtime";
import { useRef } from "react";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TextNodeType = {
    type: 'TEXT';
    placeholder?: string;

}

type EmailNodeType = {
    type: 'EMAIL';
    placeholder?: string;

}

type NumberNodeType = {
    type: 'NUMBER';
    placeholder?: string;

}

type PasswordNodeType = {
    type: 'PASSWORD';
    placeholder?: string;

}

type TextareaNodeType = {
    type: 'TEXTAREA';
    placeholder?: string;

}

type SelectNodeType = {
    type: 'SELECT';
    options: { label: string; value: string }[];
    placeholder?: string;
    createOptionLink?: string;
}

type FieldType = TextNodeType | NumberNodeType | EmailNodeType | PasswordNodeType| TextareaNodeType | SelectNodeType;

interface SharedFormBuilderProps<T> {
    name: string;
    schema: ZodObject;
    defaultValues?: DefaultValues<T & { id?: string }>;
    onSubmit: (data: T) => void;
    footer?: {
        submitLabel?: string;
        className?: string;
        onCancel?: () => void;
    };
}

interface FormField<FormProperties, FormValues> {
    name: FormProperties;
    label: string;
    node: FieldType;
    shouldShowOn?: (formValues: FormValues) => boolean;
    hook?: {
        afterChange?: () => void;
    }
}

type FormBuilderPropsField<T> = {
    className?: string;
    fields: FormField<keyof T, T>[];
};

interface FormBuilderProps<T> extends SharedFormBuilderProps<T> {
    multiStep?: false;
    fields: FormBuilderPropsField<T>[];
}

type FormBuilderPropsWithMultiStepField<T> = {
    step: number;
    className?: string;
    fields: FormField<keyof T, T>[];
};

interface FormBuilderPropsWithMultiStep<T> extends SharedFormBuilderProps<T> {
    multiStep: true;
    fields: FormBuilderPropsWithMultiStepField<T>[];
}

type RootFormBuilderProps<T> = FormBuilderProps<T> | FormBuilderPropsWithMultiStep<T>;

export default function FormBuilder<T>({ name, schema, defaultValues, onSubmit, fields, footer, multiStep }: RootFormBuilderProps<T>) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const form = useForm({
        defaultValues,
        resolver: zodResolver(schema),
        mode: "onChange",
    });
    const watchedValues = useWatch({ control: form.control });

    const stepsMap = fields.reduce<Record<number, (FormBuilderPropsField<T> | FormBuilderPropsWithMultiStepField<T>)[]>>((acc, row) => {
        if (!multiStep) {
            acc[0] = [...(acc[0] || []), row];
        } else if (multiStep && 'step' in row) {
            acc[(row as { step: number }).step] = [...(acc[(row as { step: number }).step] || []), row];
        }
        return acc;
    }, {});
    const totalSteps = Object.keys(stepsMap).length;

    return (
        <Step
            steps={Object.keys(stepsMap).map(number => ({
                step: Number(number),
                label: `Step ${number} of ${totalSteps}`,
            }))}
        >
            <Form {...form}>
                <form ref={formRef} onSubmit={form.handleSubmit((values) => onSubmit(values as T))} className="space-y-4">
                    {Object.keys(stepsMap).map((stepKey) => {
                        const fields = stepsMap[Number(stepKey)];

                        return (
                            <Fragment key={name + "MultiStep" + stepKey}>
                                <Step.Panel step={Number(stepKey)}>
                                    {fields.map((row, rowIndex) => (
                                        <div key={rowIndex} className={cn("flex items-start gap-2", row.className)}>
                                            {row.fields.map((rowField) => {
                                                const shouldRenderFields = rowField.shouldShowOn
                                                    ? rowField.shouldShowOn(watchedValues as T)
                                                    : true;

                                                if (!shouldRenderFields) return null;
                                                return (
                                                    <FormField
                                                        key={name + rowField.label}
                                                        control={form.control}
                                                        name={rowField.name as string}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                {rowField?.label && <FormLabel>{rowField.label}</FormLabel>}
                                                                <FormControl>
                                                                    {getField(rowField, field, {
                                                                        onNavigate: (link: string) => {
                                                                            router.push(link);
                                                                        }
                                                                    })}
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )
                                            })}
                                        </div>
                                    ))}
                                </Step.Panel>
                            </Fragment>
                        )
                    })}

                    <div className={cn("flex items-center gap-2 justify-end", footer?.className)}>
                        {footer?.onCancel && <Button variant="outline" onClick={footer.onCancel}>Cancel</Button>}
                        <Step.Prev />
                        <Step.Next
                            goNext={async ({ currentStepIndex, steps }) => {
                                const currentStep = currentStepIndex !== undefined ? steps?.[currentStepIndex] : null;
                                if (!currentStep) return false;
                                const stepFields = stepsMap[currentStep.step]?.map(item => item.fields?.map(field => field.name)).flat() || [];
                                const isValid = await form.trigger(stepFields as string[]);
                                if (isValid) {
                                    form.clearErrors();
                                }
                                return isValid;
                            }}
                        >
                            <Button type="button" onClick={() => formRef.current?.requestSubmit()}>{footer?.submitLabel ?? (defaultValues?.id ? "Update" : "Save")}</Button>
                        </Step.Next>
                    </div>

                    {Object.keys(form.formState.errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>Please correct the errors below.</AlertTitle>
                            <AlertDescription>
                            <p>Please verify your inputs and try again.</p>
                            <ul className="list-inside list-disc text-sm">
                                {Object.entries(form.formState.errors).map(([fieldName, error]) => (
                                    <li key={fieldName}>
                                        {fieldName}: {error?.message as string}
                                    </li>
                                ))}
                            </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </Form>
        </Step>
    )
}

function getField<T>(rowField: FormField<keyof T, T>, field: ControllerRenderProps<FieldValues, string>, options?: {
    onNavigate?: (link: string) => void;
}) {
    const node = rowField.node;
    switch (rowField.node.type) {
        case "TEXT":
            return (
                <Input placeholder={node.placeholder} value={field.value} onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }} />
            );
        case "NUMBER":
            return (
                <Input placeholder={node.placeholder} type="number" value={field.value} onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }} />
            );
        case "EMAIL":
            return (
                <Input placeholder={node.placeholder} type="email" value={field.value} onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }} />
            );
        case "PASSWORD":
            return (
                <Input placeholder={node.placeholder} type="password" value={field.value} onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }} />
            );
        case "TEXTAREA":
            return (
                <Textarea placeholder={node.placeholder} value={field.value} onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }} />
            );
        case "SELECT":
            const selectNode = node as SelectNodeType;
            return (
                <Select {...field} value={field.value || ""} onValueChange={(value) => {
                    if (value === "CREATE_NEW") {
                        options?.onNavigate?.(selectNode.createOptionLink || "/create-new");
                        return;
                    }
                    field.onChange(value);
                    if (rowField?.hook?.afterChange) rowField.hook.afterChange();
                }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={node.placeholder} />    
                    </SelectTrigger> 
                    <SelectContent>
                        {selectNode.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}

                        {selectNode?.createOptionLink && (
                            <>
                                <SelectSeparator />    
                                <SelectItem value="CREATE_NEW" onClick={(e) => e.preventDefault()}>
                                    <Link
                                        href={selectNode.createOptionLink || "/create-new"} // <-- your create page
                                        className="w-full text-left px-2 py-1 hover:bg-gray-100"
                                    >
                                        + Create new
                                    </Link>
                                </SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            );
        default:
            return null;
    }
}