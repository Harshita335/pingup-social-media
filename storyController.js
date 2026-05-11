const Story = require('../models/storyModel');
const User = require('../models/userModel');
const catchAsync = require('../middlewares/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const { deleteFile } = require('../utils/awsFunctions');

// Create new story with schedule
exports.newStory = catchAsync(async (req, res, next) => {

    let mediaUrl = '';
    if (req.file) {
        if (req.file.location) mediaUrl = req.file.location;
        else if (req.file.path) {
            const rel = require('path').relative(require('path').join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
            const base = req.protocol + '://' + req.get('host');
            mediaUrl = base + '/' + rel;
        }
    }

    if (!mediaUrl) return next(new ErrorHandler('No media uploaded', 400));

    // parse times from body; expect ISO strings
    const startAt = req.body.startAt ? new Date(req.body.startAt) : new Date();
    const endAt = req.body.endAt ? new Date(req.body.endAt) : new Date(Date.now() + 24*60*60*1000);
    const visibleToFollowers = (typeof req.body.visibleToFollowers !== 'undefined') ? (req.body.visibleToFollowers === 'true' || req.body.visibleToFollowers === true) : true;

    if (startAt >= endAt) return next(new ErrorHandler('startAt must be before endAt', 400));

    // parse hiddenFrom if provided (expect JSON array or array)
    let hiddenFrom = [];
    if (req.body.hiddenFrom) {
        try {
            if (typeof req.body.hiddenFrom === 'string') {
                hiddenFrom = JSON.parse(req.body.hiddenFrom);
            } else if (Array.isArray(req.body.hiddenFrom)) {
                hiddenFrom = req.body.hiddenFrom;
            }
        } catch (e) {
            // fallback: ignore invalid hiddenFrom
            hiddenFrom = [];
        }
    }

    const story = await Story.create({
        postedBy: req.user._id,
        media: mediaUrl,
        startAt,
        endAt,
        visibleToFollowers,
        hiddenFrom
    });

    // Notify followers about the new story (if visibleToFollowers)
    try {
        const poster = await User.findById(req.user._id).select('username followers');
        const followerIds = (poster && Array.isArray(poster.followers)) ? poster.followers.map(String) : [];
        const hiddenSet = (hiddenFrom || []).map(String);

        // prepare notification payload
        const notif = {
            type: 'story',
            message: `${poster.username} posted a new story`,
            data: { storyId: story._id, userId: poster._id, username: poster.username },
            read: false,
            createdAt: new Date()
        };

        // filter followers who should be notified
        const followersToNotify = followerIds.filter(fid => !hiddenSet.includes(fid));

        if (followersToNotify.length) {
            const io = req.app && req.app.get && req.app.get('io');

            // push notification to each follower and emit socket event
            for (const fid of followersToNotify) {
                try {
                    await User.findByIdAndUpdate(fid, { $push: { notifications: notif } });
                } catch (e) {
                    // continue on per-user failure
                    console.error('Failed to add story notification for', fid, e && e.message ? e.message : e);
                }

                try {
                    if (io) io.emit('notification', { to: fid, ...notif });
                } catch (e) {
                    console.debug('socket emit failed for story notification', e && e.message ? e.message : e);
                }
            }
        }
    } catch (e) {
        console.error('Error while notifying followers about story:', e && e.stack ? e.stack : e);
    }

    return res.status(201).json({ success: true, story });
});

// Get active stories (visible now)
exports.activeStories = catchAsync(async (req, res, next) => {
    const now = new Date();
    // fetch candidate stories in time window
    let stories = await Story.find({ startAt: { $lte: now }, endAt: { $gte: now } })
        .populate('postedBy', 'name username avatar followers')
        .sort({ createdAt: -1 });

    const requesterId = req.user ? req.user._id.toString() : null;

    // filter by visibility rules
    const visible = stories.filter(s => {
        // hide if explicitly hidden from requester
        if (requesterId && s.hiddenFrom && s.hiddenFrom.map(String).includes(requesterId)) return false;

        if (!s.visibleToFollowers) return true; // public

        // if requester is owner, always visible
        if (requesterId && s.postedBy._id.toString() === requesterId) return true;

        // if requester is follower of poster
        if (requesterId) {
            // postedBy.followers contains user's followers; check if requester is in followers
            if (s.postedBy && s.postedBy.followers && s.postedBy.followers.map(String).includes(requesterId)) return true;
        }

        return false;
    });

    // group stories by poster
    const grouped = {};
    visible.forEach(s => {
        const pid = s.postedBy._id.toString();
        if (!grouped[pid]) grouped[pid] = { user: s.postedBy, stories: [] };
        grouped[pid].stories.push(s);
    });

    const result = Object.values(grouped);

    return res.status(200).json({ success: true, stories: result });
});

// Hide/unhide a story from a follower (owner only)
exports.updateHiddenFor = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id);
    if (!story) return next(new ErrorHandler('Story not found', 404));
    if (story.postedBy.toString() !== req.user._id.toString()) return next(new ErrorHandler('Unauthorized', 401));

    const { followerId, hide } = req.body;
    if (!followerId) return next(new ErrorHandler('followerId required', 400));

    const idStr = followerId.toString();
    story.hiddenFrom = story.hiddenFrom.map(String);
    if (hide) {
        if (!story.hiddenFrom.includes(idStr)) story.hiddenFrom.push(idStr);
    } else {
        story.hiddenFrom = story.hiddenFrom.filter(x => x !== idStr);
    }

    await story.save();

    return res.status(200).json({ success: true, story });
});

// Optional: delete a story
exports.deleteStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id);
    if (!story) return next(new ErrorHandler('Story not found', 404));
    if (story.postedBy.toString() !== req.user._id.toString()) return next(new ErrorHandler('Unauthorized', 401));

    await deleteFile(story.media);
    await story.remove();

    return res.status(200).json({ success: true, message: 'Story deleted' });
});

// Get story by id (owner-only details)
exports.getStoryById = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id)
        .populate('postedBy', 'name username avatar followers')
        .populate('hiddenFrom', 'username avatar')
        .populate('views.user', 'username avatar');

    if (!story) return next(new ErrorHandler('Story not found', 404));

    return res.status(200).json({ success: true, story });
});

// Register a view for a story (called when a user opens a story)
exports.addView = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.id).populate('postedBy', 'name username avatar followers');
    if (!story) return next(new ErrorHandler('Story not found', 404));

    const viewerId = req.user._id.toString();

    // blocked?  if viewer is in hiddenFrom -> forbidden
    if (story.hiddenFrom && story.hiddenFrom.map(String).includes(viewerId)) return next(new ErrorHandler('You are not allowed to view this story', 403));

    // visibility: if visibleToFollowers true, only followers or owner may view
    if (story.visibleToFollowers) {
        if (story.postedBy._id.toString() !== viewerId) {
            // check if viewer is follower
            if (!story.postedBy.followers || !story.postedBy.followers.map(String).includes(viewerId)) {
                return next(new ErrorHandler('You are not allowed to view this story', 403));
            }
        }
    }

    // add view if not exists
    const already = story.views && story.views.map(v => v.user.toString()).includes(viewerId);
    if (!already) {
        story.views.push({ user: req.user._id, viewedAt: Date.now() });
        await story.save();
    }

    const full = await Story.findById(req.params.id)
        .populate('postedBy', 'name username avatar followers')
        .populate('views.user', 'username avatar');

    return res.status(200).json({ success: true, story: full });
});
