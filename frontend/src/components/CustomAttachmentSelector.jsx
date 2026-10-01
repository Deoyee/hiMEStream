import React, { useState } from "react";
import {
  AttachmentSelector as DefaultAttachmentSelector,
  useMessageInputContext,
  useChatContext,
} from "stream-chat-react";
import { Smile } from "lucide-react";
import EmojiStickerPicker from "./EmojiStickerPicker";

export const CustomAttachmentSelector = () => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { textareaRef } = useMessageInputContext("CustomAttachmentSelector");
  const { channel } = useChatContext("CustomAttachmentSelector");

  const handleSelectEmoji = (emoji) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const val = textarea.value;
    const nextVal = val.substring(0, start) + emoji + val.substring(end);

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(textarea, nextVal);
    } else {
      textarea.value = nextVal;
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  const handleSelectSticker = async (sticker) => {
    if (!channel) return;
    try {
      await channel.sendMessage({
        text: sticker.name || "Sticker",
        attachments: [
          {
            type: "image",
            image_url: sticker.url,
            thumb_url: sticker.url,
            fallback: sticker.name,
            custom_type: "sticker",
          },
        ],
        custom_type: "sticker",
        sticker_data: {
          id: sticker.id,
          name: sticker.name,
          url: sticker.url,
          packName: sticker.packName,
        },
      });
    } catch (err) {
      console.warn("Could not send sticker:", err);
    }
  };

  return (
    <div className="relative flex items-center gap-0.5">
      {/* Original Add Document / File Icon */}
      <DefaultAttachmentSelector />

      {/* Emoji & Sticker Toggle Button right beside Add Document */}
      <button
        id="emoji-sticker-toggle-btn"
        type="button"
        onClick={() => setIsPickerOpen((prev) => !prev)}
        className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
          isPickerOpen
            ? "text-emerald-400 bg-emerald-500/20 scale-105"
            : "text-gray-400 hover:text-emerald-400 hover:bg-white/10 active:scale-95"
        }`}
        title="Emoji and Sticker Packs"
        aria-label="Emoji and Sticker Packs"
      >
        <Smile className="w-5 h-5" />
      </button>

      {/* Floating Emoji & Sticker Picker */}
      <EmojiStickerPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectEmoji={handleSelectEmoji}
        onSelectSticker={handleSelectSticker}
      />
    </div>
  );
};

export default CustomAttachmentSelector;
