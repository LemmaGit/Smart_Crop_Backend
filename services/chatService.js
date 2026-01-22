export const formatBookmarkedMessages = (chats) => {
  return chats.flatMap((chat) =>
    chat.messages
      .filter((msg) => msg.isBookmarked)
      .map((msg) => ({
        chatId: chat._id,
        chatName: chat.name,
        message: msg,
      })),
  );
};
