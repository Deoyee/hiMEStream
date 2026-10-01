import { useEffect, useState, useRef } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  PaginatedGridLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";
import {
  X,
  Phone,
  Video,
  Loader2,
  Minus,
  Maximize2,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
} from "lucide-react";
import toast from "react-hot-toast";
import MicrophonePermissionBanner from "./MicrophonePermissionBanner";
import { useCallStore } from "../store/useCallStore";
import { promptMediaPermissions } from "../lib/mediaPermissions";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallModal({ isOpen, onClose, callId, isAudioOnly, authUser, token }) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [duration, setDuration] = useState(0);

  const { activeCall, isMinimized, minimizeCall, maximizeCall } = useCallStore();
  const hasEndedSentRef = useRef(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Duration timer
  useEffect(() => {
    if (!call) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [call]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const authUserId = String(authUser?._id || authUser?.id || "");

  // Sends "Call ended" message into the chat channel so chat shows ended, not missed
  const sendCallEndedMessage = async (durSecs) => {
    if (hasEndedSentRef.current) return;
    hasEndedSentRef.current = true;

    try {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      if (!chatClient || !chatClient.userID) return;

      const cId =
        activeCall?.channelId ||
        (callId.includes("-") ? callId.split("-").slice(0, 2).join("-") : null);
      if (!cId) return;

      const channel = chatClient.channel("messaging", cId);
      const durFormatted = formatDuration(durSecs || duration);

      await channel.sendMessage({
        text: isAudioOnly
          ? `📞 Voice call ended • ${durFormatted}`
          : `📹 Video call ended • ${durFormatted}`,
        call_status: "ended",
        call_type: isAudioOnly ? "audio" : "video",
        call_duration: durSecs || duration,
      });
      console.log("Call ended message sent successfully");
    } catch (err) {
      console.warn("Could not send call ended message:", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !token || !authUserId || !callId) return;

    let callInstance = null;
    let videoClient = null;
    let isDisposed = false;
    hasEndedSentRef.current = false;

    const initCall = async () => {
      try {
        setIsConnecting(true);

        // Proactively prompt browser for microphone (& camera for video calls)
        try {
          await promptMediaPermissions(isAudioOnly);
        } catch (promptErr) {
          console.warn("Browser media permissions prompt error:", promptErr);
        }

        const user = {
          id: authUserId,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token,
        });

        callInstance = videoClient.call("default", callId);

        // Pre-disable camera before joining so webcam never turns on for voice calls
        if (isAudioOnly) {
          try {
            await callInstance.camera.disable();
          } catch (camErr) {
            console.warn("Could not pre-disable camera for audio-only call:", camErr);
          }
        }

        await callInstance.join({ create: true });

        // Enable microphone & camera
        try {
          await callInstance.microphone.enable();
          if (!isAudioOnly) {
            await callInstance.camera.enable();
          }
          console.log("Media tracks enabled on behalf of user");
        } catch (micErr) {
          console.warn("Could not auto-enable media devices on join:", micErr);
        }

        if (isDisposed) {
          try {
            await callInstance.leave();
            await videoClient.disconnectUser();
          } catch (_e) {
            void _e;
          }
          return;
        }

        // Listen for call ended event so call ends for both participants
        callInstance.on("call.ended", () => {
          console.log("Call ended by remote participant");
          toast("Call ended", { icon: "📞", id: "call-ended-remote" });
          onCloseRef.current?.();
        });

        // Double check camera state for voice calls
        if (isAudioOnly && callInstance.camera.enabled) {
          try {
            await callInstance.camera.disable();
          } catch (camErr) {
            console.warn("Could not disable camera for audio-only call:", camErr);
          }
        }

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        if (!isDisposed) {
          console.error("Error joining call:", error);
          toast.error("Could not join call. Please try again.");
          onCloseRef.current?.();
        }
      } finally {
        if (!isDisposed) {
          setIsConnecting(false);
        }
      }
    };

    initCall();

    return () => {
      isDisposed = true;
      if (callInstance) {
        try {
          callInstance.microphone.disable();
          callInstance.camera.disable();
        } catch (_e) {
          void _e;
        }
        callInstance.leave().catch((err) => console.warn("Error leaving call on cleanup:", err));
      }
      if (videoClient) {
        videoClient.disconnectUser().catch((err) => console.warn("Error disconnecting client on cleanup:", err));
      }
      setClient(null);
      setCall(null);
      setDuration(0);
    };
  }, [isOpen, token, authUserId, callId, isAudioOnly]);

  // Ends call for BOTH participants and sends ended message
  const handleClose = async () => {
    const finalDuration = duration;
    if (call) {
      try {
        await call.microphone.disable().catch(() => {});
        await call.camera.disable().catch(() => {});
        // End the call for both participants
        await call.endCall().catch(async (e) => {
          console.warn("call.endCall failed, falling back to leave:", e);
          await call.leave().catch(() => {});
        });
      } catch (err) {
        console.warn("Error ending call on close:", err);
      }
    }
    if (client) {
      try {
        await client.disconnectUser().catch(() => {});
      } catch (err) {
        console.warn("Error disconnecting client on close:", err);
      }
    }
    await sendCallEndedMessage(finalDuration);
    onClose();
  };

  if (!isOpen) return null;

  // MINIMIZED PICTURE-IN-PICTURE CALL CARD (allows texting anyone else while on call)
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-5 right-5 z-[999999] pointer-events-auto transition-all duration-300"
        role="dialog"
        aria-modal="false"
      >
        <div className="w-[320px] sm:w-[360px] bg-[#141010]/95 backdrop-blur-2xl border-2 border-emerald-500/50 shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.3)] rounded-3xl overflow-hidden flex flex-col animate-fadeIn">
          {/* Minimized Card Top Header */}
          <div
            onClick={maximizeCall}
            className="px-3.5 py-2.5 bg-[#1c1717] border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#231d1d] transition-colors select-none"
            title="Click card to expand call"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                {isAudioOnly ? (
                  <Phone className="size-3 text-emerald-400" />
                ) : (
                  <Video className="size-3 text-emerald-400" />
                )}
                <span>{isAudioOnly ? "Voice Call" : "Video Call"}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={maximizeCall}
                className="btn btn-circle btn-xs btn-ghost text-gray-300 hover:text-white hover:bg-white/15"
                title="Expand to Fullscreen"
                aria-label="Expand to Fullscreen"
              >
                <Maximize2 className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="btn btn-circle btn-xs bg-red-600/80 hover:bg-red-600 text-white border-none shadow-sm transition-transform active:scale-95"
                title="End Call for Both"
                aria-label="End Call for Both"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Minimized Body / Controls */}
          <div className="relative bg-[#0c0a0a] overflow-hidden">
            {isConnecting ? (
              <div className="p-5 flex flex-col items-center justify-center gap-2 text-base-content/70">
                <Loader2 className="size-6 animate-spin text-emerald-500" />
                <p className="text-xs font-medium">Connecting call...</p>
              </div>
            ) : client && call ? (
              <StreamVideo client={client}>
                <StreamCall call={call}>
                  <CallModalMinimizedContent
                    isAudioOnly={isAudioOnly}
                    onClose={handleClose}
                    onMaximize={maximizeCall}
                  />
                </StreamCall>
              </StreamVideo>
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                <p>Call ended or disconnected.</p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-xs btn-outline btn-error mt-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FULLSCREEN CALL MODAL
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl h-[88vh] sm:h-[90vh] bg-[#141010] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-[#1c1717] border-b border-white/10 flex items-center justify-between select-none z-10">
          <div className="flex items-center gap-2.5">
            {isAudioOnly ? (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <Phone className="size-3.5" />
                <span>Voice Call</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <Video className="size-3.5" />
                <span>Video Call</span>
              </span>
            )}
            <span className="text-xs font-mono text-emerald-400/90 bg-black/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {formatDuration(duration)}
            </span>
            <span className="text-xs text-base-content/60 hidden sm:inline">
              hiME Stream Real-Time Call
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimize button (allows texting someone else while staying on call) */}
            <button
              type="button"
              onClick={minimizeCall}
              className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize call (text someone else)"
              aria-label="Minimize call"
            >
              <Minus className="size-4" />
            </button>

            {/* Leave & End Call for Both */}
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="End Call for Both"
              aria-label="End Call for Both"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Call Container */}
        <div className="relative flex-1 min-h-0 bg-[#0c0a0a] flex items-center justify-center overflow-hidden">
          {isConnecting ? (
            <div className="flex flex-col items-center gap-3 text-base-content/70">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">
                Connecting to {isAudioOnly ? "voice" : "video"} call...
              </p>
            </div>
          ) : client && call ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallModalContent isAudioOnly={isAudioOnly} onClose={handleClose} />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="flex flex-col items-center gap-2 text-base-content/60">
              <p className="text-sm">Could not connect to call.</p>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-sm btn-outline btn-error mt-2"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// FULLSCREEN MODAL CONTENT
function CallModalContent({ isAudioOnly, onClose }) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      onClose();
    }
  }, [callingState, onClose]);

  // Allow user to click to dismiss connection quality / in-call notifications
  useEffect(() => {
    const handleNotifClick = (e) => {
      const notif = e.target.closest(".str-video__notification");
      if (notif) {
        notif.style.opacity = "0";
        notif.style.transform = "scale(0.95)";
        setTimeout(() => {
          notif.style.display = "none";
        }, 200);
      }
    };
    document.addEventListener("click", handleNotifClick);
    return () => document.removeEventListener("click", handleNotifClick);
  }, []);

  return (
    <StreamTheme className="h-full w-full flex flex-col justify-between p-3 sm:p-4 relative">
      <MicrophonePermissionBanner isAudioOnly={isAudioOnly} />
      {isAudioOnly && (
        <div className="absolute top-4 left-4 z-40 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Voice Only (Camera Disabled)</span>
        </div>
      )}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
        <PaginatedGridLayout groupSize={2} />
      </div>
      <div className="flex justify-center pt-2 z-30">
        <CallControls onLeave={onClose} />
      </div>
    </StreamTheme>
  );
}

