export const formatBookmarkedMessages = (chats) => {
  const bookmarkedMessages = [];

  chats.forEach((chat) => {
    chat.messages.forEach((pair) => {
      if (pair.isBookmarked) {
        bookmarkedMessages.push({
          chatId: chat._id,
          chatName: chat.name,
          question: pair.question,
          answer: pair.answer,
          messageId: pair._id, // The ID of the pair itself
          bookmarkedAt: pair.updatedAt || chat.updatedAt // Fallback or add timestamp logic if needed
        });
      }
    });
  });

  return bookmarkedMessages;
};
