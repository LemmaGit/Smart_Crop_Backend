const { chatBodySchema } = require('../validators/chatValidators');

const prepareMessage = (body, file) => {
    const hasImage = Boolean(file?.path);
    const parsed = chatBodySchema.parse({
        user: body.user,
        content: body.content,
        imagePath: file?.path
    });

    if (!hasImage && !parsed.content) {
        throw new Error('Either text content or an image file is required.');
    }

    return {
        user: parsed.user,
        content: parsed.content,
        imagePath
    };
};

const formatBookmarkedMessages = (chats) => {
    return chats.flatMap((chat) =>
        chat.messages
            .filter((msg) => msg.isBookmarked)
            .map((msg) => ({
                chatId: chat._id,
                chatName: chat.name,
                message: msg,
            }))
    );
};

module.exports = {
    prepareMessage,
    formatBookmarkedMessages,
};
