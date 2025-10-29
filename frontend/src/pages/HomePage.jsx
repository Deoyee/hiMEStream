import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest, getChatHistory } from '../lib/api';
import { Link } from 'react-router';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, MessageCircleIcon, ClockIcon } from 'lucide-react';
import { formatDate, capitialize } from '../lib/utils';
import NoFriendsFound from '../components/NoFriendsFound';
import FriendCard from '../components/FriendCard';
import { getLanguageFlag } from '../lib/languageUtils.jsx';

const HomePage = () => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chatHistory.map((chat) => {
              const otherId = chat.otherUser?.id;
              const friend = friends.find((f) => f._id === otherId);
              if (!friend) return null;
              return (
                <div key={chat.channelId} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                  <div className="card-body p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar size-16 rounded-full">
                        <img src={friend.profilePic} alt={friend.fullName} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                        {friend.location && (
                          <div className="flex items-center text-xs opacity-70 mt-1">
                            <MapPinIcon className="size-3 mr-1" />
                            {friend.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-secondary rounded-[2.5rem]">
                        {getLanguageFlag(friend.nativeLanguage)} Native: {capitialize(friend.nativeLanguage)}
                      </span>
                      <span className="badge badge-outline rounded-[2.5rem]">
                        {getLanguageFlag(friend.learningLanguage)} Other languages: {capitialize(friend.learningLanguage)}
                      </span>
                    </div>

                    {chat.lastMessage && (
                      <div className="text-sm opacity-70">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Last message:</p>
                          <span className="flex items-center text-xs">
                            <ClockIcon className="size-3 mr-1" />
                            {formatDate(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="truncate">{chat.lastMessage.text}</p>
                      </div>
                    )}

                    <Link to={`/chat/${friend._id}`} className="btn btn-primary w-full mt-2 rounded-[2.5rem]">
                      <MessageCircleIcon className="size-4 mr-2" /> Continue Chat
                    </Link>
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
                <p className="opacity-70">Discover new streamers based on your profile</p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            (() => {
              const visibleRecommended = (recommendedUsers || []).filter((u) => {
                return !isRequested(u._id) && !friends.some((f) => f._id === u._id);
              });

              if (visibleRecommended.length === 0) {
                return (
                  <div className="card bg-base-200 p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
                    <p className="text-base-content opacity-70">Check back later for new streamers!</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleRecommended.map((user) => {
                    const sent = isRequested(user._id);
                    return (
                      <div key={user._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                        <div className="card-body p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar size-16 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{user.fullName}</h3>
                              {user.location && (
                                <div className="flex items-center text-xs opacity-70 mt-1">
                                  <MapPinIcon className="size-3 mr-1" /> {user.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <span className="badge badge-secondary rounded-[2.5rem]">
                              {getLanguageFlag(user.nativeLanguage)} Native: {capitialize(user.nativeLanguage)}
                            </span>
                            <span className="badge badge-outline rounded-[2.5rem]">
                              {getLanguageFlag(user.learningLanguage)} Other languages: {capitialize(user.learningLanguage)}
                            </span>
                          </div>

                          {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                          <button
                            className={`btn w-full mt-2 rounded-[2.5rem] ${sent || submittingId === user._id ? 'btn-disabled' : 'btn-primary'}`}
                            onClick={() => handleSendRequest(user._id)}
                            disabled={sent || submittingId === user._id}
                          >
                            {sent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" /> Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-4 mr-2" /> Send Friend Request
                              </>
                            )}
                          </button>
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