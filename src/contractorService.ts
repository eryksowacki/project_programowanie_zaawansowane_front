// src/contractorService.ts
import { apiFetch } from "./api";
import type { ContractorRow } from "./types";

export type ContractorCreateRequest = {
    name: string;
    taxId?: string | null;
    address?: string | null;
};

export type ContractorUpdateRequest = Partial<ContractorCreateRequest>;

export async function listContractors(): Promise<ContractorRow[]> {
    return apiFetch<ContractorRow[]>("/api/contractors");
}

export async function createContractor(payload: ContractorCreateRequest): Promise<{ id: number }> {
    return apiFetch<{ id: number }>("/api/contractors", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateContractor(id: number, payload: ContractorUpdateRequest): Promise<{ id: number }> {
    return apiFetch<{ id: number }>(`/api/contractors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteContractor(id: number): Promise<void> {
    return apiFetch<void>(`/api/contractors/${id}`, { method: "DELETE" });
}