import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  MessageSimple,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { getStreamToken, getUserById, getUserFriends, unfriendUser } from "../lib/api.js";
import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";
import CallModal from "../components/CallModal.jsx";
import CallMessage from "../components/CallMessage.jsx";
import UserProfileModal from "../components/UserProfileModal.jsx";
import { useThemeStore } from "../store/useThemeStore.js";
import { isDarkTheme } from "../constants/index.js";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const isDark = isDarkTheme(theme);
  const streamTheme = isDark ? "str-chat__theme-dark" : "str-chat__theme-light";

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: partnerUser } = useQuery({
    queryKey: ["user", targetUserId],
    queryFn: () => getUserById(targetUserId),
    enabled: !!targetUserId,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const isFriend = Array.isArray(friends) && friends.some((f) => f._id === targetUserId);

  const unfriendMutation = useMutation({
    mutationFn: unfriendUser,
    onSuccess: () => {
      toast.success("Unfriended successfully");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["user", targetUserId] });
    },
    onError: () => {
      toast.error("Failed to unfriend user");
    },
  });

  // Intercept click on call links to open in modal, and click on header to open profile modal
  useEffect(() => {
    const handleChatClick = (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href);
          if (url.pathname.includes("/call/")) {
            e.preventDefault();
            e.stopPropagation();
            const callId = url.pathname.split("/call/")[1];
            const isAudio = url.searchParams.get("type") === "audio";
            if (callId) {
              setActiveCall({ callId, isAudioOnly: isAudio });
            }
          }
        } catch {
          // ignore
        }
      }

      // Check if clicked on channel header (avatar or name) but not buttons
      const header = e.target.closest(".str-chat__header-channel");
      if (header && !e.target.closest("button") && !e.target.closest(".btn")) {
        setIsProfileModalOpen(true);
      }
    };

    document.addEventListener("click", handleChatClick, true);
    return () => {
      document.removeEventListener("click", handleChatClick, true);
    };
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        // if i start the chat => channelId: [myId, yourId] no matter who starts the chat

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        // Ensure fresh app settings with updated 100MB limit are loaded in browser
        client.appSettingsPromise = client.getAppSettings();

        // Client-side file selection watcher for instant feedback on file sizes
        const handleFileChange = (e) => {
          if (e.target && e.target.type === "file" && e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
              const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
              if (file.size > 100 * 1024 * 1024) {
                toast.error(
                  `"${file.name}" (${sizeMB}MB) exceeds the 100MB allowed limit. Maximum allowed is 100MB.`,
                  { id: "file-size-limit", duration: 6000 }
                );
              } else if (file.type.startsWith("video/") && file.size > 10 * 1024 * 1024) {
                toast(
                  `"${file.name}" is ${sizeMB}MB. Allowed up to 100MB (keep videos under 10MB for fast sending).`,
                  {
                    icon: "ℹ️",
                    id: "video-size-hint",
                    duration: 5000,
                  }
                );
              }
            }
          }
        };

        document.addEventListener("change", handleFileChange, true);

        // Subscribe to upload/attachment notifications so user gets instant toast feedback
        let lastNotifId = null;
        const unsubscribeNotifications = client.notifications?.store?.subscribe?.((state) => {
          const notifications = state?.notifications || [];
          if (notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            if (latest && latest.id !== lastNotifId) {
              lastNotifId = latest.id;
              if (latest.severity === "error") {
                if (latest.type?.includes("upload:blocked")) {
                  const reason = latest.metadata?.reason;
                  if (reason === "size_limit") {
                    toast.error("File exceeds the allowed size limit. Maximum allowed is 100MB.", { id: "upload-blocked" });
                  } else if (reason?.includes("extension") || reason?.includes("mime")) {
                    toast.error("This file format is not supported.", { id: "upload-blocked" });
                  } else {
                    toast.error(`Upload blocked: ${reason || "Invalid file"}`, { id: "upload-blocked" });
                  }
                } else if (latest.type?.includes("upload:failed")) {
                  const rawReason = latest.metadata?.reason || latest.message || "";
                  if (rawReason.toLowerCase().includes("timeout")) {
                    toast.error("Upload timed out. Allowed limit is 100MB (keep videos under 10MB for fast sending).", {
                      id: "upload-failed",
                      duration: 6000,
                    });
                  } else {
                    toast.error(`Upload failed: ${rawReason || "Failed to upload file"}`, { id: "upload-failed" });
                  }
                }
              } else if (latest.severity === "warning") {
                if (latest.type?.includes("upload:in-progress") || latest.message?.includes("upload")) {
                  toast("Please wait for the file to finish uploading before sending.", {
                    icon: "⏳",
                    id: "upload-in-progress",
                  });
                }
              }
            }
          }
        });

        setChatClient(client);
        setChannel(currChannel);

        return () => {
          document.removeEventListener("change", handleFileChange, true);
          unsubscribeNotifications?.();
        };
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleCloseCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const handleVideoCall = useCallback(() => {
    if (channel) {
      const callSessionId = `${channel.id}-${Date.now()}`;

      channel.sendMessage({
        text: "📹 Video call",
        call_id: callSessionId,
        call_type: "video",
        call_status: "started",
      });

      toast.success("Video call started!");
      setActiveCall({ callId: callSessionId, isAudioOnly: false });
    }
  }, [channel]);

  const handleVoiceCall = useCallback(() => {
    if (channel) {
      const callSessionId = `${channel.id}-${Date.now()}`;

      channel.sendMessage({
        text: "📞 Voice call",
        call_id: callSessionId,
        call_type: "audio",
        call_status: "started",
      });

      toast.success("Voice call started!");
      setActiveCall({ callId: callSessionId, isAudioOnly: true });
    }
  }, [channel]);

  const CustomMessage = useCallback(
    (props) => {
      const { message, isMyMessage } = props;
      const text = message?.text || "";
      const isCall =
        Boolean(message?.call_id) ||
        Boolean(message?.call_type) ||
        message?.custom_type === "call" ||
        text.includes("/call/") ||
        text.startsWith("📞") ||
        text.startsWith("📹") ||
        (text.toLowerCase().includes("call") &&
          (text.toLowerCase().includes("voice") ||
            text.toLowerCase().includes("video") ||
            text.toLowerCase().includes("started") ||
            text.toLowerCase().includes("missed")));

      if (isCall) {
        return (
          <CallMessage
            message={message}
            isMyMessage={isMyMessage}
            onCallBack={(isAudio) => {
              if (isAudio) {
                handleVoiceCall();
              } else {
                handleVideoCall();
              }
            }}
          />
        );
      }

      return <MessageSimple {...props} />;
    },
    [handleVoiceCall, handleVideoCall]
  );

  const audioRecordingConfig = useMemo(
    () => ({
      mediaRecorderConfig: {
        audioBitsPerSecond: 128000,
      },
      transcoderConfig: {
        sampleRate: 48000,
        // Pass-through encoder preserves native 48kHz WebM/Opus audio, eliminating 16kHz downsampling stutters and skipped audio
        encoder: async (file) => file,
      },
    }),
    []
  );

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-full w-full flex flex-col flex-1 min-h-0 bg-base-100 overflow-hidden m-0 p-0">
      <Chat client={chatClient} theme={streamTheme}>
        <Channel channel={channel}>
          <div className="w-full h-full relative flex flex-col flex-1 min-h-0">
            <CallButton
              handleVideoCall={handleVideoCall}
              handleVoiceCall={handleVoiceCall}
              handleViewProfile={() => setIsProfileModalOpen(true)}
            />
            <Window>
              <ChannelHeader />
              <MessageList Message={CustomMessage} />
              <div className="relative flex flex-col">
                <MessageInput
                  focus
                  audioRecordingEnabled={true}
                  audioRecordingConfig={audioRecordingConfig}
                />
                <div className="px-4 py-1.5 flex items-center justify-between text-[11px] text-base-content/60 bg-base-200 border-t border-base-content/10 select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>
                      Allowed size: <strong className="text-base-content font-medium">100 MB</strong> per file &bull; Videos under <strong className="text-base-content font-medium">10 MB</strong> recommended
                    </span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] text-base-content/50">
                    Supports: JPG, PNG, GIF, MP4, PDF, DOCX, ZIP & more
                  </span>
                </div>
              </div>
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

      {/* In-App Call Modal */}
      {activeCall && (
        <CallModal
          isOpen={!!activeCall}
          onClose={handleCloseCall}
          callId={activeCall.callId}
          isAudioOnly={activeCall.isAudioOnly}
          authUser={authUser}
          token={tokenData?.token}
        />
      )}

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={
            partnerUser ||
            (channel?.state?.members?.[targetUserId]?.user
              ? {
                  _id: targetUserId,
                  fullName: channel.state.members[targetUserId].user.name,
                  profilePic: channel.state.members[targetUserId].user.image,
                }
              : null)
          }
          isFriend={isFriend}
          onUnfriend={(u) => unfriendMutation.mutate(u._id)}
        />
      )}
    </div>
  );
}

export default ChatPage;
