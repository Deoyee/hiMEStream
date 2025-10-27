import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("hiME-theme") || "forest",
  setTheme: (theme) => {
    localStorage.setItem("hiME-theme", theme);
    set({ theme });
  },
}));