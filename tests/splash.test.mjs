import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { releaseSplash } from "../src/lib/splash.js";

function withSplash(
  { setting = false, system = false, complete = true } = {},
  verify,
) {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const timers = [];
  const listeners = new Map();
  const attributes = new Set(["inert", "aria-hidden"]);
  const image = {
    complete,
    addEventListener(type, callback) {
      listeners.set(type, callback);
    },
    removeEventListener(type, callback) {
      if (listeners.get(type) === callback) listeners.delete(type);
    },
    emit(type) {
      listeners.get(type)?.();
    },
  };
  const classes = new Set();
  const splash = {
    removed: false,
    querySelector(selector) {
      return selector === "img" ? image : null;
    },
    classList: {
      add(name) {
        classes.add(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    remove() {
      this.removed = true;
    },
  };
  const root = {
    removeAttribute(name) {
      attributes.delete(name);
    },
  };
  globalThis.window = {
    __reedanceSplashStartedAt: performance.now() - 100,
    matchMedia() {
      return { matches: system };
    },
    setTimeout(callback, delay) {
      const timer = { callback, delay, active: true };
      timers.push(timer);
      return timer;
    },
    clearTimeout(timer) {
      if (timer) timer.active = false;
    },
  };
  globalThis.document = {
    documentElement: { dataset: { reduceMotion: setting ? "true" : "false" } },
    getElementById(id) {
      return { "app-splash": splash, root }[id];
    },
  };
  const nextTimer = () => {
    const timer = timers.find((item) => item.active);
    assert(timer, "expected an active timer");
    timer.active = false;
    timer.callback();
    return timer.delay;
  };
  try {
    verify({ splash, image, attributes, listeners, nextTimer, timers });
  } finally {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  }
}

test("the supplied PNG is the app, favicon and pre-React splash logo", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const png = readFileSync(new URL("../logo.png", import.meta.url));
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.match(html, /rel="icon" type="image\/png" href="\/logo\.png"/);
  assert.match(html, /id="app-splash" role="status"/);
  assert.match(html, /src="\/logo\.png"/);
  assert.match(
    html,
    /<span class="splash-credit" dir="ltr">HYDRO team<\/span>/,
  );
  assert.match(html, /id="root" inert aria-hidden="true"/);
});

test("the splash holds the interface briefly, then releases it without leaving an overlay", () => {
  withSplash({}, ({ splash, attributes, nextTimer }) => {
    const cleanup = releaseSplash();
    assert(attributes.has("inert"));
    const minimum = nextTimer();
    assert(minimum > 0 && minimum <= 800);
    assert(!attributes.has("inert"));
    assert(!attributes.has("aria-hidden"));
    assert(splash.classList.contains("is-exiting"));
    assert.equal(nextTimer(), 260);
    assert(splash.removed);
    cleanup();
  });
});

test("a stalled image cannot trap the app behind its splash", () => {
  withSplash(
    { complete: false },
    ({ splash, image, attributes, listeners, nextTimer }) => {
      const cleanup = releaseSplash();
      nextTimer();
      assert(attributes.has("inert"));
      assert(listeners.has("load") && listeners.has("error"));
      assert.equal(nextTimer(), 1800);
      assert(!attributes.has("inert"));
      assert(splash.classList.contains("is-exiting"));
      assert.equal(listeners.size, 0);
      nextTimer();
      assert(splash.removed);
      cleanup();
    },
  );
});

test("reduced motion from either setting skips artificial wait and exit animation", () => {
  for (const preference of [{ setting: true }, { system: true }]) {
    withSplash(preference, ({ splash, attributes, nextTimer }) => {
      const cleanup = releaseSplash();
      assert.equal(nextTimer(), 0);
      assert(!attributes.has("inert"));
      assert.equal(nextTimer(), 0);
      assert(splash.removed);
      cleanup();
    });
  }
});

test("Strict Mode cleanup cancels the first timer before remounting", () => {
  withSplash({}, ({ splash, attributes, nextTimer, timers }) => {
    releaseSplash()();
    assert.equal(timers.filter((timer) => timer.active).length, 0);
    assert(attributes.has("inert"));
    const cleanup = releaseSplash();
    nextTimer();
    assert(splash.classList.contains("is-exiting"));
    cleanup();
  });
});
