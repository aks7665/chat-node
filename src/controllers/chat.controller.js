const ChatThreads = require("../models/chat-thread.model");
const User = require("../models/user.model");

exports.fetch_all_chat_threads = async (req, res) => {
    try {
        /** 
         * Currently i am selecting first user in database
         * But generally we get this user details from auth middleware
         * So for now i made it to select first user in database and believing this user is trying to fetch his chats
         * I need this to check which messages are read by him. So that i can check unread messages count
         */
        const user = await User.findOne({}).select('_id');
        const myUserId = user._id;

        const result = await ChatThreads.aggregate(
            [{
                    // Only fetching chats in which user participants
                    $match: {
                        recipients: {
                            $in: [myUserId]
                        }
                    }
                },
                // last message
                {
                    "$lookup": {
                        "from": "chat_messages",
                        "as": "lastMessage",
                        "let": {
                            "chatThreadId": "$_id"
                        },
                        "pipeline": [{
                                "$match": {
                                    "$expr": {
                                        "$eq": ["$$chatThreadId", "$thread"]
                                    }
                                }
                            },
                            {
                                "$sort": {
                                    "_id": -1
                                }
                            },
                            {
                                "$limit": 1
                            }
                        ]
                    }
                },
                // Chat title or username
                // Get Sender, We need sender in case of one to one chat
                {
                    "$lookup": {
                        "from": "users",
                        "as": "sender",
                        "let": {
                            "recipients": "$recipients"
                        },
                        "pipeline": [{
                                "$match": {
                                    "$expr": {
                                        "$ne": ["$_id", myUserId]
                                    }
                                }
                            },
                            {
                                "$limit": 1
                            }
                        ]
                    }
                },
                // Fetching unread messages
                {
                    "$lookup": {
                        "from": "chat_messages",
                        "as": "unreadMessages",
                        "let": {
                            "chatThreadId": "$_id"
                        },
                        "pipeline": [{
                            "$match": {
                                "$expr": {
                                    $eq: ["$$chatThreadId", "$thread"]
                                },
                                'readBy': {
                                    $nin: [myUserId]
                                }
                            }
                        }]
                    }
                },
                {
                    $project: {
                        type: 1,
                        recipients: 1,
                        lastMessage: {
                            "$arrayElemAt": ["$lastMessage.body", 0]
                        },
                        chatTitle: {
                            $cond: {
                                if: {
                                    $eq: ["$type", "group"]
                                },
                                then: "$title",
                                else: {
                                    "$arrayElemAt": ["$sender.name", 0]
                                }
                            }
                        },
                        unreadMessagesCount: {
                            $size: "$unreadMessages"
                        },
                        createdAt: 1,
                        updatedAt: 1
                    },
                },
            ]
        );

        if (!result) {
            throw new Error("Error while fetching records.");
        }

        return res.status(200).send({
            status: true,
            status_code: 200,
            result,
            message: "Records fetched."
        });
    } catch (error) {
        return res.status(200).send({
            status: false,
            status_code: 500,
            error,
            message: error.message ? error.message : "Error while fetching records."
        });
    }
};