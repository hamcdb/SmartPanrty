import { useState } from 'react';
import { createItem } from '../services/api';

const UNITS = [
    { group: 'Weight',  options: ['kg', 'g', 'lbs', 'oz'] },
    { group: 'Volume',  options: ['L', 'mL', 'gal', 'fl oz', 'cups', 'tbsp', 'tsp'] },
    { group: 'Count',   options: ['pcs', 'pack', 'box', 'bag', 'can', 'bottle', 'jar', 'roll'] },
];

const CATEGORIES = [
    'Dairy & Eggs',
    'Produce',
    'Meat & Poultry',
    'Seafood',
    'Grains & Pasta',
    'Canned & Jarred Goods',
    'Snacks & Sweets',
    'Beverages',
    'Condiments & Sauces',
    'Frozen Foods',
    'Baked Goods',
    'Spices & Herbs',
    'Other',
];

const EMPTY = { name: '', quantity: '', unit: '', category: '', expirationDate: '' };

export default function AddItemForm({ onAdd, onClose }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { ...form, quantity: Number(form.quantity) };
            if (!payload.expirationDate) delete payload.expirationDate;
            const newItem = await createItem(payload);
            onAdd(newItem);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Item</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {error && <p className="form-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field full-width">
                            <label>Item Name *</label>
                            <input name="name" placeholder="e.g. Whole Milk" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>Quantity *</label>
                            <input name="quantity" type="number" min="0" step="0.01" placeholder="0" value={form.quantity} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>Unit *</label>
                            <select name="unit" value={form.unit} onChange={handleChange} required>
                                <option value="">Select unit…</option>
                                {UNITS.map(({ group, options }) => (
                                    <optgroup key={group} label={group}>
                                        {options.map(u => <option key={u} value={u}>{u}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} required>
                                <option value="">Select category…</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Expiry Date</label>
                            <input name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Adding…' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
