// src/components/LedgerList.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { LedgerRow } from "../types";
import { listLedger } from "../documentService";
import "./_ledgerList.css";

export const LedgerList: React.FC = () => {
    const [rows, setRows] = useState<LedgerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState("");

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listLedger();
            setRows(data);
        } catch (e) {
            console.error(e);
            setError("Nie udało się pobrać rejestru (zaksięgowanych dokumentów).");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return rows;
        return rows.filter((r) => (r.description ?? "").toLowerCase().includes(qq));
    }, [rows, q]);

    return (
        <div className="ledger-card">
            <div className="ledger-header">
                <div>
                    <h2>Rejestr</h2>
                    <p>Zaksięgowane dokumenty (BOOKED) z numerem ewidencyjnym.</p>
                </div>

                <div className="ledger-toolbar">
                    <input
                        className="ledger-input"
                        placeholder="Szukaj w opisie…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <button className="ledger-btn ledger-btn--ghost" type="button" onClick={load} disabled={loading}>
                        Odśwież
                    </button>
                </div>
            </div>

            {loading && <div className="ledger-info">Ładowanie…</div>}
            {error && <div className="ledger-error">{error}</div>}

            {!loading && !error && (
                <div className="ledger-tablewrap">
                    <table className="ledger-table">
                        <thead>
                        <tr>
                            <th>Nr ewid.</th>
                            <th>Data zdarzenia</th>
                            <th>Typ</th>
                            <th>Opis</th>
                            <th className="ledger-th-right">Netto</th>
                            <th className="ledger-th-right">Brutto</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="ledger-empty">
                                    Brak pozycji w rejestrze.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((r) => (
                                <tr key={r.ledgerNumber}>
                                    <td>{r.ledgerNumber}</td>
                                    <td>{r.eventDate}</td>
                                    <td>{r.type === "INCOME" ? "Przychód" : r.type === "COST" ? "Koszt" : r.type}</td>
                                    <td>{r.description ?? "—"}</td>
                                    <td className="ledger-td-right">{Number(r.netAmount).toFixed(2)}</td>
                                    <td className="ledger-td-right">{Number(r.grossAmount).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};