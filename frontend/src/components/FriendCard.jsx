import { useState } from "react";
import { Link } from "react-router";
import { MessageSquare, MapPin, UserMinus, Loader2, Eye } from "lucide-react";
import { getLanguageFlag } from "../lib/languageUtils.jsx";
import Avatar from "./Avatar.jsx";
import useOnlineUsers from "../hooks/useOnlineUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unfriendUser } from "../lib/api";
import { capitialize } from "../lib/utils";
import toast from "react-hot-toast";

const FriendCard = ({ friend, onViewProfile, hasChatHistory = false }) => {
  const { isUserOnline } = useOnlineUsers();
  const isOnline = isUserOnline(friend?._id);
  const queryClient = useQueryClient();
  const [confirmingUnfriend, setConfirmingUnfriend] = useState(false);

  const { mutate: unfriendMutation, isPending: isUnfriending } = useMutation({
    mutationFn: () => unfriendUser(friend._id),
    onSuccess: () => {
      toast.success(`Removed ${friend.fullName} from friends`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
    onError: () => {
      toast.error("Failed to unfriend user");
    },
  });

  return (
    <div className="card bg-base-200/75 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <div className="card-body p-5 flex flex-col justify-between space-y-4">
        {/* USER INFO */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex items-start gap-3.5 cursor-pointer group/avatar min-w-0 flex-1"
            onClick={() => onViewProfile && onViewProfile(friend)}
            title="View Profile"
          >
            <Avatar
              src={friend.profilePic}
              name={friend.fullName}
              size="lg"
              showOnline={isOnline}
              isOnline={isOnline}
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-base-content group-hover/avatar:text-primary transition-colors truncate leading-snug">
                {friend.fullName}
              </h3>

              {friend.location && (
                <div className="flex items-center text-xs text-base-content/60 mt-1">
                  <MapPin className="size-3 mr-1 text-primary/70 flex-shrink-0" />
                  <span className="truncate">{friend.location}</span>
                </div>
              )}
            </div>
          </div>

          {hasChatHistory && (
            <span className="badge badge-primary/10 text-primary border border-primary/20 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
              Recent Chat
            </span>
          )}
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span>{getLanguageFlag(friend.nativeLanguage)}</span>
            <span className="truncate">Native: {capitialize(friend.nativeLanguage)}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span>{getLanguageFlag(friend.learningLanguage)}</span>
            <span className="truncate">Learning: {capitialize(friend.learningLanguage)}</span>
          </span>
        </div>

        {/* ACTIONS */}
        {confirmingUnfriend ? (
          <div className="pt-2 animate-fadeIn">
            <div className="bg-error/10 border border-error/25 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-error flex items-center gap-1 truncate">
                <UserMinus className="size-3.5 flex-shrink-0" />
                <span>Remove friend?</span>
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => unfriendMutation()}
                  disabled={isUnfriending}
                  className="btn btn-error btn-xs rounded-lg text-white font-semibold shadow-xs"
                >
                  {isUnfriending ? <Loader2 className="size-3 animate-spin" /> : "Remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingUnfriend(false)}
                  className="btn btn-ghost btn-xs rounded-lg text-base-content/70 hover:text-base-content"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2 flex items-center gap-2">
            <Link
              to={`/chat/${friend._id}`}
              className="btn btn-primary btn-sm flex-1 rounded-xl gap-2 font-medium shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              <MessageSquare className="size-4" />
              <span>Message</span>
            </Link>

            {onViewProfile && (
              <button
                type="button"
                onClick={() => onViewProfile(friend)}
                className="btn btn-circle btn-sm bg-base-300/60 hover:bg-base-300 text-base-content/70 hover:text-primary border-none transition-colors"
                title="View Full Profile"
                aria-label="View Full Profile"
              >
                <Eye className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setConfirmingUnfriend(true)}
              className="btn btn-circle btn-sm bg-base-300/60 hover:bg-error/15 text-base-content/60 hover:text-error border-none transition-colors"
              title="Unfriend"
              aria-label="Unfriend"
            >
              <UserMinus className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
