import { DEMO_ID } from "./data.js";
import { createLearningTable } from "./lib/learningTable.js";

// Additions are shipped with the app rather than requiring a second download.
// This also enriches song packs saved in IndexedDB before tables existed.
export const demoNoteDetails = {
  "present-continuous": {
    tone: "mint",
    tables: [
      {
        titleFa: "صرفِ be با فاعل‌های متفاوت",
        titleEn: "Choose be for each subject",
        introFa: "فعلِ ing ثابت می‌ماند؛ am / is / are با فاعل تغییر می‌کند.",
        introEn: "The -ing verb stays; am / is / are changes with the subject.",
        columns: [
          { fa: "فاعل", en: "Subject" },
          { fa: "فعل کمکی", en: "Be" },
          { fa: "جملهٔ نمونه", en: "Example" },
        ],
        rows: [
          ["I", "am", "I am moving."],
          ["she / he / it", "is", "She is moving."],
          ["the city lights / they", "are", "The city lights are fading."],
        ],
        footerFa:
          "با you هم از are استفاده می‌کنیم، حتی وقتی مخاطب یک نفر است.",
        footerEn: "Use are with you, even when you are speaking to one person.",
      },
    ],
    check: {
      promptFa:
        "The city lights ___ fading. جای خالی را با am / is / are پر کن.",
      promptEn: "The city lights ___ fading. Which fits: am, is or are?",
      answerFa: "are؛ چون lights جمع است.",
      answerEn: "are — lights is plural.",
    },
  },
  "keep-ing": {
    tone: "apricot",
    takeawayFa:
      "برای «ادامه دادنِ یک کار» بعد از keep شکل ing فعل می‌آید: keep moving.",
    takeawayEn:
      "To say an action continues, follow keep with the -ing form: keep moving.",
    check: {
      promptFa: "I keep ___ toward the light. شکل درستِ move چیست؟",
      promptEn: "I keep ___ toward the light. Which form of move fits?",
      answerFa: "moving؛ بعد از keep در این معنی، فعل ing می‌آید.",
      answerEn: "moving — for this meaning, keep is followed by verb-ing.",
    },
  },
  "will-future": {
    tone: "amber",
    tables: [
      {
        titleFa: "یک فعل در سه زمان",
        titleEn: "One verb across three time frames",
        introFa:
          "تفاوت را در خودِ فعل start ببین؛ این جمله‌ها نمونهٔ آموزشی‌اند.",
        introEn: "Watch start change in these teaching examples.",
        columns: [
          { fa: "زمان", en: "Time" },
          { fa: "ساختار", en: "Form" },
          { fa: "نمونه", en: "Example" },
        ],
        rows: [
          [
            { fa: "عادت / حال ساده", en: "Habit / simple present" },
            "I start",
            "I start early every day.",
          ],
          [
            { fa: "همین حالا / استمراری", en: "Right now / continuous" },
            "I am starting",
            "I am starting now.",
          ],
          [
            { fa: "آینده / تصمیم", en: "Future / decision" },
            "I'll start",
            "I'll start again tomorrow.",
          ],
        ],
      },
    ],
    takeawayFa: "پس از will شکل سادهٔ فعل می‌آید: I'll start؛ نه I'll starts.",
    takeawayEn: "After will, use the base verb: I'll start, not I'll starts.",
  },
  "let-pattern": {
    tone: "rose",
    tables: [
      {
        titleFa: "جمله را تکه‌تکه بخوان",
        titleEn: "Read the sentence in parts",
        columns: [
          { fa: "بخش", en: "Part" },
          { fa: "نقش", en: "Role" },
          { fa: "معنی", en: "Meaning" },
        ],
        rows: [
          [
            "Let",
            { fa: "فعل اصلی", en: "Main verb" },
            { fa: "بگذار", en: "allow" },
          ],
          [
            "the quiet moments",
            { fa: "مفعول", en: "Object" },
            { fa: "لحظه‌های آرام", en: "the quiet moments" },
          ],
          [
            "grow",
            { fa: "فعل ساده", en: "Base verb" },
            { fa: "رشد کنند", en: "grow" },
          ],
        ],
      },
    ],
    check: {
      promptFa: "Let the moments ___. بعد از let چه شکلی از grow می‌آید؟",
      promptEn: "Let the moments ___. Which form of grow follows let?",
      answerFa: "grow؛ بعد از مفعولِ let، فعل ساده و بدون to می‌آید.",
      answerEn: "grow — after let + object, use the base verb without to.",
    },
  },
};

