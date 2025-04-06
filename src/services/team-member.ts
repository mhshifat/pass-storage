import { IHttp, http } from "@/lib/http";
import { AddTeamMemberFormPayload, IPagination, ITeamMember, TeamMemberDto } from "@/lib/types";

class TeamMemberApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<TeamMemberDto[]>>("/team-members", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformDtoListToList(res.data.data)
    };
  }

  private transformDtoListToList(data: TeamMemberDto[]): ITeamMember[] {
    return data.map(item => this.transformDtoTo(item))
  }

  async create(values: AddTeamMemberFormPayload) {
    const res = await this._http.post<TeamMemberDto>("/team-members", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async update(id: string, values: Partial<AddTeamMemberFormPayload>) {
    const res = await this._http.put<TeamMemberDto>(`/team-members/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async delete(id: string, params: { orgId: string; teamId: string }) {
    const res = await this._http.delete<TeamMemberDto>(`/team-members/${id}`, { params });
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  private transformDtoTo(data: TeamMemberDto): ITeamMember {
    return {
      teamId: data.team_id,
      memberId: data.member_id,
      id: data.id,
    }
  }
}

export const teamMemberApiService = new TeamMemberApiService(http);
