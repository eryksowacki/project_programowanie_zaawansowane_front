import { apiFetch } from "./api";

type KpirPeriod =
  | { mode: "month"; year: number; month: number }
  | { mode: "quarter"; year: number; quarter: number }
  | { mode: "year"; year: number };

export async function downloadKpirPdf(period: KpirPeriod) {
  const res = await fetch("/api/reports/kpir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    } as any,
    body: JSON.stringify(period),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const blob = await res.blob();
  triggerDownload(blob, `kpir-${period.mode}.pdf`);
}

type ContractorXlsxParams = {
  dateFrom: string;
  dateTo: string;
  includeIncome: boolean;
  includeCost: boolean;
  contractorId?: number | null;
};

export async function downloadContractorsXlsx(params: ContractorXlsxParams) {
  const res = await fetch("/api/reports/contractors-xlsx", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    } as any,
    body: JSON.stringify(params),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const blob = await res.blob();
  triggerDownload(
    blob,
    `raport-kontrahenci-${params.dateFrom}_${params.dateTo}.xlsx`
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
