import { useEffect, useState } from "react";

export function CompanyList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCompanies() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8000/api/companies", {
                    credentials: "include", // wysyłamy ciasteczko PHPSESSID
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to load companies");
                }

                const data = await res.json();
                setCompanies(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCompanies();
    }, []);

    if (loading) return <p>Ładowanie firm...</p>;
    if (error) return <p style={{ color: "red" }}>Błąd: {error}</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
            <h2>Firmy</h2>
            {companies.length === 0 ? (
                <p>Brak firm.</p>
            ) : (
                <ul>
                    {companies.map((company) => (
                        <li key={company.id}>
                            {company.name}{" "}
                            {/* tu później możesz dodać przyciski np. "Pokaż kategorie", "Pokaż kontrahentów" */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
