// src/components/ConfirmDialog.tsx
import React from "react";
import "./_companyList.css";

interface ConfirmDialogProps {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                title,
                                                                description,
                                                                confirmText = "Potwierdź",
                                                                cancelText = "Anuluj",
                                                                danger = false,
                                                                onConfirm,
                                                                onCancel,
                                                            }) => {
    return (
        <div className="company-modal-backdrop" onMouseDown={onCancel}>
            <div
                className="company-modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="company-modal-header">
                    <div>
                        <h3 className="company-modal-title">{title}</h3>
                        <p className="company-modal-subtitle">{description}</p>
                    </div>
                    <button type="button" className="company-btn company-btn--ghost" onClick={onCancel}>
                        Zamknij
                    </button>
                </div>

                <div className="company-modal-footer">
                    <button type="button" className="company-btn company-btn--ghost" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`company-btn ${danger ? "company-btn--danger" : "company-btn--primary"}`}
                        onClick={() => onConfirm()}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};