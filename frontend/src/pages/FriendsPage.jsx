import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getUserFriends, getChatHistory } from "../lib/api";
import { MapPinIcon, MessageCircleIcon } from "lucide-react";
import { formatDate } from "../lib/utils";
import FriendCard from "../components/FriendCard";
import Avatar from "../components/Avatar.jsx";
import useOnlineUsers from "../hooks/useOnlineUsers";
import UserProfileModal from "../components/UserProfileModal.jsx";

const FriendsPage = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { isUserOnline } = useOnlineUsers();
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
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    );
  }

  // Build a list of unique chat partners from chatHistory
  const chattedUserIds = new Set(chatHistory.map((c) => c.otherUser?.id).filter(Boolean));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chats & Friends</h1>
            <p className="text-sm opacity-70 mt-1">Connect and chat with your friends</p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-primary btn-sm rounded-xl">
            Notifications
          </Link>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">People you chat with</h2>
          {chatHistory.length === 0 ? (
            <div className="card bg-base-200/60 border border-base-content/10 p-6 rounded-2xl text-center">
              <p className="opacity-70 text-sm">No chat history yet. Start a conversation with a friend!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {chatHistory.map((chat) => (
                <div key={chat.channelId} className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <div className="card-body p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3.5">
                      <Avatar
                        src={chat.otherUser?.image}
                        name={chat.otherUser?.name}
                        size="lg"
                        showOnline={isUserOnline(chat.otherUser?.id)}
                        isOnline={isUserOnline(chat.otherUser?.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-base-content truncate">{chat.otherUser?.name}</h3>
                      </div>
                    </div>

                    {chat.lastMessage && (
                      <div className="text-xs text-base-content/70 bg-base-300/40 p-2.5 rounded-lg border border-base-content/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium opacity-80">Last message:</span>
                          <span className="text-[10px] opacity-60">{formatDate(chat.lastMessageAt)}</span>
                        </div>
                        <p className="truncate font-sans">{chat.lastMessage.text}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link to={`/chat/${chat.otherUser?.id}`} className="btn btn-primary w-full rounded-xl gap-2 font-medium shadow-sm transition-all active:scale-[0.98]">
                        <MessageCircleIcon className="size-4" /> Continue Chat
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All friends ({friends.length})</h2>
          </div>
          {friends.length === 0 ? (
            <div className="card bg-base-200/60 border border-base-content/10 p-8 rounded-2xl text-center">
              <p className="opacity-70 text-sm">No friends added yet. Meet people from the home page!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {friends.map((friend) => (
                <FriendCard
                  key={friend._id}
                  friend={friend}
                  onViewProfile={setSelectedFriend}
                  hasChatHistory={chattedUserIds.has(friend._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* User Profile Modal */}
      {selectedFriend && (
        <UserProfileModal
          isOpen={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
          user={selectedFriend}
          isFriend={true}
        />
      )}
    </div>
  );
};

export default FriendsPage;
