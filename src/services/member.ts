import { IHttp, http } from "@/lib/http";
import { AddMemberFormPayload, IPagination, IMember, MemberDto } from "@/lib/types";

class MemberApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<MemberDto[]>>("/members", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformDtoListToList(res.data.data)
    };
  }

  private transformDtoListToList(data: MemberDto[]): IMember[] {
    return data.map(item => this.transformDtoTo(item))
  }

  async create(values: AddMemberFormPayload) {
    const res = await this._http.post<MemberDto>("/members", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async update(id: string, values: Partial<AddMemberFormPayload>) {
    const res = await this._http.put<MemberDto>(`/members/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async delete(id: string, params: { orgId: string }) {
    const res = await this._http.delete<MemberDto>(`/members/${id}`, { params });
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  private transformDtoTo(data: MemberDto): IMember {
    return {
      email: data.email,
      id: data.id,
    }
  }
}

export const memberApiService = new MemberApiService(http);
