const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    thread: {
        // Chat Thread ID
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat_thread" // Table Name
    },
    body: {
        type: String,
        default: null,
        trim: true
    },
    sender: {
        // User ID
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" // Table Name
    },
    readBy: {
        type: [{
            // User ID
            type: mongoose.Schema.Types.ObjectId,
            ref: "user" // Table Name
        }],
        default: []
    },
}, {
    timestamps: true
});

// Index
chatMessageSchema.index({
    thread: 1
});

// Middleware
// Error handling
chatMessageSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        next(error);
    } else {
        next();
    }
});

const ChatMessage = mongoose.model(
    "chat_message",
    chatMessageSchema
);

module.exports = ChatMessage;