import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Layers3,
  RotateCcw,
  Trophy,
  Volume2,
} from "./icons.jsx";
import { CardDeck, useCardAdvance } from "./CardDeck.jsx";
import {
  correctQuizAnswer,
  emptyAnswer,
  evaluateAnswer,
  formatQuizAnswer,
  isAnswerComplete,
  missedQuizWords,
} from "./quizData.js";

function Forward({ lang }) {
  return lang === "fa" ? <ArrowLeft size={17} /> : <ArrowRight size={17} />;
}

// Isolate Latin runs inside RTL explanations so the English line and its
// surrounding Persian punctuation retain their intended reading order.
function isolateEnglish(text) {
  return text.split(/([A-Za-z]+(?:[ '-][A-Za-z]+)*)/g).map((part, index) =>
    index % 2 ? (
      <bdi key={index} dir="ltr" lang="en">
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}

function validPreviousResult(result, questions) {
  return (
    result?.version === 1 &&
    Array.isArray(result.answers) &&
    result.answers.length === questions.length &&
    questions.every(
      (question, index) =>
        result.answers[index]?.id === question.id &&
        isAnswerComplete(question, result.answers[index].answer),
    )
  );
}

export default function QuizSession({
  kind = "song",
  questions,
  vocabulary,
  lastResult,
  lang,
  t,
  onSpeak,
  onGrade,
  onComplete,
  onReview,
  onPhaseChange,
}) {
  const [phase, setPhase] = useState(kind === "review" ? "question" : "intro");
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState(() => emptyAnswer(questions[0]));
  const [activeWord, setActiveWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const { leaving, advance } = useCardAdvance();
  const rootRef = useRef(null);
  const previous = validPreviousResult(lastResult, questions)
    ? lastResult
    : null;
  const question = questions[step];
  const isReview = kind === "review";

  useEffect(() => onPhaseChange?.(phase), [phase, onPhaseChange]);

  useEffect(() => {
    if (phase === "intro") return;
    const frame = window.requestAnimationFrame(() => {
      const reduced =
        document.documentElement.dataset.reduceMotion === "true" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heading = rootRef.current?.querySelector(
        phase === "result"
          ? ".quiz-result-hero h2"
          : ".quiz-question-heading h2",
      );
      heading?.focus({ preventScroll: true });
      rootRef.current?.scrollIntoView({
        block: "start",
        behavior: reduced ? "instant" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step, phase]);

  useEffect(() => {
    if (!feedback || phase !== "question") return undefined;
    const frame = window.requestAnimationFrame(() =>
      rootRef.current
        ?.querySelector(".quiz-feedback")
        ?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [feedback, phase]);

  function start() {
    setAnswers([]);
    setStep(0);
    setAnswer(emptyAnswer(questions[0]));
    setActiveWord(null);
    setFeedback(null);
    setPhase("question");
  }

  function submit(event) {
    event.preventDefault();
    if (feedback || !isAnswerComplete(question, answer)) return;
    const grade = evaluateAnswer(question, answer);
    const nextAnswers = [...answers, { id: question.id, answer }];
    setFeedback(grade);
    setAnswers(nextAnswers);
    onGrade?.(question, grade);
    if (step === questions.length - 1) {
      onComplete?.({
        version: 1,
        completedAt: Date.now(),
        answers: nextAnswers,
      });
    }
  }

  function next() {
    advance(() => {
      if (step === questions.length - 1) {
        setPhase("result");
      } else {
        setStep(step + 1);
        setAnswer(emptyAnswer(questions[step + 1]));
        setFeedback(null);
        setActiveWord(null);
      }
    });
  }

  function pairWith(meaningId) {
    if (!activeWord || feedback) return;
    setAnswer((current) => {
      const updated = { ...current };
      for (const [word, meaning] of Object.entries(updated)) {
        if (meaning === meaningId) delete updated[word];
      }
      updated[activeWord] = meaningId;
      return updated;
    });
    setActiveWord(null);
  }

  const savedAnswers =
    phase === "result" && answers.length ? answers : previous?.answers || [];
  const gradedAnswers = savedAnswers.map(({ id, answer: submitted }) => {
    const item = questions.find((part) => part.id === id);
    return {
      question: item,
      answer: submitted,
      grade: evaluateAnswer(item, submitted),
    };
  });
  const score = gradedAnswers.filter(({ grade }) => grade.correct).length;
  const missedWords = missedQuizWords(savedAnswers, questions, vocabulary);
  const previousScore = previous?.answers.filter(
    (item, index) => evaluateAnswer(questions[index], item.answer).correct,
  ).length;

  return (
    <div className="quiz-view" ref={rootRef}>
      {phase === "intro" && (
        <div className="quiz-intro">
          <span className="quiz-hero-icon">
            <ClipboardCheck size={28} />
          </span>
          <div className="quiz-intro-copy">
            <span className="view-overline">MIDNIGHT AVENUE / QUIZ</span>
            <h2>
              {t(
                "شنیدی، فهمیدی؛ حالا نوبت توئه.",
                "You listened. Now make it yours.",
              )}
            </h2>
            <p>
              {t(
                "۵ سؤال کوتاه از متن دموی اختصاصی؛ جمله بساز، واژه‌ها رو وصل کن، گزینه بزن و جای خالی رو پر کن. بعد از هر جواب، دلیلش رو می‌بینی.",
                "Five quick questions about the original demo: build a line, match words, choose a meaning and type the missing word. Every answer comes with a reason.",
              )}
            </p>
            <div
              className="quiz-type-list"
              aria-label={t("نوع سؤال‌ها", "Question types")}
            >
              <span>{t("چهارگزینه‌ای", "Multiple choice")}</span>
              <span>{t("مچ‌کردن", "Matching")}</span>
              <span>{t("ساخت جمله", "Build a line")}</span>
              <span>{t("تایپ", "Typing")}</span>
            </div>
            <p className="quiz-audio-note">
              <Volume2 size={16} />
              {t(
                "در آزمون آهنگ پخش نمی‌شود؛ دکمهٔ شنیدنِ جمله فقط از صدای مرورگر استفاده می‌کند.",
                "No track plays during the quiz; the optional spoken line uses your browser’s voice.",
              )}
            </p>
            {previous && (
              <div className="quiz-last-score">
                <span>
                  {t("نتیجهٔ دفعهٔ قبل", "Your last result")}:{" "}
                  <b dir="ltr">
                    {previousScore}/{questions.length}
                  </b>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers(previous.answers);
                    setPhase("result");
                  }}
                >
                  {t("دیدن پاسخ‌ها", "See answers")}
                </button>
              </div>
            )}
            <button
              type="button"
              className="primary-button quiz-main-action"
              onClick={start}
            >
              <ClipboardCheck size={18} />
              {t("شروع آزمون", "Start quiz")}
              <Forward lang={lang} />
            </button>
          </div>
        </div>
      )}

      {phase === "question" && (
        <CardDeck
          cardKey={question.id}
          behind={questions.length - step - 1}
          leaving={leaving}
          variant="quiz"
        >
          <form className="quiz-session" onSubmit={submit}>
            <div className="quiz-progress-top">
              <span>
                {isReview
                  ? t("مرور با سؤال", "QUESTION REVIEW")
                  : t("آزمون آهنگ", "SONG QUIZ")}
              </span>
              <strong>
                {t("سؤال", "Question")}{" "}
                <b dir="ltr">
                  {step + 1} / {questions.length}
                </b>
              </strong>
            </div>
            <div
              className="quiz-progress-track"
              role="progressbar"
              aria-valuenow={step + (feedback ? 1 : 0)}
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-label={t("پیشرفت آزمون", "Quiz progress")}
            >
              {questions.map((item, index) => (
                <span
                  key={item.id}
                  className={index < step + (feedback ? 1 : 0) ? "filled" : ""}
                />
              ))}
            </div>
            <div className="quiz-question-heading">
              <span className="quiz-skill">
                {t(question.skillFa, question.skillEn)}
              </span>
              <h2 id="quiz-current-prompt" tabIndex={-1}>
                {lang === "fa"
                  ? isolateEnglish(question.promptFa)
                  : question.promptEn}
              </h2>
            </div>
            {question.context && question.type !== "typing" && (
              <p className="quiz-typing-context quiz-choice-context" dir="ltr">
                {question.context}
              </p>
            )}
            {question.speech && (
              <div className="quiz-listen-tools">
                <button type="button" onClick={() => onSpeak(question.speech)}>
                  <Volume2 size={17} />{" "}
                  {t(
                    "شنیدن جمله با صدای مرورگر",
                    "Hear the browser read this line",
                  )}
                </button>
              </div>
            )}

            {question.type === "choice" && (
              <div
                className="quiz-options"
                role="group"
                aria-labelledby="quiz-current-prompt"
              >
                {question.options.map((option) => {
                  const selected = answer === option.id;
                  const grading =
                    feedback &&
                    (option.id === question.correctId
                      ? "correct"
                      : selected
                        ? "incorrect"
                        : "");
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`quiz-option ${selected ? "selected" : ""} ${grading || ""}`}
                      aria-pressed={selected}
                      disabled={!!feedback}
                      onClick={() => setAnswer(option.id)}
                      dir={
                        question.optionsInPersian || lang === "fa"
                          ? "rtl"
                          : "ltr"
                      }
                    >
                      <span className="quiz-option-indicator">
                        {grading === "correct" ? (
                          <Check size={16} />
                        ) : (
                          String.fromCharCode(
                            65 + question.options.indexOf(option),
                          )
                        )}
                      </span>
                      <span>{t(option.fa, option.en)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === "order" && (
              <div className="quiz-order" aria-labelledby="quiz-current-prompt">
                <span className="quiz-control-label">
                  {t(
                    "جملهٔ تو · برای برداشتن روی تکه بزن",
                    "Your line · tap a chunk to remove it",
                  )}
                </span>
                <div
                  className={`quiz-order-answer ${answer.length ? "has-pieces" : ""}`}
                  dir="ltr"
                  role="group"
                  aria-label={t("تکه‌های انتخاب‌شده", "Selected chunks")}
                >
                  {answer.length ? (
                    answer.map((id, index) => (
                      <button
                        key={id}
                        type="button"
                        disabled={!!feedback}
                        onClick={() =>
                          setAnswer(
                            answer.filter(
                              (_, partIndex) => partIndex !== index,
                            ),
                          )
                        }
                        aria-label={`${t("برداشتن", "Remove")} ${question.chunks.find((part) => part.id === id).text}`}
                      >
                        {question.chunks.find((part) => part.id === id).text}{" "}
                        <span aria-hidden="true">×</span>
                      </button>
                    ))
                  ) : (
                    <span>
                      {t(
                        "از پایین تکه‌ها رو به ترتیب انتخاب کن",
                        "Pick the chunks below in order",
                      )}
                    </span>
                  )}
                </div>
                <span className="quiz-control-label">
                  {t("تکه‌های جمله", "CHUNKS")}
                </span>
                <div
                  className="quiz-order-bank"
                  dir="ltr"
                  role="group"
                  aria-label={t("تکه‌های در دسترس", "Available chunks")}
                >
                  {question.choices.map((id) => {
                    const part = question.chunks.find(
                      (chunk) => chunk.id === id,
                    );
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!!feedback || answer.includes(id)}
                        onClick={() => setAnswer([...answer, id])}
                      >
                        {part.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {question.type === "match" && (
              <div className="quiz-match" aria-labelledby="quiz-current-prompt">
                <p>
                  {t(
                    "اول واژه را انتخاب کن، بعد معنی‌اش را. برای تغییر، دوباره روی واژه بزن. هر سه جفت باید درست باشند تا این سؤال یک امتیاز بگیرد.",
                    "Choose a word, then its meaning. Choose a word again to change its match. All three pairs must be right for the point.",
                  )}
                </p>
                <div className="quiz-match-columns">
                  <div
                    className="quiz-match-column"
                    role="group"
                    aria-label={t("واژه‌ها", "Words")}
                  >
                    <span className="quiz-control-label">
                      {t("واژه", "WORD")}
                    </span>
                    {question.pairs.map((pair, index) => (
                      <button
                        key={pair.id}
                        type="button"
                        dir="ltr"
                        aria-pressed={activeWord === pair.id}
                        disabled={!!feedback}
                        className={`${activeWord === pair.id ? "is-active" : ""} ${answer[pair.id] ? "is-paired" : ""} ${feedback ? (answer[pair.id] === pair.id ? "is-right" : "is-wrong") : ""}`}
                        onClick={() => setActiveWord(pair.id)}
                      >
                        <span>{index + 1}</span>
                        {pair.text}
                      </button>
                    ))}
                  </div>
                  <div
                    className="quiz-match-column"
                    role="group"
                    aria-label={t("معنی‌ها", "Meanings")}
                  >
                    <span className="quiz-control-label">
                      {t("معنی", "MEANING")}
                    </span>
                    {question.meaningOrder.map((id) => {
                      const pair = question.pairs.find(
                        (entry) => entry.id === id,
                      );
                      const pairedIndex = question.pairs.findIndex(
                        (word) => answer[word.id] === id,
                      );
                      const pairedWord = question.pairs[pairedIndex];
                      return (
                        <button
                          key={id}
                          type="button"
                          dir={lang === "fa" ? "rtl" : "ltr"}
                          disabled={!activeWord || !!feedback}
                          className={`${pairedWord ? "is-paired" : ""} ${feedback && pairedWord ? (pairedWord.id === id ? "is-right" : "is-wrong") : ""}`}
                          onClick={() => pairWith(id)}
                        >
                          <span>
                            {pairedIndex >= 0 ? pairedIndex + 1 : "·"}
                          </span>
                          {t(pair.fa, pair.en)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <small>
                  {t(
                    `${Object.keys(answer).length} از ${question.pairs.length} جفت ساخته شد`,
                    `${Object.keys(answer).length} of ${question.pairs.length} pairs connected`,
                  )}
                </small>
              </div>
            )}

            {question.type === "typing" && (
              <div className="quiz-typing">
                <p className="quiz-typing-context" dir="ltr">
                  {question.context}
                </p>
                <label htmlFor="quiz-typed-answer">
                  {t("واژهٔ جاافتاده", "Missing word")}
                </label>
                <input
                  id="quiz-typed-answer"
                  type="text"
                  dir="ltr"
                  lang="en"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  disabled={!!feedback}
                  maxLength={40}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder={t("اینجا به انگلیسی بنویس", "Type in English")}
                />
              </div>
            )}

            {feedback && (
              <div
                className={`quiz-feedback ${feedback.correct ? "is-correct" : "is-incorrect"}`}
                role="status"
                tabIndex={-1}
              >
                <div className="quiz-feedback-title">
                  {feedback.correct ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <RotateCcw size={20} />
                  )}
                  <strong>
                    {feedback.correct
                      ? t("درست گفتی!", "That's right!")
                      : t("این یکی رو مرور می‌کنیم.", "Let's learn this one.")}
                  </strong>
                  {question.type === "match" && (
                    <span>
                      {t(
                        `${feedback.matchedCount} از ${question.pairs.length} جفت درست`,
                        `${feedback.matchedCount} of ${question.pairs.length} pairs correct`,
                      )}
                    </span>
                  )}
                </div>
                {!feedback.correct && (
                  <div className="quiz-feedback-answer">
                    <span>{t("پاسخ درست", "Correct answer")}</span>
                    <strong dir="auto">
                      {correctQuizAnswer(question, lang)}
                    </strong>
                  </div>
                )}
                <p>
                  {lang === "fa"
                    ? isolateEnglish(question.explanationFa)
                    : question.explanationEn}
                </p>
              </div>
            )}
            <div className="quiz-step-actions">
              {feedback ? (
                <button type="button" className="primary-button" onClick={next}>
                  {step === questions.length - 1
                    ? t("دیدن نتیجه", "See results")
                    : t("سؤال بعدی", "Next question")}
                  <Forward lang={lang} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!isAnswerComplete(question, answer)}
                >
                  {t("بررسی پاسخ", "Check answer")} <Forward lang={lang} />
                </button>
              )}
            </div>
          </form>
        </CardDeck>
      )}

      {phase === "result" && (
        <div className="quiz-result">
          <div className="quiz-result-hero">
            <span>
              <Trophy size={28} />
            </span>
            <div>
              <small>
                {isReview
                  ? t("مرور به پایان رسید", "REVIEW COMPLETE")
                  : t("آزمون به پایان رسید", "QUIZ COMPLETE")}
              </small>
              <h2 tabIndex={-1}>
                {score === questions.length
                  ? t("عالی بود! همه رو بلدی.", "Perfect! You've got this.")
                  : t(
                      "هر اشتباه، یک فرصتِ یادگیریه.",
                      "Every mistake is a step forward.",
                    )}
              </h2>
              <p>
                {t(
                  "پاسخ‌ها و دلیل هر کدام را پایین ببین.",
                  "See your answers and the reasons below.",
                )}
              </p>
            </div>
            <strong dir="ltr">
              {score}
              <span> / {questions.length}</span>
            </strong>
          </div>
          <div className="quiz-result-list">
            <h3>{t("مرور پاسخ‌ها", "Review your answers")}</h3>
            {gradedAnswers.map(
              ({ question: item, answer: submitted, grade }, index) => (
                <details
                  key={item.id}
                  className={`quiz-result-item ${grade.correct ? "is-correct" : "is-incorrect"}`}
                  open={!grade.correct}
                >
                  <summary>
                    <span>
                      {grade.correct ? (
                        <Check size={18} />
                      ) : (
                        <RotateCcw size={17} />
                      )}
                    </span>
                    <strong>
                      {t("سؤال", "Question")} {index + 1} ·{" "}
                      {t(item.skillFa, item.skillEn)}
                    </strong>
                    <small>
                      {grade.correct
                        ? t("درست", "Correct")
                        : t("نیاز به مرور", "Review")}
                    </small>
                  </summary>
                  <div>
                    <p>
                      {lang === "fa"
                        ? isolateEnglish(item.promptFa)
                        : item.promptEn}
                    </p>
                    {item.context && <p dir="ltr">{item.context}</p>}
                    {item.type === "match" && (
                      <p>
                        {t(
                          `${grade.matchedCount} از ${item.pairs.length} جفت درست`,
                          `${grade.matchedCount} of ${item.pairs.length} pairs correct`,
                        )}
                      </p>
                    )}
                    {!grade.correct && (
                      <p>
                        {t("پاسخ تو", "Your answer")}:{" "}
                        <b dir="auto">
                          {formatQuizAnswer(item, submitted, lang)}
                        </b>
                      </p>
                    )}
                    <p>
                      {t("پاسخ درست", "Correct answer")}:{" "}
                      <b dir="auto">{correctQuizAnswer(item, lang)}</b>
                    </p>
                    <p className="quiz-result-explanation">
                      {lang === "fa"
                        ? isolateEnglish(item.explanationFa)
                        : item.explanationEn}
                    </p>
                  </div>
                </details>
              ),
            )}
          </div>
          {isReview ? (
            <div className="quiz-result-followup">
              <Layers3 size={22} />
              <p>
                {t(
                  "کارت‌های درست یک خانه جلو رفتند؛ واژه‌هایی که جا افتادند یک دقیقهٔ دیگر دوباره آمادهٔ مرور می‌شوند.",
                  "Remembered cards moved forward one box. Missed words will be due again in a minute.",
                )}
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={onReview}
              >
                {t("بازگشت به جعبه", "Back to the box")} <Forward lang={lang} />
              </button>
            </div>
          ) : (
            <div className="quiz-result-followup">
              <BookOpen size={22} />
              <div>
                <strong>
                  {missedWords.length
                    ? t(
                        "واژه‌های سختت را در جعبه مرور کن",
                        "Review your tricky words in the box",
                      )
                    : t("یادگیری رو ادامه بده", "Keep the momentum going")}
                </strong>
                <p>
                  {missedWords.length
                    ? t(
                        "واژه‌های جاافتاده بدون پاک‌کردنِ بقیهٔ کارت‌ها به لایتنر اضافه شدند. وضعیت مرور فعلی را در جعبه ببین.",
                        "Only missed words were added to Leitner, without changing unrelated cards. Check the box for their current due dates.",
                      )
                    : t(
                        "اگر واژه‌ای ذخیره کرده‌ای، می‌تونی از جعبهٔ لایتنر مرورش کنی.",
                        "If you've saved words, your Leitner box is ready when you are.",
                      )}
                </p>
                {missedWords.length > 0 && (
                  <div className="quiz-missed-words" dir="ltr">
                    {missedWords.map((word) => (
                      <span key={word}>{word}</span>
                    ))}
                  </div>
                )}
                <div className="quiz-result-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={onReview}
                  >
                    <Layers3 size={17} />
                    {t("رفتن به جعبهٔ لایتنر", "Open Leitner box")}{" "}
                    <Forward lang={lang} />
                  </button>
                  <button type="button" className="quiz-retry" onClick={start}>
                    <RotateCcw size={16} />
                    {t("آزمون دوباره", "Try quiz again")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
