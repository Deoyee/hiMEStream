import { useState, useId, useMemo } from "react";

// Curated vibrant gradients for initials fallback
const GRADIENTS = [
  "from-emerald-500 to-teal-700",
  "from-violet-600 to-indigo-800",
  "from-pink-500 to-rose-700",
  "from-cyan-500 to-blue-700",
  "from-amber-500 to-orange-700",
  "from-purple-500 to-fuchsia-700",
];

const SIZE_MAP = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
  xl: "size-24 text-xl",
};

export const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getDeterministicGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const Avatar = ({
  src,
  name = "User",
  size = "md",
  className = "",
  ring = true,
  showOnline = false,
  isOnline = false,
}) => {
  // If original src is the defunct liara url or empty, use dicebear seed immediately
  const initialUrl = useMemo(() => {
    if (!src || src.includes("avatar.iran.liara.run")) {
      const seed = encodeURIComponent(name?.trim() || "streamer");
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    }
    return src;
  }, [src, name]);

  const [currentSrc, setCurrentSrc] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // If original src failed and wasn't dicebear yet, try dicebear
    if (!currentSrc.includes("api.dicebear.com")) {
      const seed = encodeURIComponent(name?.trim() || "streamer");
      setCurrentSrc(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
    } else {
      // If even dicebear fails (e.g. offline), fall back to initials
      setHasError(true);
    }
  };

  const sizeClass = SIZE_MAP[size] || size;
  const gradientClass = useMemo(() => getDeterministicGradient(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200 ${sizeClass} ${
          ring ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 shadow-sm" : ""
        }`}
      >
        {!hasError ? (
          <img
            src={currentSrc}
            alt=""
            onError={handleError}
            className="w-full h-full object-cover rounded-full bg-base-300"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold tracking-wider shadow-inner`}
          >
            {initials}
          </div>
        )}
      </div>

      {showOnline && isOnline && (
        <span className="absolute bottom-0 right-0 flex h-3 w-3 -translate-x-0.5 -translate-y-0.5" title="Online">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-base-100 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
};

export default Avatar;
