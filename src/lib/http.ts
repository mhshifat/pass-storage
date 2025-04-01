import axios, { AxiosHeaders } from 'axios';
import { APIResponse, SuccessAPIResponse } from './types';
import { storage } from './storage';

export interface IHttp {
  get<T>(url: string, options: { params?: Record<string, unknown>, headers?: Record<string, unknown> }): Promise<APIResponse<T>>;
  delete<T>(url: string, options: { params?: Record<string, unknown>, headers?: Record<string, unknown> }): Promise<APIResponse<T>>;
  post<T>(url: string, body: unknown): Promise<APIResponse<T>>;
  put<T>(url: string, body: unknown): Promise<APIResponse<T>>;
  patch<T>(url: string, body: unknown): Promise<APIResponse<T>>;
}

class Http implements IHttp {
  private _baseUrl = process.env.NEXT_PUBLIC_API_URL + "/api";
  private _request = axios.create({
    baseURL: this._baseUrl,
  })

  async get<T>(url: string, options: { params?: Record<string, unknown>, headers?: Record<string, unknown> }) {
    const token = await storage.getAuthToken();
    const { data } = await this._request({
      url,
      method: "GET",
      params: {
        ...options.params
      },
      headers: {
        ...options.headers as AxiosHeaders,
        "Authorization": `Bearer ${token}`
      }
    });
    return data as Promise<SuccessAPIResponse<T>>;
  }

  async post<T>(url: string, body: unknown) {
    const token = await storage.getAuthToken();
    const { data } = await this._request({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      data: body
    });
    return data as Promise<SuccessAPIResponse<T>>;
  }

  async put<T>(url: string, body: unknown) {
    const token = await storage.getAuthToken();
    const { data } = await this._request({
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      data: body
    });
    return data as Promise<SuccessAPIResponse<T>>;
  }

  async patch<T>(url: string, body: unknown) {
    const token = await storage.getAuthToken();
    const { data } = await this._request({
      url,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      data: body
    });
    return data as Promise<SuccessAPIResponse<T>>;
  }

  async delete<T>(url: string, options: { params?: Record<string, unknown>, headers?: Record<string, unknown> }) {
    const token = await storage.getAuthToken();
    const { data } = await this._request({
      url,
      method: "DELETE",
      params: options.params,
      headers: {
        ...options.headers as AxiosHeaders,
        "Authorization": `Bearer ${token}`
      }
    });
    return data as Promise<SuccessAPIResponse<T>>;
  }
}

export const http = new Http();
