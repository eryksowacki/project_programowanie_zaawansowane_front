import { apiFetch } from "./api";
import type {
  DocumentRow,
  DocumentCreateRequest,
  DocumentCreateResponse,
  DocumentBookResponse,
  DocumentListQuery,
  LedgerRow,
} from "./types";

function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function listDocuments(
  query: DocumentListQuery = {}
): Promise<DocumentRow[]> {
  const q = buildQuery({
    type: query.type,
    status: query.status,
  });

  return apiFetch<DocumentRow[]>(`/api/documents${q}`);
}

export async function createDocument(
  payload: DocumentCreateRequest
): Promise<DocumentCreateResponse> {
  return apiFetch<DocumentCreateResponse>("/api/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function bookDocument(id: number): Promise<DocumentBookResponse> {
  return apiFetch<DocumentBookResponse>(`/api/documents/${id}/book`, {
    method: "POST",
  });
}

export async function listLedger(): Promise<LedgerRow[]> {
  return apiFetch<LedgerRow[]>("/api/ledger");
}
