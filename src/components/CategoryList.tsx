// src/components/CategoryList.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { CategoryRow, User } from "../types";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../categoryService";

type Props = {
    user: User;      // na razie nieużywane, ale zostawiamy do ewentualnych uprawnień/UI
    canEdit: boolean; // tylko MANAGER = true
};

type CategoryType = "INCOME" | "COST";
type TypeFilter = "all" | CategoryType;

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
    { value: "all", label: "Wszystkie" },
    { value: "INCOME", label: "Przychód" },
    { value: "COST", label: "Koszt" },
];

export const CategoryList: React.FC<Props> = ({ user, canEdit }) => {
    const [items, setItems] = useState<CategoryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<TypeFilter>("all");
    const [q, setQ] = useState("");

    // create
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<CategoryType>("COST");
    const [saving, setSaving] = useState(false);

    // edit
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState<CategoryType>("COST");

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listCategories({
                type: type === "all" ? undefined : type,
            });
            setItems(data);
        } catch (e) {
            console.error(e);
            setError("Nie udało się pobrać kategorii.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return items;
        return items.filter((c) => (c.name ?? "").toLowerCase().includes(qq));
    }, [items, q]);

    const startEdit = (c: CategoryRow) => {
        setEditId(c.id);
        setEditName(c.name ?? "");
        // backend zwraca "INCOME"/"COST", ale zabezpieczamy się:
        setEditType((c.type === "INCOME" || c.type === "COST" ? c.type : "COST") as CategoryType);
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
        setEditType("COST");
    };

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) {
            alert("Podaj nazwę kategorii.");
            return;
        }

        setSaving(true);
        try {
            await createCategory({ name, type: newType });
            setNewName("");
            setNewType("COST");
            setCreateOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            alert("Nie udało się dodać kategorii.");
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
            await updateCategory(id, { name, type: editType });
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
        if (!window.confirm("Usunąć kategorię?")) return;

        setSaving(true);
        try {
            await deleteCategory(id);
            // jeśli usunąłeś aktualnie edytowaną:
            if (editId === id) cancelEdit();
            await load();
        } catch (e) {
            console.error(e);
            alert("Nie udało się usunąć kategorii.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="doc-card">
            <div className="doc-header">
                <div>
                    <h2>Kategorie</h2>
                    <p>
                        Kategorie są przypisane do Twojej firmy.{" "}
                        {canEdit ? "Możesz dodawać/edytować/usuwać." : "Masz tylko podgląd."}
                    </p>
                </div>

                <div className="doc-toolbar">
                    <input
                        className="doc-input"
                        placeholder="Szukaj…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <select
                        className="doc-select"
                        value={type}
                        onChange={(e) => setType(e.target.value as TypeFilter)}
                    >
                        {TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

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
                        placeholder="Nazwa kategorii"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />

                    <select
                        className="doc-select"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as CategoryType)}
                    >
                        <option value="INCOME">Przychód</option>
                        <option value="COST">Koszt</option>
                    </select>

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
                            <th>Typ</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="doc-empty">
                                    Brak kategorii.
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
                                                <select
                                                    className="doc-select"
                                                    value={editType}
                                                    onChange={(e) => setEditType(e.target.value as CategoryType)}
                                                >
                                                    <option value="INCOME">Przychód</option>
                                                    <option value="COST">Koszt</option>
                                                </select>
                                            ) : c.type === "INCOME" ? (
                                                "Przychód"
                                            ) : c.type === "COST" ? (
                                                "Koszt"
                                            ) : (
                                                c.type
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