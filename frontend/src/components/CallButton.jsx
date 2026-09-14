import { Phone, Video, User } from "lucide-react";

function CallButton({ handleVideoCall, handleVoiceCall, handleViewProfile }) {
  return (
    <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-2">
      {handleViewProfile && (
        <button
          type="button"
          onClick={handleViewProfile}
          className="btn btn-circle btn-sm bg-[#2b2424] hover:bg-[#382f2f] text-gray-200 border border-white/10 shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          title="View Profile"
          aria-label="View Profile"
        >
          <User className="size-4" />
        </button>
      )}

      <button
        type="button"
        onClick={handleVoiceCall}
        className="btn btn-circle btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        title="Start Voice Call"
        aria-label="Start Voice Call"
      >
        <Phone className="size-4" />
      </button>

      <button
        type="button"
        onClick={handleVideoCall}
        className="btn btn-circle btn-sm btn-success text-white shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        title="Start Video Call"
        aria-label="Start Video Call"
      >
        <Video className="size-4" />
      </button>
    </div>
  );
}

export default CallButton;