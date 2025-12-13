import CreateProjectBtn from "./create-project-btn";
import ProjectsList from "./projects-list";
import { FolderKanban } from "lucide-react";

export default function ProjectsContainer() {
    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2.5">
                            <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    </div>
                    <p className="text-muted-foreground text-sm pl-12">
                        Manage your data analysis projects
                    </p>
                </div>
                <CreateProjectBtn />
            </div>
            <ProjectsList />
        </div>
    )
}