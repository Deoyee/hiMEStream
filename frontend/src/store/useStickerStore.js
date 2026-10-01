import { create } from "zustand";
import { STICKER_PACKS } from "../data/stickers";

const getStorageKey = (userId) => `hiME_user_stickers_${userId || "default"}`;

// Default stickers in user collection
const initialDefaultStickers = [
  STICKER_PACKS[0].stickers[0], // Hello! / Hola!
  STICKER_PACKS[0].stickers[1], // Thank you!
  STICKER_PACKS[0].stickers[2], // Practice Time!
  STICKER_PACKS[1].stickers[0], // Waving Hand
  STICKER_PACKS[1].stickers[1], // Partying Face
  STICKER_PACKS[1].stickers[4], // Fire
];

export const useStickerStore = create((set, get) => ({
  userId: null,
  myStickers: [],

  initForUser: (userId) => {
    const key = getStorageKey(userId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ userId, myStickers: parsed });
        return;
      }
    } catch (e) {
      console.warn("Could not read saved stickers:", e);
    }
    // Set defaults if nothing stored
    set({ userId, myStickers: initialDefaultStickers });
    try {
      localStorage.setItem(key, JSON.stringify(initialDefaultStickers));
    } catch (_e) {
      void _e;
    }
  },

  addSticker: (sticker) => {
    const { myStickers, userId } = get();
    if (!sticker || !sticker.url) return false;

    // Check if already in collection
    const exists = myStickers.some(
      (s) => s.id === sticker.id || s.url === sticker.url
    );
    if (exists) return false;

    const newSticker = {
      id: sticker.id || `custom_${Date.now()}`,
      name: sticker.name || "Custom Sticker",
      packName: sticker.packName || "Saved Stickers",
      url: sticker.url,
      dateAdded: Date.now(),
    };

    const updated = [newSticker, ...myStickers];
    set({ myStickers: updated });

    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save sticker to storage:", e);
    }
    return true;
  },

  removeSticker: (stickerIdOrUrl) => {
    const { myStickers, userId } = get();
    const updated = myStickers.filter(
      (s) => s.id !== stickerIdOrUrl && s.url !== stickerIdOrUrl
    );
    set({ myStickers: updated });

    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not remove sticker from storage:", e);
    }
  },

  hasSticker: (stickerIdOrUrl) => {
    const { myStickers } = get();
    return myStickers.some(
      (s) => s.id === stickerIdOrUrl || s.url === stickerIdOrUrl
    );
  },
}));
