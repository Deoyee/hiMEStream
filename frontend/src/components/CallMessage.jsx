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
          ? "ml-auto bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 border border-emerald-500/30 text-emerald-50"
          : isMissed
          ? "mr-auto bg-gradient-to-r from-rose-950/60 to-rose-900/40 border border-rose-500/30 text-rose-100"
          : "mr-auto bg-[#241e1e] border border-white/10 text-gray-100"
      }`}
    >
      {/* Call Icon Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
          isMissed
            ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30"
            : isMyMessage
            ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30"
            : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
        }`}
      >
        {isAudio ? (
          isMissed ? (
            <PhoneMissed className="w-5 h-5 text-rose-400 animate-pulse" />
          ) : isMyMessage ? (
            <PhoneOutgoing className="w-5 h-5 text-emerald-300" />
          ) : (
            <PhoneIncoming className="w-5 h-5 text-emerald-400" />
          )
        ) : isMissed ? (
          <VideoOff className="w-5 h-5 text-rose-400 animate-pulse" />
        ) : (
          <Video className="w-5 h-5 text-emerald-400" />
        )}
      </div>

      {/* Title & Status */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={`text-[13.5px] font-semibold leading-snug truncate ${
            isMissed ? "text-rose-300" : isMyMessage ? "text-emerald-100" : "text-gray-100"
          }`}
        >
          {title}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
          <span>{timeStr}</span>
          <span>&bull;</span>
          <span className={isMissed ? "text-rose-400 font-medium" : "text-gray-400"}>
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
              ? "bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white"
              : "bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white"
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
