import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

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
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import MicrophonePermissionBanner from "../components/MicrophonePermissionBanner";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let videoClient = null;
    let callInstance = null;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: String(authUser._id || authUser.id),
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        const searchParams = new URLSearchParams(window.location.search);
        const isAudioOnly = searchParams.get("type") === "audio";

        // Pre-disable camera before joining so the webcam never turns on during call initialization
        if (isAudioOnly) {
          try {
            await callInstance.camera.disable();
          } catch (camErr) {
            console.warn("Could not pre-disable camera for audio-only call:", camErr);
          }
        }

        await callInstance.join({ create: true });

        // Ask for microphone permission on behalf of the user and enable mic
        try {
          if (navigator?.mediaDevices?.getUserMedia) {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream.getTracks().forEach((t) => t.stop());
          }
          await callInstance.microphone.enable();
          console.log("Microphone enabled on behalf of user");
        } catch (micErr) {
          console.warn("Could not auto-enable microphone on join:", micErr);
        }

        if (isAudioOnly && callInstance.camera.enabled) {
          try {
            await callInstance.camera.disable();
          } catch (camErr) {
            console.warn("Could not disable camera for audio-only call:", camErr);
          }
        }

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
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
    };
  }, [tokenData?.token, authUser?._id, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();
  const { id: callId } = useParams();
  const { authUser } = useAuthUser();

  const searchParams = new URLSearchParams(window.location.search);
  const isAudioOnly = searchParams.get("type") === "audio";

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

  // when call ends, redirect back to chat with the other participant (if possible)
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      try {
        // callId is channel id created by joining two ids with '-'
        const parts = (callId || "").split("-");
        const otherId = parts.find((p) => p && p !== authUser?._id) || null;
        if (otherId) {
          navigate(`/chat/${otherId}`);
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Error navigating after call left:", err);
        navigate("/");
      }
    }
  }, [callingState, callId, authUser, navigate]);

  return (
    <StreamTheme>
      <MicrophonePermissionBanner />
      {isAudioOnly && (
        <div className="absolute top-4 left-4 z-50 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Voice Call</span>
        </div>
      )}
      <PaginatedGridLayout groupSize={2} />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;