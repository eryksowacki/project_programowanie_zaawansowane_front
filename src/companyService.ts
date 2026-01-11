import { apiFetch } from "./api";
import type {
  Company,
  CompanyCreateRequest,
  CompanyUpdateRequest,
  CompanyUserRow,
} from "./types";

export type CompanySort = "id" | "name" | "taxId" | "active";
export type SortDir = "asc" | "desc";

export interface CompanyListParams {
  q?: string;
  active?: boolean;
  sort?: CompanySort;
  dir?: SortDir;
}

function buildQuery(params?: CompanyListParams): string {
  if (!params) return "";
  const qs = new URLSearchParams();

  if (params.q && params.q.trim() !== "") qs.set("q", params.q.trim());
  if (typeof params.active === "boolean")
    qs.set("active", String(params.active));
  if (params.sort) qs.set("sort", params.sort);
  if (params.dir) qs.set("dir", params.dir);

  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function listCompanies(
  params?: CompanyListParams
): Promise<Company[]> {
  const query = buildQuery(params);
  return apiFetch<Company[]>(`/api/admin/companies${query}`);
}

export async function getCompany(id: number): Promise<Company> {
  return apiFetch<Company>(`/api/admin/companies/${id}`);
}

export async function createCompany(
  payload: CompanyCreateRequest
): Promise<Company> {
  return apiFetch<Company>(`/api/admin/companies`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCompany(
  id: number,
  payload: CompanyUpdateRequest
): Promise<Company> {
  return apiFetch<Company>(`/api/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await fetch(`/api/admin/companies/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (res.status === 204) return;

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  const err: any = new Error(data?.message || `HTTP ${res.status}`);
  err.status = res.status;
  err.data = data;
  throw err;
}

export async function listCompanyUsers(
  companyId: number
): Promise<CompanyUserRow[]> {
  return apiFetch<CompanyUserRow[]>(`/api/admin/companies/${companyId}/users`);
}
