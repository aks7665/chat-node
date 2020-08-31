const ChatThread = require("../models/chat-thread.model");
const ChatMessage = require("../models/chat-message.model");
const User = require("../models/user.model");

exports.executeSeeders = async () => {
    seedUsers();
}

/** create user accounts */
seedUsers = async () => {
    try {
        /** check if already populated */
        const usersCollection = await User.find({});
        if (usersCollection.length > 0) {
            return;
        }

        const users = [
            new User({
                name: 'John Doe',
                email: 'john@mail.com',
                password: '12345678'
            }),
            new User({
                name: 'Jane Doe',
                email: 'admin@mail.com',
                password: '12345678'
            }),
            new User({
                name: 'Haris',
                email: 'haris@mail.com',
                password: '12345678'
            }),
            new User({
                name: 'Shane',
                email: 'shane@mail.com',
                password: '12345678'
            })
        ];

        /** create new database entry for user */
        for (const user of users) {
            await User.create(user);
        }
        console.log('User seeder runned.');
        seedChatThreads();
    } catch (error) {
        console.log('Seeder: Error - User', error);
    }
}

/** create chat threads */
seedChatThreads = async () => {
    try {
        /** check if already populated */
        const usersCollection = await User.find({});
        const chatThreadsCollection = await ChatThread.find({});

        if (usersCollection.length < 3 || chatThreadsCollection.length > 0) {
            return;
        }

        const threads = [
            new ChatThread({
                title: 'Group - Jane/John/Haris',
                type: 'group',
                recipients: [usersCollection[0]._id, usersCollection[1]._id, usersCollection[2]._id, ]
            }),

            new ChatThread({
                type: 'direct',
                recipients: [usersCollection[0]._id, usersCollection[1]._id]
            }),
            new ChatThread({
                type: 'direct',
                recipients: [usersCollection[0]._id, usersCollection[2]._id, ]
            }),
            new ChatThread({
                title: 'Group - Shane/John/Haris',
                type: 'group',
                recipients: [usersCollection[0]._id, usersCollection[3]._id, usersCollection[2]._id, ]
            }),
        ];

        /** create new database threads for user */
        for (const thread of threads) {
            await ChatThread.create(threads);
        }
        // 
        console.log('Chat Thread seeder runned.');
        seedChatMessages();
    } catch (error) {
        console.log('Seeder: Error - Chat Thread', error);
    }
}

/** create chat messages */
seedChatMessages = async () => {
    try {
        /** check if already populated */
        const chatThreadsCollection = await ChatThread.find({});
        const chatMessagesCollection = await ChatMessage.find({});

        if (chatThreadsCollection.length < 3 || chatMessagesCollection.length > 0) {
            return;
        }

        const messageProto = [
            'Hello',
            'How are you?',
            'I am good.',
            'What about you?',
            'I am also good.',
            'What are you doing?',
            'Nothing',
            'Bye',
            'Talk to you later.',
            'See you soon.'
        ]

        for (const thread of chatThreadsCollection) {
            const chatThreadId = thread._id;
            const chatRecipients = thread.recipients;

            for (let i = 0; i < 3; i++) {
                const message = {
                    thread: chatThreadId,
                    body: messageProto[getRandomInt(9)],
                    sender: chatRecipients[getRandomInt(chatRecipients.length)],
                    readBy: [chatRecipients[getRandomInt(chatRecipients.length)]],
                }
                await ChatMessage.create(message);
            }
        }

        console.log('Chat Message seeder runned.');
    } catch (error) {
        console.log('Seeder: Error - Chat Message', error);
    }
}

getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}