import { useState, useEffect, useRef } from "react";
import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { promptMediaPermissions } from "../lib/mediaPermissions";

const MicrophonePermissionBanner = ({ isAudioOnly = false }) => {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { camera, hasBrowserPermission: hasCamPermission } = useCameraState();

  const [isRequesting, setIsRequesting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasAutoPromptedRef = useRef(false);

  const needsMic = hasMicPermission === false;
  const needsCam = !isAudioOnly && hasCamPermission === false;
  const needsPermission = needsMic || needsCam;

  // Proactively request media permissions on behalf of the user when entering the call
  useEffect(() => {
    if (!call) return;

    const requestOnBehalf = async () => {
      if (needsPermission && !hasAutoPromptedRef.current) {
        hasAutoPromptedRef.current = true;
        try {
          const granted = await promptMediaPermissions(isAudioOnly);
          if (granted) {
            if (microphone) await microphone.enable();
            if (!isAudioOnly && camera) await camera.enable();
            console.log("Media devices enabled automatically on behalf of user");
          }
        } catch (err) {
          console.warn("Could not automatically enable media devices on join:", err);
        }
      }
    };

    requestOnBehalf();
  }, [call, microphone, camera, needsPermission, isAudioOnly]);

  // If all required permissions are granted, no banner is needed
  if (!needsPermission || isDismissed) {
    return null;
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await promptMediaPermissions(isAudioOnly);
      if (granted) {
        if (microphone) await microphone.enable();
        if (!isAudioOnly && camera) await camera.enable();
        toast.success(
          isAudioOnly
            ? "Microphone enabled! Others can now hear you."
            : "Camera and microphone enabled!"
        );
      }
    } catch (err) {
      console.warn("Media request error:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  const label = isAudioOnly
    ? "Microphone Access Required"
    : needsMic && needsCam
    ? "Camera & Microphone Access Required"
    : needsCam
    ? "Camera Access Required"
    : "Microphone Access Required";

  const description = isAudioOnly
    ? "Your microphone is currently blocked. Allow access so participants can hear you."
    : "Allow camera and microphone access so participants can see and hear you.";

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-fadeIn">
      <div className="bg-[#1c1414]/95 border-2 border-amber-500/70 shadow-[0_8px_30px_rgba(245,158,11,0.25)] backdrop-blur-xl rounded-2xl p-3.5 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0 flex items-center gap-1">
            {needsMic && <MicOff className="size-4 animate-pulse" />}
            {needsCam && <VideoOff className="size-4 animate-pulse" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs sm:text-sm text-amber-300 truncate">
              {label}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-black font-bold border-none shadow-md transition-transform hover:scale-105 active:scale-95 text-xs flex items-center gap-1.5"
          >
            {isRequesting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Prompting...</span>
              </>
            ) : (
              <>
                <Mic className="size-3.5" />
                <span>Allow Access</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-white"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrophonePermissionBanner;
