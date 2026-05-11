const catchAsync = require("../middlewares/catchAsync");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const mongoose = require('mongoose');

// Send New Message
exports.newMessage = catchAsync(async (req, res, next) => {

    const { chatId, content } = req.body;

    const msgData = {
        sender: req.user._id,
        chatId,
        content,
    }

    const newMessage = await Message.create(msgData);

    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

    res.status(200).json({
        success: true,
        newMessage,
    });
});

// Get All Messages
exports.getMessages = catchAsync(async (req, res, next) => {
    // exclude messages the current user deleted for themselves
    const messages = await Message.find({
        chatId: req.params.chatId,
        $or: [ { deletedFor: { $exists: false } }, { deletedFor: { $not: { $elemMatch: { $eq: req.user._id } } } } ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        messages,
    });
});

// Edit message (only sender)
exports.editMessage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return next(new Error('content required'));
    const msg = await Message.findById(id);
    if (!msg) return next(new Error('message not found'));
    if (String(msg.sender) !== String(req.user._id)) return next(new Error('not authorized'));
    msg.content = content;
    msg.edited = true;
    await msg.save();

    // emit socket event
    try { const io = req.app.get && req.app.get('io'); if (io) io.emit('messageUpdated', msg); } catch (e) {}

    res.status(200).json({ success: true, message: msg });
});

// Delete or Unsend message
exports.deleteMessage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const unsend = req.query.unsend === 'true';
    const msg = await Message.findById(id);
    if (!msg) return next(new Error('message not found'));

    if (unsend) {
        // only sender can unsend (remove for both)
        if (String(msg.sender) !== String(req.user._id)) return next(new Error('not authorized'));
        msg.unsent = true;
        msg.content = '';
        await msg.save();
        try { const io = req.app.get && req.app.get('io'); if (io) io.emit('messageDeleted', { id: msg._id, unsent: true }); } catch (e) {}
        return res.status(200).json({ success: true });
    }

    // local delete for requester
    if (!(msg.deletedFor || []).some(u => String(u) === String(req.user._id))) {
        msg.deletedFor = msg.deletedFor || [];
        msg.deletedFor.push(req.user._id);
        await msg.save();
    }
    try { const io = req.app.get && req.app.get('io'); if (io) io.emit('messageDeleted', { id: msg._id, deletedFor: req.user._id }); } catch (e) {}
    res.status(200).json({ success: true });
});

// Toggle reaction
exports.toggleReaction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { emoji } = req.body;
    if (!emoji) return next(new Error('emoji required'));
    const msg = await Message.findById(id);
    if (!msg) return next(new Error('message not found'));

    const existing = (msg.reactions || []).find(r => String(r.user) === String(req.user._id) && r.emoji === emoji);
    if (existing) {
        // remove
        msg.reactions = (msg.reactions || []).filter(r => !(String(r.user) === String(req.user._id) && r.emoji === emoji));
    } else {
        msg.reactions = msg.reactions || [];
        msg.reactions.push({ user: req.user._id, emoji });
    }
    await msg.save();
    try { const io = req.app.get && req.app.get('io'); if (io) io.emit('messageReaction', { id: msg._id, reactions: msg.reactions }); } catch (e) {}
    res.status(200).json({ success: true, reactions: msg.reactions });
});