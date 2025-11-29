import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";
import { Button } from "./button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

type StepNode = {
    step: number;
    label: string;
}

interface StepContextValue {
    currentStep: number | null;
    steps: StepNode[];
    currentStepIndex: number;
    setCurrentStepIndex: Dispatch<SetStateAction<number>>;
}

const StepCtx = createContext<StepContextValue | null>(null);

interface StepProps {
    steps: StepNode[];
}

export default function Step({ children, steps }: PropsWithChildren<StepProps>) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = useMemo(() => {
        return steps[currentStepIndex]?.step || null;
    }, [steps, currentStepIndex]);

    return (
        <StepCtx.Provider value={{
            currentStep,
            steps,
            currentStepIndex,
            setCurrentStepIndex,
        }}>
            {children}
        </StepCtx.Provider>
    )
}

Step.displayName = "Step";

interface StepPanelProps {
    step: number;
}

function StepPanel({ children, step }: PropsWithChildren<StepPanelProps>) {
    const ctx = useContext(StepCtx);

    if (!ctx) return null;
    if (ctx.currentStep !== step) return null;
    
    return (
        <>
            {children}
        </>
    )
}

Step.Panel = StepPanel;
StepPanel.displayName = "StepPanel";

function PrevStep({ children }: PropsWithChildren) {
    const ctx = useContext(StepCtx);
    
    if (!ctx) return;
    if (ctx.currentStep === null || ctx.currentStepIndex === 0) return;
    return (
        <Button type="button" onClick={() => {
            ctx.setCurrentStepIndex(ctx.currentStepIndex - 1);
        }} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{children || "Previous"}</span>
        </Button>
    )
}

Step.Prev = PrevStep;
PrevStep.displayName = "PrevStep";

interface NextStepProps {
    goNext?: (args: {
        currentStepIndex?: number;
        steps?: StepNode[];
    }) => Promise<boolean>;
}

function NextStep({ children, goNext }: PropsWithChildren<NextStepProps>) {
    const ctx = useContext(StepCtx);

    if (!ctx) return null;

    const hasNextStep =
        ctx.currentStep !== null &&
        ctx.currentStep < ctx.steps[ctx.steps.length - 1].step;

    if (hasNextStep) {
        return (
            <Button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    const next = () => {
                        ctx.setCurrentStepIndex(ctx.currentStepIndex + 1);
                    };
                    if (goNext) {
                        goNext({
                            currentStepIndex: ctx.currentStepIndex,
                            steps: ctx.steps,
                        }).then((canProceed) => {
                            if (canProceed) next();
                        });
                    } else {
                        next();
                    }
                }}
                className="flex items-center gap-2"
            >
                <span>Next</span>
                <ArrowRightIcon className="h-4 w-4" />
            </Button>
        );
    }

    return <>{children}</>;
}

Step.Next = NextStep;
NextStep.displayName = "NextStep";