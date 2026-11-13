import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { starterCourses } from "../src/starterData.js";
import { normalizeWord } from "../src/data.js";
import { createLearningTable } from "../src/lib/learningTable.js";
import {
  demoExtraNote,
  demoNoteDetails,
  enrichDemoLesson,
} from "../src/learningData.js";

const downloadedLesson = JSON.parse(
  readFileSync(
    new URL("../public/content/midnight-avenue.json", import.meta.url),
  ),
);
const tones = new Set(["blue", "mint", "amber", "coral", "rose", "apricot"]);

function validateTable(table) {
  assert(table.titleFa && table.titleEn);
  assert(table.columns.length >= 2);
  assert(table.rows.length > 0);
  for (const column of table.columns) assert(column.fa && column.en);
  for (const row of table.rows) {
    assert.equal(row.length, table.columns.length, table.titleEn);
    for (const cell of row) {
      if (typeof cell === "string") assert(cell.trim());
      else assert(cell.fa && cell.en);
    }
  }
}

test("a lesson table derives its rows and columns from an editable grid", () => {
  const grid = [
    [
      { fa: "فاعل", en: "Subject" },
      { fa: "حال", en: "Present" },
    ],
    ["yo", "canto"],
    ["tú", "cantas"],
  ];
  const table = createLearningTable({
    titleFa: "صرف فعل",
    titleEn: "Conjugation",
    grid,
    rowHeader: false,
    footerFa: "یک مثال",
  });
  assert.equal(table.columns.length, 2);
  assert.equal(table.rows.length, 2);
  assert.deepEqual(table.rows[1], ["tú", "cantas"]);
  assert.equal(table.rowHeader, false);
  assert.equal(table.footerFa, "یک مثال");
  assert.notEqual(table.columns, grid[0]);
  assert.notEqual(table.rows[0], grid[1]);

  const bigger = createLearningTable({
    titleFa: "واژگان",
    titleEn: "Vocabulary",
    grid: [
      [...grid[0], { fa: "معنی", en: "Meaning" }],
      ["la luna", "las lunas", { fa: "ماه", en: "moon" }],
      ["el sol", "los soles", { fa: "خورشید", en: "sun" }],
      ["el día", "los días", { fa: "روز", en: "day" }],
    ],
  });
  assert.equal(bigger.columns.length, 3);
  assert.equal(bigger.rows.length, 3);
  assert.equal(bigger.rowHeader, true);
  validateTable(bigger);
  const singleColumn = createLearningTable({
    titleFa: "واژه‌ها",
    titleEn: "Words",
    grid: [[{ fa: "واژه", en: "Word" }], ["hola"], ["adiós"]],
    rowHeader: false,
  });
  assert.equal(singleColumn.columns.length, 1);
  assert.equal(singleColumn.rows.length, 2);

  assert.throws(
    () =>
      createLearningTable({
        titleFa: "عنوان",
        titleEn: "Empty",
        grid: [grid[0]],
      }),
    /data row/,
  );
  assert.throws(
    () =>
      createLearningTable({
        titleFa: "عنوان",
        titleEn: "Ragged",
        grid: [grid[0], ["yo"]],
      }),
    /row 2 needs 2 cells/,
  );
  assert.throws(
    () =>
      createLearningTable({
        titleFa: "عنوان",
        titleEn: "Invalid",
        grid: [grid[0], ["yo", 12]],
      }),
    /invalid cell at row 2, column 2/,
  );
  assert.throws(
    () =>
      createLearningTable({
        titleFa: "عنوان",
        titleEn: "Blank heading",
        grid: [
          ["", "Verb"],
          ["yo", "canto"],
        ],
      }),
    /heading 1 needs text/,
  );
  assert.throws(
    () =>
      createLearningTable({
        titleFa: "عنوان",
        titleEn: "Duplicate shape",
        grid,
        rows: [],
      }),
    /use grid instead/,
  );
});

