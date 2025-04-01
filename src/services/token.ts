import { IHttp, http } from "@/lib/http";
import { AddTokenFormPayload, IPagination, IToken, TokenDto } from "@/lib/types";

class TokenApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async find(params: Record<string, unknown>) {
    const res = await this._http.get<IPagination<TokenDto[]>>("/tokens", { params });
    if (!res.success) throw new Error(res.message);
    return {
      ...res.data,
      data: this.transformTokenDtoListToTokenList(res.data.data)
    };
  }

  private transformTokenDtoListToTokenList(data: TokenDto[]): IToken[] {
    return data.map(item => this.transformTokenDtoToToken(item))
  }

  async create(values: AddTokenFormPayload) {
    const res = await this._http.post<TokenDto>("/tokens", values);
    if (!res.success) throw new Error(res.message);
    return this.transformTokenDtoToToken(res.data);
  }

  async update(id: string, values: Partial<AddTokenFormPayload>) {
    const res = await this._http.put<TokenDto>(`/tokens/${id}`, values);
    if (!res.success) throw new Error(res.message);
    return this.transformTokenDtoToToken(res.data);
  }

  async delete(id: string) {
    const res = await this._http.delete<TokenDto>(`/tokens/${id}`, {});
    if (!res.success) throw new Error(res.message);
    return this.transformTokenDtoToToken(res.data);
  }

  private transformTokenDtoToToken(data: TokenDto): IToken {
    return {
      algorithm: data.algorithm,
      digits: data.digits,
      issuer: data.issuer,
      name: data.name,
      password: data.password,
      period: data.period,
      secret: data.secret,
      serviceUrl: data.service_url,
      username: data.username,
      id: data.id,
    }
  }
}

export const tokenApiService = new TokenApiService(http);
