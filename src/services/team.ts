import { IHttp, http } from "@/lib/http";
import { AddTeamFormPayload, IPagination, ITeam, TeamDto } from "@/lib/types";

class TeamApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<TeamDto[]>>("/teams", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformDtoListToList(res.data.data)
    };
  }

  private transformDtoListToList(data: TeamDto[]): ITeam[] {
    return data.map(item => this.transformDtoTo(item))
  }

  async create(values: AddTeamFormPayload) {
    const res = await this._http.post<TeamDto>("/teams", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async update(id: string, values: Partial<AddTeamFormPayload>) {
    const res = await this._http.put<TeamDto>(`/teams/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async delete(id: string, params: { orgId: string }) {
    const res = await this._http.delete<TeamDto>(`/teams/${id}`, { params });
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  private transformDtoTo(data: TeamDto): ITeam {
    return {
      createdAt: data.created_at,
      description: data.description,
      name: data.name,
      id: data.id,
    }
  }
}

export const teamApiService = new TeamApiService(http);
