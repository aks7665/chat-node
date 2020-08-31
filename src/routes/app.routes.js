const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');

// Chat Routes
router.get('/chat-threads', chatController.fetch_all_chat_threads);

module.exports = router;