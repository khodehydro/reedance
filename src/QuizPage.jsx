import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, Layers3 } from "./icons.jsx";
import QuizSession from "./QuizSession.jsx";

// A distraction-free destination shared by the song test and due-word review.
// It deliberately renders no song player, mini-player, catalog navigation or
// lesson tabs; App pauses the track before entering this view.
export default function QuizPage({
  session,
  vocabulary,
  lastResult,
  lang,
  t,
  onExit,
  onSpeak,
  onGrade,
  onComplete,
  onReview,
}) {
  const review = session.kind === "review";
  const Icon = review ? Layers3 : ClipboardCheck;
  const [phase, setPhase] = useState(review ? "question" : "intro");
  return (
    <div className="quiz-page page-appear">
      <header className="quiz-page-header">
        <div className="quiz-page-header-inner">
          <button
            type="button"
            className="quiz-page-back"
            onClick={onExit}
            aria-label={
              review
                ? t("بازگشت به جعبهٔ لایتنر", "Back to Leitner box")
                : t("بازگشت به آهنگ", "Back to song")
            }
          >
            {lang === "fa" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div className="quiz-page-identity">
            <span>
              {review ? "LEITNER / REVIEW" : "MIDNIGHT AVENUE / QUIZ"}
            </span>
            <strong>
              {review
                ? t("مرور واژه‌ها", "Word review")
                : t("آزمون آهنگ", "Song quiz")}
            </strong>
          </div>
          <span className="quiz-page-count">
            {t(
              `${session.questions.length.toLocaleString("fa-IR")} سؤال`,
              `${session.questions.length} questions`,
            )}
          </span>
        </div>
      </header>
      <div className="quiz-page-main">
        {phase === "intro" && (
          <div className="quiz-page-focus">
            <span className="quiz-page-focus-icon">
              <Icon size={23} />
            </span>
            <div>
              <small>{t("فضای تمرکز", "FOCUS MODE")}</small>
              <h1>
                {review
                  ? t("چند واژه، یک قدم جلوتر.", "One word at a time.")
                  : t("حالا فقط تو و سؤال‌ها.", "Just you and the questions.")}
              </h1>
              <p>
                {t(
                  "پخش آهنگ اینجا متوقف است؛ هر وقت خواستی با دکمهٔ بازگشت به مسیرت برگرد.",
                  "The track is paused here. Use Back to return to where you left off.",
                )}
              </p>
            </div>
          </div>
        )}
        <section
          className={`quiz-page-surface ${phase === "question" ? "is-question" : ""}`}
          aria-label={
            review
              ? t("سؤال‌های مرور لایتنر", "Leitner review questions")
              : t(
                  "سؤال‌های آهنگ Midnight Avenue",
                  "Midnight Avenue quiz questions",
                )
          }
        >
          <QuizSession
            kind={session.kind}
            questions={session.questions}
            vocabulary={vocabulary}
            lastResult={review ? null : lastResult}
            lang={lang}
            t={t}
            onSpeak={onSpeak}
            onGrade={onGrade}
            onComplete={onComplete}
            onReview={onReview}
            onPhaseChange={setPhase}
          />
        </section>
      </div>
    </div>
  );
}
