import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  cancelFriendRequest,
  getChatHistory,
} from '../lib/api';
import { Link } from 'react-router';
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  MessageCircleIcon,
  ClockIcon,
  Search,
  Filter,
  Sparkles,
  X,
  Languages,
  Globe2,
} from 'lucide-react';
import { formatDate, capitialize } from '../lib/utils';
import NoFriendsFound from '../components/NoFriendsFound';
import FriendCard from '../components/FriendCard';
import Avatar from '../components/Avatar.jsx';
import { getLanguageFlag } from '../lib/languageUtils.jsx';
import useOnlineUsers from '../hooks/useOnlineUsers';
import useAuthUser from '../hooks/useAuthUser';
import UserProfileModal from '../components/UserProfileModal';
import LanguageDropdown from '../components/LanguageDropdown.jsx';
import { LANGUAGES } from '../constants';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { authUser } = useAuthUser();
  const { isUserOnline } = useOnlineUsers();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [submittingId, setSubmittingId] = useState(null);

  // Search & Language Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNative, setFilterNative] = useState('');
  const [filterLearning, setFilterLearning] = useState('');
  const [perfectMatchOnly, setPerfectMatchOnly] = useState(false);

  // Selected user for full profile inspection modal
  const [selectedUser, setSelectedUser] = useState(null);

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
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
    },
    onError: () => {
      toast.error('Failed to send friend request');
    },
  });

  const { mutateAsync: cancelRequestMutationAsync } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      toast.success('Friend request cancelled');
      queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
    },
    onError: () => {
      toast.error('Failed to cancel request');
    },
  });

  useEffect(() => {
    if (!outgoingFriendReqs) return;
    const setIds = new Set(outgoingFriendReqs.map((r) => r.recipient?._id).filter(Boolean));
    setOutgoingRequestsIds(setIds);
  }, [outgoingFriendReqs]);

  const handleSendRequest = async (userId) => {
    setSubmittingId(userId);
    setOutgoingRequestsIds((prev) => new Set(prev).add(userId));
    try {
      await sendRequestMutationAsync(userId);
    } catch {
      setOutgoingRequestsIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelRequest = async (userId) => {
    setSubmittingId(userId);
    try {
      await cancelRequestMutationAsync(userId);
      setOutgoingRequestsIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const isRequested = (id) => outgoingRequestsIds.has(id);

  // Filter recommended users
  const filteredUsers = recommendedUsers.filter((user) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = user.fullName?.toLowerCase().includes(q);
      const matchLoc = user.location?.toLowerCase().includes(q);
      const matchBio = user.bio?.toLowerCase().includes(q);
      const matchNative = user.nativeLanguage?.toLowerCase().includes(q);
      const matchLearning = user.learningLanguage?.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchBio && !matchNative && !matchLearning) return false;
    }

    if (filterNative && user.nativeLanguage?.toLowerCase() !== filterNative.toLowerCase()) {
      return false;
    }

    if (filterLearning && user.learningLanguage?.toLowerCase() !== filterLearning.toLowerCase()) {
      return false;
    }

    if (perfectMatchOnly && authUser) {
      const isPerfect =
        user.nativeLanguage?.toLowerCase() === authUser.learningLanguage?.toLowerCase() &&
        user.learningLanguage?.toLowerCase() === authUser.nativeLanguage?.toLowerCase();
      if (!isPerfect) return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(searchQuery || filterNative || filterLearning || perfectMatchOnly);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterNative('');
    setFilterLearning('');
    setPerfectMatchOnly(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
            <p className="text-sm opacity-70 mt-1">Chat and video call with your friends and connections</p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-sm rounded-[2.5rem]">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends & Chat History Grid */}
        {loadingFriends || loadingChats ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 && chatHistory.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {chatHistory.map((chat) => {
              const otherUser = chat.otherUser;
              if (!otherUser) return null;
              const isOnline = isUserOnline(otherUser.id);
              return (
                <div
                  key={chat.channelId}
                  className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                >
                  <div className="card-body p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3.5">
                      <Avatar
                        src={otherUser.image}
                        name={otherUser.name}
                        size="md"
                        showOnline={isOnline}
                        isOnline={isOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-base-content truncate">{otherUser.name}</h3>
                        <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                          <ClockIcon className="size-3" />
                          <span>{formatDate(chat.lastMessageAt)}</span>
                        </p>
                      </div>
                    </div>

                    {chat.lastMessage && (
                      <p className="text-xs text-base-content/70 bg-base-300/40 p-2.5 rounded-lg border border-base-content/5 truncate">
                        "{chat.lastMessage.text}"
                      </p>
                    )}

                    <Link
                      to={`/chat/${otherUser.id}`}
                      className="btn btn-primary btn-sm rounded-xl font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <MessageCircleIcon className="size-4 mr-1.5" /> Continue Chat
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section: Meet New Language Partners */}
        <section className="space-y-6 pt-6 border-t border-base-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New People</h2>
              <p className="text-sm opacity-70 mt-1">Discover people from around the globe</p>
            </div>

            {/* Perfect match button */}
            {authUser && authUser.learningLanguage && authUser.nativeLanguage && (
              <button
                type="button"
                onClick={() => setPerfectMatchOnly(!perfectMatchOnly)}
                className={`btn btn-sm rounded-2xl gap-2 font-medium transition-all ${
                  perfectMatchOnly
                    ? 'btn-primary shadow-md shadow-primary/20'
                    : 'btn-outline border-base-content/20'
                }`}
              >
                <Sparkles className="size-4 text-warning animate-pulse" />
                <span>Perfect Language Match</span>
              </button>
            )}
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="bg-base-200/90 border border-base-content/10 p-3.5 sm:p-4 rounded-2xl space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar with no icon overlapping */}
              <div className="flex-1 min-w-[220px]">
                <label className="input input-bordered h-11 flex items-center gap-2.5 rounded-xl bg-base-100 border-base-content/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 shadow-sm transition-all">
                  <Search className="size-4 opacity-50 flex-shrink-0 text-base-content" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, city, language..."
                    className="grow text-sm bg-transparent border-none outline-none focus:outline-none text-base-content placeholder:text-base-content/40 min-w-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="btn btn-ghost btn-circle btn-xs opacity-60 hover:opacity-100 text-base-content"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </label>
              </div>

              {/* Native Language Custom Dropdown */}
              <div className="w-full sm:w-48 lg:w-52 shrink-0">
                <LanguageDropdown
                  prefix="Native"
                  icon={Languages}
                  value={filterNative}
                  onChange={setFilterNative}
                  languages={LANGUAGES}
                />
              </div>

              {/* Learning Language Custom Dropdown */}
              <div className="w-full sm:w-48 lg:w-52 shrink-0">
                <LanguageDropdown
                  prefix="Learning"
                  icon={Globe2}
                  value={filterLearning}
                  onChange={setFilterLearning}
                  languages={LANGUAGES}
                />
              </div>

              {/* Reset Filters / Partner Count */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 px-1">
                <div className="text-xs opacity-70 font-medium whitespace-nowrap">
                  {hasActiveFilters ? (
                    <span>
                      <strong className="text-primary font-semibold">{filteredUsers.length}</strong> of{' '}
                      {recommendedUsers.length} found
                    </span>
                  ) : (
                    <span>{recommendedUsers.length} available</span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg gap-1 font-semibold px-2 py-1 h-8 min-h-[32px] transition-all active:scale-95"
                    title="Clear all filters"
                  >
                    <X className="size-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-base-content/10 text-xs">
                <span className="opacity-50 text-[11px] uppercase tracking-wider font-semibold mr-1">
                  Active filters:
                </span>
                {searchQuery && (
                  <span className="badge badge-primary badge-outline gap-1.5 py-2.5 px-3 rounded-xl font-medium">
                    <span>"{searchQuery}"</span>
                    <X
                      className="size-3 cursor-pointer hover:text-error transition-colors"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
                {filterNative && (
                  <span className="badge badge-primary badge-outline gap-1.5 py-2.5 px-3 rounded-xl font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {getLanguageFlag(filterNative)}
                      <span>Native: {capitialize(filterNative)}</span>
                    </span>
                    <X
                      className="size-3 cursor-pointer hover:text-error transition-colors"
                      onClick={() => setFilterNative('')}
                    />
                  </span>
                )}
                {filterLearning && (
                  <span className="badge badge-primary badge-outline gap-1.5 py-2.5 px-3 rounded-xl font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {getLanguageFlag(filterLearning)}
                      <span>Learning: {capitialize(filterLearning)}</span>
                    </span>
                    <X
                      className="size-3 cursor-pointer hover:text-error transition-colors"
                      onClick={() => setFilterLearning('')}
                    />
                  </span>
                )}
                {perfectMatchOnly && (
                  <span className="badge badge-warning badge-outline gap-1.5 py-2.5 px-3 rounded-xl font-medium">
                    <span>🔥 Perfect Match</span>
                    <X
                      className="size-3 cursor-pointer hover:text-error transition-colors"
                      onClick={() => setPerfectMatchOnly(false)}
                    />
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-error hover:underline ml-1 font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Recommended Users Grid */}
          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="card bg-base-200/60 p-10 text-center border border-base-content/10 rounded-2xl space-y-2">
              <h3 className="font-semibold text-lg">No people match your current filter</h3>
              <p className="text-base-content/70 text-sm">
                Try clearing search terms or filters to view more people.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-sm btn-primary rounded-xl mx-auto mt-2"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                const sent = isRequested(user._id);
                const isOnline = isUserOnline(user._id);
                const isSubmitting = submittingId === user._id;

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                  >
                    <div className="card-body p-5 flex flex-col justify-between space-y-4">
                      {/* Avatar & Info */}
                      <div
                        className="flex items-start gap-3.5 cursor-pointer group/card"
                        onClick={() => setSelectedUser(user)}
                        title="View Profile"
                      >
                        <Avatar
                          src={user.profilePic}
                          name={user.fullName}
                          size="lg"
                          showOnline={isOnline}
                          isOnline={isOnline}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-base-content group-hover/card:text-primary transition-colors truncate leading-snug">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs text-base-content/60 mt-1">
                              <MapPinIcon className="size-3 mr-1 text-primary/70 flex-shrink-0" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Language Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span>{getLanguageFlag(user.nativeLanguage)}</span>
                          <span className="truncate">Native: {capitialize(user.nativeLanguage)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <span>{getLanguageFlag(user.learningLanguage)}</span>
                          <span className="truncate">Learning: {capitialize(user.learningLanguage)}</span>
                        </span>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-xs text-base-content/70 italic bg-base-300/40 p-2.5 rounded-lg border border-base-content/5 line-clamp-2">
                          "{user.bio}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-2 flex items-center gap-2">
                        {sent ? (
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(user._id)}
                            disabled={isSubmitting}
                            className="btn btn-outline btn-error w-full rounded-xl font-medium gap-2 transition-all active:scale-[0.98]"
                            title="Cancel friend request"
                          >
                            <X className="size-4" />
                            <span>Cancel Request</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendRequest(user._id)}
                            disabled={isSubmitting}
                            className="btn btn-primary w-full rounded-xl font-medium gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                          >
                            <UserPlusIcon className="size-4" />
                            <span>Add Friend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* User Full Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          isFriend={friends.some((f) => f._id === selectedUser._id)}
          isRequested={isRequested(selectedUser._id)}
          onSendRequest={(id) => handleSendRequest(id)}
          onCancelRequest={(id) => handleCancelRequest(id)}
        />
      )}
    </div>
  );
};

export default HomePage;