export const demoExtraNote = {
  id: "when-clause",
  tone: "coral",
  tagFa: "بند زمان",
  tagEn: "Time clauses",
  titleFa: "وقتی آینده می‌رسد، comes حال است",
  titleEn: "A future meaning with a present verb",
  bodyFa:
    "در جملهٔ «When morning comes, I'll start again»، رویداد هر دو بخش مربوط به آینده است؛ اما بعد از when برای زمانِ آینده معمولاً حال ساده می‌آید، نه will.",
  bodyEn:
    "Both parts of “When morning comes, I'll start again” refer to the future. After when, a future time clause usually takes the simple present, not will.",
  example: "When morning comes, I'll start again.",
  exampleFa: "وقتی صبح برسد، دوباره شروع می‌کنم.",
  tables: [
    {
      titleFa: "دو بخش، دو شکل فعل",
      titleEn: "Two clauses, two verb forms",
      columns: [
        { fa: "بخش جمله", en: "Clause" },
        { fa: "شکل فعل", en: "Verb form" },
        { fa: "کارکرد", en: "What it does" },
      ],
      rows: [
        [
          "When morning comes",
          { fa: "حال ساده: comes", en: "Simple present: comes" },
          { fa: "زمان وقوع را می‌گوید", en: "Says when" },
        ],
        [
          "I'll start again",
          { fa: "آینده: will + start", en: "Future: will + start" },
          { fa: "کارِ بعدی را می‌گوید", en: "Says what follows" },
        ],
      ],
    },
  ],
  takeawayFa:
    "برای همین معنا می‌گوییم When morning comes، نه When morning will come.",
  takeawayEn:
    "For this meaning, say When morning comes, not When morning will come.",
  check: {
    promptFa: "When the sun ___, we'll go. شکل درستِ rise چیست؟",
    promptEn: "When the sun ___, we'll go. Which form of rise fits?",
    answerFa: "rises؛ در بندِ زمان بعد از when، حال ساده می‌آید.",
    answerEn: "rises — use the simple present in the time clause after when.",
  },
};

export const demoVocabularyTables = [
  createLearningTable({
    titleFa: "واژه‌ها در شکل‌های دیگر",
    titleEn: "More forms of the words you hear",
    introFa:
      "فعل‌ها را کنار شکل گذشته و ing ببین؛ نمونه‌ها برای یادگیری فراتر از همین سطرها هستند.",
    introEn:
      "Compare base, past and -ing forms to use these words beyond the lyric.",
    grid: [
      [
        { fa: "فعل پایه", en: "Base verb" },
        { fa: "گذشته", en: "Past" },
        { fa: "شکل ing", en: "-ing form" },
      ],
      ["keep", "kept", "keeping"],
      ["grow", "grew", "growing"],
      ["fade", "faded", "fading"],
      ["move", "moved", "moving"],
    ],
    footerFa:
      "به kept و grew دقت کن: شکل گذشتهٔ این دو فعل با افزودن ed ساخته نمی‌شود.",
    footerEn: "Notice kept and grew: these past forms don't simply add -ed.",
  }),
];

export function enrichDemoLesson(lesson) {
  if (lesson?.id !== DEMO_ID) return lesson;
  const notes = (lesson.grammar || []).map((note) => ({
    ...demoNoteDetails[note.id],
    ...note,
    tables: note.tables ?? demoNoteDetails[note.id]?.tables,
  }));
  if (!notes.some((note) => note.id === demoExtraNote.id))
    notes.push(demoExtraNote);
  return {
    ...lesson,
    grammar: notes,
    vocabularyTables: lesson.vocabularyTables ?? demoVocabularyTables,
  };
}
