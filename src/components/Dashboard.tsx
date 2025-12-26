// src/components/Dashboard.tsx
import React, { useMemo, useState } from "react";
import type { User } from "../types";
import "./_dashboard.css";
import { CompanyList } from "./CompanyList";
import { DocumentList } from "./DocumentList";
import { LedgerList } from "./LedgerList";
import { CategoryList } from "./CategoryList";
import { ContractorList } from "./ContractorList";

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

type UserViewMode = "documents" | "ledger" | "categories" | "contractors";

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const isSystemAdmin =
        user.role === "ROLE_SYSTEM_ADMIN" ||
        (user.roles ?? []).includes("ROLE_SYSTEM_ADMIN");

    const showUserDashboard = !isSystemAdmin;

    const isManager = useMemo(() => {
        const r = user.role;
        const roles = user.roles ?? [];
        return r === "ROLE_MANAGER" || roles.includes("ROLE_MANAGER");
    }, [user.role, user.roles]);

    const [userMode, setUserMode] = useState<UserViewMode>("documents");

    const UserTabs = () => (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button
                type="button"
                className="doc-btn doc-btn--primary"
                onClick={() => setUserMode("documents")}
                style={{ opacity: userMode === "documents" ? 1 : 0.6 }}
            >
                Dokumenty (bufor)
            </button>

            <button
                type="button"
                className="doc-btn doc-btn--primary"
                onClick={() => setUserMode("ledger")}
                style={{ opacity: userMode === "ledger" ? 1 : 0.6 }}
            >
                Rejestr (zaksięgowane)
            </button>

            <button
                type="button"
                className="doc-btn doc-btn--primary"
                onClick={() => setUserMode("categories")}
                style={{ opacity: userMode === "categories" ? 1 : 0.6 }}
            >
                Kategorie
            </button>

            <button
                type="button"
                className="doc-btn doc-btn--primary"
                onClick={() => setUserMode("contractors")}
                style={{ opacity: userMode === "contractors" ? 1 : 0.6 }}
            >
                Kontrahenci
            </button>
        </div>
    );

    return (
        <div className="dash-page">
            <div className="dash-blob dash-blob--1" />
            <div className="dash-blob dash-blob--2" />

            <div className="dash-shell">
                <header className="dash-header">
                    <div className="dash-logo">
                        <span className="dash-logo-icon">📄</span>
                        <div className="dash-logo-text">
                            <span className="dash-logo-title">DocLedger</span>
                            <span className="dash-logo-subtitle">System księgowania dokumentów</span>
                        </div>
                    </div>

                    <div className="dash-header-right">
                        <div className="dash-user-chip">
                            <div className="dash-user-avatar">{user.email.charAt(0).toUpperCase()}</div>
                            <div className="dash-user-info">
                                <span className="dash-user-email">{user.email}</span>
                                <span className="dash-user-role">{(user.role ?? "").replace("ROLE_", "")}</span>
                            </div>
                        </div>

                        <button type="button" className="dash-logout-btn" onClick={onLogout}>
                            Wyloguj
                        </button>
                    </div>
                </header>

                {/* SYSTEM ADMIN: firmy na pełną szerokość */}
                {isSystemAdmin && (
                    <main className="dash-main dash-main--single">
                        <section className="dash-main-right">
                            <CompanyList />
                        </section>
                    </main>
                )}

                {/* USER/KIEROWNIK */}
                {showUserDashboard && (
                    <main className="dash-main dash-main--single">
                        <section className="dash-main-right">
                            <UserTabs />

                            {userMode === "documents" && <DocumentList user={user} />}
                            {userMode === "ledger" && <LedgerList />}

                            {userMode === "categories" && <CategoryList user={user} canEdit={isManager} />}
                            {userMode === "contractors" && <ContractorList user={user} canEdit={isManager} />}
                        </section>
                    </main>
                )}
            </div>
        </div>
    );
};

export default Dashboard;