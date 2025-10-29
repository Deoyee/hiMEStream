import { Link } from "react-router";
import { getLanguageFlag } from "../lib/languageUtils.jsx";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={friend.profilePic} alt={friend.fullName} className="object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{friend.fullName}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-primary gap-1">
                {getLanguageFlag(friend.nativeLanguage)}
                {friend.nativeLanguage}
              </span>
              <span className="badge badge-secondary gap-1">
                {getLanguageFlag(friend.learningLanguage)}
                {friend.learningLanguage}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link 
            to={`/chat/${friend._id}`} 
            className="btn btn-outline w-full"
          >
            Message
          </Link>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

