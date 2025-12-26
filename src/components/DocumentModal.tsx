import React, { useEffect, useMemo, useState } from "react";
import type { CategoryRow, ContractorRow, DocumentCreateRequest, DocumentType } from "../types";
import { listCategories } from "../categoryService";
import { listContractors } from "../contractorService";
import "./_documentModal.css";

type Props = {
    onClose: () => void;
    onSubmit: (payload: DocumentCreateRequest) => Promise<void>;
};

const TYPE_OPTIONS: Array<{ value: DocumentType; label: string }> = [
    { value: "INCOME", label: "Przychód" },
    { value: "COST", label: "Koszt" },
];

function todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export const DocumentModal: React.FC<Props> = ({ onClose, onSubmit }) => {
    const [type, setType] = useState<DocumentType>("COST");
    const [issueDate, setIssueDate] = useState(todayISO());
    const [eventDate, setEventDate] = useState(todayISO());
    const [description, setDescription] = useState<string>("");

    const [netAmount, setNetAmount] = useState<string>("0.00");
    const [vatAmount, setVatAmount] = useState<string>("0.00");
    const [grossAmount, setGrossAmount] = useState<string>("0.00");

    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [contractors, setContractors] = useState<ContractorRow[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [contractorId, setContractorId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [cats, cons] = await Promise.all([
                    listCategories({ type }),
                    listContractors(),
                ]);

                if (!alive) return;
                setCategories(cats);
                setContractors(cons);

                // reset wyborów, jeśli nie pasują do nowej listy
                if (!cats.some((c) => c.id === categoryId)) setCategoryId(null);
                if (!cons.some((c) => c.id === contractorId)) setContractorId(null);
            } catch (e) {
                console.error(e);
                if (!alive) return;
                setError("Nie udało się pobrać kategorii/kontrahentów.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const numbersOk = useMemo(() => {
        const n = Number(netAmount);
        const v = Number(vatAmount);
        const g = Number(grossAmount);
        return Number.isFinite(n) && Number.isFinite(v) && Number.isFinite(g);
    }, [netAmount, vatAmount, grossAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!numbersOk) {
            setError("Kwoty muszą być liczbami.");
            return;
        }

        const payload: DocumentCreateRequest = {
            type,
            issueDate,
            eventDate,
            description: description.trim() ? description.trim() : null,
            netAmount: Number(netAmount),
            vatAmount: Number(vatAmount),
            grossAmount: Number(grossAmount),
            categoryId,
            contractorId,
        };

        setSaving(true);
        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Nie udało się dodać dokumentu.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dm-backdrop" onClick={onClose}>
            <div className="dm-card" onClick={(e) => e.stopPropagation()}>
                <div className="dm-head">
                    <div>
                        <div className="dm-title">Dodaj dokument</div>
                        <div className="dm-subtitle">Zapisze się w buforze (BUFFER).</div>
                    </div>

                    <button type="button" className="dm-x" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {error && <div className="dm-error">{error}</div>}
                {loading && <div className="dm-info">Ładowanie danych…</div>}

                <form className="dm-form" onSubmit={handleSubmit}>
                    <div className="dm-grid">
                        <label className="dm-label">
                            Typ
                            <select className="dm-input" value={type} onChange={(e) => setType(e.target.value)}>
                                {TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="dm-label">
                            Data wystawienia
                            <input
                                type="date"
                                className="dm-input"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </label>

                        <label className="dm-label">
                            Data zdarzenia
                            <input
                                type="date"
                                className="dm-input"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                required
                            />
                        </label>

                        <label className="dm-label dm-span-2">
                            Opis
                            <input
                                type="text"
                                className="dm-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="np. Zakup materiałów"
                            />
                        </label>

                        <label className="dm-label">
                            Netto
                            <input
                                type="number"
                                step="0.01"
                                className="dm-input"
                                value={netAmount}
                                onChange={(e) => setNetAmount(e.target.value)}
                                required
                            />
                        </label>

                        <label className="dm-label">
                            VAT
                            <input
                                type="number"
                                step="0.01"
                                className="dm-input"
                                value={vatAmount}
                                onChange={(e) => setVatAmount(e.target.value)}
                                required
                            />
                        </label>

                        <label className="dm-label">
                            Brutto
                            <input
                                type="number"
                                step="0.01"
                                className="dm-input"
                                value={grossAmount}
                                onChange={(e) => setGrossAmount(e.target.value)}
                                required
                            />
                        </label>

                        <label className="dm-label dm-span-2">
                            Kategoria (opcjonalnie)
                            <select
                                className="dm-input"
                                value={categoryId ?? ""}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">— brak —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="dm-label dm-span-2">
                            Kontrahent (opcjonalnie)
                            <select
                                className="dm-input"
                                value={contractorId ?? ""}
                                onChange={(e) => setContractorId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">— brak —</option>
                                {contractors.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                        {c.taxId ? ` (${c.taxId})` : ""}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="dm-actions">
                        <button type="button" className="dm-btn dm-btn--ghost" onClick={onClose}>
                            Anuluj
                        </button>
                        <button type="submit" className="dm-btn dm-btn--primary" disabled={saving || loading}>
                            {saving ? "Zapisywanie…" : "Dodaj"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};