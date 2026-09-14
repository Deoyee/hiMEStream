import React from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  VideoOff,
} from "lucide-react";

export const CallMessage = ({ message, isMyMessage, onCallBack }) => {
  const text = message?.text || "";
  const lowerText = text.toLowerCase();

  const isAudio =
    message?.call_type === "audio" ||
    lowerText.includes("voice") ||
    text.includes("type=audio") ||
    text.startsWith("📞");

  const isMissed =
    message?.call_status === "missed" ||
    lowerText.includes("missed") ||
    lowerText.includes("declined") ||
    lowerText.includes("no answer");

  // Format timestamp nicely
  const timeStr = message?.created_at
    ? new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  let title = "";
  if (isMissed) {
    title = isAudio ? "Missed Voice Call" : "Missed Video Call";
  } else if (isMyMessage) {
    title = isAudio ? "Outgoing Voice Call" : "Outgoing Video Call";
  } else {
    title = isAudio ? "Incoming Voice Call" : "Incoming Video Call";
  }

  return (
    <div
      className={`flex items-center gap-3.5 my-1.5 px-4 py-3 rounded-2xl max-w-sm transition-all shadow-md select-none ${
        isMyMessage
          ? "ml-auto bg-primary text-primary-content border border-primary/25 shadow-primary/20"
          : isMissed
          ? "mr-auto bg-error/15 text-error border border-error/25"
          : "mr-auto bg-base-200 text-base-content border border-base-content/10"
      }`}
    >
      {/* Call Icon Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
          isMissed
            ? "bg-error/20 text-error ring-1 ring-error/30"
            : isMyMessage
            ? "bg-primary-content/20 text-primary-content ring-1 ring-primary-content/30"
            : "bg-primary/15 text-primary ring-1 ring-primary/25"
        }`}
      >
        {isAudio ? (
          isMissed ? (
            <PhoneMissed className="w-5 h-5 text-error animate-pulse" />
          ) : isMyMessage ? (
            <PhoneOutgoing className="w-5 h-5 text-primary-content" />
          ) : (
            <PhoneIncoming className="w-5 h-5 text-primary" />
          )
        ) : isMissed ? (
          <VideoOff className="w-5 h-5 text-error animate-pulse" />
        ) : (
          <Video className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Title & Status */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={`text-[13.5px] font-semibold leading-snug truncate ${
            isMissed ? "text-error" : isMyMessage ? "text-primary-content" : "text-base-content"
          }`}
        >
          {title}
        </span>
        <div className={`flex items-center gap-1.5 text-[11px] mt-0.5 ${
          isMyMessage ? "text-primary-content/75" : isMissed ? "text-error/80" : "text-base-content/60"
        }`}>
          <span>{timeStr}</span>
          <span>&bull;</span>
          <span className={isMissed ? "text-error font-medium" : ""}>
            {isMissed ? "No answer" : "Call ended"}
          </span>
        </div>
      </div>

      {/* Call-back action button */}
      {onCallBack && (
        <button
          type="button"
          onClick={() => onCallBack(isAudio)}
          className={`btn btn-circle btn-sm border-0 transition-transform active:scale-95 shrink-0 ${
            isMissed
              ? "bg-error/20 hover:bg-error text-error hover:text-error-content"
              : isMyMessage
              ? "bg-primary-content/20 hover:bg-primary-content/30 text-primary-content"
              : "bg-primary/15 hover:bg-primary text-primary hover:text-primary-content"
          }`}
          title={isAudio ? "Voice call back" : "Video call back"}
        >
          {isAudio ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default CallMessage;
