import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { X, Phone, Video, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallModal({ isOpen, onClose, callId, isAudioOnly, authUser, token }) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!isOpen || !token || !authUser || !callId) return;

    let callInstance = null;
    let videoClient = null;
    let isCancelled = false;

    const initCall = async () => {
      try {
        setIsConnecting(true);

        const user = {
          id: authUser._id,
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

        if (isCancelled) {
          await callInstance.leave();
          return;
        }

        // Double check after join for voice calls
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
        console.error("Error joining call:", error);
        toast.error("Could not join call. Please try again.");
        onClose();
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      isCancelled = true;
      if (callInstance) {
        callInstance.leave().catch((err) => console.warn("Error leaving call on cleanup:", err));
      }
    };
  }, [isOpen, token, authUser, callId, isAudioOnly, onClose]);

  const handleClose = async () => {
    if (call) {
      try {
        await call.leave();
      } catch (err) {
        console.warn("Error leaving call on close:", err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl h-[88vh] sm:h-[90vh] bg-[#141010] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-[#1c1717] border-b border-white/10 flex items-center justify-between select-none z-10">
          <div className="flex items-center gap-2">
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
            <span className="text-xs text-base-content/60 hidden sm:inline">
              hiME Stream Real-Time Call
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Leave & Close Call"
            aria-label="Leave & Close Call"
          >
            <X className="size-4" />
          </button>
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

function CallModalContent({ isAudioOnly, onClose }) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onClose();
    }
  }, [callingState, onClose]);

  return (
    <StreamTheme className="h-full w-full flex flex-col justify-between p-3 sm:p-4 relative">
      {isAudioOnly && (
        <div className="absolute top-4 left-4 z-40 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Voice Only (Camera Disabled)</span>
        </div>
      )}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
        <SpeakerLayout />
      </div>
      <div className="flex justify-center pt-2 z-30">
        <CallControls onLeave={onClose} />
      </div>
    </StreamTheme>
  );
}

export default CallModal;
