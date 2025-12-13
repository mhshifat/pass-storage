import CreateProjectBtn from "./create-project-btn";
import ProjectsList from "./projects-list";

export default function ProjectsContainer() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Select a project to view and manage your data analysis
                        </p>
                    </div>
                    <CreateProjectBtn />
                </div>
                <ProjectsList />
            </div>
        </div>
    )
}