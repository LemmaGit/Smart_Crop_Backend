const { chatBodySchema } = require('../validators/chatValidators');

const prepareMessage = (body, file) => {
    const hasImage = Boolean(req.file?.path);
    const parsed = chatBodySchema.parse({
        user: body.user,
        content: body.content,
        imagePath: req.file?.path
    });

    if (!hasImage && !parsed.content) {
        throw new Error('Either text content or an image file is required.');
    }

    let messageContent = parsed.content;
    // let contentType = 'text';

    // if (hasImage) {
    //     messageContent = file.path;
    //     contentType = 'image';
    // }

    return {
        user: parsed.user,
        // content: messageContent,
        content: parsed.content,
        // contentType,
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
