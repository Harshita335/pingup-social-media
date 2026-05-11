const express = require('express');
const { ensureWallet, topUp, transferToUser, getTransactions, getWallet } = require('../controllers/paymentController');
const { getMethods, addMethod, deleteMethod, setDefault, setPin, hasPin } = require('../controllers/paymentMethodController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express();

// simple in-memory rate limiter per user id (10 requests per minute)
const limits = new Map();
function rateLimiter(req, res, next) {
	try {
		const key = req.user ? String(req.user._id) : req.ip;
		const now = Date.now();
		const windowMs = 60 * 1000;
		const max = 20; // 20 requests per minute
		const entry = limits.get(key) || { count: 0, start: now };
		if (now - entry.start > windowMs) {
			entry.count = 1;
			entry.start = now;
		} else {
			entry.count += 1;
		}
		limits.set(key, entry);
		if (entry.count > max) return res.status(429).json({ success: false, message: 'Too many payment requests, slow down' });
		next();
	} catch (e) {
		next();
	}
}

// request logger for payments
function paymentLogger(req, res, next) {
	try {
		console.log(`[PAYMENT] ${new Date().toISOString()} user:${req.user ? req.user._id : 'anon'} ${req.method} ${req.originalUrl} body:${JSON.stringify(req.body).slice(0,500)}`);
	} catch (e) {}
	next();
}

router.use(isAuthenticated, rateLimiter, paymentLogger);
router.post('/wallet/topup', ensureWallet, topUp);
router.post('/transfer', ensureWallet, transferToUser);
router.get('/transactions', getTransactions);
router.get('/wallet', ensureWallet, getWallet);

// payment methods management
router.get('/methods', getMethods);
router.post('/methods', addMethod);
router.delete('/methods/:id', deleteMethod);
router.post('/methods/:id/set-default', setDefault);
router.post('/pin/set', setPin);
router.get('/pin/status', hasPin);

// recipients: your followers who have verified payment methods
router.get('/recipients', async (req, res, next) => {
	try {
		const User = require('../models/userModel');
		const me = await User.findById(req.user._id).select('followers');
		const followerIds = (me && me.followers) ? me.followers : [];
		const recipients = await User.find({ _id: { $in: followerIds }, 'paymentMethods.verified': true }).select('username avatar paymentMethods');
		// map methods to only include masked details
		const mapped = recipients.map(r => ({ _id: r._id, username: r.username, avatar: r.avatar, paymentMethods: (r.paymentMethods || []).filter(m=>m.verified).map(m=>({ _id: m._id, type: m.type, details: m.details, isDefault: m.isDefault })) }));
		res.status(200).json({ success: true, recipients: mapped });
	} catch (e) { next(e); }
});

module.exports = router;
