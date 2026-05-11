const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        content: {
            type: String,
            trim: true,
            required: true,
        },
        edited: { type: Boolean, default: false },
        unsent: { type: Boolean, default: false },
        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        reactions: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                emoji: { type: String }
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);