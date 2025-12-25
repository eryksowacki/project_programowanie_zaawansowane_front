import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8000", // ważne: ten sam host co backend
    withCredentials: true,            // <-- kluczowe dla sesji PHPSESSID
});
