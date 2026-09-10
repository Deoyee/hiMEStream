import { Link } from "react-router";
import { MessageSquare, MapPin } from "lucide-react";
import { getLanguageFlag } from "../lib/languageUtils.jsx";
import Avatar from "./Avatar.jsx";
import useOnlineUsers from "../hooks/useOnlineUsers";

const FriendCard = ({ friend }) => {
  const { isUserOnline } = useOnlineUsers();
  const isOnline = isUserOnline(friend?._id);

  return (
    <div className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
      <div className="card-body p-5 flex flex-col justify-between space-y-4">
        {/* USER INFO */}
        <div className="flex items-start gap-3.5">
          <Avatar
            src={friend.profilePic}
            name={friend.fullName}
            size="lg"
            showOnline={isOnline}
            isOnline={isOnline}
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-base-content truncate leading-snug">
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

        {/* LANGUAGES */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span>{getLanguageFlag(friend.nativeLanguage)}</span>
            <span className="truncate">Native: {friend.nativeLanguage}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span>{getLanguageFlag(friend.learningLanguage)}</span>
            <span className="truncate">Learning: {friend.learningLanguage}</span>
          </span>
        </div>

        {/* ACTIONS */}
        <div className="pt-2">
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-outline btn-primary btn-sm sm:btn-md w-full rounded-xl gap-2 font-medium transition-transform active:scale-[0.98]"
          >
            <MessageSquare className="size-4" />
            <span>Message</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