// MINIMIZED CARD CONTENT (Picture-in-Picture dock)
function CallModalMinimizedContent({ isAudioOnly, onClose, onMaximize }) {
  const { useCallCallingState, useMicrophoneState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();

  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      onClose();
    }
  }, [callingState, onClose]);

  const handleToggleMic = async (e) => {
    e.stopPropagation();
    try {
      await microphone.toggle();
    } catch (err) {
      console.warn("Could not toggle mic in minimized card:", err);
    }
  };

  const handleToggleCam = async (e) => {
    e.stopPropagation();
    try {
      await camera.toggle();
    } catch (err) {
      console.warn("Could not toggle camera in minimized card:", err);
    }
  };

  if (isAudioOnly) {
    return (
      <div
        onClick={onMaximize}
        className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:bg-[#120e0e] transition-colors relative"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex items-center justify-center size-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Phone className="size-5 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-[#141010]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Voice Call Active</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <span>Click card to expand</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleToggleMic}
              className={`btn btn-circle btn-sm border-none shadow-md transition-all ${
                isMicMuted
                  ? "bg-red-600/80 hover:bg-red-600 text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 text-gray-200"
              }`}
              title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMicMuted ? <MicOff className="size-3.5 text-white" /> : <Mic className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white border-none shadow-md"
              title="End Call for Both"
            >
              <PhoneOff className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video call minimized
  return (
    <div className="relative group cursor-pointer" onClick={onMaximize}>
      <div className="h-44 w-full overflow-hidden bg-black flex items-center justify-center">
        <StreamTheme className="h-full w-full">
          <PaginatedGridLayout groupSize={2} pageArrowsVisible={false} />
        </StreamTheme>
      </div>

      {/* Hover action bar overlay */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-semibold text-gray-300 pl-1">
          Click video to expand
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`btn btn-circle btn-xs border-none ${
              isMicMuted
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-black/70 hover:bg-black text-white"
            }`}
            title={isMicMuted ? "Unmute" : "Mute"}
          >
            {isMicMuted ? <MicOff className="size-3" /> : <Mic className="size-3" />}
          </button>

          <button
            type="button"
            onClick={handleToggleCam}
            className={`btn btn-circle btn-xs border-none ${
              isCamMuted
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-black/70 hover:bg-black text-white"
            }`}
            title={isCamMuted ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isCamMuted ? <VideoOff className="size-3" /> : <Video className="size-3" />}
          </button>

          <button
            type="button"
            onClick={onMaximize}
            className="btn btn-circle btn-xs bg-emerald-600 hover:bg-emerald-500 text-white border-none"
            title="Maximize"
          >
            <Maximize2 className="size-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-xs bg-red-600 hover:bg-red-700 text-white border-none"
            title="End Call for Both"
          >
            <PhoneOff className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModal;
