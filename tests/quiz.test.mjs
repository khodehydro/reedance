import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDailyQuestions,
  correctQuizAnswer,
  demoQuiz,
  evaluateAnswer,
  formatQuizAnswer,
  isAnswerComplete,
  missedQuizWords,
} from "../src/quizData.js";
import { queueMissedCards, scheduleReviewCard } from "../src/lib/review.js";

const lesson = JSON.parse(
  readFileSync(
    new URL("../public/content/midnight-avenue.json", import.meta.url),
  ),
);
const questions = demoQuiz.questions;
const [choice, match, order, typing] = questions;

test("the five quiz questions are grounded in the unlocked demo lesson", () => {
  assert.equal(demoQuiz.songId, lesson.id);
  assert.equal(questions.length, 5);
  assert.deepEqual(
    new Set(questions.map(({ type }) => type)),
    new Set(["choice", "match", "order", "typing"]),
  );
  assert.equal(new Set(questions.map(({ id }) => id)).size, 5);
  for (const question of questions) {
    if (question.type === "match") {
      for (const pair of question.pairs)
        assert(lesson.lyrics.some((line) => line.at === pair.at));
    } else {
      assert(lesson.lyrics.some((line) => line.at === question.at));
    }
    for (const word of question.wordIds ||
      question.pairs?.map(({ id }) => id) ||
      []) {
      assert(
        word in lesson.vocabulary,
        `${question.id} references unknown word ${word}`,
      );
    }
    if (question.speech)
      assert(lesson.lyrics.some((line) => line.en === question.speech));
    if (question.type === "choice" && question.context)
      assert(lesson.lyrics.some((line) => line.en === question.context));
  }
  assert.equal(
    correctQuizAnswer(order, "en"),
    lesson.lyrics.find(({ at }) => at === order.at).en,
  );
  assert.equal(
    typing.context.replace("____", typing.accepted[0]),
    lesson.lyrics.find(({ at }) => at === typing.at).en,
  );
});

test("multiple choice requires a real option and explains the correct answer", () => {
  assert.equal(isAnswerComplete(choice, "not-an-option"), false);
  assert.equal(isAnswerComplete(choice, choice.correctId), true);
  assert.deepEqual(evaluateAnswer(choice, choice.correctId).missedWords, []);
  assert.deepEqual(evaluateAnswer(choice, "way").missedWords, ["hope"]);
  assert.equal(formatQuizAnswer(choice, choice.correctId, "fa"), "امید");
  assert.equal(correctQuizAnswer(choice, "en"), "a feeling of hope");
  assert.throws(() => evaluateAnswer(choice, ""), /Incomplete/);
});

test("matching counts each pair and sends only mistaken words to review", () => {
  assert.equal(isAnswerComplete(match, { fading: "fading" }), false);
  assert.equal(
    isAnswerComplete(match, {
      fading: "quiet",
      quiet: "quiet",
      toward: "toward",
    }),
    false,
  );
  const answers = { fading: "toward", quiet: "quiet", toward: "fading" };
  assert.deepEqual(evaluateAnswer(match, answers), {
    correct: false,
    missedWords: ["fading", "toward"],
    matchedCount: 1,
  });
  assert.equal(
    evaluateAnswer(match, {
      fading: "fading",
      quiet: "quiet",
      toward: "toward",
    }).correct,
    true,
  );
});

test("line building requires each chunk once and in its lyric order", () => {
  const correct = order.chunks.map(({ id }) => id);
  assert.equal(
    isAnswerComplete(order, [correct[0], correct[0], correct[2]]),
    false,
  );
  assert.equal(evaluateAnswer(order, correct).correct, true);
  assert.deepEqual(evaluateAnswer(order, [...correct].reverse()).missedWords, [
    "alive",
  ]);
  assert.equal(
    formatQuizAnswer(order, correct, "fa"),
    "I keep a little hope alive.",
  );
});

test("typed answers allow casing, outer whitespace and punctuation, not partial words", () => {
  assert.equal(isAnswerComplete(typing, "    "), false);
  for (const answer of ["step", " STEP ", "Step!", "step."]) {
    assert.equal(evaluateAnswer(typing, answer).correct, true);
  }
  assert.equal(evaluateAnswer(typing, "stepping").correct, false);
  assert.equal(evaluateAnswer(typing, "steps").correct, false);
  assert.deepEqual(evaluateAnswer(typing, "wrong").missedWords, ["step"]);
});

test("Leitner questions use due saved words, valid four-choice distractors and answerable example blanks", () => {
  const words = [
    "hope",
    "fading",
    "quiet",
    "step",
    "way",
    "road",
    "unknown",
    "hope",
  ];
  const daily = buildDailyQuestions(words, lesson);
  assert.equal(daily.length, 5);
  assert.deepEqual(
    daily.map((item) => item.wordIds[0]),
    words.slice(0, 5),
  );
  assert.deepEqual(
    daily.map((item) => item.type),
    ["choice", "typing", "choice", "typing", "choice"],
  );
  for (const item of daily) {
    if (item.type === "choice") {
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options.map(({ id }) => id)).size, 4);
      assert.equal(evaluateAnswer(item, item.wordIds[0]).correct, true);
      assert.equal(item.optionsInPersian, true);
    } else {
      assert(item.context.includes("____"));
      assert.equal(
        item.context.replace("____", item.accepted[0]),
        lesson.vocabulary[item.wordIds[0]].example,
      );
      assert.equal(evaluateAnswer(item, item.wordIds[0]).correct, true);
    }
  }
});

test("only missed vocabulary is queued, without losing unrelated or already saved cards", () => {
  const answers = [
    { id: choice.id, answer: "way" },
    {
      id: match.id,
      answer: { fading: "toward", quiet: "quiet", toward: "fading" },
    },
    { id: order.id, answer: order.chunks.map(({ id }) => id) },
    { id: typing.id, answer: "wrong" },
    { id: questions[4].id, answer: questions[4].correctId },
  ];
  const missed = missedQuizWords(answers, questions, lesson.vocabulary);
  assert.deepEqual(missed, ["hope", "fading", "toward", "step"]);
  const existing = {
    hope: { stage: 4, due: 4000 },
    quiet: { stage: 2, due: 5000 },
  };
  const queued = queueMissedCards(existing, missed, 6000);
  assert.deepEqual(queued.quiet, existing.quiet);
  assert.deepEqual(queued.hope, { stage: 1, due: 6000 });
  assert.deepEqual(queued.step, { stage: 1, due: 6000 });
  assert.deepEqual(existing.hope, { stage: 4, due: 4000 });
  assert.equal(queueMissedCards(queued, [], 9000), queued);
});

test("graded Leitner review moves remembered cards, and returns misses in one minute", () => {
  const now = 123456;
  const day = 24 * 60 * 60 * 1000;
  assert.deepEqual(scheduleReviewCard({ stage: 1, due: now }, true, now), {
    stage: 2,
    due: now + 2 * day,
  });
  assert.deepEqual(scheduleReviewCard({ stage: 5, due: now }, true, now), {
    stage: 5,
    due: now + 16 * day,
  });
  assert.deepEqual(scheduleReviewCard({ stage: 3, due: now }, false, now), {
    stage: 1,
    due: now + 60_000,
  });
});
