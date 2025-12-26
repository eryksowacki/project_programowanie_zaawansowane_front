import { apiFetch } from "./api";
import type { AdminUserCreateRequest, AdminUserUpdateRequest } from "./types";

export async function createAdminUser(payload: AdminUserCreateRequest) {
    return apiFetch<{ id: number; email: string; role: string | null; companyId: number | null }>(
        "/api/admin/users",
        { method: "POST", body: JSON.stringify(payload) }
    );
}

// export async function updateAdminUser(userId: number, payload: AdminUserUpdateRequest) {
//     return apiFetch<{ id: number }>(`/api/admin/users/${userId}`, {
//         method: "PATCH",
//         body: JSON.stringify(payload),
//     });
// }

export async function patchAdminUser(userId: number, payload: AdminUserUpdateRequest) {
    return apiFetch<{ id: number }>(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function updateAdminUserFull(userId: number, payload: AdminUserUpdateRequest) {
    return apiFetch<{ id: number }>(`/api/admin/users/${userId}/full`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
export async function deleteAdminUser(userId: number) {
    return apiFetch<void>(`/api/admin/users/${userId}`, { method: "DELETE" });
}