const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    amount: { type: Number, required: true }, // cents
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['bank', 'upi', 'wallet'], default: 'wallet' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    meta: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
