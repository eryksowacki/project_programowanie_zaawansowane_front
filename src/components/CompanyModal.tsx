// src/components/CompanyModal.tsx
import React, { useEffect, useState } from "react";
import type { Company, CompanyCreateRequest, CompanyUpdateRequest } from "../types";
import "./_companyList.css";

type Mode = "create" | "edit";

interface CompanyModalProps {
    mode: Mode;
    company?: Company; // wymagane dla edit
    onClose: () => void;
    onSubmit: (payload: CompanyCreateRequest | CompanyUpdateRequest) => Promise<void>;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
                                                              mode,
                                                              company,
                                                              onClose,
                                                              onSubmit,
                                                          }) => {
    const isEdit = mode === "edit";

    const [name, setName] = useState("");
    const [taxId, setTaxId] = useState("");
    const [address, setAddress] = useState("");
    const [active, setActive] = useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && company) {
            setName(company.name ?? "");
            setTaxId(company.taxId ?? "");
            setAddress(company.address ?? "");
            setActive(Boolean(company.active));
        } else {
            setName("");
            setTaxId("");
            setAddress("");
            setActive(true);
        }
    }, [isEdit, company]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (name.trim().length < 2) {
            setError("Nazwa firmy jest wymagana (min. 2 znaki).");
            return;
        }

        setSaving(true);
        try {
            const payload: CompanyCreateRequest | CompanyUpdateRequest = {
                name: name.trim(),
                taxId: taxId.trim() === "" ? null : taxId.trim(),
                address: address.trim() === "" ? null : address.trim(),
                active,
            };
            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Nie udało się zapisać firmy. Sprawdź dane i spróbuj ponownie.");
        } finally {
            setSaving(false);
        }
    };

    const title = isEdit ? "Edytuj firmę" : "Dodaj nową firmę";
    const subtitle = isEdit
        ? "Zmień dane firmy i zapisz."
        : "Uzupełnij dane firmy, aby dodać ją do systemu.";

    return (
        <div className="company-modal-backdrop" onMouseDown={onClose}>
            <div
                className="company-modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="company-modal-header">
                    <div>
                        <h3 className="company-modal-title">{title}</h3>
                        <p className="company-modal-subtitle">{subtitle}</p>
                    </div>
                    <button type="button" className="company-btn company-btn--ghost" onClick={onClose}>
                        Zamknij
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="company-modal-body">
                        {error && <div className="company-inline-error">{error}</div>}

                        <div className="company-field">
                            <div className="company-label">Nazwa</div>
                            <input
                                className="company-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="np. ABC Sp. z o.o."
                                autoFocus
                            />
                        </div>

                        <div className="company-field">
                            <div className="company-label">NIP</div>
                            <input
                                className="company-input"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="np. 1234567890"
                            />
                        </div>

                        <div className="company-field">
                            <div className="company-label">Adres</div>
                            <textarea
                                className="company-textarea"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ulica, numer, kod, miasto"
                            />
                        </div>

                        <label className="company-checkbox-row">
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                            />
                            Firma aktywna
                        </label>
                    </div>

                    <div className="company-modal-footer">
                        <button
                            type="button"
                            className="company-btn company-btn--ghost"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            className="company-btn company-btn--primary"
                            disabled={saving}
                        >
                            {saving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};