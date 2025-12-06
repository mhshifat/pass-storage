import { IConnection } from "../client/types";
import { IConnectionDto } from "./types";

export function transformConnectionDtoToProject(dto: IConnectionDto): IConnection {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        createdAt: dto.created_at,
        type: dto.type,
    }
}

export function transformConnectionDtoListToProjectList(dtos: IConnectionDto[]): IConnection[] {
    return dtos.map(transformConnectionDtoToProject);
}