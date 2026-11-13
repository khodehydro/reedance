import React, { useEffect, useId, useRef, useState } from "react";
import { Check, Lightbulb, Table2, Volume2 } from "./icons.jsx";

// A lesson table is content, not an image: headers, row headers and cells stay
// navigable to a screen reader and the narrow viewport scrolls only the table.
// Cells are either target-language strings or { fa, en } translations.
function cellText(cell, lang) {
  return typeof cell === "string" ? cell : cell?.[lang] || "";
}

function TableCell({ cell, lang, locale }) {
  const translated = typeof cell !== "string";
  return (
    <span
      dir={cell?.dir || "auto"}
      lang={cell?.locale || (translated ? lang : locale)}
    >
      {cellText(cell, lang)}
    </span>
  );
}

export function LearningTable({ table, lang, t, locale = "en" }) {
  const scrollRef = useRef(null);
  const hintId = useId();
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const region = scrollRef.current;
    if (!region) return undefined;
    const update = () =>
      setOverflow(region.scrollWidth > region.clientWidth + 1);
    update();
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(update);
      observer.observe(region);
      observer.observe(region.querySelector("table"));
      return () => observer.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [table, lang]);
  if (!table?.columns?.length || !table.rows?.length) return null;
  const title = t(table.titleFa, table.titleEn);
  return (
    <figure className="learning-table">
      <figcaption>
        <span className="learning-table-icon">
          <Table2 size={18} />
        </span>
        <span>
          <strong>{title}</strong>
          {table.introFa && <small>{t(table.introFa, table.introEn)}</small>}
        </span>
      </figcaption>
      {overflow && (
        <span className="learning-table-hint" id={hintId}>
          {t(
            "ستون‌های بیشتر: جدول را افقی بکش یا با کلیدهای جهت حرکت بده.",
            "More columns: swipe sideways or use the arrow keys.",
          )}
        </span>
      )}
      <div
        className="learning-table-scroll"
        ref={scrollRef}
        role={overflow ? "region" : undefined}
        tabIndex={overflow ? 0 : undefined}
        aria-label={overflow ? `${t("جدول", "Table")}: ${title}` : undefined}
        aria-describedby={overflow ? hintId : undefined}
      >
        <table style={{ "--table-columns": table.columns.length }}>
          <caption className="learning-visually-hidden">{title}</caption>
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th scope="col" key={index}>
                  <TableCell cell={column} lang={lang} locale={locale} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => {
                  const isRowHeader =
                    cellIndex === 0 && table.rowHeader !== false;
                  const Cell = isRowHeader ? "th" : "td";
                  return (
                    <Cell
                      key={cellIndex}
                      scope={isRowHeader ? "row" : undefined}
                    >
                      <TableCell cell={cell} lang={lang} locale={locale} />
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.footerFa && (
        <p className="learning-table-footer">
          {t(table.footerFa, table.footerEn)}
        </p>
      )}
    </figure>
  );
}

export function ExampleSpeechButton({ text, locale, onSpeak, t }) {
  if (!text || !onSpeak) return null;
  return (
    <button
      className="learning-speak"
      type="button"
      onClick={() => onSpeak(text, locale)}
      aria-label={`${t("شنیدن مثال با صدای مرورگر", "Hear the example with your browser's voice")}: ${text}`}
    >
      <Volume2 size={16} />
      {t("شنیدن مثال", "Hear example")}
    </button>
  );
}

function QuickCheck({ check, t }) {
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();
  return (
    <div className="learning-check">
      <span className="learning-check-kicker">
        {t("یک‌لحظه امتحان کن", "QUICK CHECK")}
      </span>
      <p>{t(check.promptFa, check.promptEn)}</p>
      <button
        type="button"
        aria-expanded={revealed}
        aria-controls={answerId}
        onClick={() => setRevealed((current) => !current)}
      >
        <Check size={15} />
        {revealed
          ? t("پنهان کردن پاسخ", "Hide answer")
          : t("دیدن پاسخ", "Reveal answer")}
      </button>
      <div id={answerId} hidden={!revealed}>
        {revealed && (
          <p className="learning-check-answer" role="status">
            {t(check.answerFa, check.answerEn)}
          </p>
        )}
      </div>
    </div>
  );
}

export function NoteExtras({ note, lang, t, locale = "en" }) {
  return (
    <>
      {note.tables?.map((table, index) => (
        <LearningTable
          key={table.titleEn || index}
          table={table}
          lang={lang}
          t={t}
          locale={locale}
        />
      ))}
      {note.takeawayFa && (
        <aside className="learning-takeaway">
          <Lightbulb size={17} />
          <div>
            <strong>{t("یادت بمونه", "Remember")}</strong>
            <p>{t(note.takeawayFa, note.takeawayEn)}</p>
          </div>
        </aside>
      )}
      {note.check && <QuickCheck check={note.check} t={t} />}
    </>
  );
}
