// Original questions about the independent Midnight Avenue demo. Keep these
// in the app so older locally downloaded packs also gain the quiz on update.
// The demo audio is instrumental; spoken samples use browser speech synthesis.
import { DEMO_ID, normalizeWord } from "./data.js";

export const demoQuiz = {
  songId: DEMO_ID,
  questions: [
    {
      id: "hope-meaning",
      type: "choice",
      skillFa: "معنی در متن",
      skillEn: "Meaning in context",
      promptFa: "واژهٔ «hope» در این سطر یعنی چه؟",
      promptEn: "What does “hope” mean in this line?",
      context: "I keep a little hope alive.",
      options: [
        { id: "way", fa: "راه", en: "a path" },
        { id: "hope", fa: "امید", en: "a feeling of hope" },
        { id: "quiet", fa: "سکوت", en: "silence" },
        { id: "step", fa: "قدم", en: "a step" },
      ],
      correctId: "hope",
      wordIds: ["hope"],
      at: 16,
      speech: "I keep a little hope alive.",
      explanationFa:
        "hope یعنی «امید»؛ گوینده می‌گوید با وجود سختی، هنوز کمی امید را زنده نگه می‌دارد.",
      explanationEn:
        "Hope is the feeling that things can get better. The speaker is keeping a little of it alive.",
    },
    {
      id: "three-connections",
      type: "match",
      skillFa: "مچ‌کردن",
      skillEn: "Match the meanings",
      promptFa: "هر واژهٔ آهنگ را به معنی درستش وصل کن.",
      promptEn: "Match each lyric word to its meaning.",
      pairs: [
        {
          id: "fading",
          text: "fading",
          fa: "کم‌نور شدن",
          en: "growing dimmer",
          at: 8,
        },
        {
          id: "quiet",
          text: "quiet",
          fa: "آرام، ساکت",
          en: "calm and still",
          at: 24,
        },
        {
          id: "toward",
          text: "toward",
          fa: "به‌سوی",
          en: "in the direction of",
          at: 56,
        },
      ],
      meaningOrder: ["toward", "fading", "quiet"],
      explanationFa:
        "fading به کم‌نور یا محوشدن، quiet به آرام‌بودن و toward به حرکت به‌سوی چیزی اشاره دارد.",
      explanationEn:
        "Fading describes a gradual change, quiet describes stillness, and toward points to a direction.",
    },
    {
      id: "hope-order",
      type: "order",
      skillFa: "ساخت جمله",
      skillEn: "Build a line",
      promptFa: "این سطر را با تکه‌ها به ترتیب درست بساز.",
      promptEn: "Put these chunks in the order they appear in the line.",
      chunks: [
        { id: "i-keep", text: "I keep" },
        { id: "little-hope", text: "a little hope" },
        { id: "alive", text: "alive." },
      ],
      choices: ["alive", "i-keep", "little-hope"],
      wordIds: ["alive"],
      at: 16,
      speech: "I keep a little hope alive.",
      explanationFa:
        "ساختار جمله «I keep + a little hope + alive» است: من چیزی را در حالت زنده نگه می‌دارم.",
      explanationEn:
        "Keep + object + adjective describes maintaining a state: I keep a little hope alive.",
    },
    {
      id: "step-blank",
      type: "typing",
      skillFa: "جای خالی و تایپ",
      skillEn: "Type the missing word",
      promptFa: "واژهٔ جاافتاده از سطر آهنگ را تایپ کن.",
      promptEn: "Type the missing word from the demo line.",
      context: "One ____ at a time, I find my way.",
      accepted: ["step"],
      wordIds: ["step"],
      at: 40,
      speech: "One step at a time, I find my way.",
      explanationFa:
        "one step at a time یعنی «هر بار یک قدم»؛ یک اصطلاح برای پیش‌رفتن بدون عجله.",
      explanationEn:
        "One step at a time means making progress gradually, one small action at a time.",
    },
    {
      id: "way-phrase",
      type: "choice",
      skillFa: "مفهوم عبارت",
      skillEn: "Phrase in context",
      promptFa: "عبارت «find my way» در این سطر چه معنایی دارد؟",
      promptEn: "What does “find my way” mean here?",
      context: "One step at a time, I find my way.",
      options: [
        { id: "lost", fa: "برای همیشه گم شوم", en: "get lost for good" },
        {
          id: "route",
          fa: "راه یا مسیرم را پیدا کنم",
          en: "find my direction",
        },
        { id: "sing", fa: "با صدای بلند آواز بخوانم", en: "sing loudly" },
        { id: "wait", fa: "بدون حرکت منتظر بمانم", en: "wait without moving" },
      ],
      correctId: "route",
      wordIds: ["way"],
      at: 40,
      speech: "One step at a time, I find my way.",
      explanationFa:
        "find my way اینجا فقط پیدا کردن جاده نیست؛ می‌تواند پیدا کردن مسیر و جهتِ پیش‌رفتن در زندگی باشد.",
      explanationEn:
        "Find my way can mean discovering a direction in life, not merely finding a physical road.",
    },
  ],
};

