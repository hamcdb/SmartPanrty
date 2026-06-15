const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const BASE_URL = `${API_BASE}/api/items`;
const AUTH_URL = `${API_BASE}/api/auth`;

function authHeaders() {
    const token = localStorage.getItem('sp_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/* ── Auth ─────────────────────────────────────────────── */
export async function register(name, email, password) {
    const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

export async function login(email, password) {
    const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
}

/* ── Items ────────────────────────────────────────────── */
export async function getAllItems() {
    const res = await fetch(BASE_URL, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
}

export async function getItemById(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Item not found');
    return res.json();
}

export async function createItem(data) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create item');
    }
    return res.json();
}

export async function updateItem(id, data) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update item');
    }
    return res.json();
}

export async function deleteItem(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete item');
    }
    return res.json();
}

