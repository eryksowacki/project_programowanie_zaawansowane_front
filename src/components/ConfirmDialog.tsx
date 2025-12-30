// src/components/ConfirmDialog.tsx
import React, { useEffect, useRef, useState } from "react";
import "./_companyList.css";

interface ConfirmDialogProps {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;

    // Jeśli onConfirm rzuci Error("..."), to pokażemy tę wiadomość
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
}

function getErrorMessage(err: unknown): string {
    const anyErr = err as any;

    // jeśli rzucasz Error("...") to message jest OK
    if (typeof anyErr?.message === "string" && anyErr.message.trim()) return anyErr.message;

    // axios-like: err.response.data.message
    const msg = anyErr?.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    // w ostateczności:
    try {
        return JSON.stringify(anyErr);
    } catch {
        return "Operacja nie powiodła się.";
    }
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const showErrorFor7s = (msg: string) => {
        setError(msg);
        clearTimer();
        timerRef.current = window.setTimeout(() => {
            setError(null);
            timerRef.current = null;
        }, 7000);
    };

    useEffect(() => {
        // ESC zamyka modal
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            clearTimer();
        };
    }, [onCancel]);

    const handleConfirm = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            await onConfirm();
            // sukces -> zamykamy modal
            onCancel();
        } catch (err) {
            // błąd -> pokazujemy i ODRAZU odblokowujemy UI
            showErrorFor7s(getErrorMessage(err));
        } finally {
            // 🔥 to jest klucz – bez tego modal “wisi” w przetwarzaniu
            setIsSubmitting(false);
        }
    };

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

                    {/* Zamykamy zawsze, nawet jeśli był błąd */}
                    <button type="button" className="company-btn company-btn--ghost" onClick={onCancel}>
                        Zamknij
                    </button>
                </div>

                {error && (
                    <div className="company-inline-error" style={{ margin: "0 0 12px 0" }}>
                        {error}
                    </div>
                )}

                <div className="company-modal-footer">
                    <button
                        type="button"
                        className="company-btn company-btn--ghost"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`company-btn ${danger ? "company-btn--danger" : "company-btn--primary"}`}
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Przetwarzanie..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};