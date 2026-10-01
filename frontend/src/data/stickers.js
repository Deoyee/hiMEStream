// Curated high-resolution stickers and comprehensive emoji database for hiMEv2

// Language Exchange SVG Badge Stickers (Instant load, zero latency, razor sharp)
const createBadge = (emoji, title, subtitle, color1, color2) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="90" viewBox="0 0 200 90">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>
    <rect x="8" y="8" width="184" height="74" rx="22" fill="url(#bg)" filter="url(#shadow)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <text x="36" y="54" font-size="34" text-anchor="middle">${emoji}</text>
    <text x="68" y="42" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16" fill="#ffffff">${title}</text>
    <text x="68" y="60" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="11.5" fill="rgba(255,255,255,0.9)">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const STICKER_PACKS = [
  {
    id: "language_exchange",
    name: "🗣️ Greetings & Language",
    icon: "🗣️",
    stickers: [
      {
        id: "badge_hello",
        name: "Hello! / Hola!",
        packName: "Greetings & Language",
        url: createBadge("👋", "Hello! / Hola!", "Let's chat!", "#10b981", "#059669"),
      },
      {
        id: "badge_thanks",
        name: "Thank you! / Gracias",
        packName: "Greetings & Language",
        url: createBadge("🙏", "Thank you!", "¡Muchas gracias!", "#3b82f6", "#1d4ed8"),
      },
      {
        id: "badge_practice",
        name: "Practice Time!",
        packName: "Greetings & Language",
        url: createBadge("🎯", "Practice Time!", "Ready when you are", "#8b5cf6", "#6d28d9"),
      },
      {
        id: "badge_goodjob",
        name: "Great Job! / ¡Muy Bien!",
        packName: "Greetings & Language",
        url: createBadge("🌟", "Great Job!", "Keep it up! 👏", "#f59e0b", "#d97706"),
      },
      {
        id: "badge_coffee",
        name: "Coffee & Chat",
        packName: "Greetings & Language",
        url: createBadge("☕", "Coffee & Chat", "Quick conversation?", "#ec4899", "#be185d"),
      },
      {
        id: "badge_howsay",
        name: "How do you say...?",
        packName: "Greetings & Language",
        url: createBadge("🤔", "How to say...?", "Quick question!", "#06b6d4", "#0891b2"),
      },
      {
        id: "badge_buddy",
        name: "Language Buddy",
        packName: "Greetings & Language",
        url: createBadge("🌍", "Language Buddy", "Global friendship", "#14b8a6", "#0f766e"),
      },
      {
        id: "badge_congrats",
        name: "Congratulations! / Félicitations",
        packName: "Greetings & Language",
        url: createBadge("🎉", "Congratulations!", "You nailed it!", "#e11d48", "#9f1239"),
      },
    ],
  },
  {
    id: "fluent_3d_moods",
    name: "✨ 3D Reactions",
    icon: "✨",
    stickers: [
      {
        id: "fluent_waving_hand",
        name: "Waving Hand",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png",
      },
      {
        id: "fluent_party_face",
        name: "Partying Face",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png",
      },
      {
        id: "fluent_grinning_face",
        name: "Big Smile",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png",
      },
      {
        id: "fluent_heart_eyes",
        name: "Heart Eyes",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png",
      },
      {
        id: "fluent_fire",
        name: "Fire",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fire.png",
      },
      {
        id: "fluent_rocket",
        name: "Rocket Launch",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png",
      },
      {
        id: "fluent_star",
        name: "Glowing Star",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png",
      },
      {
        id: "fluent_hundred",
        name: "100 Points",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Hundred%20Points.png",
      },
      {
        id: "fluent_clapping",
        name: "Clapping Hands",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Clapping%20Hands.png",
      },
      {
        id: "fluent_tears_joy",
        name: "Laughing Tears",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Tears%20of%20Joy.png",
      },
      {
        id: "fluent_thinking",
        name: "Thinking Face",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Thinking%20Face.png",
      },
      {
        id: "fluent_party_popper",
        name: "Party Popper",
        packName: "3D Reactions",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png",
      },
    ],
  },
  {
    id: "cute_animals",
    name: "🐼 Cute Animals",
    icon: "🐼",
    stickers: [
      {
        id: "fluent_panda",
        name: "Panda",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
      },
      {
        id: "fluent_cat",
        name: "Cat Face",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
      },
      {
        id: "fluent_dog",
        name: "Dog Face",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
      },
      {
        id: "fluent_fox",
        name: "Fox",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
      },
      {
        id: "fluent_bear",
        name: "Bear",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png",
      },
      {
        id: "fluent_koala",
        name: "Koala",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Koala.png",
      },
      {
        id: "fluent_owl",
        name: "Owl",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Owl.png",
      },
      {
        id: "fluent_penguin",
        name: "Penguin",
        packName: "Cute Animals",
        url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Penguin.png",
      },
    ],
  },
];

// Rich categorized emojis
export const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys & Moods",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹",
      "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗",
      "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🤫",
      "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒",
      "🙄", "😬", "🤥", "😮‍💨", "😌", "😔", "🥹", "🥺", "😢", "😭",
      "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡",
      "😠", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰",
      "🥳", "😎", "🤓", "🧐", "🤠", "😴", "🤤", "😵", "😵‍💫", "🤐",
    ],
  },
  {
    id: "gestures",
    name: "Hands & Gestures",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜",
      "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳",
      "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀",
    ],
  },
  {
    id: "hearts",
    name: "Hearts & Sparkles",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
      "✨", "⭐", "🌟", "💫", "🔥", "💥", "💯", "🎉", "🎊", "🎈",
      "🎯", "🏆", "🥇", "🥈", "🥉", "👑", "💎", "🔮", "💡", "⚡",
    ],
  },
  {
    id: "languages",
    name: "Language & Travel",
    icon: "🌍",
    emojis: [
      "🌍", "🌎", "🌏", "🗺️", "🧭", "✈️", "🛫", "🛬", "🚀", "⛵",
      "🇬🇧", "🇺🇸", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇵🇹", "🇷🇺", "🇨🇳", "🇯🇵",
      "🇰🇷", "🇳🇬", "🇧🇷", "🇲🇽", "🇨🇦", "🇦🇺", "🇮🇳", "🇸🇦", "🇹🇷", "🇪🇬",
      "🇿🇦", "🇰🇪", "🇬🇭", "🇮🇩", "🇵🇭", "🇻🇳", "🇹🇭", "🇳🇱", "🇸🇪", "🇬🇷",
    ],
  },
  {
    id: "objects",
    name: "Study & Everyday",
    icon: "📚",
    emojis: [
      "📚", "📖", "📕", "📗", "📘", "📙", "📓", "📝", "✏️", "✒️",
      "🎓", "💻", "📱", "🎧", "🎙️", "🗣️", "💬", "🗨️", "📢", "🔔",
      "☕", "🍵", "🧋", "🍕", "🍔", "🍣", "🌮", "🍰", "🍩", "🍪",
      "⏰", "⏳", "📅", "📌", "📍", "🎵", "🎶", "🎸", "🎮", "🕹️",
    ],
  },
];
