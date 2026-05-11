const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    balance: { type: Number, default: 0 }, // store in cents
    currency: { type: String, default: 'INR' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Wallet', walletSchema);
