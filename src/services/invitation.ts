import { IHttp, http } from "@/lib/http";
import { InviteMemberFormPayload, IPagination, IInvitation, InvitationDto, AcceptInviteFormPayload } from "@/lib/types";

class InvitationApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<InvitationDto[]>>("/invitations", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformDtoListToList(res.data.data)
    };
  }

  private transformDtoListToList(data: InvitationDto[]): IInvitation[] {
    return data.map(item => this.transformDtoTo(item))
  }

  async create(values: InviteMemberFormPayload) {
    const res = await this._http.post<InvitationDto>("/invitations", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async accept(values: AcceptInviteFormPayload) {
    const res = await this._http.post<InvitationDto>("/invitations/accept", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async update(id: string, values: Partial<InviteMemberFormPayload>) {
    const res = await this._http.put<InvitationDto>(`/invitations/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async delete(id: string, params: { orgId: string }) {
    const res = await this._http.delete<InvitationDto>(`/invitations/${id}`, { params });
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  private transformDtoTo(data: InvitationDto): IInvitation {
    return {
      createdAt: data.created_at,
      email: data.email,
      id: data.id,
    }
  }
}

export const invitationApiService = new InvitationApiService(http);
