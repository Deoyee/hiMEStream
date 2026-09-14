import { Phone, Video, User } from "lucide-react";

function CallButton({ handleVideoCall, handleVoiceCall, handleViewProfile }) {
  return (
    <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-2">
      {handleViewProfile && (
        <button
          type="button"
          onClick={handleViewProfile}
          className="btn btn-circle btn-sm bg-base-200/90 hover:bg-base-300 text-base-content border border-base-content/15 shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          title="View Profile"
          aria-label="View Profile"
        >
          <User className="size-4" />
        </button>
      )}

      <button
        type="button"
        onClick={handleVoiceCall}
        className="btn btn-circle btn-sm btn-primary text-primary-content border-none shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        title="Start Voice Call"
        aria-label="Start Voice Call"
      >
        <Phone className="size-4" />
      </button>

      <button
        type="button"
        onClick={handleVideoCall}
        className="btn btn-circle btn-sm btn-accent text-accent-content border-none shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        title="Start Video Call"
        aria-label="Start Video Call"
      >
        <Video className="size-4" />
      </button>
    </div>
  );
}

export default CallButton;