// A short question session for words already due in the existing Leitner box.
// Meaning options stay in Persian, as they do in the word sheet and library.
export function buildDailyQuestions(words, lesson) {
  if (!lesson?.vocabulary || !Array.isArray(words)) return [];
  const available = [...new Set(words)]
    .filter((word) => lesson.vocabulary[word])
    .slice(0, 5);
  const vocabulary = Object.keys(lesson.vocabulary);
  return available.map((word, index) => {
    const entry = lesson.vocabulary[word];
    const line = lesson.lyrics.find((item) =>
      item.tokens.some((token) => normalizeWord(token.w) === word),
    );
    const common = {
      id: `daily-${word}`,
      at: line?.at,
      wordIds: [word],
      speech: entry.example,
      explanationFa: `«${word}» یعنی ${entry.fa}. نمونه: ${entry.example}`,
      explanationEn: `The missing or matched word is “${word}”. Example: ${entry.example} (Persian: ${entry.fa}).`,
    };
    if (index % 2 === 0) {
      const distractors = vocabulary
        .filter(
          (candidate) =>
            candidate !== word && lesson.vocabulary[candidate].fa !== entry.fa,
        )
        .slice(index, index + 3);
      if (distractors.length < 3) {
        distractors.push(
          ...vocabulary
            .filter(
              (candidate) =>
                candidate !== word &&
                lesson.vocabulary[candidate].fa !== entry.fa &&
                !distractors.includes(candidate),
            )
            .slice(0, 3 - distractors.length),
        );
      }
      const correctPosition = index % 4;
      const ids = [...distractors];
      ids.splice(correctPosition, 0, word);
      return {
        ...common,
        type: "choice",
        skillFa: "مرور معنی",
        skillEn: "Meaning check",
        promptFa: `«${word}» در آهنگ به چه معناست؟`,
        promptEn: `Which Persian meaning matches “${word}”?`,
        options: ids.map((id) => ({
          id,
          fa: lesson.vocabulary[id].fa,
          en: lesson.vocabulary[id].fa,
        })),
        correctId: word,
        optionsInPersian: true,
      };
    }
    const example = entry.example || line?.en || word;
    const blank = example.replace(new RegExp(`\\b${word}\\b`, "i"), "____");
    return {
      ...common,
      type: "typing",
      skillFa: "یادآوری با تایپ",
      skillEn: "Type from memory",
      promptFa: `با توجه به معنی «${entry.fa}»، جای خالی را پر کن.`,
      promptEn: `Complete the example. Persian clue: ${entry.fa}`,
      context: blank === example ? "____" : blank,
      accepted: [word],
    };
  });
}

export function emptyAnswer(question) {
  if (question.type === "order") return [];
  if (question.type === "match") return {};
  return "";
}

export function isAnswerComplete(question, answer) {
  if (question.type === "choice")
    return question.options.some((option) => option.id === answer);
  if (question.type === "typing")
    return typeof answer === "string" && !!answer.trim();
  if (question.type === "order")
    return (
      Array.isArray(answer) &&
      answer.length === question.chunks.length &&
      new Set(answer).size === question.chunks.length &&
      answer.every((id) => question.chunks.some((chunk) => chunk.id === id))
    );
  if (question.type === "match") {
    const values = Object.values(answer || {});
    return (
      values.length === question.pairs.length &&
      new Set(values).size === question.pairs.length &&
      question.pairs.every((pair) =>
        question.pairs.some((meaning) => answer[pair.id] === meaning.id),
      )
    );
  }
  return false;
}

export function evaluateAnswer(question, answer) {
  if (!isAnswerComplete(question, answer))
    throw new Error(`Incomplete quiz answer: ${question.id}`);
  let correct = false;
  let missedWords = [];
  let matchedCount;
  switch (question.type) {
    case "choice":
      correct = answer === question.correctId;
      break;
    case "typing":
      correct = question.accepted.some(
        (accepted) =>
          answer
            .trim()
            .toLowerCase()
            .replace(/[.!?,…]+$/g, "") === accepted.toLowerCase(),
      );
      break;
    case "order":
      correct = question.chunks.every(
        (chunk, index) => answer[index] === chunk.id,
      );
      break;
    case "match":
      matchedCount = question.pairs.filter(
        (pair) => answer[pair.id] === pair.id,
      ).length;
      correct = matchedCount === question.pairs.length;
      missedWords = question.pairs
        .filter((pair) => answer[pair.id] !== pair.id)
        .map((pair) => pair.id);
      break;
    default:
      throw new Error(`Unknown quiz question type: ${question.type}`);
  }
  return {
    correct,
    missedWords: correct
      ? []
      : missedWords.length
        ? missedWords
        : question.wordIds || [],
    matchedCount,
  };
}

export function missedQuizWords(answers, questions, vocabulary) {
  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );
  return [
    ...new Set(
      answers.flatMap(({ id, answer }) => {
        const question = questionById.get(id);
        if (!question || !isAnswerComplete(question, answer)) return [];
        return evaluateAnswer(question, answer).missedWords;
      }),
    ),
  ].filter((word) => Boolean(vocabulary?.[word]));
}

export function formatQuizAnswer(question, answer, lang = "fa") {
  if (question.type === "choice") {
    const option = question.options.find((item) => item.id === answer);
    return option ? (lang === "fa" ? option.fa : option.en) : "—";
  }
  if (question.type === "typing") return answer || "—";
  if (question.type === "order")
    return answer
      .map((id) => question.chunks.find((part) => part.id === id)?.text)
      .join(" ");
  if (question.type === "match")
    return question.pairs
      .map((pair) => {
        const meaning = question.pairs.find(
          (item) => item.id === answer[pair.id],
        );
        return `${pair.text} → ${meaning ? (lang === "fa" ? meaning.fa : meaning.en) : "—"}`;
      })
      .join(" · ");
  return "—";
}

export function correctQuizAnswer(question, lang = "fa") {
  if (question.type === "choice")
    return formatQuizAnswer(question, question.correctId, lang);
  if (question.type === "typing") return question.accepted[0];
  if (question.type === "order")
    return formatQuizAnswer(
      question,
      question.chunks.map((chunk) => chunk.id),
      lang,
    );
  if (question.type === "match")
    return formatQuizAnswer(
      question,
      Object.fromEntries(question.pairs.map((pair) => [pair.id, pair.id])),
      lang,
    );
  return "—";
}
