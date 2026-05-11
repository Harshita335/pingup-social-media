const catchAsync = require('../middlewares/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const mockBank = require('../utils/mockBank');

// ensure wallet exists for user
exports.ensureWallet = catchAsync(async (req, res, next) => {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    req.wallet = wallet;
    next();
});

// top-up wallet via mock bank/upi
exports.topUp = catchAsync(async (req, res, next) => {
    const { amount, method } = req.body; // amount in decimal rupees
    if (!amount || isNaN(amount) || Number(amount) <= 0) return next(new ErrorHandler('invalid amount', 400));
    const cents = Math.round(Number(amount) * 100);

    const tx = await Transaction.create({ from: null, to: req.user._id, amount: cents, method: method || 'bank', status: 'pending' });

    try {
        // mock bank processing
        const accountId = `user-${req.user._id}`;
        const result = await mockBank.processTopUp({ accountId, amountCents: cents, method });
        if (!result.success) throw new Error(result.error || 'topup failed');

        // credit wallet
        const wallet = await Wallet.findOneAndUpdate({ user: req.user._id }, { $inc: { balance: cents } }, { new: true, upsert: true });
        tx.status = 'success';
        tx.meta = { txId: result.txId };
        await tx.save();

        res.status(200).json({ success: true, wallet, transaction: tx });
    } catch (e) {
        tx.status = 'failed';
        tx.meta = { error: e.message };
        await tx.save();
        return next(new ErrorHandler(e.message || 'topup failed', 500));
    }
});

// transfer funds to follower
exports.transferToUser = catchAsync(async (req, res, next) => {
    // Accept either toUserId or toUsername (preferred)
    const { toUserId, toUsername, amount, method } = req.body;
    if (!toUserId && !toUsername) return next(new ErrorHandler('toUserId or toUsername required', 400));
    if (!amount || isNaN(amount) || Number(amount) <= 0) return next(new ErrorHandler('invalid amount', 400));

    const cents = Math.round(Number(amount) * 100);
    const { senderMethodId, pin } = req.body;
    const fromWallet = await Wallet.findOne({ user: req.user._id });
    if (!fromWallet || fromWallet.balance < cents) return next(new ErrorHandler('Insufficient balance', 400));

    // resolve recipient
    let recipient = null;
    if (toUserId) recipient = await User.findById(toUserId).select('username paymentMethods');
    else if (toUsername) recipient = await User.findOne({ username: toUsername }).select('username paymentMethods');
    if (!recipient) return next(new ErrorHandler('Recipient not found', 404));

    // ensure recipient is a follower of sender (i.e., sender can send to their followers)
    const sender = await User.findById(req.user._id).select('followers paymentMethods');
    if (!sender) return next(new ErrorHandler('sender not found', 404));
    const isFollower = (sender.followers || []).some(f => String(f) === String(recipient._id));
    if (!isFollower) return next(new ErrorHandler('Recipient must be one of your followers', 403));

    // if user has a payment PIN set, require and verify it
    const pinController = require('./paymentMethodController');
    const hasPin = (sender && sender.paymentMethods) ? false : false; // placeholder
    // fetch actual pin status
    const userWithPin = await User.findById(req.user._id).select('+paymentPin');
    if (userWithPin && userWithPin.paymentPin) {
        if (!pin) return next(new ErrorHandler('PIN required', 400));
        const ok = await pinController.verifyPin(req.user._id, pin);
        if (!ok) return next(new ErrorHandler('Invalid PIN', 401));
    }
    if (!recipient) return next(new ErrorHandler('Recipient not found', 404));

    const tx = await Transaction.create({ from: req.user._id, to: recipient._id, amount: cents, method: method || 'wallet', status: 'pending' });

    try {
        // perform internal transfer via mockBank (wallet-backed)
        // use senderMethodId if provided to simulate using a specific linked account
        const fromAccountId = senderMethodId ? `user-${req.user._id}-m-${senderMethodId}` : `user-${req.user._id}`;
        const toAccountId = `user-${recipient._id}`;
        const result = await mockBank.processTransfer({ fromAccountId, toAccountId, amountCents: cents, method });
        if (!result.success) throw new Error(result.error || 'transfer failed');

        // adjust wallets
        await Wallet.findOneAndUpdate({ user: req.user._id }, { $inc: { balance: -cents } });
        const toWallet = await Wallet.findOneAndUpdate({ user: recipient._id }, { $inc: { balance: cents } }, { new: true, upsert: true });

        tx.status = 'success';
        tx.meta = { txId: result.txId };
        await tx.save();

        // add notification to recipient
        const notif = { type: 'payment', message: `${req.user.username || 'Someone'} sent you ₹${(cents/100).toFixed(2)}`, data: { from: req.user._id, amount: cents, txId: result.txId }, read: false, createdAt: new Date() };
        await User.findByIdAndUpdate(recipient._id, { $push: { notifications: notif } });

        // emit socket event if available
        try {
            const io = req.app && req.app.get && req.app.get('io');
            if (io) io.emit('notification', { to: String(recipient._id), ...notif });
        } catch (e) { }

        // create or find chat and send a message linking the transaction
        try {
            const Chat = require('../models/chatModel');
            const Message = require('../models/messageModel');

            let chat = await Chat.findOne({ users: { $all: [req.user._id, recipient._id] } });
            if (!chat) chat = await Chat.create({ users: [req.user._id, recipient._id] });

            const content = `You received ₹${(cents/100).toFixed(2)} from ${req.user.username || 'someone'}.`;
            const newMessage = await Message.create({ sender: req.user._id, chatId: chat._id, content, meta: { txId: result.txId, amount: cents } });

            await Chat.findByIdAndUpdate(chat._id, { latestMessage: newMessage });
            // optionally emit message event
            try {
                const io = req.app && req.app.get && req.app.get('io');
                if (io) io.emit('newMessage', { to: String(recipient._id), message: newMessage });
            } catch (e) {}
        } catch (e) {}

        res.status(200).json({ success: true, transaction: tx, toWallet });
    } catch (e) {
        tx.status = 'failed';
        tx.meta = { error: e.message };
        await tx.save();
        return next(new ErrorHandler(e.message || 'transfer failed', 500));
    }
});

// list user's transactions
exports.getTransactions = catchAsync(async (req, res, next) => {
    const txs = await Transaction.find({ $or: [{ from: req.user._id }, { to: req.user._id }] }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions: txs });
});

// get current user's wallet
exports.getWallet = catchAsync(async (req, res, next) => {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    res.status(200).json({ success: true, wallet });
});
