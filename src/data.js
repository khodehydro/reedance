export const DEMO_ID = "midnight-avenue";

export const songLanguages = {
  en: {
    nameFa: "انگلیسی",
    nameEn: "English",
    countryFa: "بریتانیا",
    countryEn: "United Kingdom",
    flag: "/flags/gb.svg",
    locale: "en-US",
  },
  es: {
    nameFa: "اسپانیایی",
    nameEn: "Spanish",
    countryFa: "اسپانیا",
    countryEn: "Spain",
    flag: "/flags/es.svg",
    locale: "es-ES",
  },
  ko: {
    nameFa: "کره‌ای",
    nameEn: "Korean",
    countryFa: "کرهٔ جنوبی",
    countryEn: "South Korea",
    flag: "/flags/kr.svg",
    locale: "ko-KR",
  },
};

// Access labels are visual tier examples. Non-demo titles have no licensed
// audio, lyrics, checkout, or purchasable pack in this prototype.
export const songs = [
  {
    id: DEMO_ID,
    title: "Midnight Avenue",
    artist: "Reedance Originals",
    image: "/art/midnight-avenue.webp",
    duration: "1:04",
    level: "B1",
    language: "en",
    moodFa: "شبانه",
    moodEn: "Night drive",
    genre: "indie",
    access: "free",
    demo: true,
  },
  {
    id: "despacito",
    title: "Despacito",
    artist: "Luis Fonsi",
    image: "/art/despacito.webp",
    duration: "3:47",
    level: "A2",
    language: "es",
    moodFa: "تابستانی",
    moodEn: "Summer",
    genre: "pop",
    access: "paid",
    demo: false,
  },
  {
    id: "spring-day",
    title: "Spring Day",
    artist: "BTS",
    image: "/art/spring-day.webp",
    duration: "4:34",
    level: "B1",
    language: "ko",
    moodFa: "آرام",
    moodEn: "Calm",
    genre: "calm",
    access: "paid",
    demo: false,
  },
  {
    id: "blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    image: "/art/blinding-lights.webp",
    duration: "3:20",
    level: "B1",
    language: "en",
    moodFa: "انرژی‌بخش",
    moodEn: "Energetic",
    genre: "pop",
    access: "paid",
    demo: false,
  },
  {
    id: "someone-like-you",
    title: "Someone Like You",
    artist: "Adele",
    image: "/art/someone-like-you.webp",
    duration: "4:45",
    level: "A2",
    language: "en",
    moodFa: "آرام",
    moodEn: "Calm",
    genre: "calm",
    access: "paid",
    demo: false,
  },
  {
    id: "flowers",
    title: "Flowers",
    artist: "Miley Cyrus",
    image: "/art/flowers.webp",
    duration: "3:20",
    level: "A2",
    language: "en",
    moodFa: "حال‌خوب‌کن",
    moodEn: "Feel-good",
    genre: "pop",
    access: "paid",
    demo: false,
  },
];

export function normalizeWord(text) {
  // Preserve accented Spanish and Hangul instead of dropping all non-ASCII
  // letters when a future lesson looks up a tapped lyric in its word list.
  return text
    .toLocaleLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}']/gu, "");
}

export function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
