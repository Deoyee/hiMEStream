import { generateStreamToken } from "../lib/stream.js";
import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getChatHistory(req, res) {
  try {
    const userId = req.user._id.toString();
    
    // Get all channels where the current user is a member
    const filter = { members: { $in: [userId] }, type: 'messaging' };
    const sort = [{ last_message_at: -1 }];
    
    const channels = await streamClient.queryChannels(filter, sort, {
      limit: 30,
      messages_limit: 1,
      state: true,
    });

    // Extract relevant info from each channel
    const chatHistory = channels.map(channel => {
      const otherMember = channel.state.members
        ? Object.values(channel.state.members).find(member => member.user_id !== userId)
        : null;

      return {
        channelId: channel.id,
        lastMessage: channel.state.messages[channel.state.messages.length - 1],
        lastMessageAt: channel.last_message_at,
        otherUser: otherMember ? {
          id: otherMember.user_id,
          name: otherMember.user?.name || 'Unknown User',
          image: otherMember.user?.image
        } : null
      };
    });

    res.status(200).json(chatHistory);
  } catch (error) {
    console.log("Error in getChatHistory controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}