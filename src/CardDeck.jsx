import React, { useEffect, useRef, useState } from "react";

const EXIT_MS = 220; // Keep in sync with deck-leave in cardDeck.css.

function reducedMotion() {
  return (
    document.documentElement.dataset.reduceMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Commit the next card only after the current one has left. Lock repeated
// clicks during the short exit; cancel an unfinished move if the view unmounts.
// With either reduced-motion preference, advance synchronously instead.
export function useCardAdvance() {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);
  const busy = useRef(false);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      busy.current = false;
    },
    [],
  );

  function advance(update) {
    if (busy.current) return;
    busy.current = true;
    if (reducedMotion()) {
      update();
      // The next card renders immediately, but keep the click guard through
      // this event-loop turn so a double tap cannot grade the same word twice.
      timer.current = window.setTimeout(() => {
        timer.current = null;
        busy.current = false;
      }, 0);
      return;
    }
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      update();
      setLeaving(false);
      busy.current = false;
    }, EXIT_MS);
  }

  return { leaving, advance };
}

// Only the front contains content or controls. Back layers are decorative,
// hidden from assistive tech and never duplicate an answer or a saved item.
export function CardDeck({
  cardKey,
  behind = 0,
  leaving = false,
  variant,
  children,
}) {
  const depth = Math.min(2, Math.max(0, behind));
  return (
    <div
      className={`card-deck card-deck--${variant} ${leaving ? "is-leaving" : ""}`}
      data-depth={depth}
    >
      {depth > 1 && (
        <span
          className="card-deck-back card-deck-back--far"
          aria-hidden="true"
        />
      )}
      {depth > 0 && (
        <span
          className="card-deck-back card-deck-back--near"
          aria-hidden="true"
        />
      )}
      <div className="card-deck-front" key={cardKey} inert={leaving}>
        {children}
      </div>
    </div>
  );
}
