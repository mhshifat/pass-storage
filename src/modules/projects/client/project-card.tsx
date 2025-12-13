import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

interface ProjectCardProps {
    title: string;
    description: string | null;
}

export default function ProjectCard({ title, description }: ProjectCardProps) {
    return (
        <Card className="group overflow-hidden border-border/40 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer bg-card">
            <CardHeader className="space-y-4 p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                        <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <CardTitle className="text-xl font-semibold text-foreground leading-tight">
                            {title}
                        </CardTitle>
                        {description ? (
                            <CardDescription className="text-sm leading-relaxed line-clamp-2">
                                {description}
                            </CardDescription>
                        ) : (
                            <CardDescription className="text-sm italic text-muted-foreground/60">
                                No description provided
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}