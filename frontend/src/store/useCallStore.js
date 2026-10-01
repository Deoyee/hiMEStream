import { create } from "zustand";

export const useCallStore = create((set) => ({
  activeCall: null, // { callId, isAudioOnly, callerName, callerPic }
  isMinimized: false,

  startCall: (callData) =>
    set({
      activeCall: callData,
      isMinimized: false,
    }),

  minimizeCall: () => set({ isMinimized: true }),
  maximizeCall: () => set({ isMinimized: false }),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),

  endCall: () =>
    set({
      activeCall: null,
      isMinimized: false,
    }),
}));

export default useCallStore;