test("downloaded song lessons gain rich notes without changing the stored pack", () => {
  const originalGrammar = structuredClone(downloadedLesson.grammar);
  const lesson = enrichDemoLesson(downloadedLesson);
  assert.equal(lesson.grammar.length, originalGrammar.length + 1);
  assert.deepEqual(downloadedLesson.grammar, originalGrammar);
  assert.equal(lesson.lyrics, downloadedLesson.lyrics);
  assert.deepEqual(lesson.grammar.at(-1), demoExtraNote);
  assert.equal(enrichDemoLesson(lesson).grammar.length, lesson.grammar.length);
  assert.equal(enrichDemoLesson({ id: "other" }).id, "other");

  for (const note of lesson.grammar) {
    assert(tones.has(note.tone));
    assert(note.titleFa && note.titleEn && note.bodyFa && note.bodyEn);
    assert(
      lesson.lyrics.some((line) =>
        line.en.toLowerCase().includes(note.example.toLowerCase()),
      ),
    );
    for (const table of note.tables || []) validateTable(table);
    if (note.check) {
      assert(note.check.promptFa && note.check.promptEn);
      assert(note.check.answerFa && note.check.answerEn);
    }
  }
  assert(
    Object.keys(demoNoteDetails).every((id) =>
      lesson.grammar.some((note) => note.id === id),
    ),
  );
  for (const table of lesson.vocabularyTables) validateTable(table);
});

test("each starter course has bilingual, readable note and vocabulary tables", () => {
  for (const [language, course] of Object.entries(starterCourses)) {
    assert(course.wordsIntroFa && course.wordsIntroEn, language);
    assert(course.words.length >= 4, language);
    assert(course.vocabularyTables.length > 0, language);
    assert.equal(
      new Set(course.words.map((word) => word.word)).size,
      course.words.length,
    );
    for (const rule of course.grammar) {
      assert(tones.has(rule.tone), `${language}: ${rule.titleEn}`);
      assert(rule.tables?.length > 0, `${language}: ${rule.titleEn}`);
      for (const table of rule.tables) validateTable(table);
    }
    for (const word of course.words) {
      assert(tones.has(word.tone));
      assert(word.translationFa && word.translationEn);
      assert(word.example && word.exampleFa && word.exampleEn);
    }
    for (const table of course.vocabularyTables) validateTable(table);
  }
});

test("word lookup retains accents and Hangul without changing English lyric lookup", () => {
  assert.equal(normalizeWord("¡Día!"), "día");
  assert.equal(normalizeWord("NIÑA,"), "niña");
  assert.equal(normalizeWord("밤이."), "밤이");
  assert.equal(normalizeWord("hope."), "hope");
});

test("Spanish noun gender and plural are explicit and exceptions do not rely on colour", () => {
  const { words, vocabularyTables, grammar } = starterCourses.es;
  const rows = vocabularyTables[0].rows;
  for (const word of words) {
    const row = rows.find(([noun]) => noun === `${word.article} ${word.word}`);
    assert(row, `missing gender table entry: ${word.word}`);
    assert(row[1].fa.startsWith(word.genderFa));
    assert.equal(row[2], word.plural);
  }
  assert.equal(words.find((word) => word.word === "día").article, "el");
  assert.equal(words.find((word) => word.word === "mano").article, "la");
  assert(
    new Set(
      words
        .filter((word) => word.genderEn === "feminine")
        .map((word) => word.tone),
    ).size > 1,
  );
  const conjugations = grammar[0].tables[0].rows;
  assert(
    conjugations.some(
      ([subject, form]) => subject === "yo" && form === "canto",
    ),
  );
  assert(
    conjugations.some(
      ([subject, form]) => subject.includes("vosotros") && form === "cantáis",
    ),
  );
  assert(
    grammar.some((rule) =>
      rule.tables?.some((table) =>
        table.rows.some((row) => row.includes("canté")),
      ),
    ),
  );
});
