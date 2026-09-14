import { LANGUAGE_TO_FLAG } from "../constants/index.js";

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3.5 w-auto rounded-[2px] object-contain inline-block flex-shrink-0"
      />
    );
  }
  return null;
}