import { useState } from "react";

export function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState("admin@system.local");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // ważne dla ciasteczek
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Login failed");
            }

            const user = await res.json();
            onLoginSuccess(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 320, margin: "40px auto" }}>
            <h2>Logowanie</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Email<br />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Hasło<br />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </label>
                </div>
                {error && (
                    <div style={{ color: "red", marginBottom: 12 }}>
                        {error}
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? "Logowanie..." : "Zaloguj"}
                </button>
            </form>
        </div>
    );
}
