// src/components/ContractorList.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { ContractorRow, User } from "../types";
import { createContractor, deleteContractor, listContractors, updateContractor } from "../contractorService";

type Props = {
    user: User;
    canEdit: boolean; // tylko MANAGER = true
};

export const ContractorList: React.FC<Props> = ({ canEdit }) => {
    const [items, setItems] = useState<ContractorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");

    // create
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTaxId, setNewTaxId] = useState<string>("");
    const [newAddress, setNewAddress] = useState<string>("");
    const [saving, setSaving] = useState(false);

    // edit
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editTaxId, setEditTaxId] = useState<string>("");
    const [editAddress, setEditAddress] = useState<string>("");

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listContractors();
            setItems(data);
        } catch (e) {
            console.error(e);
            setError("Nie udało się pobrać kontrahentów.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return items;
        return items.filter((c) => {
            const blob = `${c.name ?? ""} ${c.taxId ?? ""} ${c.address ?? ""}`.toLowerCase();
            return blob.includes(qq);
        });
    }, [items, q]);

    const startEdit = (c: ContractorRow) => {
        setEditId(c.id);
        setEditName(c.name ?? "");
        setEditTaxId(c.taxId ?? "");
        setEditAddress(c.address ?? "");
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
        setEditTaxId("");
        setEditAddress("");
    };

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) {
            alert("Podaj nazwę kontrahenta.");
            return;
        }

        setSaving(true);
        try {
            await createContractor({
                name,
                taxId: newTaxId.trim() ? newTaxId.trim() : null,
                address: newAddress.trim() ? newAddress.trim() : null,
            });
            setNewName("");
            setNewTaxId("");
            setNewAddress("");
            setCreateOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            alert("Nie udało się dodać kontrahenta.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async (id: number) => {
        const name = editName.trim();
        if (!name) {
            alert("Nazwa nie może być pusta.");
            return;
        }

        setSaving(true);
        try {
            await updateContractor(id, {
                name,
                taxId: editTaxId.trim() ? editTaxId.trim() : null,
                address: editAddress.trim() ? editAddress.trim() : null,
            });
            cancelEdit();
            await load();
        } catch (e) {
            console.error(e);
            alert("Nie udało się zapisać zmian.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Usunąć kontrahenta?")) return;
        setSaving(true);
        try {
            await deleteContractor(id);
            await load();
        } catch (e) {
            console.error(e);
            alert("Nie udało się usunąć kontrahenta.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="doc-card">
            <div className="doc-header">
                <div>
                    <h2>Kontrahenci</h2>
                    <p>
                        Lista kontrahentów w Twojej firmie.{" "}
                        {canEdit ? "Możesz dodawać/edytować/usuwać." : "Masz tylko podgląd."}
                    </p>
                </div>

                <div className="doc-toolbar">
                    <input
                        className="doc-input"
                        placeholder="Szukaj (nazwa/NIP/adres)…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <button className="doc-btn doc-btn--ghost" type="button" onClick={load} disabled={loading}>
                        Odśwież
                    </button>

                    {canEdit && (
                        <button
                            className="doc-btn doc-btn--primary"
                            type="button"
                            onClick={() => setCreateOpen((v) => !v)}
                        >
                            {createOpen ? "× Zamknij" : "+ Dodaj"}
                        </button>
                    )}
                </div>
            </div>

            {canEdit && createOpen && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        className="doc-input"
                        placeholder="Nazwa"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <input
                        className="doc-input"
                        placeholder="NIP (opcjonalnie)"
                        value={newTaxId}
                        onChange={(e) => setNewTaxId(e.target.value)}
                    />
                    <input
                        className="doc-input"
                        placeholder="Adres (opcjonalnie)"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        style={{ minWidth: 260 }}
                    />

                    <button className="doc-btn doc-btn--primary" type="button" onClick={handleCreate} disabled={saving}>
                        {saving ? "Zapisywanie…" : "Zapisz"}
                    </button>
                </div>
            )}

            {loading && <div className="doc-info">Ładowanie…</div>}
            {error && <div className="doc-error">{error}</div>}

            {!loading && !error && (
                <div className="doc-tablewrap">
                    <table className="doc-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nazwa</th>
                            <th>NIP</th>
                            <th>Adres</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="doc-empty">
                                    Brak kontrahentów.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => {
                                const isEditing = editId === c.id;

                                return (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    className="doc-input"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            ) : (
                                                c.name
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    className="doc-input"
                                                    value={editTaxId}
                                                    onChange={(e) => setEditTaxId(e.target.value)}
                                                />
                                            ) : (
                                                c.taxId ?? "—"
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    className="doc-input"
                                                    value={editAddress}
                                                    onChange={(e) => setEditAddress(e.target.value)}
                                                    style={{ minWidth: 260 }}
                                                />
                                            ) : (
                                                c.address ?? "—"
                                            )}
                                        </td>

                                        <td style={{ whiteSpace: "nowrap" }}>
                                            {!canEdit ? (
                                                <button className="doc-btn" type="button" disabled>
                                                    —
                                                </button>
                                            ) : isEditing ? (
                                                <>
                                                    <button
                                                        className="doc-btn doc-btn--primary"
                                                        type="button"
                                                        onClick={() => handleSaveEdit(c.id)}
                                                        disabled={saving}
                                                    >
                                                        Zapisz
                                                    </button>
                                                    <button
                                                        className="doc-btn doc-btn--ghost"
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        disabled={saving}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Anuluj
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="doc-btn doc-btn--ghost"
                                                        type="button"
                                                        onClick={() => startEdit(c)}
                                                        disabled={saving}
                                                    >
                                                        Edytuj
                                                    </button>
                                                    <button
                                                        className="doc-btn"
                                                        type="button"
                                                        onClick={() => handleDelete(c.id)}
                                                        disabled={saving}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Usuń
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};