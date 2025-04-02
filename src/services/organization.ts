import { IHttp, http } from "@/lib/http";
import { AddOrganizationFormPayload, IPagination, IOrganization, OrganizationDto } from "@/lib/types";

class OrganizationApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<OrganizationDto[]>>("/organizations", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformDtoListToList(res.data.data)
    };
  }

  private transformDtoListToList(data: OrganizationDto[]): IOrganization[] {
    return data.map(item => this.transformDtoTo(item))
  }

  async create(values: AddOrganizationFormPayload) {
    const res = await this._http.post<OrganizationDto>("/organizations", values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async update(id: string, values: Partial<AddOrganizationFormPayload>) {
    const res = await this._http.put<OrganizationDto>(`/organizations/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  async delete(id: string) {
    const res = await this._http.delete<OrganizationDto>(`/organizations/${id}`, {});
    if (!res.success) throw new Error(res.message);
    return this.transformDtoTo(res.data);
  }

  private transformDtoTo(data: OrganizationDto): IOrganization {
    return {
      createdAt: data.created_at,
      description: data.description,
      name: data.name,
      id: data.id,
    }
  }
}

export const organizationApiService = new OrganizationApiService(http);
