import toast from "react-hot-toast";

/**
 * Proactively triggers the browser's native permission prompt for microphone and camera.
 * @param {boolean} isAudioOnly - If true, only audio is requested. Otherwise audio and video are requested.
 * @returns {Promise<boolean>} - true if permissions were granted, false otherwise.
 */
export const promptMediaPermissions = async (isAudioOnly = false) => {
  if (!navigator?.mediaDevices?.getUserMedia) {
    console.warn("navigator.mediaDevices.getUserMedia is not supported on this browser.");
    return false;
  }

  const constraints = isAudioOnly
    ? { audio: true, video: false }
    : { audio: true, video: true };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // Immediately stop temporary tracks so Stream SDK can bind the hardware devices without conflicts
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.warn("Media permissions prompt result:", err);
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      toast.error(
        `Please allow ${isAudioOnly ? "microphone" : "camera and microphone"} access in your browser (click the lock 🔒 icon in the address bar).`,
        { id: "media-perm-blocked", duration: 7000 }
      );
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      toast.error(
        `No ${isAudioOnly ? "microphone" : "camera/microphone"} device detected on your system.`,
        { id: "device-not-found", duration: 5000 }
      );
    }
    return false;
  }
};

export default promptMediaPermissions;
