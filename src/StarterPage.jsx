import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  CheckCircle2,
  GraduationCap,
  Languages,
  Layers3,
  Lightbulb,
  Music2,
  Sparkles,
  Volume2,
} from "./icons.jsx";
import { DEMO_ID, songLanguages } from "./data.js";
import { starterCourses } from "./starterData.js";
import {
  ExampleSpeechButton,
  LearningTable,
  NoteExtras,
} from "./LearningBlocks.jsx";

const steps = [
  {
    id: "letters",
    fa: "خط و الفبا",
    en: "Letters & script",
    introFa: "حرف‌ها را بشناس و ببین چطور روی صفحه کنار هم می‌نشینند.",
    introEn: "Get to know the characters and how they look on the page.",
    icon: Languages,
  },
  {
    id: "sounds",
    fa: "صدا و تلفظ",
    en: "Sounds & speech",
    introFa: "نام حرف با صدایش در واژه فرق دارد؛ چند صدای کلیدی را تمرین کن.",
    introEn: "Letter names and word sounds differ. Try a few useful patterns.",
    icon: Volume2,
  },
  {
    id: "grammar",
    fa: "گرامر پایه",
    en: "First grammar",
    introFa: "با الگوهای کوتاه، ساختارِ جمله‌های ساده را تشخیص بده.",
    introEn: "Use short patterns to recognise the shape of simple sentences.",
    icon: BookOpen,
  },
  {
    id: "words",
    fa: "واژه‌ها",
    en: "Words in context",
    introFa: "واژه را با نقش، شکلِ درست و جملهٔ واقعی‌اش یاد بگیر.",
    introEn: "Learn a word with its role, useful form and a real example.",
    icon: Layers3,
  },
  {
    id: "practice",
    fa: "اولین سطر",
    en: "First line",
    introFa: "واژه‌ها را جدا کن و یک سطر کوتاه را قبل از شنیدن بفهم.",
    introEn: "Break down a short line before you listen to it.",
    icon: AudioLines,
  },
];

