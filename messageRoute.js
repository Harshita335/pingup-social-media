const express = require('express');
const { newMessage, getMessages, editMessage, deleteMessage, toggleReaction } = require('../controllers/messageController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express();

router.route("/newMessage").post(isAuthenticated, newMessage);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);

router.route('/message/:id').put(isAuthenticated, editMessage).delete(isAuthenticated, deleteMessage);
router.route('/message/:id/reaction').post(isAuthenticated, toggleReaction);

module.exports = router;