const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const protect = require('../middleware/auth');

// All item routes require a valid JWT
router.use(protect);

// GET /api/items — Retrieve all pantry items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find({ userId: req.userId });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/items/:id — Retrieve a single item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/items — Add a new pantry item
router.post('/', async (req, res) => {
    try {
        const item = new Item({ ...req.body, userId: req.userId });
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: err.message });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/items/:id — Update an existing item
router.put('/:id', async (req, res) => {
    try {
        const item = await Item.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: err.message });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/items/:id — Remove an item from the pantry
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
