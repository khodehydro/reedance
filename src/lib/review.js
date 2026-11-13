const DAY = 24 * 60 * 60 * 1000;
const REVIEW_DAYS = [0, 1, 2, 4, 8, 16];

export function scheduleReviewCard(card, remembered, now = Date.now()) {
  const stage = remembered ? Math.min(5, (card.stage || 1) + 1) : 1;
  return {
    stage,
    due: now + (remembered ? REVIEW_DAYS[stage] * DAY : 60 * 1000),
  };
}

// A wrong answer in the song quiz makes only its related words due now. A
// previously saved word stays saved; unrelated cards keep their due dates.
export function queueMissedCards(cards, words, now = Date.now()) {
  if (!words.length) return cards;
  const next = { ...cards };
  for (const word of words) next[word] = { stage: 1, due: now };
  return next;
}
