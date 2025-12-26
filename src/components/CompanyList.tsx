// src/components/CompanyList.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Company, CompanyCreateRequest, CompanyUpdateRequest } from "../types";
import { listCompanies, createCompany, updateCompany, deleteCompany } from "../companyService";
import { CompanyModal } from "./CompanyModal";
import { ConfirmDialog } from "./ConfirmDialog";
import "./_companyList.css";
import { useNavigate } from "react-router-dom";

export const CompanyList: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [activeOnly, setActiveOnly] = useState<boolean | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editCompany, setEditCompany] = useState<Company | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

    const navigate = useNavigate();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listCompanies({
                q: search.trim() ? search.trim() : undefined,
                active: activeOnly === null ? undefined : activeOnly,
                sort: "name",
                dir: "asc",
            });
            setCompanies(data);
        } catch (err) {
            console.error(err);
            setError("Nie udało się pobrać listy firm.");
        } finally {
            setLoading(false);
        }
    }, [search, activeOnly]);

    // debounce dla search/filtra (i jeden efekt zamiast dwóch)
    useEffect(() => {
        const t = setTimeout(() => {
            load();
        }, 250);
        return () => clearTimeout(t);
    }, [load]);

    const rows = useMemo(() => companies, [companies]);

    const handleCreate = async (payload: CompanyCreateRequest | CompanyUpdateRequest) => {
        setError(null);
        try {
            await createCompany(payload as CompanyCreateRequest);
            setCreateOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            setError("Nie udało się dodać firmy.");
        }
    };

    const handleEdit = async (payload: CompanyCreateRequest | CompanyUpdateRequest) => {
        if (!editCompany) return;

        setError(null);
        try {
            await updateCompany(editCompany.id, payload as CompanyUpdateRequest);
            setEditCompany(null);
            await load();
        } catch (e) {
            console.error(e);
            setError("Nie udało się zaktualizować firmy.");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setError(null);
        try {
            await deleteCompany(deleteTarget.id);
            setDeleteTarget(null);
            await load();
        } catch (e) {
            console.error(e);
            setError("Nie udało się usunąć firmy.");
        }
    };

    return (
        <div className="company-card">
            <div className="company-header">
                <div>
                    <h2>Firmy w systemie</h2>
                    <p>Dodawaj, edytuj i usuwaj firmy. Filtruj po nazwie/NIP oraz statusie.</p>
                </div>

                <div className="company-search">
                    <input
                        type="text"
                        placeholder="Szukaj po nazwie lub NIP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={activeOnly === null ? "all" : activeOnly ? "active" : "inactive"}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === "all") setActiveOnly(null);
                            if (v === "active") setActiveOnly(true);
                            if (v === "inactive") setActiveOnly(false);
                        }}
                    >
                        <option value="all">Wszystkie</option>
                        <option value="active">Tylko aktywne</option>
                        <option value="inactive">Tylko nieaktywne</option>
                    </select>

                    <button
                        type="button"
                        className="company-btn company-btn--primary"
                        onClick={() => setCreateOpen(true)}
                    >
                        + Dodaj
                    </button>

                    <button
                        type="button"
                        className="company-btn company-btn--ghost"
                        onClick={load}
                        disabled={loading}
                    >
                        Odśwież
                    </button>
                </div>
            </div>

            {loading && <div className="company-info-row">Ładowanie...</div>}
            {error && <div className="company-error-row">{error}</div>}

            {!loading && !error && (
                <div className="company-table-wrapper">
                    <table className="company-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nazwa</th>
                            <th>NIP</th>
                            <th>Status</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="company-empty">
                                    Brak firm spełniających kryteria.
                                </td>
                            </tr>
                        ) : (
                            rows.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.taxId ?? "—"}</td>
                                    <td>
                                        {c.active ? (
                                            <span className="company-badge company-badge--ok">aktywna</span>
                                        ) : (
                                            <span className="company-badge company-badge--muted">nieaktywna</span>
                                        )}
                                    </td>
                                    <td className="company-actions">
                                        <button
                                            type="button"
                                            className="company-btn company-btn--ghost"
                                            onClick={() => navigate(`/admin/companies/${c.id}`)}
                                        >
                                            Szczegóły
                                        </button>
                                        <button
                                            type="button"
                                            className="company-btn company-btn--ghost"
                                            onClick={() => setEditCompany(c)}
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            type="button"
                                            className="company-btn company-btn--danger"
                                            onClick={() => setDeleteTarget(c)}
                                        >
                                            Usuń
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {createOpen && (
                <CompanyModal
                    mode="create"
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editCompany && (
                <CompanyModal
                    mode="edit"
                    company={editCompany}
                    onClose={() => setEditCompany(null)}
                    onSubmit={handleEdit}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Usunąć firmę?"
                    description={`Ta operacja jest nieodwracalna. Firma: ${deleteTarget.name}`}
                    confirmText="Usuń"
                    danger
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};