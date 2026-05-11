const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    media: {
        type: String,
        required: true,
    },
    startAt: {
        type: Date,
        required: true,
    },
    endAt: {
        type: Date,
        required: true,
    },
    // if true, only followers (and owner) can view this story. If false, story is public.
    visibleToFollowers: {
        type: Boolean,
        default: true,
    },
    // list of user ids who should NOT see this story (owner can hide from specific followers)
    hiddenFrom: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    views: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            viewedAt: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Story', storySchema);
