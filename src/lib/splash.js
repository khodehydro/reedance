// The splash lives in index.html so the logo appears before React/CSS loads.
// Release the inert app only after it has mounted and the icon can be shown.
export function releaseSplash() {
  const splash = document.getElementById("app-splash");
  if (!splash) return () => {};

  const root = document.getElementById("root");
  const image = splash.querySelector("img");
  const reduceMotion =
    document.documentElement.dataset.reduceMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const started = window.__reedanceSplashStartedAt ?? performance.now();
  const minimum = reduceMotion
    ? 0
    : Math.max(0, 800 - (performance.now() - started));
  let imageWaitTimer;
  let removalTimer;
  let released = false;

  function revealApp() {
    if (released) return;
    released = true;
    window.clearTimeout(imageWaitTimer);
    image?.removeEventListener("load", revealApp);
    image?.removeEventListener("error", revealApp);
    root?.removeAttribute("inert");
    root?.removeAttribute("aria-hidden");
    splash.classList.add("is-exiting");
    removalTimer = window.setTimeout(
      () => splash.remove(),
      reduceMotion ? 0 : 260,
    );
  }

  const startTimer = window.setTimeout(() => {
    if (image?.complete) {
      revealApp();
    } else {
      image?.addEventListener("load", revealApp, { once: true });
      image?.addEventListener("error", revealApp, { once: true });
      // The app must not remain blocked if an image request stalls.
      imageWaitTimer = window.setTimeout(revealApp, 1800);
    }
  }, minimum);

  return () => {
    window.clearTimeout(startTimer);
    window.clearTimeout(imageWaitTimer);
    window.clearTimeout(removalTimer);
    image?.removeEventListener("load", revealApp);
    image?.removeEventListener("error", revealApp);
  };
}
