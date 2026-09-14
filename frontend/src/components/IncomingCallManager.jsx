import { useEffect, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { Phone, Video, PhoneCall, X, Check } from "lucide-react";
import Avatar from "./Avatar.jsx";
import CallModal from "./CallModal.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const IncomingCallManager = () => {
  const { authUser } = useAuthUser();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCallModal, setActiveCallModal] = useState(null);
  const [chatClient, setChatClient] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    let client = null;
    let listener = null;

    const setupListener = async () => {
      try {
        client = StreamChat.getInstance(STREAM_API_KEY);
        setChatClient(client);

        // Listen for new messages across all user channels
        listener = client.on("message.new", (event) => {
          const msg = event?.message;
          if (!msg) return;

          // Ignore messages sent by ourselves
          const myId = String(authUser?._id || authUser?.id || "");
          const senderId = String(msg.user?.id || "");
          if (myId && senderId && myId === senderId) return;

          // Ignore messages already marked missed or ended
          const lowerText = (msg.text || "").toLowerCase();
          if (
            msg.call_status === "missed" ||
            lowerText.includes("missed") ||
            lowerText.includes("no answer")
          ) {
            return;
          }

          // Check if message is a call invitation
          const isCallMsg =
            Boolean(msg.call_id) ||
            msg.call_status === "started" ||
            msg.text?.includes("/call/") ||
            (msg.text?.startsWith("📞") && !lowerText.includes("missed")) ||
            (msg.text?.startsWith("📹") && !lowerText.includes("missed"));

          if (isCallMsg) {
            const createdAt = new Date(msg.created_at).getTime();
            const now = Date.now();

            // Only trigger if sent within the last 45 seconds
            if (now - createdAt < 45000) {
              let callId = msg.call_id;
              let isAudioOnly =
                msg.call_type === "audio" || lowerText.includes("voice");

              if (!callId && msg.text?.includes("/call/")) {
                const urlMatch = msg.text.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                  try {
                    const url = new URL(urlMatch[0]);
                    callId = url.pathname.split("/call/")[1];
                    isAudioOnly = url.searchParams.get("type") === "audio";
                  } catch {
                    // ignore url parse error
                  }
                }
              }

              if (callId) {
                setIncomingCall({
                  callId,
                  isAudioOnly,
                  caller: msg.user,
                  receivedAt: now,
                  channelId: event.channel_id,
                  channelType: event.channel_type || "messaging",
                });
              }
            }
          }
        });
      } catch (err) {
        console.warn("Could not setup incoming call listener:", err);
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.unsubscribe === "function") {
        listener.unsubscribe();
      }
    };
  }, [tokenData, authUser]);

  // Auto-dismiss after 40 seconds if unresponded and mark missed call
  useEffect(() => {
    if (!incomingCall) return;

    const timer = setTimeout(() => {
      if (chatClient && authUser) {
        try {
          const channelType = incomingCall.channelType || "messaging";
          const channelId =
            incomingCall.channelId ||
            [authUser._id, incomingCall.caller?.id].sort().join("-");
          const channel = chatClient.channel(channelType, channelId);
          channel.sendMessage({
            text: incomingCall.isAudioOnly
              ? "📞 Missed voice call"
              : "📹 Missed video call",
            call_status: "missed",
            call_type: incomingCall.isAudioOnly ? "audio" : "video",
          });
        } catch (e) {
          console.warn("Could not send missed call message on timeout:", e);
        }
      }
      setIncomingCall(null);
    }, 40000);

    return () => clearTimeout(timer);
  }, [incomingCall, chatClient, authUser]);

  const handleAccept = () => {
    if (incomingCall) {
      setActiveCallModal({
        callId: incomingCall.callId,
        isAudioOnly: incomingCall.isAudioOnly,
      });
      setIncomingCall(null);
    }
  };

  const handleCloseCallModal = useCallback(() => {
    setActiveCallModal(null);
  }, []);

  const handleDecline = () => {
    if (incomingCall && chatClient && authUser) {
      try {
        const channelType = incomingCall.channelType || "messaging";
        const channelId =
          incomingCall.channelId ||
          [authUser._id, incomingCall.caller?.id].sort().join("-");
        const channel = chatClient.channel(channelType, channelId);
        channel.sendMessage({
          text: incomingCall.isAudioOnly
            ? "📞 Missed voice call"
            : "📹 Missed video call",
          call_status: "missed",
          call_type: incomingCall.isAudioOnly ? "audio" : "video",
        });
      } catch (e) {
        console.warn("Could not send missed call message on decline:", e);
      }
    }
    setIncomingCall(null);
  };

  return (
    <>
      {/* Floating Incoming Call Banner */}
      {incomingCall && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] w-[92vw] max-w-md animate-bounce-subtle">
          <div className="bg-[#181313]/95 backdrop-blur-xl border-2 border-emerald-500/50 shadow-[0_10px_35px_rgba(16,185,129,0.35)] rounded-3xl p-4 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative">
                <Avatar
                  src={incomingCall.caller?.image}
                  name={incomingCall.caller?.name || "Caller"}
                  size="md"
                  className="ring-2 ring-emerald-500"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-sm">
                  {incomingCall.isAudioOnly ? (
                    <Phone className="size-3 animate-pulse" />
                  ) : (
                    <Video className="size-3 animate-pulse" />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-sm text-white truncate">
                  {incomingCall.caller?.name || "Someone"}
                </p>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>
                    Incoming {incomingCall.isAudioOnly ? "Voice" : "Video"} Call...
                  </span>
                </p>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleDecline}
                className="btn btn-circle btn-sm bg-red-600/80 hover:bg-red-600 text-white border-none shadow-md transition-transform active:scale-95"
                title="Decline"
                aria-label="Decline"
              >
                <X className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="btn btn-circle btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md transition-transform hover:scale-110 active:scale-95"
                title="Accept Call"
                aria-label="Accept Call"
              >
                <PhoneCall className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Call Modal when accepted via banner */}
      {activeCallModal && (
        <CallModal
          isOpen={!!activeCallModal}
          onClose={handleCloseCallModal}
          callId={activeCallModal.callId}
          isAudioOnly={activeCallModal.isAudioOnly}
          authUser={authUser}
          token={tokenData?.token}
        />
      )}
    </>
  );
};

export default IncomingCallManager;