export default function StarterPage({
  lang,
  t,
  navigate,
  language,
  setLanguage,
  progress,
  setProgress,
  onSpeak,
}) {
  const target = starterCourses[language] ? language : "en";
  const course = starterCourses[target];
  const [activeStep, setActiveStep] = useState("letters");
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const lessonRef = useRef(null);
  const completed = Array.isArray(progress?.[target]) ? progress[target] : [];
  const stepIndex = steps.findIndex((item) => item.id === activeStep);
  const currentStep = steps[stepIndex];
  const allLetters = course.alphabetGroups.flatMap((group) => group.letters);
  const currentLetter =
    allLetters.find((letter) => letter.glyph === selectedGlyph) ||
    allLetters[0];
  const selectedToken = course.practice.pieces[selectedPiece];
  const Forward = lang === "fa" ? ArrowLeft : ArrowRight;
  const completedCount = steps.filter((item) =>
    completed.includes(item.id),
  ).length;

  function chooseLanguage(code) {
    setLanguage(code);
    setActiveStep("letters");
    setSelectedGlyph(null);
    setSelectedPiece(null);
    setRevealed(false);
  }

  function chooseStep(id) {
    setActiveStep(id);
    setSelectedPiece(null);
    setRevealed(false);
  }

  function finishStep() {
    setProgress((previous) => {
      const safe = previous && typeof previous === "object" ? previous : {};
      const done = Array.isArray(safe[target]) ? safe[target] : [];
      return done.includes(activeStep)
        ? safe
        : { ...safe, [target]: [...done, activeStep] };
    });
    if (stepIndex < steps.length - 1) {
      chooseStep(steps[stepIndex + 1].id);
      window.requestAnimationFrame(() =>
        lessonRef.current?.scrollIntoView({
          behavior:
            document.documentElement.dataset.reduceMotion === "true" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          block: "start",
        }),
      );
    }
  }

  function hearLetter() {
    const spoken =
      target === "ko"
        ? currentLetter.name
        : target === "es"
          ? `La letra ${currentLetter.name}`
          : `The letter ${currentLetter.glyph}`;
    onSpeak(spoken, course.locale);
  }

  return (
    <div className="page-content page-appear starter-page">
      <div className="page-heading">
        <span className="heading-eyebrow">
          <span /> {t("قبل از اولین لیریک", "BEFORE YOUR FIRST LYRIC")}
        </span>
        <h1>{t("استارترِ زبان مقصد.", "Your language starter.")}</h1>
        <p>
          {t(
            "اول خط را بخوان، صداها را بشناس و بعد سراغ آهنگ برو.",
            "Meet the script, hear its sounds and build up to the music.",
          )}
        </p>
      </div>

      <section
        className="starter-hero"
        aria-label={t("مسیر استارتر", "Starter path")}
      >
        <div className="starter-hero-copy">
          <span className="starter-kicker">
            <GraduationCap size={18} /> STARTER / 00
          </span>
          <h2>
            {t(
              "از حروف شروع کن. به لیریک برس.",
              "Start with letters. Arrive at lyrics.",
            )}
          </h2>
          <p>{t(course.introFa, course.introEn)}</p>
          <div
            className="starter-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={completedCount}
            aria-label={t("پیشرفت استارتر", "Starter progress")}
          >
            <div className="starter-progress-copy">
              <span>{t("مسیر تو", "YOUR PATH")}</span>
              <strong dir="ltr">
                {completedCount} / {steps.length}
              </strong>
            </div>
            <span className="starter-progress-track">
              <span
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </span>
          </div>
        </div>
        <div className="starter-hero-art" aria-hidden="true">
          <div className="starter-orbit starter-orbit-one" />
          <div className="starter-orbit starter-orbit-two" />
          <span className="starter-glyph" lang={course.locale}>
            {course.heroGlyph}
          </span>
          <span className="starter-art-note">
            <AudioLines size={16} />{" "}
            {t("ببین · بشنو · بخوان", "SEE · HEAR · READ")}
          </span>
        </div>
      </section>

      <section
        className="starter-language-section"
        aria-label={t("انتخاب زبان مقصد", "Choose a target language")}
      >
        <div className="starter-section-heading">
          <div>
            <span>{t("اول مسیرت رو انتخاب کن", "CHOOSE YOUR PATH")}</span>
            <h2>
              {t(
                "کدوم زبان رو می‌خوای بخونی؟",
                "Which language are you learning?",
              )}
            </h2>
          </div>
          <small>
            {t(
              "هر زبان، استارتر خودش رو داره.",
              "Each language has its own starter.",
            )}
          </small>
        </div>
        <div
          className="starter-language-list"
          role="group"
          aria-label={t("زبان‌های استارتر", "Starter languages")}
        >
          {Object.keys(starterCourses).map((code) => {
            const languageInfo = songLanguages[code];
            return (
              <button
                type="button"
                key={code}
                className={`starter-language ${target === code ? "active" : ""}`}
                aria-pressed={target === code}
                onClick={() => chooseLanguage(code)}
              >
                <img src={languageInfo.flag} alt="" />
                <span>
                  <strong>{t(languageInfo.nameFa, languageInfo.nameEn)}</strong>
                  <small>
                    {t(
                      starterCourses[code].scriptFa,
                      starterCourses[code].scriptEn,
                    )}
                  </small>
                </span>
                {target === code && <Check size={17} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="starter-path-section"
        aria-label={t("قدم‌های استارتر", "Starter steps")}
      >
        <div className="starter-section-heading">
          <div>
            <span>{t("پنج قدم کوتاه", "FIVE SMALL STEPS")}</span>
            <h2>{t("مسیرت تا اولین سطر", "Your path to the first line")}</h2>
          </div>
          <small>
            {t(
              "هر قدم رو که تمام کردی، علامت بزن.",
              "Mark each step when it makes sense.",
            )}
          </small>
        </div>
        <div
          className="starter-steps"
          role="group"
          aria-label={t("انتخاب قدم آموزشی", "Choose a learning step")}
        >
          {steps.map((item, index) => {
            const Icon = item.icon;
            const done = completed.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                className={`starter-step ${activeStep === item.id ? "active" : ""}`}
                aria-pressed={activeStep === item.id}
                onClick={() => chooseStep(item.id)}
              >
                <span className="starter-step-icon">
                  <Icon size={20} />
                </span>
                <span className="starter-step-copy">
                  <small dir="ltr">0{index + 1}</small>
                  <strong>{t(item.fa, item.en)}</strong>
                </span>
                {done && (
                  <CheckCircle2
                    className="starter-step-check"
                    size={17}
                    aria-label={t("انجام‌شده", "Completed")}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="starter-lesson-panel"
        key={`${target}-${activeStep}`}
        ref={lessonRef}
        aria-labelledby="starter-lesson-heading"
      >
        <div className="starter-lesson-top">
          <span className="starter-lesson-overline" dir="ltr">
            STARTER / {String(stepIndex + 1).padStart(2, "0")}
          </span>
          <h2 id="starter-lesson-heading">
            {t(currentStep.fa, currentStep.en)}
          </h2>
          <p>{t(currentStep.introFa, currentStep.introEn)}</p>
        </div>

        {activeStep === "letters" && (
          <div className="starter-alphabet">
            <div className="starter-alphabet-main">
              <h3>{t(course.alphabetFa, course.alphabetEn)}</h3>
              {course.alphabetGroups.map((group) => (
                <div className="starter-letter-group" key={group.nameEn}>
                  <span className="starter-group-label">
                    {t(group.nameFa, group.nameEn)}
                  </span>
                  <div className="starter-letter-grid" lang={course.locale}>
                    {group.letters.map((letter) => (
                      <button
                        type="button"
                        key={letter.glyph}
                        className={
                          currentLetter.glyph === letter.glyph ? "selected" : ""
                        }
                        aria-pressed={currentLetter.glyph === letter.glyph}
                        aria-label={`${letter.glyph} — ${letter.name}`}
                        onClick={() => setSelectedGlyph(letter.glyph)}
                      >
                        {letter.glyph}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <aside className="starter-letter-focus" aria-live="polite">
              <span>{t("نام این حرف", "THIS LETTER'S NAME")}</span>
              <strong lang={course.locale}>{currentLetter.glyph}</strong>
              <b dir="auto" lang={course.locale}>
                {currentLetter.name}
              </b>
              <div className="starter-persian-hint" dir="rtl">
                <span>
                  {t("راهنمای فارسیِ تقریبی", "Approximate Persian guide")}
                </span>
                <strong lang="fa">{currentLetter.faHint}</strong>
              </div>
              <p>{t(course.alphabetTipFa, course.alphabetTipEn)}</p>
              <button type="button" onClick={hearLetter}>
                <Volume2 size={18} />
                {t("شنیدن نام حرف", "Hear its name")}
              </button>
            </aside>
          </div>
        )}

        {activeStep === "sounds" && (
          <div className="starter-sounds">
            <div className="starter-subnote">
              <Volume2 size={18} />
              {t(
                "راهنمای فارسی تقریبی است، نه معادل دقیق صدا؛ برای شنیدن نمونه روی دکمه بزن. لهجه و صدای دستگاهت ممکن است فرق کند.",
                "Persian spellings are approximations, not exact sounds. Tap to hear your device's voice; accents may differ.",
              )}
            </div>
            <div className="starter-sound-grid">
              {course.sounds.map((sound, index) => (
                <article className="starter-sound-card" key={sound.symbol}>
                  <span className="starter-sound-index" dir="ltr">
                    0{index + 1} / SOUND
                  </span>
                  <strong dir="ltr" lang={course.locale}>
                    {sound.symbol}
                  </strong>
                  <div className="starter-sound-example">
                    <div>
                      <b dir="auto" lang={course.locale}>
                        {sound.example}
                      </b>
                      <small dir="ltr">{sound.reading}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSpeak(sound.speech || sound.example, course.locale)
                      }
                      aria-label={`${t("شنیدن", "Hear")} ${sound.example}`}
                    >
                      <Volume2 size={19} />
                    </button>
                  </div>
                  <div className="starter-sound-hint" dir="rtl">
                    <span>{t("نزدیک به", "Persian approximation")}</span>
                    <strong lang="fa">{sound.faReading}</strong>
                  </div>
                  <p>{t(sound.tipFa, sound.tipEn)}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeStep === "grammar" && (
          <div className="starter-grammar-grid">
            {course.grammar.map((rule, index) => (
              <article
                className="starter-grammar-card learning-tone"
                data-tone={rule.tone || "blue"}
                key={rule.titleEn}
              >
                <span className="starter-grammar-number" dir="ltr">
                  0{index + 1}
                </span>
                <div>
                  <h3>{t(rule.titleFa, rule.titleEn)}</h3>
                  <span className="starter-grammar-pattern" dir="auto">
                    {rule.pattern}
                  </span>
                </div>
                <div className="starter-grammar-example">
                  <strong dir="auto" lang={course.locale}>
                    {rule.example}
                  </strong>
                  <span>{t(rule.translationFa, rule.translationEn)}</span>
                  <ExampleSpeechButton
                    text={rule.example}
                    locale={course.locale}
                    onSpeak={onSpeak}
                    t={t}
                  />
                </div>
                <p>{t(rule.tipFa, rule.tipEn)}</p>
                <NoteExtras
                  note={rule}
                  lang={lang}
                  t={t}
                  locale={course.locale}
                />
              </article>
            ))}
          </div>
        )}

        {activeStep === "words" && (
          <div className="starter-vocabulary">
            <p className="starter-words-intro">
              <Lightbulb size={18} />
              {t(course.wordsIntroFa, course.wordsIntroEn)}
            </p>
            <div className="starter-word-grid">
              {course.words.map((word) => (
                <article
                  className="starter-word-card learning-tone"
                  data-tone={word.tone || "blue"}
                  key={word.word}
                >
                  <div className="starter-word-top">
                    <span className="starter-word-tag">
                      {word.genderFa
                        ? t(word.genderFa, word.genderEn)
                        : t(word.partFa, word.partEn)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSpeak(
                          word.article
                            ? `${word.article} ${word.word}`
                            : word.word,
                          course.locale,
                        )
                      }
                      aria-label={`${t("شنیدن", "Hear")} ${word.article ? `${word.article} ` : ""}${word.word}`}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  <h3 dir="auto" lang={course.locale}>
                    {word.article ? `${word.article} ${word.word}` : word.word}
                  </h3>
                  <p className="starter-word-translation">
                    {t(word.translationFa, word.translationEn)}
                  </p>
                  <div className="starter-word-example">
                    <strong dir="auto" lang={course.locale}>
                      {word.example}
                    </strong>
                    <span>{t(word.exampleFa, word.exampleEn)}</span>
                  </div>
                  {word.noteFa && (
                    <p className="starter-word-note">
                      <Lightbulb size={15} />
                      {t(word.noteFa, word.noteEn)}
                    </p>
                  )}
                </article>
              ))}
            </div>
            <div
              className="starter-word-reference learning-tone"
              data-tone={target === "es" ? "apricot" : "blue"}
            >
              {course.vocabularyTables.map((table) => (
                <LearningTable
                  key={table.titleEn}
                  table={table}
                  lang={lang}
                  t={t}
                  locale={course.locale}
                />
              ))}
            </div>
          </div>
        )}

        {activeStep === "practice" && (
          <div className="starter-practice">
            <div className="starter-practice-heading">
              <span className="starter-practice-icon">
                <Music2 size={22} />
              </span>
              <div>
                <h3>{t("یک سطر رو خودت بخون", "Read a line for yourself")}</h3>
                <p>{t(course.practice.tipFa, course.practice.tipEn)}</p>
              </div>
            </div>
            <div
              className="starter-practice-line"
              dir="ltr"
              lang={course.locale}
            >
              {course.practice.pieces.map((piece, index) => (
                <button
                  type="button"
                  key={`${piece.text}-${index}`}
                  className={selectedPiece === index ? "active" : ""}
                  aria-pressed={selectedPiece === index}
                  onClick={() => setSelectedPiece(index)}
                >
                  {piece.text}
                </button>
              ))}
            </div>
            <p className="starter-line-pronunciation" dir="rtl">
              <span>
                {t("تلفظ تقریبی", "Approximate Persian pronunciation")}
              </span>
              <b lang="fa">{course.practice.faReading}</b>
            </p>
            <div className="starter-piece-meaning" role="status">
              {selectedToken ? (
                <>
                  <span dir="auto" lang={course.locale}>
                    {selectedToken.text}
                  </span>
                  <strong>{t(selectedToken.fa, selectedToken.en)}</strong>
                </>
              ) : (
                <span>
                  {t(
                    "برای دیدن معنی، روی بخشی از سطر بزن.",
                    "Tap part of the line to see its meaning.",
                  )}
                </span>
              )}
            </div>
            <div className="starter-practice-actions">
              <button
                type="button"
                className="starter-hear-line"
                onClick={() => onSpeak(course.practice.line, course.locale)}
              >
                <Volume2 size={18} /> {t("شنیدن جمله", "Hear the sentence")}
              </button>
              <button
                type="button"
                className="starter-reveal"
                aria-expanded={revealed}
                onClick={() => setRevealed((value) => !value)}
              >
                <Sparkles size={18} />
                {revealed
                  ? t("پنهان کردن معنی", "Hide the meaning")
                  : t("دیدن معنی کامل", "Reveal the full meaning")}
              </button>
            </div>
            {revealed && (
              <div
                className="starter-translation"
                dir={lang === "fa" ? "rtl" : "ltr"}
              >
                <span>{t("معنی سطر", "THE FULL MEANING")}</span>
                <strong>
                  {t(
                    course.practice.translationFa,
                    course.practice.translationEn,
                  )}
                </strong>
              </div>
            )}
          </div>
        )}

        <div className="starter-lesson-footer">
          <button type="button" className="primary-button" onClick={finishStep}>
            {stepIndex === steps.length - 1
              ? t("پایان استارتر رو ثبت کن", "Mark the starter complete")
              : t("فهمیدم؛ قدم بعدی", "Got it · next step")}
            {completed.includes(activeStep) &&
            stepIndex === steps.length - 1 ? (
              <Check size={18} />
            ) : (
              <Forward size={18} />
            )}
          </button>
          <span>
            {completed.includes(activeStep) ? (
              <>
                <CheckCircle2 size={15} />
                {t("این قدم انجام شده", "Step completed")}
              </>
            ) : (
              t("با سرعت خودت پیش برو.", "Take it at your own pace.")
            )}
          </span>
        </div>
      </section>

      <div className="starter-next-up">
        <div>
          <span className="starter-next-icon">
            <AudioLines size={22} />
          </span>
          <div>
            <span>{t("وقتی آماده بودی", "WHEN YOU'RE READY")}</span>
            <strong>
              {t(
                "از تمرین کوتاه به آهنگ برس.",
                "Go from a short line to a song.",
              )}
            </strong>
            <p>
              {target === "en"
                ? t(
                    "متن و صدای آهنگ نمایشیِ انگلیسی بعد از دانلود در دسترسه.",
                    "The original English demo unlocks its audio and lesson after download.",
                  )
                : t(
                    "فعلاً دموی قابل پخش انگلیسیه؛ آهنگ‌های این زبان فقط نمای کاتالوگ هستن.",
                    "Only the English original is playable for now; songs in this language are catalog previews.",
                  )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              target === "en" ? "song" : "explore",
              target === "en" ? DEMO_ID : undefined,
            )
          }
        >
          {target === "en"
            ? t("رفتن به آهنگ نمونه", "Open the demo song")
            : t("دیدن کاتالوگ", "Explore the catalog")}
          <Forward size={18} />
        </button>
      </div>
    </div>
  );
}
