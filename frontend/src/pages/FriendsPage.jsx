import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getUserFriends, getChatHistory } from "../lib/api";
import { MapPinIcon, MessageCircleIcon } from "lucide-react";
import { formatDate } from "../lib/utils";
import FriendCard from "../components/FriendCard";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: chatHistory = [], isLoading: loadingChats } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: getChatHistory,
  });

  if (loadingFriends || loadingChats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  // Build a list of unique chat partners from chatHistory
  const chattedUserIds = new Set(chatHistory.map((c) => c.otherUser?.id).filter(Boolean));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Chats & Friends</h1>
          <Link to="/notifications" className="btn btn-outline btn-sm rounded-[2.5rem]">
            Notifications
          </Link>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3">People you chat with</h2>
          {chatHistory.length === 0 ? (
            <div className="card bg-base-200 p-6">No chat history found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatHistory.map((chat) => (
                <div key={chat.channelId} className="card bg-base-200 hover:shadow-lg">
                  <div className="card-body">
                    <div className="flex items-center gap-3">
                      <div className="avatar size-16 rounded-full">
                        <img src={chat.otherUser?.image} alt={chat.otherUser?.name} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{chat.otherUser?.name}</h3>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          <MapPinIcon className="size-3" />
                          <span>{/* location unknown in stream data */}</span>
                        </div>
                      </div>
                    </div>

                    {chat.lastMessage && (
                      <div className="mt-3 text-sm opacity-70">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Last message</p>
                          <span className="text-xs">{formatDate(chat.lastMessageAt)}</span>
                        </div>
                        <p className="truncate">{chat.lastMessage.text}</p>
                      </div>
                    )}

                    <Link to={`/chat/${chat.otherUser?.id}`} className="btn btn-primary w-full mt-4">
                      <MessageCircleIcon className="size-4 mr-2" /> Continue Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">All friends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend._id}>
                {/* highlight if they appear in chatHistory */}
                {chattedUserIds.has(friend._id) ? (
                  <div className="card border border-primary">
                    <div className="card-body">
                      <FriendCard friend={friend} />
                    </div>
                  </div>
                ) : (
                  <FriendCard friend={friend} />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendsPage;
