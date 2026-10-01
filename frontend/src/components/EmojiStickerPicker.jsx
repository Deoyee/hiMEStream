import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Smile,
  Sparkles,
  Search,
  X,
  Star,
  Trash2,
  Bookmark,
  Heart,
  Globe,
  Plus,
} from "lucide-react";
import { STICKER_PACKS, EMOJI_CATEGORIES } from "../data/stickers";
import { useStickerStore } from "../store/useStickerStore";
import useAuthUser from "../hooks/useAuthUser";

export const EmojiStickerPicker = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectSticker,
}) => {
  const [activeTab, setActiveTab] = useState("stickers"); // 'stickers' | 'emojis'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackId, setSelectedPackId] = useState("language_exchange");
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("smileys");

  const { authUser } = useAuthUser();
  const { myStickers, removeSticker, initForUser } = useStickerStore();
  const pickerRef = useRef(null);

  useEffect(() => {
    if (authUser?._id) {
      initForUser(authUser._id);
    }
  }, [authUser?._id, initForUser]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        // Check if clicked the toggle button
        if (e.target.closest("#emoji-sticker-toggle-btn")) return;
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filtered emojis
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      const cat = EMOJI_CATEGORIES.find((c) => c.id === selectedEmojiCategory);
      return cat ? cat.emojis : EMOJI_CATEGORIES[0].emojis;
    }
    // Search across all categories
    const q = searchQuery.toLowerCase();
    const all = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q) || cat.id.includes(q)) {
        all.push(...cat.emojis);
      } else {
        // filter individual emojis
        all.push(...cat.emojis);
      }
    });
    return Array.from(new Set(all)).slice(0, 100);
  }, [searchQuery, selectedEmojiCategory]);

  // Active stickers list
  const currentStickers = useMemo(() => {
    if (selectedPackId === "my_collection") {
      if (!searchQuery.trim()) return myStickers;
      const q = searchQuery.toLowerCase();
      return myStickers.filter((s) => s.name?.toLowerCase().includes(q));
    }

    const pack = STICKER_PACKS.find((p) => p.id === selectedPackId);
    if (!pack) return [];
    if (!searchQuery.trim()) return pack.stickers;

    const q = searchQuery.toLowerCase();
    return pack.stickers.filter((s) => s.name?.toLowerCase().includes(q));
  }, [selectedPackId, myStickers, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-3 z-[99999] w-[340px] sm:w-[400px] h-[430px] bg-[#161212]/98 backdrop-blur-2xl border border-white/15 shadow-[0_15px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.18)] rounded-3xl flex flex-col overflow-hidden animate-fadeIn"
      role="dialog"
      aria-label="Emoji and Sticker Picker"
    >
      {/* Top Header: Tab Switcher & Close */}
      <div className="px-3.5 pt-3 pb-2 bg-[#1f1919] border-b border-white/10 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("stickers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "stickers"
                ? "bg-emerald-500 text-white shadow-md scale-100"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Stickers</span>
            {myStickers.length > 0 && (
              <span className="ml-1 text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full">
                {myStickers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emojis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "emojis"
                ? "bg-emerald-500 text-white shadow-md scale-100"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Smile className="size-3.5" />
            <span>Emojis</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-white hover:bg-white/10"
          title="Close Picker"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2.5 bg-[#140f0f] border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "stickers"
                ? "Search sticker packs..."
                : "Search emojis..."
            }
            className="w-full bg-[#1e1818] border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          STICKERS TAB CONTENT
          ======================================================== */}
      {activeTab === "stickers" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Pack Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1b1515] border-b border-white/5 overflow-x-auto no-scrollbar select-none">
            {/* My Collection Tab */}
            <button
              type="button"
              onClick={() => setSelectedPackId("my_collection")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPackId === "my_collection"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>My Collection</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({myStickers.length})
              </span>
            </button>

            {/* Standard Packs */}
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPackId(pack.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPackId === pack.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{pack.icon}</span>
                <span>{pack.name.replace(/^[^\s]+\s*/, "")}</span>
              </button>
            ))}
          </div>

          {/* Stickers Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar">
            {currentStickers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentStickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className="group relative flex flex-col items-center justify-center p-2 rounded-2xl bg-[#1d1717] hover:bg-[#261f1f] border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                    onClick={() => {
                      onSelectSticker(sticker);
                      onClose();
                    }}
                    title={sticker.name}
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.name}
                      className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="text-[11px] font-medium text-gray-300 group-hover:text-white text-center mt-1 truncate max-w-full px-1">
                      {sticker.name}
                    </span>

                    {/* Delete button only in My Collection */}
                    {selectedPackId === "my_collection" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(sticker.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from my collection"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedPackId === "my_collection" ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 mb-2.5">
                  <Star className="size-6 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Your sticker collection is empty
                </h4>
                <p className="text-xs max-w-xs text-gray-400 leading-relaxed">
                  When someone sends a sticker in chat, click the{" "}
                  <strong className="text-amber-300">⭐ Add</strong> button on
                  it to save it here!
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No stickers matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          EMOJIS TAB CONTENT
          ======================================================== */}
      {activeTab === "emojis" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Tabs */}
          {!searchQuery && (
            <div className="flex items-center gap-1 px-3 py-2 bg-[#1b1515] border-b border-white/5 overflow-x-auto no-scrollbar select-none">
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedEmojiCategory(cat.id)}
                  className={`p-1.5 rounded-xl text-base transition-all ${
                    selectedEmojiCategory === cat.id
                      ? "bg-emerald-500/20 ring-1 ring-emerald-500/40 scale-105"
                      : "opacity-60 hover:opacity-100 hover:bg-white/5"
                  }`}
                  title={cat.name}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 custom-scrollbar">
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
              {filteredEmojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="flex items-center justify-center h-10 w-10 text-2xl rounded-xl hover:bg-white/10 active:scale-90 transition-all select-none"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiStickerPicker;
