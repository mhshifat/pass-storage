import CreateProjectBtn from "./create-project-btn";
import ProjectsList from "./projects-list";

export default function ProjectsContainer() {
    return (
        <div className="flex flex-col gap-5">
            <CreateProjectBtn />
            <ProjectsList />
        </div>
    )
}