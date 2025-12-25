import { api } from "./api";

export async function login(email, password) {
    const response = await api.post("/api/login", { email, password });
    // response.data = { id, email, role, roles, companyId }
    return response.data;
}
