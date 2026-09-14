import { X, MapPin, MessageSquare, UserPlus, UserMinus, Calendar, Globe2, Languages, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import Avatar from "./Avatar.jsx";
import { getLanguageFlag } from "../lib/languageUtils.jsx";
import useOnlineUsers from "../hooks/useOnlineUsers";
import { formatDate } from "../lib/utils";

const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  isFriend = false,
  isRequested = false,
  onSendRequest,
  onCancelRequest,
  onUnfriend,
}) => {
  const { isUserOnline } = useOnlineUsers();

  if (!isOpen || !user) return null;

  const isOnline = isUserOnline(user._id);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-base-200 border border-base-content/15 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="h-28 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/40 hover:bg-black/60 text-white border-none transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-0 relative space-y-5">
          {/* Avatar floating over banner */}
          <div className="-mt-14 flex items-end justify-between">
            <div className="relative">
              <Avatar
                src={user.profilePic}
                name={user.fullName}
                size="xl"
                ring={true}
                showOnline={isOnline}
                isOnline={isOnline}
                className="ring-4 ring-base-200 shadow-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 pb-1">
              <span
                className={`badge badge-sm font-medium ${
                  isOnline ? "badge-success gap-1" : "badge-ghost opacity-60"
                }`}
              >
                {isOnline && <span className="size-1.5 rounded-full bg-white animate-pulse" />}
                {isOnline ? "Active Now" : "Offline"}
              </span>
            </div>
          </div>

          {/* User Name & Location */}
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              {user.fullName}
            </h2>
            {user.location && (
              <p className="flex items-center gap-1.5 text-xs text-base-content/70 mt-1">
                <MapPin className="size-3.5 text-primary flex-shrink-0" />
                <span>{user.location}</span>
              </p>
            )}
          </div>

          {/* Language Pair Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-base-300/60 border border-base-content/5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Languages className="size-3.5" />
                Native Language
              </span>
              <span className="font-bold text-sm text-base-content flex items-center gap-2 mt-0.5">
                <span className="text-base">{getLanguageFlag(user.nativeLanguage)}</span>
                <span className="truncate">{user.nativeLanguage || "Not specified"}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-base-300/60 border border-base-content/5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Globe2 className="size-3.5" />
                Learning Language
              </span>
              <span className="font-bold text-sm text-base-content flex items-center gap-2 mt-0.5">
                <span className="text-base">{getLanguageFlag(user.learningLanguage)}</span>
                <span className="truncate">{user.learningLanguage || "Not specified"}</span>
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
              About Me
            </h4>
            <p className="text-sm text-base-content/85 leading-relaxed bg-base-300/30 p-3.5 rounded-2xl border border-base-content/5 italic">
              {user.bio ? `"${user.bio}"` : "This user hasn't written a bio yet."}
            </p>
          </div>

          {/* Member Joined Date */}
          {user.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-base-content/50 pt-1">
              <Calendar className="size-3.5" />
              <span>Member since {formatDate(user.createdAt)}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center gap-3">
            {isFriend ? (
              <>
                <Link
                  to={`/chat/${user._id}`}
                  onClick={onClose}
                  className="btn btn-primary rounded-2xl flex-1 gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <MessageSquare className="size-4" />
                  <span>Send Message</span>
                </Link>
                {onUnfriend && (
                  <button
                    type="button"
                    onClick={() => {
                      onUnfriend(user);
                      onClose();
                    }}
                    className="btn btn-outline btn-error rounded-2xl gap-2 font-medium"
                  >
                    <UserMinus className="size-4" />
                    <span>Unfriend</span>
                  </button>
                )}
              </>
            ) : isRequested ? (
              <button
                type="button"
                onClick={() => {
                  onCancelRequest && onCancelRequest(user._id);
                }}
                className="btn btn-outline btn-error w-full rounded-2xl font-medium gap-2"
              >
                <X className="size-4" />
                <span>Cancel Friend Request</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSendRequest && onSendRequest(user._id);
                }}
                className="btn btn-primary w-full rounded-2xl font-medium gap-2 shadow-md hover:shadow-lg"
              >
                <UserPlus className="size-4" />
                <span>Add Friend</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
