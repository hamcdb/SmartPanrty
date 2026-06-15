import { deleteItem } from '../services/api';

export default function ItemList({ items, selected, onToggleSelect, onToggleSelectAll, onEdit, onDelete }) {

    async function handleDelete(id) {
        if (!window.confirm('Remove this item from the pantry?')) return;
        try {
            await deleteItem(id);
            onDelete(id);
        } catch (err) {
            alert(err.message);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getStatus(item) {
        if (!item.expirationDate) return 'fresh';
        const diff = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (diff < 0) return 'expired';
        if (diff <= 7) return 'expiring';
        return 'fresh';
    }

    function getExpiryClass(item) {
        if (!item.expirationDate) return '';
        const diff = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (diff < 0) return 'cell-expiry-expired';
        if (diff <= 7) return 'cell-expiry-warn';
        return '';
    }

    const STATUS_LABEL = { fresh: 'FRESH', expiring: 'EXPIRING', expired: 'EXPIRED' };

    return (
        <table className="items-table">
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            checked={items.length > 0 && selected.size === items.length}
                            onChange={onToggleSelectAll}
                        />
                    </th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>QTY</th>
                    <th>Unit</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr className="empty-row">
                        <td colSpan={8}>Your pantry is empty — click Add New to get started.</td>
                    </tr>
                ) : (
                    items.map((item) => {
                        const status = getStatus(item);
                        return (
                            <tr key={item._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(item._id)}
                                        onChange={() => onToggleSelect(item._id)}
                                    />
                                </td>
                                <td>
                                    <span className="cell-name" onClick={() => onEdit(item)}>
                                        {item.name}
                                    </span>
                                </td>
                                <td><span className="cell-category">{item.category}</span></td>
                                <td><span className="cell-qty">{item.quantity}</span></td>
                                <td>{item.unit}</td>
                                <td className={getExpiryClass(item)}>{formatDate(item.expirationDate)}</td>
                                <td>
                                    <span className={`status-badge status-${status}`}>
                                        {STATUS_LABEL[status]}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-action-cell">
                                        <button className="table-edit-btn" onClick={() => onEdit(item)} title="Edit">
                                            <PencilIcon />
                                        </button>
                                        <button className="table-delete-btn" onClick={() => handleDelete(item._id)} title="Delete">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
}

function PencilIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    );
}
