"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ProjectCard from "./project-card";

export default function ProjectsList() {
    const trpc = useTRPC();
    const { data: projectsData } = useSuspenseQuery(trpc.projects.findMany.queryOptions({
        page: 1,
        perPage: 10
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {projectsData.items.map(project => (
                <ProjectCard
                    key={"ProjectCard" + project.id}
                    id={project.id}
                    title={project.name}
                    description={project.description}
                />
            ))}
        </div>
    )
}