const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        unit: {
            type: String,
            required: [true, 'Unit of measurement is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        expirationDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
