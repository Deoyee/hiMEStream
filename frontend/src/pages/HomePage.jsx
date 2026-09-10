import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest, getChatHistory } from '../lib/api';
import { Link } from 'react-router';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, MessageCircleIcon, ClockIcon } from 'lucide-react';
import { formatDate, capitialize } from '../lib/utils';
import NoFriendsFound from '../components/NoFriendsFound';
import FriendCard from '../components/FriendCard';
import Avatar from '../components/Avatar.jsx';
import { getLanguageFlag } from '../lib/languageUtils.jsx';
import useOnlineUsers from '../hooks/useOnlineUsers';

const HomePage = () => {
  const { isUserOnline } = useOnlineUsers();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [submittingId, setSubmittingId] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  const { data: chatHistory = [], isLoading: loadingChats } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: getChatHistory,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutateAsync: sendRequestMutationAsync } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] }),
  });

  useEffect(() => {
    if (!outgoingFriendReqs) return;
    const setIds = new Set(outgoingFriendReqs.map((r) => r.recipient?._id).filter(Boolean));
    setOutgoingRequestsIds(setIds);
  }, [outgoingFriendReqs]);

  const handleSendRequest = async (userId) => {
    setSubmittingId(userId);
    // optimistic
    setOutgoingRequestsIds((prev) => new Set(prev).add(userId));
    try {
      await sendRequestMutationAsync(userId);
    } catch (err) {
      // rollback
      setOutgoingRequestsIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } finally {
      setSubmittingId(null);
    }
  };

  // helpers
  const isRequested = (id) => outgoingRequestsIds.has(id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm rounded-[2.5rem]">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends || loadingChats ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 && chatHistory.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {chatHistory.map((chat) => {
              const otherId = chat.otherUser?.id;
              const friend = friends.find((f) => f._id === otherId);
              if (!friend) return null;
              return (
                <div key={chat.channelId} className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
                  <div className="card-body p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        src={friend.profilePic}
                        name={friend.fullName}
                        size="lg"
                        showOnline={isUserOnline(friend._id)}
                        isOnline={isUserOnline(friend._id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-base-content truncate leading-snug">{friend.fullName}</h3>
                        {friend.location && (
                          <div className="flex items-center text-xs text-base-content/60 mt-1">
                            <MapPinIcon className="size-3 mr-1 text-primary/70 flex-shrink-0" />
                            <span className="truncate">{friend.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span>{getLanguageFlag(friend.nativeLanguage)}</span>
                        <span className="truncate">Native: {capitialize(friend.nativeLanguage)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <span>{getLanguageFlag(friend.learningLanguage)}</span>
                        <span className="truncate">Learning: {capitialize(friend.learningLanguage)}</span>
                      </span>
                    </div>

                    {chat.lastMessage && (
                      <div className="text-xs text-base-content/70 bg-base-300/40 p-2.5 rounded-lg border border-base-content/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium opacity-80">Last message:</span>
                          <span className="flex items-center text-[10px] opacity-60">
                            <ClockIcon className="size-3 mr-1" />
                            {formatDate(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="truncate font-sans">{chat.lastMessage.text}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link
                        to={`/chat/${friend._id}`}
                        className="btn btn-primary w-full rounded-xl gap-2 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <MessageCircleIcon className="size-4" /> Continue Chat
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {friends
              .filter((f) => !chatHistory.some((c) => c.otherUser?.id === f._id))
              .map((friend) => <FriendCard key={friend._id} friend={friend} />)}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Users</h2>
                <p className="opacity-70 text-sm mt-0.5">Discover new streamers based on your profile</p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            (() => {
              const visibleRecommended = (recommendedUsers || []).filter((u) => {
                return !isRequested(u._id) && !friends.some((f) => f._id === u._id);
              });

              if (visibleRecommended.length === 0) {
                return (
                  <div className="card bg-base-200/60 p-8 text-center border border-base-content/10 rounded-2xl">
                    <h3 className="font-semibold text-lg mb-1">No recommendations available</h3>
                    <p className="text-base-content/70 text-sm">Check back later for new streamers!</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleRecommended.map((user) => {
                    const sent = isRequested(user._id);
                    return (
                      <div key={user._id} className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
                        <div className="card-body p-5 flex flex-col justify-between space-y-4">
                          <div className="flex items-start gap-3.5">
                            <Avatar
                              src={user.profilePic}
                              name={user.fullName}
                              size="lg"
                              showOnline={isUserOnline(user._id)}
                              isOnline={isUserOnline(user._id)}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-base-content truncate leading-snug">{user.fullName}</h3>
                              {user.location && (
                                <div className="flex items-center text-xs text-base-content/60 mt-1">
                                  <MapPinIcon className="size-3 mr-1 text-primary/70 flex-shrink-0" />
                                  <span className="truncate">{user.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <span>{getLanguageFlag(user.nativeLanguage)}</span>
                              <span className="truncate">Native: {capitialize(user.nativeLanguage)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              <span>{getLanguageFlag(user.learningLanguage)}</span>
                              <span className="truncate">Learning: {capitialize(user.learningLanguage)}</span>
                            </span>
                          </div>

                          {user.bio && (
                            <p className="text-xs text-base-content/70 italic bg-base-300/40 p-2.5 rounded-lg border border-base-content/5 line-clamp-2">
                              "{user.bio}"
                            </p>
                          )}

                          <div className="pt-2">
                            <button
                              className={`btn w-full rounded-xl font-medium gap-2 transition-all active:scale-[0.98] ${
                                sent || submittingId === user._id ? 'btn-disabled opacity-60' : 'btn-primary shadow-sm hover:shadow-md'
                              }`}
                              onClick={() => handleSendRequest(user._id)}
                              disabled={sent || submittingId === user._id}
                            >
                              {sent ? (
                                <>
                                  <CheckCircleIcon className="size-4" /> Request Sent
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="size-4" /> Send Friend Request
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;