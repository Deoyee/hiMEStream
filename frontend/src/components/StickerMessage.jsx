import React, { useState } from "react";
import { Star, Check, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useStickerStore } from "../store/useStickerStore";
import useAuthUser from "../hooks/useAuthUser";

export const StickerMessage = ({ message, isMyMessage }) => {
  const { authUser } = useAuthUser();
  const { addSticker, removeSticker, hasSticker } = useStickerStore();

  const stickerAttachment = message?.attachments?.find(
    (att) => att.type === "image" || att.custom_type === "sticker"
  );

  const stickerUrl =
    message?.sticker_data?.url ||
    stickerAttachment?.image_url ||
    stickerAttachment?.thumb_url ||
    message?.text;

  const stickerName =
    message?.sticker_data?.name ||
    stickerAttachment?.fallback ||
    message?.text ||
    "Sticker";

  const isSaved = hasSticker(stickerUrl);
  const [isHovered, setIsHovered] = useState(false);

  // Format timestamp
  const timeStr = message?.created_at
    ? new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleToggleCollection = (e) => {
    e.stopPropagation();
    if (isSaved) {
      removeSticker(stickerUrl);
      toast("Removed from your sticker collection", { icon: "🗑️" });
    } else {
      const added = addSticker({
        id: message?.sticker_data?.id || `sticker_${Date.now()}`,
        name: stickerName,
        url: stickerUrl,
        packName: message?.sticker_data?.packName || "Saved Stickers",
      });
      if (added) {
        toast.success("Added to your sticker collection! ⭐", {
          id: `saved-${stickerUrl}`,
        });
      }
    }
  };

  return (
    <div
      className={`relative my-2 flex flex-col group select-none transition-all ${
        isMyMessage ? "items-end ml-auto" : "items-start mr-auto"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sender label for incoming sticker */}
      {!isMyMessage && message?.user?.name && (
        <span className="text-[11px] font-medium text-base-content/60 ml-1 mb-0.5">
          {message.user.name}
        </span>
      )}

      {/* Main Sticker Container */}
      <div className="relative inline-block group">
        <div className="relative p-1.5 transition-transform duration-200 hover:scale-105 active:scale-95">
          <img
            src={stickerUrl}
            alt={stickerName}
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Quick Action Button: Add to Collection */}
          <div
            className={`absolute -top-2.5 ${
              isMyMessage ? "-left-2" : "-right-2"
            } transition-all duration-200 z-10 ${
              isHovered ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:scale-100 sm:group-hover:pointer-events-auto"
            }`}
          >
            <button
              type="button"
              onClick={handleToggleCollection}
              className={`btn btn-xs rounded-full gap-1 shadow-lg border border-white/20 backdrop-blur-md transition-all ${
                isSaved
                  ? "bg-amber-500/90 hover:bg-amber-600 text-white"
                  : "bg-[#181414]/90 hover:bg-[#251f1f] text-amber-300 hover:text-amber-200"
              }`}
              title={isSaved ? "Remove from my stickers" : "Add to my sticker collection"}
            >
              {isSaved ? (
                <>
                  <Check className="size-3 text-white" />
                  <span className="text-[10px] font-semibold">Saved</span>
                </>
              ) : (
                <>
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-semibold">Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-1 text-[10px] opacity-60 px-1 mt-0.5 ${
            isMyMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span>{timeStr}</span>
          {isMyMessage && (
            <span className="text-emerald-400 font-bold ml-0.5">✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickerMessage;
