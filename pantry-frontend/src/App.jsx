import { useState, useEffect } from 'react';
import { getAllItems } from './services/api';
import { useAuth } from './context/AuthContext';
import ItemList from './components/ItemList';
import AddItemForm from './components/AddItemForm';
import EditItemModal from './components/EditItemModal';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import './App.css';

const NAV = [
    { label: 'Dashboard', icon: <GridIcon />, active: true }
    // { label: 'Inventory', icon: <BoxIcon /> },
    // { label: 'Orders', icon: <ListIcon /> },
    // { label: 'Reports', icon: <ChartIcon /> },
];

const NAV_BOTTOM = [
    { label: 'Sign Out', icon: <SignOutIcon /> },
    // { label: 'Help & Support', icon: <HelpIcon /> },
];

export default function App() {
    const { user, logout } = useAuth();
    const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selected, setSelected] = useState(new Set());

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setError('');
        getAllItems()
            .then(setItems)
            .catch(() => setError('Could not load pantry. Is the server running?'))
            .finally(() => setLoading(false));
    }, [user]);

    function handleAdd(newItem) {
        setItems((prev) => [newItem, ...prev]);
        setShowAdd(false);
    }

    function handleSave(updated) {
        setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
        setEditingItem(null);
    }

    function handleDelete(id) {
        setItems((prev) => prev.filter((i) => i._id !== id));
    }

    function toggleSelect(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSelectAll() {
        setSelected((prev) =>
            prev.size === filtered.length ? new Set() : new Set(filtered.map((i) => i._id))
        );
    }

    function getStatus(item) {
        if (!item.expirationDate) return 'fresh';
        const diff = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (diff < 0) return 'expired';
        if (diff <= 7) return 'expiring';
        return 'fresh';
    }

    const categories = [...new Set(items.map((i) => i.category))].sort();

    const filtered = items.filter((i) => {
        const q = search.toLowerCase();
        const matchSearch = i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
        const matchCategory = !filterCategory || i.category === filterCategory;
        const matchStatus = !filterStatus || getStatus(i) === filterStatus;
        return matchSearch && matchCategory && matchStatus;
    });

    // ── Auth gate ───────────────────────────────────────────
    if (!user) {
        return authView === 'login'
            ? <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
            : <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }

    // ── Derive avatar initials ───────────────────────────────
    const initials = user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="layout">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">SP</span>
                    <span className="brand-name">SMARTPANTRY</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        {NAV.map(({ label, icon, active }) => (
                            <a key={label} className={`nav-item${active ? ' active' : ''}`}>
                                <span className="nav-icon">{icon}</span>
                                {label}
                            </a>
                        ))}
                    </div>
                    <div className="nav-group nav-bottom">
                        {NAV_BOTTOM.map(({ label, icon }) => (
                            <a key={label} className="nav-item" onClick={label === 'Sign Out' ? logout : undefined} style={{ cursor: 'pointer' }}>
                                <span className="nav-icon">{icon}</span>
                                {label}
                            </a>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* ── Main Area ── */}
            <div className="main-area">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-search">
                        <SearchIcon />
                        <input
                            placeholder="Search by name or category…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* <div className="topbar-right">
                        <span className="icon-btn">🔔</span>
                        <span className="avatar">JD</span>
                    </div> */}
                    <div className="topbar-right">
                        <span className="avatar" title={user.name}>{initials}</span>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    <div className="page-toolbar">
                        <h1 className="page-title">Dashboard</h1>
                        <div className="toolbar-actions">
                            <button className="btn-dark" onClick={() => setShowAdd(true)}>
                                Add New <span>›</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <div className="filter-bar-left">
                            <select
                                className="filter-select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <div className="status-pills">
                                {[
                                    { value: '',         label: 'All' },
                                    { value: 'fresh',    label: 'Fresh' },
                                    { value: 'expiring', label: 'Expiring Soon' },
                                    { value: 'expired',  label: 'Expired' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        className={`status-pill${filterStatus === value ? ' active' : ''} pill-${value || 'all'}`}
                                        onClick={() => setFilterStatus(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-bar-right">
                            {(filterCategory || filterStatus) && (
                                <button
                                    className="filter-clear"
                                    onClick={() => { setFilterCategory(''); setFilterStatus(''); }}
                                >
                                    Clear filters
                                </button>
                            )}
                            <span className="results-count">
                                {filtered.length} item{filtered.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {loading && <p className="state-msg">Loading…</p>}
                        {error && <p className="state-msg error">{error}</p>}
                        {!loading && !error && (
                            <ItemList
                                items={filtered}
                                selected={selected}
                                onToggleSelect={toggleSelect}
                                onToggleSelectAll={toggleSelectAll}
                                onEdit={setEditingItem}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            {showAdd && <AddItemForm onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onSave={handleSave}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    );
}

/* ── Inline SVG Icons ─────────────────────────────────── */
function GridIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    );
}
function BoxIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
    );
}
function ListIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
    );
}
function ChartIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
    );
}
function GearIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    );
}
function SignOutIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    );
}
function HelpIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    );
}
function SearchIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );
}
