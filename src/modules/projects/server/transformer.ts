import { IProject } from "../client/types";
import { IProjectDto } from "./types";

export function transformProjectDtoToProject(dto: IProjectDto): IProject {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        createdAt: dto.created_at,
    }
}

export function transformProjectDtoListToProjectList(dtos: IProjectDto[]): IProject[] {
    return dtos.map(transformProjectDtoToProject);
}