// Web Audio API based Ringtone generator for incoming calls
// Zero external asset dependencies, zero network latency, 100% reliable

class Ringtone {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.loopTimer = null;
    this.activeNodes = [];
  }

  initContext() {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch((err) => {
        console.warn("Could not resume AudioContext:", err);
      });
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      this.initContext();
    } catch (e) {
      console.warn("Error initializing AudioContext for ringtone:", e);
    }

    // Trigger mobile vibration if supported
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 1000]);
      }
    } catch (_err) {
      void _err;
    }

    const playChimePattern = () => {
      if (!this.isPlaying) return;

      try {
        this.initContext();
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Modern, melodious incoming call ringtone (FaceTime / WhatsApp inspired chords)
        // Burst 1: Arpeggio chords
        const burst1 = [
          { time: 0.0, freqs: [523.25, 659.25], gain: 0.08 }, // C5 + E5
          { time: 0.16, freqs: [659.25, 783.99], gain: 0.09 }, // E5 + G5
          { time: 0.32, freqs: [783.99, 1046.5], gain: 0.1 }, // G5 + C6
          { time: 0.48, freqs: [1046.5, 1318.51], gain: 0.11 }, // C6 + E6
        ];

        // Burst 2: Harmonious resolving cadence
        const burst2 = [
          { time: 0.85, freqs: [587.33, 783.99], gain: 0.08 }, // D5 + G5
          { time: 1.01, freqs: [659.25, 880.0], gain: 0.09 }, // E5 + A5
          { time: 1.17, freqs: [783.99, 1046.5], gain: 0.1 }, // G5 + C6
          { time: 1.33, freqs: [1046.5, 1567.98], gain: 0.12 }, // C6 + G6
        ];

        const allChords = [...burst1, ...burst2];

        allChords.forEach(({ time, freqs, gain: targetGain }) => {
          freqs.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + time);

            // Soft envelope: attack and exponential decay
            gainNode.gain.setValueAtTime(0, now + time);
            gainNode.gain.linearRampToValueAtTime(targetGain, now + time + 0.025);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.4);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + 0.42);

            this.activeNodes.push(osc);
            osc.onended = () => {
              const idx = this.activeNodes.indexOf(osc);
              if (idx !== -1) this.activeNodes.splice(idx, 1);
            };
          });
        });

        // Loop after 3.2 seconds
        this.loopTimer = setTimeout(() => {
          if (this.isPlaying) {
            // Repeat vibration pattern
            try {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([400, 200, 400, 1000]);
              }
            } catch (_err) {
              void _err;
            }

            playChimePattern();
          }
        }, 3200);
      } catch (err) {
        console.warn("Ringtone playback error:", err);
      }
    };

    playChimePattern();
  }

  stop() {
    this.isPlaying = false;

    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    try {
      this.activeNodes.forEach((node) => {
        try {
          node.stop();
          node.disconnect();
        } catch (_err) {
          void _err;
        }
      });
      this.activeNodes = [];
    } catch (_err) {
      void _err;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch (_err) {
      void _err;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        this.audioCtx.close().catch(() => {});
      } catch (_err) {
        void _err;
      }
      this.audioCtx = null;
    }
  }
}

export const ringtone = new Ringtone();
export default ringtone;
