import { StreamChat } from 'stream-chat';

// Initialize Stream Chat client
const streamClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

export const connectUser = async (user, token) => {
  try {
    await streamClient.connectUser(
      {
        id: user._id,
        name: user.fullName,
        image: user.profilePic,
      },
      token
    );
    return streamClient;
  } catch (error) {
    console.error('Error connecting user to Stream:', error);
    throw error;
  }
};

export const disconnectUser = async () => {
  try {
    await streamClient.disconnectUser();
  } catch (error) {
    console.error('Error disconnecting user from Stream:', error);
  }
};

export { streamClient };