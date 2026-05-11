const catchAsync = require('../middlewares/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModel');
const mockBank = require('../utils/mockBank');
const bcrypt = require('bcryptjs');

function maskAccount(s) {
    if (!s) return '';
    const str = String(s);
    if (str.length <= 4) return '****' + str;
    return '****' + str.slice(-4);
}

// list current user's payment methods (masked)
exports.getMethods = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('paymentMethods');
    const methods = (user.paymentMethods || []).map(m => ({
        _id: m._id,
        type: m.type,
        details: m.details,
        meta: m.meta,
        verified: m.verified,
        isDefault: m.isDefault,
        createdAt: m.createdAt
    }));
    res.status(200).json({ success: true, methods });
});

// add a new payment method (bank or upi)
exports.addMethod = catchAsync(async (req, res, next) => {
    const { type, accountNumber, ifsc, upiId, holderName, bankName, makeDefault } = req.body;
    if (!type || (type !== 'bank' && type !== 'upi')) return next(new ErrorHandler('invalid type', 400));

    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler('user not found', 404));

    const method = { type, details: '', raw: {}, meta: { holderName, bankName }, verified: false, isDefault: false };

    if (type === 'bank') {
        if (!accountNumber) return next(new ErrorHandler('accountNumber required', 400));
        method.details = maskAccount(accountNumber) + (ifsc ? ` • ${ifsc}` : '');
        method.raw = { accountNumber, ifsc };
    } else {
        if (!upiId) return next(new ErrorHandler('upiId required', 400));
        method.details = maskAccount(upiId);
        method.raw = { upiId };
    }

    user.paymentMethods = user.paymentMethods || [];
    // if first method, make default
    if (user.paymentMethods.length === 0 || makeDefault) {
        user.paymentMethods.forEach(m => m.isDefault = false);
        method.isDefault = true;
    }

    user.paymentMethods.push(method);
    await user.save();

    // mock verification: create account in mock bank so transfers work later
    try {
        const methodId = user.paymentMethods[user.paymentMethods.length - 1]._id;
        const accountId = `user-${user._id}-m-${methodId}`;
        mockBank.createAccount(accountId);
        // mark verified
        const idx = user.paymentMethods.findIndex(m => String(m._id) === String(methodId));
        if (idx >= 0) { user.paymentMethods[idx].verified = true; await user.save(); }
    } catch (e) {
        // ignore mock failure
    }

    const saved = user.paymentMethods[user.paymentMethods.length - 1];
    res.status(201).json({ success: true, method: { _id: saved._id, type: saved.type, details: saved.details, verified: saved.verified, isDefault: saved.isDefault } });
});

// delete method
exports.deleteMethod = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler('user not found', 404));
    user.paymentMethods = (user.paymentMethods || []).filter(m => String(m._id) !== String(id));
    // ensure one default
    if (!(user.paymentMethods || []).some(m => m.isDefault) && user.paymentMethods.length) user.paymentMethods[0].isDefault = true;
    await user.save();
    res.status(200).json({ success: true });
});

// set default method
exports.setDefault = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler('user not found', 404));
    user.paymentMethods.forEach(m => m.isDefault = String(m._id) === String(id));
    await user.save();
    res.status(200).json({ success: true });
});

// set or update payment PIN
exports.setPin = catchAsync(async (req, res, next) => {
    const { pin } = req.body;
    if (!pin || String(pin).length < 4) return next(new ErrorHandler('pin must be at least 4 digits', 400));
    const hash = await bcrypt.hash(String(pin), 10);
    await User.findByIdAndUpdate(req.user._id, { paymentPin: hash });
    res.status(200).json({ success: true });
});

// check whether user has a pin set
exports.hasPin = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+paymentPin');
    res.status(200).json({ success: true, hasPin: !!(user && user.paymentPin) });
});

// verify provided pin (internal use) - plain helper (not middleware)
exports.verifyPin = async (userId, pin) => {
    const user = await User.findById(userId).select('+paymentPin');
    if (!user || !user.paymentPin) return false;
    return await bcrypt.compare(String(pin), user.paymentPin);
};
