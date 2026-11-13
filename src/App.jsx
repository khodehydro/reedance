import React, { useEffect, useId, useRef, useState } from "react";
import appLogo from "../logo.png";
import { releaseSplash } from "./lib/splash.js";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CloudDownload,
  Compass,
  Download,
  GraduationCap,
  Headphones,
  House,
  Languages,
  Layers3,
  Library,
  Lightbulb,
  LockKeyhole,
  LockKeyholeOpen,
  Music2,
  Pause,
  Play,
  Repeat2,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  User,
  VolumeX,
  X,
} from "./icons.jsx";
import {
  DEMO_ID,
  formatTime,
  normalizeWord,
  songLanguages,
  songs,
} from "./data.js";
import { downloadDemoPack, getDownloadedPack } from "./lib/offline.js";
import StarterPage from "./StarterPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import QuizPage from "./QuizPage.jsx";
import { CardDeck, useCardAdvance } from "./CardDeck.jsx";
import { buildDailyQuestions, demoQuiz, missedQuizWords } from "./quizData.js";
import { queueMissedCards, scheduleReviewCard } from "./lib/review.js";
import { enrichDemoLesson } from "./learningData.js";
import {
  ExampleSpeechButton,
  LearningTable,
  NoteExtras,
} from "./LearningBlocks.jsx";

const nav = [
  { id: "home", fa: "خانه", en: "Home", icon: House },
  { id: "explore", fa: "کشف", en: "Explore", icon: Compass },
  { id: "starter", fa: "استارتر", en: "Starter", icon: GraduationCap },
  { id: "leitner", fa: "جعبه", en: "Review", icon: Layers3 },
  { id: "library", fa: "کتابخانه", en: "Library", icon: Library },
];

const initialMarks = {
  songs: [],
  words: [],
  grammar: [],
  idioms: [],
  sentences: [],
};
const demoSong = songs[0];

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(key));
      return stored === null ? fallback : stored;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private browsing */
    }
  }, [key, value]);
  return [value, setValue];
}

function Brand({ lang }) {
  return (
    <div className="brand" aria-label="Reedance">
      <span className="brand-symbol">
        <img src={appLogo} width="42" height="42" alt="" />
      </span>
      <span className="brand-words">
        <strong>{lang === "fa" ? "ری‌دنس" : "Reedance"}</strong>
        <small>
          {lang === "fa" ? "زبان روی موج موسیقی" : "Language in every beat"}
        </small>
      </span>
    </div>
  );
}

function Forward({ lang, size = 17 }) {
  return lang === "fa" ? <ArrowLeft size={size} /> : <ArrowRight size={size} />;
}

function Back({ lang, size = 18 }) {
  return lang === "fa" ? <ArrowRight size={size} /> : <ArrowLeft size={size} />;
}

function AppNavigation({ page, navigate, lang, t }) {
  const selected = page === "song" ? "explore" : page;
  return (
    <>
      <aside className="desktop-sidebar">
        <Brand lang={lang} />
        <div className="nav-caption">{t("فضای تو", "YOUR SPACE")}</div>
        <nav
          className="side-links"
          aria-label={t("ناوبری اصلی", "Main navigation")}
        >
          {nav.map(({ id, fa, en, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`side-link ${selected === id ? "active" : ""}`}
              aria-current={selected === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <Icon size={20} />
              <span>{t(fa, en)}</span>
              {selected === id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-feature">
          <span className="sidebar-feature-icon">
            <Headphones size={23} />
          </span>
          <strong>{t("با موسیقی یاد بگیر", "Learn with music")}</strong>
          <p>
            {t(
              "هر آهنگ، یک دنیای تازه از واژه‌ها و جمله‌ها.",
              "Every song opens a new world of words and phrases.",
            )}
          </p>
          <button type="button" onClick={() => navigate("song", DEMO_ID)}>
            {t("تجربهٔ دمو", "Try the demo")} <Forward lang={lang} size={16} />
          </button>
        </div>
        <div className="sidebar-foot">
          REEDANCE <span>·</span> UI PREVIEW
        </div>
      </aside>
      <nav
        className="bottom-nav"
        aria-label={t("ناوبری اصلی", "Main navigation")}
      >
        {nav.map(({ id, fa, en, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`bottom-link ${selected === id ? "active" : ""}`}
            aria-current={selected === id ? "page" : undefined}
            aria-label={t(fa, en)}
            onClick={() => navigate(id)}
          >
            <span className="bottom-link-icon">
              <Icon size={20} />
            </span>
            <span className="bottom-link-label">{t(fa, en)}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

function Topbar({ lang, setLang, navigate, page, t }) {
  return (
    <header className="topbar">
      <div className="topbar-mobile-brand">
        <Brand lang={lang} />
      </div>
      <div className="topbar-desktop-note">
        <Sparkles size={18} className="tiny-sparkle" />
        {t(
          "برای گوش دادن، برای یاد گرفتن.",
          "Made for listening and learning.",
        )}
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="language-switch"
          onClick={() => setLang(lang === "fa" ? "en" : "fa")}
          aria-label={
            lang === "fa"
              ? "Switch interface to English"
              : "تغییر زبان رابط به فارسی"
          }
          title={lang === "fa" ? "English" : "فارسی"}
        >
          <Languages size={17} />
          <span>{lang === "fa" ? "EN" : "فا"}</span>
        </button>
        <button
          type="button"
          className={`top-avatar ${page === "profile" ? "active" : ""}`}
          onClick={() => navigate("profile")}
          aria-current={page === "profile" ? "page" : undefined}
          aria-label={t("صفحهٔ کاربری و تنظیمات", "Profile and settings")}
          title={t("فضای من", "My space")}
        >
          <User size={18} />
        </button>
      </div>
    </header>
  );
}

function SectionTitle({ eyebrow, title, action, onAction, lang }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button" className="section-action" onClick={onAction}>
          {action}
          <Forward lang={lang} size={17} />
        </button>
      )}
    </div>
  );
}

function SaveButton({ saved, onClick, t, label, className = "" }) {
  return (
    <button
      type="button"
      className={`save-icon ${saved ? "saved" : ""} ${className}`}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={`${saved ? t("برداشتن نشان", "Remove saved") : t("نشان کردن", "Save")} ${label}`}
      title={saved ? t("نشان شده", "Saved") : t("نشان کردن", "Save")}
    >
      <Bookmark size={18} />
    </button>
  );
}

function LanguageFlag({ song, t }) {
  const language = songLanguages[song.language];
  return (
    <img
      className="lang-flag"
      src={language.flag}
      alt={t(
        `پرچم ${language.countryFa}، زبان ${language.nameFa}`,
        `${language.nameEn} · ${language.countryEn} flag`,
      )}
      title={t(language.nameFa, language.nameEn)}
    />
  );
}

function SongTile({ song, onOpen, lang, t }) {
  const free = song.access === "free";
  const accessLabel = free
    ? t("محتوای رایگان", "Free content")
    : t(
        "محتوای پولی (فقط نمایشی؛ فعلاً قابل خرید نیست)",
        "Paid tier preview (not available to purchase)",
      );
  return (
    <article className="song-tile">
      <div className="song-tile-cover">
        <button
          type="button"
          className="song-tile-art"
          onClick={() => onOpen(song.id)}
          aria-label={`${t("باز کردن", "Open")} ${song.title}`}
        >
          <img src={song.image} alt="" />
        </button>
        <span
          className={`tile-access ${free ? "free" : "paid"}`}
          role="img"
          aria-label={accessLabel}
        >
          {free ? (
            <LockKeyholeOpen size={18} aria-hidden="true" />
          ) : (
            <LockKeyhole size={18} aria-hidden="true" />
          )}
        </span>
      </div>
      <div className="song-tile-body">
        <button
          type="button"
          className="tile-title"
          onClick={() => onOpen(song.id)}
        >
          <strong dir="ltr">{song.title}</strong>
          <span dir="ltr">{song.artist}</span>
        </button>
        <div className="tile-meta">
          <span className="tile-level">{song.level}</span>
          <LanguageFlag song={song} t={t} />
          <i /> <span>{lang === "fa" ? song.moodFa : song.moodEn}</span>
          <span className="tile-duration" dir="ltr">
            {song.duration}
          </span>
        </div>
      </div>
    </article>
  );
}

function HomePage({ lang, t, navigate, ready }) {
  return (
    <div className="page-content page-appear">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} />{" "}
            {t("زبان، این بار با موسیقی", "LANGUAGE, REMIXED")}
          </span>
          <h1>
            {t("آهنگ رو بشنو.", "Feel the music.")}
            <br />
            <em>{t("معنیش رو زندگی کن.", "Learn every line.")}</em>
          </h1>
          <p>
            {t(
              "لیریک، ترجمه، واژه‌ها و گرامر کنار آهنگ موردعلاقه‌ات. یادگیری از همین‌جا شروع می‌شه.",
              "Lyrics, translations, words and grammar live alongside the music you love. Start learning on your own beat.",
            )}
          </p>
          <button
            type="button"
            className="hero-button"
            onClick={() => navigate("song", DEMO_ID)}
          >
            {ready
              ? t("ادامهٔ آهنگ نمونه", "Continue the demo song")
              : t("تجربهٔ آهنگ نمونه", "Explore the demo song")}
            <Forward lang={lang} size={18} />
          </button>
          <div className="hero-small-note">
            <span className="hero-dot" />
            {t(
              "یک دمو برای دیدن تجربهٔ کامل",
              "One original demo to explore the full experience",
            )}
          </div>
        </div>
        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-halo" />
          <div className="hero-record" />
          <img src={demoSong.image} alt="" />
          <div className="hero-word-card">
            <span>
              <Music2 size={18} />
            </span>
            <div>
              <strong>one step at a time</strong>
              <small>قدم‌به‌قدم</small>
            </div>
          </div>
        </div>
      </section>
      <section className="home-starter-callout">
        <span className="home-starter-symbol">
          <GraduationCap size={25} />
        </span>
        <div>
          <small>STARTER / FIRST STEPS</small>
          <strong>
            {t(
              "قبل از لیریک، خط و صدای زبان رو بشناس.",
              "Meet the language before the first lyric.",
            )}
          </strong>
          <p>
            {t(
              "الفبا، تلفظ و گرامرِ اولِ انگلیسی، اسپانیایی یا کره‌ای.",
              "Letters, sounds and first grammar for English, Spanish or Korean.",
            )}
          </p>
        </div>
        <button type="button" onClick={() => navigate("starter")}>
          {t("رفتن به استارتر", "Open Starter")}
          <Forward lang={lang} size={18} />
        </button>
      </section>
      <section className="home-block">
        <SectionTitle
          eyebrow={t("گوش کن و کشف کن", "LISTEN & DISCOVER")}
          title={t("برای شروعِ امروز", "Start listening today")}
          action={t("همهٔ آهنگ‌ها", "All songs")}
          onAction={() => navigate("explore")}
          lang={lang}
        />
        <div className="song-rail">
          {songs.map((song) => (
            <SongTile
              key={song.id}
              song={song}
              onOpen={(id) => navigate("song", id)}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </section>
      <section className="home-block">
        <SectionTitle
          eyebrow={t("فقط شنیدن نیست", "MORE THAN LISTENING")}
          title={t("هر چیزی سر جای خودش", "Everything in one place")}
          lang={lang}
        />
        <div className="feature-grid">
          <button
            type="button"
            className="feature-box feature-blue"
            onClick={() => navigate("song", DEMO_ID)}
          >
            <span>
              <BookOpen size={23} />
            </span>
            <strong>{t("لیریک و ترجمه", "Lyrics & translation")}</strong>
            <small>
              {t(
                "متن کامل، ترجمهٔ روان و معنی کلمه‌به‌کلمه",
                "Full text, fluent and word-by-word translation",
              )}
            </small>
            <Forward lang={lang} size={18} />
          </button>
          <button
            type="button"
            className="feature-box feature-peach"
            onClick={() => navigate("song", DEMO_ID, "grammar")}
          >
            <span>
              <Lightbulb size={23} />
            </span>
            <strong>{t("نکته و اصطلاح", "Notes & expressions")}</strong>
            <small>
              {t(
                "گرامر و جمله‌های کاربردی، درست وسط آهنگ",
                "Grammar and useful phrases right inside the song",
              )}
            </small>
            <Forward lang={lang} size={18} />
          </button>
          <button
            type="button"
            className="feature-box feature-lavender"
            onClick={() => navigate("leitner")}
          >
            <span>
              <Layers3 size={23} />
            </span>
            <strong>{t("جعبهٔ لایتنر", "Leitner review")}</strong>
            <small>
              {t(
                "لغت‌هات رو ذخیره کن و به موقع مرور کن",
                "Save new words and review them when they’re due",
              )}
            </small>
            <Forward lang={lang} size={18} />
          </button>
        </div>
      </section>
      <div className="home-footnote">
        <Sparkles size={18} />
        {t(
          "آهنگ‌های معروف فعلاً نمایشی هستند؛ محتوای قابل پخش این نسخه، دموی اختصاصی است.",
          "Popular-song cards are catalog previews; the playable content in this version is an original demo.",
        )}
      </div>
    </div>
  );
}

function ExplorePage({ lang, t, navigate }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterTouched, setFilterTouched] = useState(false);
  const filters = [
    { id: "all", fa: "همه", en: "All" },
    { id: "demo", fa: "قابل تجربه", en: "Playable demo" },
    { id: "free", fa: "رایگان", en: "Free" },
    { id: "paid", fa: "پولی", en: "Paid" },
    { id: "en", fa: "انگلیسی", en: "English" },
    { id: "es", fa: "اسپانیایی", en: "Spanish" },
    { id: "ko", fa: "کره‌ای", en: "Korean" },
    { id: "pop", fa: "پاپ", en: "Pop" },
    { id: "calm", fa: "آرام", en: "Calm" },
  ];
  const results = songs.filter(
    (song) =>
      (filter === "all" ||
        (filter === "demo"
          ? song.demo
          : filter === "free" || filter === "paid"
            ? song.access === filter
            : ["en", "es", "ko"].includes(filter)
              ? song.language === filter
              : song.genre === filter)) &&
      `${song.title} ${song.artist} ${song.moodFa} ${song.moodEn} ${songLanguages[song.language].nameFa} ${songLanguages[song.language].nameEn}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="page-content page-appear">
      <div className="page-heading">
        <span className="heading-eyebrow">
          <span /> {t("کتابخانهٔ موسیقی", "THE MUSIC CATALOG")}
        </span>
        <h1>{t("آهنگ بعدی رو پیدا کن.", "Find your next song.")}</h1>
        <p>
          {t(
            "آهنگی که دوست داری رو انتخاب کن؛ هر کدوم می‌تونه شروع یک یادگیری تازه باشه.",
            "Pick a song you love. Every track can become a new way to learn.",
          )}
        </p>
      </div>
      <div className="explore-search">
        <Search size={20} />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t(
            "آهنگ یا خواننده رو جست‌وجو کن...",
            "Search songs or artists...",
          )}
          aria-label={t("جست‌وجوی آهنگ", "Search songs")}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label={t("پاک کردن جست‌وجو", "Clear search")}
          >
            <X size={17} />
          </button>
        )}
      </div>
      <div
        className="filter-list"
        role="group"
        aria-label={t("فیلتر آهنگ‌ها", "Song filters")}
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`filter-button ${filter === item.id ? "active" : ""}`}
            aria-pressed={filter === item.id}
            onClick={() => {
              setFilter(item.id);
              setFilterTouched(true);
            }}
          >
            {t(item.fa, item.en)}
          </button>
        ))}
      </div>
      <SectionTitle
        eyebrow={t(
          `${results.length.toLocaleString("fa-IR")} آهنگ`,
          `${results.length} songs`,
        )}
        title={t("انتخاب کن و شروع کن", "Choose your track")}
        lang={lang}
      />
      {results.length ? (
        <div className="catalog-grid" key={filterTouched ? filter : "initial"}>
          {results.map((song) => (
            <SongTile
              key={song.id}
              song={song}
              onOpen={(id) => navigate("song", id)}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title={t("آهنگی پیدا نشد", "No songs found")}
          description={t(
            "جست‌وجو یا فیلتر رو تغییر بده.",
            "Try a different search or filter.",
          )}
          action={t("نمایش همه", "Show all")}
          onAction={() => {
            setSearch("");
            setFilter("all");
          }}
        />
      )}
      <div className="catalog-notice">
        <Music2 size={19} />
        <p>
          {t(
            "قفل باز یعنی محتوای رایگان؛ قفل بسته فقط طرحِ محتوای پولیِ آینده را نشان می‌دهد و در این نمونه خریدی فعال نیست. آهنگ‌های شناخته‌شده فقط پیش‌نمایش کاتالوگ‌اند؛ پخش و متن واقعی آن‌ها به مجوز نیاز دارد. دموی اختصاصی رایگان و قابل تجربه است.",
            "An open lock marks free content; a closed lock previews a future paid tier, with no purchase available here. Familiar titles are catalog previews only—their audio and lyrics require licences. The original demo is free and playable.",
          )}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={27} />
      </span>
      <h3 tabIndex={-1}>{title}</h3>
      <p>{description}</p>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function DownloadGate({ status, progress, onDownload, lang, t }) {
  const busy = status === "checking" || status === "downloading";
  return (
    <div className="gate-layout">
      <section className="download-gate">
        <span className="gate-icon">
          {status === "downloading" ? (
            <Download size={28} />
          ) : (
            <CloudDownload size={28} />
          )}
        </span>
        <span className="gate-overline">
          {t("مرحلهٔ اول · آماده‌سازی", "STEP ONE · GET READY")}
        </span>
        <h2>
          {t("اول، بستهٔ آهنگ رو دانلود کن.", "Download the song pack first.")}
        </h2>
        <p>
          {t(
            "فایل صوتی، متن، ترجمه و همهٔ ابزارهای یادگیری یکجا ذخیره می‌شن. بعدش می‌تونی پخش کنی و کلمه‌ها رو کشف کنی.",
            "The audio, lyrics, translations and learning tools are saved together. Then you can play, explore and learn from the saved pack.",
          )}
        </p>
        <div className="gate-includes">
          <div>
            <Music2 size={18} />
            <span>{t("فایل صوتی کامل دمو", "Full demo audio")}</span>
            <Check size={16} />
          </div>
          <div>
            <BookOpen size={18} />
            <span>{t("۸ خط متن و ترجمه", "8 lyric lines & translations")}</span>
            <Check size={16} />
          </div>
          <div>
            <Sparkles size={18} />
            <span>
              {t("واژه‌ها، گرامر و اصطلاحات", "Words, grammar & expressions")}
            </span>
            <Check size={16} />
          </div>
        </div>
        {status === "downloading" && (
          <div className="download-progress">
            <div>
              <span>
                {t("در حال دریافت محتوا...", "Downloading content...")}
              </span>
              <strong>{progress}%</strong>
            </div>
            <div className="download-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <button
          type="button"
          className="primary-button gate-button"
          disabled={busy}
          onClick={onDownload}
        >
          {status === "checking"
            ? t("در حال بررسی دانلودها...", "Checking downloads...")
            : status === "downloading"
              ? t("در حال دانلود...", "Downloading...")
              : t("دانلود و باز کردن آهنگ", "Download & unlock song")}
          {!busy && <Forward lang={lang} size={18} />}
        </button>
        <small className="gate-size">
          {t(
            "حدود ۲ مگابایت · روی همین دستگاه ذخیره می‌شود",
            "About 2 MB · stored on this device",
          )}
        </small>
      </section>
      <div className="gate-preview">
        <span className="preview-lock">
          <LockKeyhole size={20} />
        </span>
        <span className="gate-preview-label">
          {t("بعد از دانلود منتظرته", "WAITING AFTER DOWNLOAD")}
        </span>
        <h3>
          {t(
            "از شنیدن تا فهمیدن، همه‌چیز کنار هم.",
            "From listening to understanding.",
          )}
        </h3>
        <div className="preview-lyric">
          <span>
            <Music2 size={18} />
          </span>
          <strong>I keep a little hope alive.</strong>
          <small>ذره‌ای امید را زنده نگه می‌دارم.</small>
        </div>
        <div className="preview-blur">
          <span />
          <span />
          <span />
        </div>
        <div className="preview-tags">
          <span>Lyrics</span>
          <span>Words</span>
          <span>Grammar</span>
        </div>
      </div>
    </div>
  );
}

function UnavailableGate({ lang, t, navigate }) {
  return (
    <div className="unavailable-gate">
      <span className="unavailable-icon">
        <LockKeyhole size={25} />
      </span>
      <div>
        <span className="gate-overline">
          {t("پیش‌نمایش کاتالوگ", "CATALOG PREVIEW")}
        </span>
        <h2>
          {t(
            "برای این آهنگ هنوز بستهٔ محتوایی نداریم.",
            "This song pack is not available in the demo.",
          )}
        </h2>
        <p>
          {t(
            "این کارت ظاهر کاتالوگ رو نشون می‌ده. فایل صوتی و لیریک واقعی آهنگ‌های معروف فقط با منبع مجاز اضافه می‌شن. می‌تونی همین جریان دانلود، پلیر و آموزش رو با آهنگ اختصاصی امتحان کنی.",
            "This card previews the catalog design. Real audio and lyrics for popular songs need licensed sources. Try the full download, player and learning flow with our original demo track.",
          )}
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("song", DEMO_ID)}
        >
          {t("تجربه با آهنگ نمونه", "Try the original demo")}
          <Forward lang={lang} size={18} />
        </button>
      </div>
    </div>
  );
}

function PlayerPanel({
  song,
  docked,
  panelRef,
  playing,
  currentTime,
  duration,
  loop,
  muted,
  togglePlay,
  skip,
  seek,
  setLoop,
  setMuted,
  t,
}) {
  const length = duration || 64;
  const progress = Math.min(100, (currentTime / length) * 100);
  return (
    <section
      ref={panelRef}
      className="player-panel"
      aria-label={t("پلیر آهنگ", "Song player")}
    >
      <div className="player-full" aria-hidden={docked} inert={docked}>
        <div className="player-cover">
          <img src={song.image} alt={song.title} />
          {playing && (
            <span className="playing-equalizer" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <div className="player-heading">
          <div>
            <strong dir="ltr">{song.title}</strong>
            <span dir="ltr">{song.artist}</span>
          </div>
          <span className="player-demo-tag">{t("صدای دمو", "DEMO AUDIO")}</span>
        </div>
        <div className="player-timeline">
          <input
            type="range"
            min="0"
            max={length}
            step="0.1"
            value={Math.min(currentTime, length)}
            onChange={(event) => seek(Number(event.target.value))}
            style={{ "--seek-progress": `${progress}%` }}
            aria-label={t("موقعیت آهنگ", "Song position")}
          />
          <div>
            <span dir="ltr">{formatTime(currentTime)}</span>
            <span dir="ltr">{formatTime(length)}</span>
          </div>
        </div>
        <div className="player-controls">
          <button
            type="button"
            onClick={() => skip(-10)}
            aria-label={t("۱۰ ثانیه عقب", "Back 10 seconds")}
          >
            <SkipBack size={22} />
          </button>
          <button
            type="button"
            className="main-play"
            onClick={togglePlay}
            aria-label={playing ? t("مکث", "Pause") : t("پخش", "Play")}
          >
            {playing ? <Pause size={23} /> : <Play size={23} />}
          </button>
          <button
            type="button"
            onClick={() => skip(10)}
            aria-label={t("۱۰ ثانیه جلو", "Forward 10 seconds")}
          >
            <SkipForward size={22} />
          </button>
        </div>
        <div className="player-bottom">
          <button
            type="button"
            className={loop ? "on" : ""}
            onClick={() => setLoop(!loop)}
            aria-pressed={loop}
            aria-label={t("تکرار آهنگ", "Repeat song")}
          >
            <Repeat2 size={18} />
            {t("تکرار", "Repeat")}
          </button>
          <span>REEDANCE ORIGINALS</span>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-label={
              muted ? t("وصل کردن صدا", "Unmute") : t("قطع کردن صدا", "Mute")
            }
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
        </div>
      </div>
    </section>
  );
}

function LyricsView({
  lesson,
  mode,
  setMode,
  currentTime,
  seek,
  onWord,
  onQuiz,
  lang,
  t,
}) {
  const modes = [
    { id: "original", fa: "متن اصلی", en: "Original" },
    { id: "translation", fa: "ترجمهٔ کامل", en: "Full translation" },
    { id: "word", fa: "کلمه‌به‌کلمه", en: "Word by word" },
  ];
  const activeIndex = lesson.lyrics.reduce(
    (last, line, index) => (line.at <= currentTime ? index : last),
    0,
  );
  return (
    <div className="lyrics-view">
      <div className="lesson-view-header">
        <div>
          <span className="view-overline">LYRICS / ترجمه</span>
          <h2>{t("همراه آهنگ بخون", "Follow every line")}</h2>
        </div>
        <span className="view-count">{t("۸ خط", "8 lines")}</span>
      </div>
      <div
        className="translation-modes"
        role="group"
        aria-label={t("نوع نمایش ترجمه", "Translation display mode")}
      >
        {modes.map((item) => (
          <button
            type="button"
            key={item.id}
            className={mode === item.id ? "selected" : ""}
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {t(item.fa, item.en)}
          </button>
        ))}
      </div>
      <div className="lyric-tip">
        <Lightbulb size={17} />
        {t(
          "روی هر کلمه بزن تا معنی و نمونه‌جمله‌اش رو ببینی. زمانِ هر خط هم قابل انتخابه.",
          "Tap any word for its meaning and example. Tap a timestamp to jump to that line.",
        )}
      </div>
      <div className="lyric-lines" key={mode}>
        {lesson.lyrics.map((line, index) => (
          <div
            key={line.at}
            className={`lyric-line ${index === activeIndex ? "active" : ""}`}
          >
            <button
              type="button"
              className="lyric-time"
              onClick={() => seek(line.at)}
              aria-label={`${t("رفتن به", "Jump to")} ${formatTime(line.at)}`}
            >
              {index === activeIndex ? (
                <AudioLines size={18} />
              ) : (
                <span dir="ltr">{formatTime(line.at)}</span>
              )}
            </button>
            <div className="lyric-content">
              {mode === "word" ? (
                <div className="word-by-word" dir="ltr">
                  {line.tokens.map((token, tokenIndex) => (
                    <button
                      type="button"
                      key={`${token.w}-${tokenIndex}`}
                      onClick={() => onWord(token, line)}
                    >
                      <strong>{token.w}</strong>
                      <small dir="rtl">{token.fa}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="lyric-english" dir="ltr">
                  {line.tokens.map((token, tokenIndex) => (
                    <button
                      type="button"
                      key={`${token.w}-${tokenIndex}`}
                      onClick={() => onWord(token, line)}
                    >
                      {token.w}
                    </button>
                  ))}
                </div>
              )}
              {mode === "translation" && (
                <p className="lyric-persian" dir="rtl">
                  {line.fa}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="lesson-disclaimer">
        {lang === "fa" ? lesson.disclaimerFa : lesson.disclaimerEn}
      </p>
      <div className="lyrics-quiz-cta">
        <ClipboardCheck size={23} />
        <div>
          <strong>
            {t("حالا یادگیریت رو بسنج", "Ready to test what stuck?")}
          </strong>
          <p>
            {t(
              "پنج سؤال کوتاه از همین سطرها",
              "Five quick questions from these lines",
            )}
          </p>
        </div>
        <button type="button" onClick={onQuiz}>
          {t("رفتن به آزمون", "Take the quiz")}
          <Forward lang={lang} size={16} />
        </button>
      </div>
    </div>
  );
}

function GrammarView({ lesson, isMarked, onMark, onSpeak, locale, lang, t }) {
  return (
    <div className="learning-view">
      <div className="lesson-view-header">
        <div>
          <span className="view-overline">GRAMMAR NOTES</span>
          <h2>
            {t("نکته‌هایی که توی آهنگ پنهانن", "The details inside the song")}
          </h2>
        </div>
        <span className="view-count">{lesson.grammar.length}</span>
      </div>
      <p className="view-intro">
        {t(
          "ساختارها را در جدول ببین، مثال را بشنو و پیش از دیدن پاسخ، خودت امتحان کن. هر نکته را هم می‌تونی نشان کنی.",
          "Compare patterns in a table, hear an example and try a quick check before revealing the answer. Save notes for later.",
        )}
      </p>
      <div className="notes-list">
        {lesson.grammar.map((note, index) => (
          <article
            className="grammar-card learning-tone"
            data-tone={note.tone || "blue"}
            key={note.id}
          >
            <div className="grammar-top">
              <span className="grammar-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="grammar-tag">{t(note.tagFa, note.tagEn)}</span>
              <SaveButton
                saved={isMarked("grammar", note.id)}
                onClick={() => onMark("grammar", note.id)}
                t={t}
                label={t(note.titleFa, note.titleEn)}
              />
            </div>
            <h3>{t(note.titleFa, note.titleEn)}</h3>
            <p>{t(note.bodyFa, note.bodyEn)}</p>
            <div className="grammar-example">
              <span>IN THE SONG</span>
              <strong dir="ltr">{note.example}</strong>
              <small dir="rtl">{note.exampleFa}</small>
              <ExampleSpeechButton
                text={note.example}
                locale={locale}
                onSpeak={onSpeak}
                t={t}
              />
            </div>
            <NoteExtras note={note} lang={lang} t={t} locale={locale} />
          </article>
        ))}
      </div>
    </div>
  );
}

function WordsView({
  lesson,
  isMarked,
  onMark,
  onWord,
  onSpeak,
  locale,
  lang,
  t,
}) {
  return (
    <div className="learning-view">
      <div className="lesson-view-header">
        <div>
          <span className="view-overline">VOCABULARY</span>
          <h2>{t("لغت‌هایی برای نگه داشتن", "Words worth keeping")}</h2>
        </div>
        <span className="view-count">{lesson.featuredWords.length}</span>
      </div>
      <p className="view-intro">
        {t(
          "روی لغت بزن تا معنی و مثالش باز بشه؛ نشان‌کردنش اون رو به جعبهٔ لایتنر اضافه می‌کنه.",
          "Tap a word for its meaning and example; saving it adds it to your Leitner box.",
        )}
      </p>
      <div className="vocab-list">
        {lesson.featuredWords.map((word, index) => {
          const entry = lesson.vocabulary[word];
          const line =
            lesson.lyrics.find((item) =>
              item.tokens.some((token) => normalizeWord(token.w) === word),
            ) || lesson.lyrics[0];
          return (
            <div
              className="vocab-row learning-tone"
              data-tone={
                entry.tone ||
                ["mint", "amber", "rose", "apricot", "coral", "blue"][index % 6]
              }
              key={word}
            >
              <button
                type="button"
                className="vocab-main"
                onClick={() => onWord({ w: word, fa: entry.fa }, line)}
              >
                <strong dir="auto">
                  {entry.article ? `${entry.article} ${word}` : word}
                </strong>
                <span dir="rtl">{entry.fa}</span>
                <small className="vocab-kind">
                  {t(entry.partFa, entry.partEn)}
                  {entry.genderFa && ` · ${t(entry.genderFa, entry.genderEn)}`}
                  {entry.plural && ` · ${entry.plural}`}
                </small>
              </button>
              <button
                type="button"
                className="vocab-sound"
                onClick={() =>
                  onSpeak(
                    entry.article ? `${entry.article} ${word}` : word,
                    locale,
                  )
                }
                aria-label={`${t("تلفظ", "Pronounce")} ${entry.article ? `${entry.article} ` : ""}${word}`}
              >
                <Volume2 size={18} />
              </button>
              <SaveButton
                saved={isMarked("words", word)}
                onClick={() => onMark("words", word)}
                t={t}
                label={word}
              />
            </div>
          );
        })}
      </div>
      {lesson.vocabularyTables?.length > 0 && (
        <div className="learning-word-tables learning-tone" data-tone="blue">
          {lesson.vocabularyTables.map((table) => (
            <LearningTable
              key={table.titleEn}
              table={table}
              lang={lang}
              t={t}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhrasesView({ lesson, isMarked, onMark, lang, t }) {
  return (
    <div className="learning-view">
      <div className="lesson-view-header">
        <div>
          <span className="view-overline">EXPRESSIONS & PHRASES</span>
          <h2>{t("چیزهایی که به کار میان", "Phrases you can actually use")}</h2>
        </div>
        <span className="view-count">
          {lesson.idioms.length + lesson.sentences.length}
        </span>
      </div>
      <div className="phrase-section">
        <h3>
          <Sparkles size={18} />
          {t("اصطلاحات", "Expressions")}
        </h3>
        {lesson.idioms.map((item) => (
          <article className="phrase-card" key={item.id}>
            <div className="phrase-top">
              <span className="phrase-kind">EXPRESSION</span>
              <SaveButton
                saved={isMarked("idioms", item.id)}
                onClick={() => onMark("idioms", item.id)}
                t={t}
                label={item.en}
              />
            </div>
            <strong dir="ltr">{item.en}</strong>
            <p dir={lang === "fa" ? "rtl" : "ltr"}>
              {t(item.fa, item.meaningEn)}
            </p>
            <div className="phrase-example">
              <span dir="ltr">{item.example}</span>
              <small dir="rtl">{item.exampleFa}</small>
            </div>
          </article>
        ))}
      </div>
      <div className="phrase-section">
        <h3>
          <BookOpen size={18} />
          {t("جمله‌های کاربردی", "Useful sentences")}
        </h3>
        {lesson.sentences.map((item) => (
          <article className="phrase-card sentence-card" key={item.id}>
            <div className="phrase-top">
              <span className="phrase-kind">EVERYDAY ENGLISH</span>
              <SaveButton
                saved={isMarked("sentences", item.id)}
                onClick={() => onMark("sentences", item.id)}
                t={t}
                label={item.en}
              />
            </div>
            <strong dir="ltr">{item.en}</strong>
            <p dir="rtl">{item.fa}</p>
            <small>{t(item.contextFa, item.contextEn)}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function SongPage({
  song,
  initialTab,
  lang,
  t,
  navigate,
  status,
  progress,
  download,
  lesson,
  playing,
  currentTime,
  duration,
  loop,
  muted,
  togglePlay,
  skip,
  seek,
  setLoop,
  setMuted,
  marks,
  onMark,
  onWord,
  onSpeak,
  onOpenQuiz,
  finishedSong,
}) {
  const [tab, setTab] = useState(initialTab);
  const [mode, setMode] = useState("translation");
  const [dockedPlayer, setDockedPlayer] = useState(false);
  const headerRef = useRef(null);
  const playerRef = useRef(null);
  function handleTabKeyDown(event, currentId) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex(({ id }) => id === currentId);
    const forward = (event.key === "ArrowLeft") === (lang === "fa") ? 1 : -1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + forward + tabs.length) % tabs.length;
    setTab(tabs[nextIndex].id);
    document.getElementById(`song-tab-${tabs[nextIndex].id}`)?.focus();
  }
  useEffect(() => {
    setTab(initialTab);
    setMode("translation");
  }, [song.id, initialTab]);
  useEffect(() => {
    if (!song.demo || status !== "ready" || !lesson) {
      setDockedPlayer(false);
      return undefined;
    }
    let frame = 0;
    const mobileLayout = window.matchMedia("(max-width: 760px)");
    const update = () => {
      frame = 0;
      const header = headerRef.current?.getBoundingClientRect();
      const player = playerRef.current?.getBoundingClientRect();
      if (!header || !player) return;
      const mobile = mobileLayout.matches;
      // On mobile the full player leaves before the strip appears. On wider
      // screens it gives way once its top passes the header. Measuring their
      // relative positions keeps the threshold stable as the strip opens.
      const distance = mobile
        ? player.bottom - header.bottom
        : player.top - header.bottom;
      setDockedPlayer((docked) => {
        const threshold = mobile ? (docked ? 24 : -4) : docked ? -4 : -48;
        return distance < threshold;
      });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [song.id, song.demo, status, lesson]);
  const tabs = [
    { id: "lyrics", fa: "لیریک", en: "Lyrics", icon: AudioLines },
    { id: "grammar", fa: "نکته‌ها", en: "Notes", icon: Lightbulb },
    { id: "words", fa: "لغت‌ها", en: "Words", icon: BookOpen },
    { id: "phrases", fa: "اصطلاح و جمله", en: "Phrases", icon: Sparkles },
  ];
  const isMarked = (type, id) => marks[type]?.includes(id) || false;
  const targetLocale = songLanguages[song.language]?.locale || "en-US";
  return (
    <div
      className={`page-content song-page ${dockedPlayer ? "has-docked-player" : ""}`}
    >
      <div className="song-sticky-header" ref={headerRef}>
        <header className="song-page-header">
          <button
            type="button"
            className="song-header-back"
            onClick={() => navigate("explore")}
            aria-label={t("بازگشت به آهنگ‌ها", "Back to songs")}
          >
            <Back lang={lang} size={20} />
          </button>
          <div className="song-header-title">
            <span className="song-header-eyebrow">
              {song.demo
                ? t("پخش و یادگیری", "LISTEN & LEARN")
                : t("پیش‌نمایش آهنگ", "SONG PREVIEW")}
            </span>
            <h1 dir="ltr">{song.title}</h1>
            {!song.demo && <small dir="ltr">{song.artist}</small>}
            <div className="song-header-meta">
              <span className="song-header-level">
                <LanguageFlag song={song} t={t} />
                <b dir="ltr">{song.level}</b>
                <span>
                  {t(
                    songLanguages[song.language].nameFa,
                    songLanguages[song.language].nameEn,
                  )}
                </span>
              </span>
              <span dir="ltr">{song.duration}</span>
              <span className="song-header-mood">
                {lang === "fa" ? song.moodFa : song.moodEn}
              </span>
            </div>
          </div>
          <SaveButton
            saved={isMarked("songs", song.id)}
            onClick={() => onMark("songs", song.id)}
            t={t}
            label={song.title}
          />
        </header>
        {song.demo && status === "ready" && lesson && (
          <div
            className="song-docked-player"
            aria-hidden={!dockedPlayer}
            inert={!dockedPlayer}
          >
            <strong dir="ltr">{song.title}</strong>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={`${playing ? t("مکث", "Pause") : t("پخش", "Play")} ${song.title}`}
            >
              {playing ? <Pause size={23} /> : <Play size={23} />}
            </button>
          </div>
        )}
      </div>
      {!song.demo ? (
        <UnavailableGate lang={lang} t={t} navigate={navigate} />
      ) : status !== "ready" || !lesson ? (
        <DownloadGate
          status={status}
          progress={progress}
          onDownload={download}
          lang={lang}
          t={t}
        />
      ) : (
        <>
          <div className="song-workspace">
            <PlayerPanel
              song={song}
              docked={dockedPlayer}
              panelRef={playerRef}
              playing={playing}
              currentTime={currentTime}
              duration={duration}
              loop={loop}
              muted={muted}
              togglePlay={togglePlay}
              skip={skip}
              seek={seek}
              setLoop={setLoop}
              setMuted={setMuted}
              t={t}
            />
            <section className="lesson-panel">
              {finishedSong && !playing && (
                <div className="song-quiz-finish-banner">
                  <ClipboardCheck size={23} />
                  <div>
                    <strong>
                      {t(
                        "آهنگ تموم شد؛ وقت یه آزمون کوتاهه!",
                        "Track finished — ready for a quick quiz?",
                      )}
                    </strong>
                    <p>
                      {t(
                        "۵ سؤال با بازخورد و مرور واژه‌های سخت",
                        "5 questions, helpful feedback and a path to review",
                      )}
                    </p>
                  </div>
                  <button type="button" onClick={() => onOpenQuiz(tab)}>
                    {t("شروع کن", "Take quiz")}
                    <Forward lang={lang} size={16} />
                  </button>
                </div>
              )}
              <div className="lesson-navigation">
                <div
                  className="lesson-tabs"
                  role="tablist"
                  aria-label={t(
                    "بخش‌های آموزشی آهنگ",
                    "Song learning sections",
                  )}
                >
                  {tabs.map(({ id, fa, en, icon: Icon }) => (
                    <button
                      key={id}
                      id={`song-tab-${id}`}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      tabIndex={tab === id ? 0 : -1}
                      className={tab === id ? "active" : ""}
                      onClick={() => setTab(id)}
                      onKeyDown={(event) => handleTabKeyDown(event, id)}
                    >
                      <Icon size={17} />
                      {t(fa, en)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="lesson-quiz-link"
                  onClick={() => onOpenQuiz(tab)}
                  aria-label={t(
                    "باز کردن آزمون در صفحهٔ جدا",
                    "Open quiz in a separate view",
                  )}
                >
                  <ClipboardCheck size={17} />
                  {t("آزمون", "Quiz")}
                  <Forward lang={lang} size={13} />
                </button>
              </div>
              <div
                className="lesson-body"
                role="tabpanel"
                aria-labelledby={`song-tab-${tab}`}
                key={tab}
              >
                {tab === "lyrics" && (
                  <LyricsView
                    lesson={lesson}
                    mode={mode}
                    setMode={setMode}
                    currentTime={currentTime}
                    seek={seek}
                    onWord={onWord}
                    onQuiz={() => onOpenQuiz("lyrics")}
                    lang={lang}
                    t={t}
                  />
                )}
                {tab === "grammar" && (
                  <GrammarView
                    lesson={lesson}
                    isMarked={isMarked}
                    onMark={onMark}
                    onSpeak={onSpeak}
                    locale={targetLocale}
                    lang={lang}
                    t={t}
                  />
                )}
                {tab === "words" && (
                  <WordsView
                    lesson={lesson}
                    isMarked={isMarked}
                    onMark={onMark}
                    onWord={onWord}
                    onSpeak={onSpeak}
                    locale={targetLocale}
                    lang={lang}
                    t={t}
                  />
                )}
                {tab === "phrases" && (
                  <PhrasesView
                    lesson={lesson}
                    isMarked={isMarked}
                    onMark={onMark}
                    lang={lang}
                    t={t}
                  />
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function WordSheet({
  selected,
  lesson,
  close,
  isMarked,
  onMark,
  onSpeak,
  locale,
  lang,
  t,
}) {
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close]);
  if (!selected || !lesson) return null;
  const key = normalizeWord(selected.token.w);
  const entry = lesson.vocabulary[key];
  const word = selected.token.w.replace(/[.,!?]/g, "");
  const meaning = entry?.fa || selected.token.fa;
  const example = entry?.example || selected.line.en;
  const exampleFa = entry?.exampleFa || selected.line.fa;
  const saved = isMarked("words", key);
  return (
    <div className="sheet-backdrop" onMouseDown={close}>
      <section
        className="word-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${t("معنی واژهٔ", "Word meaning:")} ${word}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-top">
          <span className="word-sheet-label">WORD / واژه</span>
          <button type="button" onClick={close} aria-label={t("بستن", "Close")}>
            <X size={19} />
          </button>
        </div>
        <div className="word-sheet-heading">
          <div>
            <h2 dir="auto" lang={locale}>
              {entry?.article ? `${entry.article} ${word}` : word}
            </h2>
            {entry?.ipa && (
              <span dir="ltr">
                {entry.ipa} · {t(entry.partFa, entry.partEn)}
              </span>
            )}
            {entry?.faReading && (
              <span
                className="word-persian-reading"
                dir={lang === "fa" ? "rtl" : "ltr"}
              >
                {t("نزدیک به", "Persian guide")}:{" "}
                <b lang="fa" dir="rtl">
                  {entry.faReading}
                </b>
              </span>
            )}
            {entry?.genderFa && (
              <span className="word-grammar-meta">
                {t("جنسیت دستوری", "Grammatical gender")}:{" "}
                {t(entry.genderFa, entry.genderEn)}
                {entry.plural && (
                  <>
                    {" · "}
                    {t("جمع", "Plural")}:{" "}
                    <b dir="auto" lang={locale}>
                      {entry.plural}
                    </b>
                  </>
                )}
              </span>
            )}
          </div>
          <button
            type="button"
            className="word-speak"
            onClick={() =>
              onSpeak(
                entry?.article ? `${entry.article} ${word}` : word,
                locale,
              )
            }
            aria-label={`${t("تلفظ", "Pronounce")} ${entry?.article ? `${entry.article} ` : ""}${word}`}
          >
            <Volume2 size={21} />
          </button>
        </div>
        <div className="word-meaning">
          <span>{t("معنی", "MEANING")}</span>
          <strong dir="rtl">{meaning}</strong>
        </div>
        <div className="word-example">
          <span>{t("در یک جمله", "IN A SENTENCE")}</span>
          <strong dir="ltr">{example}</strong>
          <small dir="rtl">{exampleFa}</small>
        </div>
        <button
          type="button"
          className={`primary-button sheet-save ${saved ? "is-saved" : ""}`}
          onClick={() => onMark("words", key)}
        >
          {saved ? <Check size={18} /> : <Bookmark size={18} />}
          {saved
            ? t("توی جعبهٔ لایتنر ذخیره شد", "Saved to your Leitner box")
            : t("ذخیره در جعبهٔ لایتنر", "Save to Leitner box")}
        </button>
      </section>
    </div>
  );
}

function LeitnerReviewCard({ word, wordInfo, onReview, lang, t }) {
  const [revealed, setRevealed] = useState(false);
  const answerRef = useRef(null);
  useEffect(() => {
    if (!revealed) return undefined;
    const frame = window.requestAnimationFrame(() =>
      answerRef.current?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [revealed]);
  return (
    <div className="review-card">
      <span className="review-label">
        {t("روی کارت فکر کن", "THINK OF THE MEANING")}
      </span>
      <h2 dir="ltr" tabIndex={-1}>
        {word}
      </h2>
      {!revealed ? (
        <>
          <p>
            {t(
              "معنی این واژه رو یادت میاد؟",
              "Do you remember what this word means?",
            )}
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setRevealed(true)}
          >
            {t("نمایش جواب", "Reveal answer")}
            <Forward lang={lang} size={18} />
          </button>
        </>
      ) : (
        <>
          <div
            className="review-answer"
            role="status"
            tabIndex={-1}
            ref={answerRef}
          >
            <span>{t("معنی", "MEANING")}</span>
            <strong dir="rtl">{wordInfo?.fa || word}</strong>
            <small dir="ltr">{wordInfo?.example || ""}</small>
            {wordInfo?.exampleFa && (
              <small dir="rtl">{wordInfo.exampleFa}</small>
            )}
          </div>
          <div className="review-actions">
            <button
              type="button"
              className="review-again"
              onClick={() => onReview(false)}
            >
              <RotateCcw size={17} />
              {t("دوباره ببین", "Review again")}
            </button>
            <button
              type="button"
              className="review-good"
              onClick={() => onReview(true)}
            >
              <Check size={17} />
              {t("یادم بود", "Got it")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LeitnerPage({
  cards,
  lesson,
  review,
  lang,
  t,
  navigate,
  onOpenReview,
}) {
  const [now, setNow] = useState(() => Date.now());
  const { leaving, advance } = useCardAdvance();
  const reviewSlot = useRef(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  const entries = Object.entries(cards);
  const due = entries.filter(([, card]) => card.due <= now);
  const quizDueWords = due
    .map(([word]) => word)
    .filter((word) => lesson?.vocabulary[word])
    .slice(0, 5);
  const current = due[0];
  const previousWord = useRef(current?.[0]);
  useEffect(() => {
    if (previousWord.current === current?.[0]) return undefined;
    previousWord.current = current?.[0];
    const frame = window.requestAnimationFrame(() =>
      reviewSlot.current
        ?.querySelector(current ? ".review-card h2" : ".empty-state h3")
        ?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [current?.[0]]);
  const stages = [1, 2, 3, 4, 5];
  const wordInfo = current && lesson?.vocabulary[current[0]];
  return (
    <div className="page-content page-appear">
      <div className="page-heading">
        <span className="heading-eyebrow">
          <span /> {t("مرور هوشمند", "SMART REVIEW")}
        </span>
        <h1>{t("جعبهٔ لایتنر تو.", "Your Leitner box.")}</h1>
        <p>
          {t(
            "لغت‌هایی که نشان کردی، اینجا توی زمان مناسب دوباره پیداشون می‌کنی.",
            "The words you save come back here at the right time.",
          )}
        </p>
      </div>
      <SectionTitle
        eyebrow={t(
          `${due.length.toLocaleString("fa-IR")} لغت برای امروز`,
          `${due.length} words due today`,
        )}
        title={t("وقت مرور کردنه", "Time for a quick review")}
        lang={lang}
      />
      <div ref={reviewSlot}>
        {current ? (
          <CardDeck
            cardKey={current[0]}
            behind={due.length - 1}
            leaving={leaving}
            variant="leitner"
          >
            <LeitnerReviewCard
              word={current[0]}
              wordInfo={wordInfo}
              lang={lang}
              t={t}
              onReview={(remembered) =>
                advance(() => review(current[0], remembered))
              }
            />
          </CardDeck>
        ) : (
          <EmptyState
            icon={entries.length ? CheckCircle2 : Layers3}
            title={
              entries.length
                ? t("مرور امروزت تموم شد!", "All caught up for today!")
                : t("جعبه‌ات هنوز خالیه", "Your box is empty for now")
            }
            description={
              entries.length
                ? t(
                    "لغت‌ها در زمان مناسب برای مرور بعدی برمی‌گردن.",
                    "Your words will return when it’s time to review again.",
                  )
                : t(
                    "از روی لیریک یا فهرست واژه‌ها، چند لغت رو نشان کن.",
                    "Save words from the lyrics or vocabulary list to start reviewing.",
                  )
            }
            action={
              !entries.length
                ? t("رفتن به آهنگ نمونه", "Explore demo song")
                : null
            }
            onAction={() => navigate("song", DEMO_ID)}
          />
        )}
      </div>
      {quizDueWords.length > 0 && (
        <div className="leitner-quiz-launch">
          <ClipboardCheck size={23} />
          <div>
            <strong>
              {t("مرور امروز با سؤال", "Review today's words with questions")}
            </strong>
            <p>
              {t(
                "به صفحهٔ جداگانهٔ پرسش‌ها برو؛ معنی را انتخاب کن یا واژه را تایپ کن. نتیجه روی همین کارت‌ها اعمال می‌شود.",
                "Open a separate question view to choose a meaning or type the word. Answers update these same cards.",
              )}
            </p>
          </div>
          <button type="button" onClick={() => onOpenReview(quizDueWords)}>
            {t("شروع مرور", "Start review")}
            <Forward lang={lang} size={16} />
          </button>
        </div>
      )}
      <div
        className="leitner-stages"
        aria-label={t("خانه‌های لایتنر", "Leitner boxes")}
      >
        {stages.map((stage) => (
          <div key={stage} className={stage === 1 ? "first" : ""}>
            <span>{String(stage).padStart(2, "0")}</span>
            <strong>
              {entries.filter(([, card]) => card.stage === stage).length}
            </strong>
            <small>
              {t("خانه", "Box")} {stage}
            </small>
          </div>
        ))}
      </div>
      <div className="leitner-banner">
        <div>
          <span>THE LEITNER METHOD</span>
          <h2>
            {t(
              "کم‌کم یاد بگیر، مدت‌ها یادت بمونه.",
              "Learn a little. Remember a lot.",
            )}
          </h2>
          <p>
            {t(
              "هر جواب درست، واژه رو یک خانه جلو می‌بره. اگه یادت نبود، دوباره به خانهٔ اول برمی‌گرده.",
              "A remembered word moves forward one box. A forgotten one returns to the first.",
            )}
          </p>
        </div>
        <span className="leitner-banner-art">
          <Layers3 size={58} />
        </span>
      </div>
      {entries.length > 0 && (
        <div className="review-collection">
          <SectionTitle
            title={t("همهٔ لغت‌های من", "My saved words")}
            lang={lang}
          />
          <div>
            {entries.map(([word, card]) => (
              <span key={word} className="review-word" dir="ltr">
                <strong>{word}</strong>
                <small>BOX {card.stage}</small>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SavedPhraseCard({ item, onSpeak, t }) {
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();
  return (
    <article className="saved-phrase-card">
      <span>{item.eyebrow}</span>
      <h3 dir="ltr" lang="en" tabIndex={-1}>
        {item.title}
      </h3>
      <p>
        {t(
          "معنی‌اش را به خاطر بیار؛ بعد پاسخ را ببین.",
          "Recall the meaning, then reveal it.",
        )}
      </p>
      <div className="saved-phrase-card-actions">
        <button
          type="button"
          onClick={() => onSpeak(item.title, "en-US")}
          aria-label={`${t("شنیدن عبارت", "Hear phrase")}: ${item.title}`}
        >
          <Volume2 size={17} /> {t("شنیدن", "Listen")}
        </button>
        <button
          type="button"
          aria-expanded={revealed}
          aria-controls={answerId}
          onClick={() => setRevealed((current) => !current)}
        >
          {revealed
            ? t("پنهان کردن معنی", "Hide meaning")
            : t("دیدن معنی", "Reveal meaning")}
        </button>
      </div>
      <div id={answerId} hidden={!revealed}>
        {revealed && (
          <div className="saved-phrase-answer" role="status">
            <strong dir="rtl" lang="fa">
              {item.sub}
            </strong>
            {item.meaningEn && (
              <small dir="ltr" lang="en">
                {item.meaningEn}
              </small>
            )}
            {item.example && (
              <small dir="ltr" lang="en">
                {item.example}
              </small>
            )}
            {item.exampleFa && (
              <small dir="rtl" lang="fa">
                {item.exampleFa}
              </small>
            )}
            {item.contextFa && (
              <small>{t(item.contextFa, item.contextEn)}</small>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SavedPhraseDeck({ items, onSpeak, lang, t }) {
  const [position, setPosition] = useState(0);
  const { leaving, advance } = useCardAdvance();
  const slot = useRef(null);
  const index = Math.min(position, items.length - 1);
  const item = items[index];
  const previousItem = useRef(item.id);
  useEffect(() => {
    if (previousItem.current === item.id) return undefined;
    previousItem.current = item.id;
    const frame = window.requestAnimationFrame(() =>
      slot.current
        ?.querySelector(".saved-phrase-card h3")
        ?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [item.id]);

  function move(direction) {
    if (items.length < 2) return;
    advance(() =>
      setPosition(
        (current) => (current + direction + items.length) % items.length,
      ),
    );
  }

  return (
    <section
      className="saved-phrase-review"
      aria-labelledby="saved-phrase-review-heading"
    >
      <div className="saved-phrase-review-header">
        <div>
          <h2 id="saved-phrase-review-heading">
            {t("مرور عبارت‌های نشان‌شده", "Review saved phrases")}
          </h2>
          <p>
            {t(
              "هر کارت را بخوان و بعد سراغ کارت بعدی برو.",
              "Reveal the meaning, then move through your cards.",
            )}
          </p>
        </div>
        <span dir="ltr">
          {index + 1} / {items.length}
        </span>
      </div>
      <div ref={slot}>
        <CardDeck
          cardKey={item.id}
          behind={items.length - 1}
          leaving={leaving}
          variant="phrases"
        >
          <SavedPhraseCard item={item} onSpeak={onSpeak} t={t} />
        </CardDeck>
      </div>
      <div className="saved-phrase-review-controls">
        <button
          type="button"
          disabled={items.length < 2 || leaving}
          onClick={() => move(-1)}
        >
          <Back lang={lang} size={17} /> {t("قبلی", "Previous")}
        </button>
        <button
          type="button"
          disabled={items.length < 2 || leaving}
          onClick={() => move(1)}
        >
          {t("کارت بعدی", "Next card")} <Forward lang={lang} size={17} />
        </button>
      </div>
    </section>
  );
}

function LibraryPage({ marks, lesson, ready, navigate, onSpeak, lang, t }) {
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all", fa: "همه", en: "All" },
    { id: "words", fa: "واژه‌ها", en: "Words" },
    { id: "grammar", fa: "نکته‌ها", en: "Notes" },
    { id: "phrases", fa: "عبارت‌ها", en: "Phrases" },
    { id: "songs", fa: "آهنگ‌ها", en: "Songs" },
  ];
  const items = [
    ...marks.words.map((id) => ({
      id: `word-${id}`,
      type: "words",
      eyebrow: "WORD",
      title: id,
      sub: lesson?.vocabulary[id]?.fa || t("لغت ذخیره‌شده", "Saved word"),
    })),
    ...marks.grammar.map((id) => {
      const item = lesson?.grammar.find((note) => note.id === id);
      return {
        id: `grammar-${id}`,
        type: "grammar",
        eyebrow: "GRAMMAR",
        title: item ? t(item.titleFa, item.titleEn) : id,
        sub: item?.example || "",
      };
    }),
    ...marks.idioms.map((id) => {
      const item = lesson?.idioms.find((entry) => entry.id === id);
      return {
        id: `idiom-${id}`,
        type: "phrases",
        eyebrow: "EXPRESSION",
        title: item?.en || id,
        sub: item?.fa || "",
        available: !!item,
        meaningEn: item?.meaningEn,
        example: item?.example,
        exampleFa: item?.exampleFa,
      };
    }),
    ...marks.sentences.map((id) => {
      const item = lesson?.sentences.find((entry) => entry.id === id);
      return {
        id: `sentence-${id}`,
        type: "phrases",
        eyebrow: "SENTENCE",
        title: item?.en || id,
        sub: item?.fa || "",
        available: !!item,
        contextFa: item?.contextFa,
        contextEn: item?.contextEn,
      };
    }),
    ...marks.songs.map((id) => {
      const item = songs.find((song) => song.id === id);
      return {
        id: `song-${id}`,
        type: "songs",
        eyebrow: "SONG",
        title: item?.title || id,
        sub: item?.artist || "",
        image: item?.image,
        songId: id,
      };
    }),
  ];
  const visible =
    filter === "all" ? items : items.filter((item) => item.type === filter);
  const savedPhrases = items.filter(
    (item) => item.type === "phrases" && item.available,
  );
  return (
    <div className="page-content page-appear">
      <div className="page-heading">
        <span className="heading-eyebrow">
          <span /> {t("مجموعهٔ شخصی", "YOUR COLLECTION")}
        </span>
        <h1>{t("چیزهایی که نگه داشتی.", "Saved for later.")}</h1>
        <p>
          {t(
            "از لغت‌های تازه تا جمله‌های کاربردی، همه اینجا منتظر مرور دوباره‌ان.",
            "Words, notes and phrases you marked, all in one calm place.",
          )}
        </p>
      </div>
      {savedPhrases.length > 0 &&
        (filter === "all" || filter === "phrases") && (
          <SavedPhraseDeck
            items={savedPhrases}
            onSpeak={onSpeak}
            lang={lang}
            t={t}
          />
        )}
      <div className="library-summary">
        <div>
          <span className="library-stat-icon blue">
            <BookOpen size={20} />
          </span>
          <strong>
            {marks.words.length.toLocaleString(
              lang === "fa" ? "fa-IR" : "en-US",
            )}
          </strong>
          <small>{t("لغت", "Words")}</small>
        </div>
        <div>
          <span className="library-stat-icon amber">
            <Lightbulb size={20} />
          </span>
          <strong>
            {marks.grammar.length.toLocaleString(
              lang === "fa" ? "fa-IR" : "en-US",
            )}
          </strong>
          <small>{t("نکته", "Notes")}</small>
        </div>
        <div>
          <span className="library-stat-icon violet">
            <Bookmark size={20} />
          </span>
          <strong>
            {(marks.sentences.length + marks.idioms.length).toLocaleString(
              lang === "fa" ? "fa-IR" : "en-US",
            )}
          </strong>
          <small>{t("جمله و اصطلاح", "Phrases")}</small>
        </div>
      </div>
      <div className="offline-banner">
        <span>
          <CloudDownload size={23} />
        </span>
        <div>
          <strong>
            {ready
              ? t(
                  "بستهٔ آهنگ نمونه روی دستگاهته",
                  "The demo song pack is on your device",
                )
              : t("هنوز آهنگی دانلود نکردی", "No songs downloaded yet")}{" "}
          </strong>
          <p>
            {ready
              ? t(
                  "فایل صوتی و آموزش‌ها ذخیره شده‌اند و از کتابخانه قابل دسترسی‌اند.",
                  "The audio and lesson pack are saved locally in this browser.",
                )
              : t(
                  "برای دسترسی به پلیر و آموزش‌ها، اول بستهٔ آهنگ نمونه رو دانلود کن.",
                  "Download the demo pack to unlock its player and learning tools.",
                )}
          </p>
        </div>
        <button type="button" onClick={() => navigate("song", DEMO_ID)}>
          {ready ? t("باز کردن", "Open") : t("دانلود", "Download")}
          <Forward lang={lang} size={16} />
        </button>
      </div>
      <SectionTitle
        eyebrow={t("نشان‌شده‌ها", "BOOKMARKS")}
        title={t("مجموعهٔ من", "My collection")}
        lang={lang}
      />
      <div
        className="filter-list library-filters"
        role="group"
        aria-label={t("فیلتر نشان‌شده‌ها", "Saved items filters")}
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`filter-button ${filter === item.id ? "active" : ""}`}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {t(item.fa, item.en)}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="saved-grid">
          {visible.map((item) => (
            <button
              type="button"
              key={item.id}
              className="saved-card"
              onClick={() =>
                navigate(
                  "song",
                  item.songId || DEMO_ID,
                  item.type === "grammar"
                    ? "grammar"
                    : item.type === "words"
                      ? "words"
                      : item.type === "phrases"
                        ? "phrases"
                        : "lyrics",
                )
              }
            >
              {item.image ? (
                <img src={item.image} alt="" />
              ) : (
                <span className={`saved-type-icon ${item.type}`}>
                  {item.type === "words" ? (
                    <BookOpen size={20} />
                  ) : item.type === "grammar" ? (
                    <Lightbulb size={20} />
                  ) : (
                    <Bookmark size={20} />
                  )}
                </span>
              )}
              <div>
                <small>{item.eyebrow}</small>
                <strong
                  dir={
                    item.type === "words" ||
                    item.type === "songs" ||
                    item.type === "phrases"
                      ? "ltr"
                      : undefined
                  }
                >
                  {item.title}
                </strong>
                <span>{item.sub}</span>
              </div>
              <Forward lang={lang} size={17} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title={t("هنوز چیزی نشان نکردی", "Nothing saved here yet")}
          description={t(
            "از صفحهٔ آهنگ، لغت‌ها و نکته‌هایی که دوست داری رو نگه دار.",
            "Save words, notes or songs and they’ll show up here.",
          )}
          action={t("دیدن آهنگ نمونه", "See the demo song")}
          onAction={() => navigate("song", DEMO_ID)}
        />
      )}
    </div>
  );
}

function MiniPlayer({
  playing,
  currentTime,
  duration,
  togglePlay,
  navigate,
  lang,
  t,
}) {
  return (
    <div className="mini-player">
      <button
        type="button"
        className="mini-open"
        onClick={() => navigate("song", DEMO_ID)}
        aria-label={t("باز کردن پلیر", "Open player")}
      >
        <img src={demoSong.image} alt="" />
        <span>
          <strong dir="ltr">Midnight Avenue</strong>
          <small>
            {t("دموی اختصاصی ·", "Original demo ·")} {formatTime(currentTime)} /{" "}
            {formatTime(duration || 64)}
          </small>
        </span>
      </button>
      <button
        type="button"
        className="mini-play"
        onClick={togglePlay}
        aria-label={playing ? t("مکث", "Pause") : t("پخش", "Play")}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <span
        className="mini-progress"
        style={{ width: `${(currentTime / (duration || 64)) * 100}%` }}
      />
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useStoredState("reedance-language", "fa");
  const [theme, setTheme] = useStoredState("reedance-theme-v1", "light");
  const [fontSize, setFontSize] = useStoredState(
    "reedance-font-size-v1",
    "normal",
  );
  const [reduceMotion, setReduceMotion] = useStoredState(
    "reedance-reduce-motion-v1",
    false,
  );
  const [rating, setRating] = useStoredState("reedance-local-rating-v1", 0);
  const [marks, setMarks] = useStoredState("reedance-marks-v2", initialMarks);
  const [cards, setCards] = useStoredState("reedance-leitner-v2", {});
  const [lastQuizResult, setLastQuizResult] = useStoredState(
    "reedance-quiz-result-v1",
    null,
  );
  const [starterLanguage, setStarterLanguage] = useStoredState(
    "reedance-starter-language-v1",
    "en",
  );
  const [starterProgress, setStarterProgress] = useStoredState(
    "reedance-starter-progress-v1",
    {},
  );
  const [page, setPage] = useState("home");
  const [quizSession, setQuizSession] = useState(null);
  const [songId, setSongId] = useState(DEMO_ID);
  const [songTab, setSongTab] = useState("lyrics");
  const [status, setStatus] = useState("checking");
  const [progress, setProgress] = useState(0);
  const [lesson, setLesson] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [finishedSong, setFinishedSong] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(64);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [toast, setToast] = useState("");
  const [navCondensed, setNavCondensed] = useState(false);
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const t = (fa, en) => (lang === "fa" ? fa : en);

  useEffect(() => releaseSplash(), []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);
  useEffect(() => {
    const preference = ["light", "dark", "system"].includes(theme)
      ? theme
      : "light";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const dark =
        preference === "dark" ||
        (preference === "system" && systemDark.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#0d1728" : "#f6f9fe");
    };
    update();
    systemDark.addEventListener("change", update);
    return () => systemDark.removeEventListener("change", update);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.fontSize = [
      "normal",
      "large",
      "xlarge",
    ].includes(fontSize)
      ? fontSize
      : "normal";
  }, [fontSize]);
  useEffect(() => {
    document.documentElement.dataset.reduceMotion =
      reduceMotion === true ? "true" : "false";
  }, [reduceMotion]);
  useEffect(() => {
    if (page === "song" || page === "quiz") {
      setNavCondensed(false);
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setNavCondensed((compact) => window.scrollY > (compact ? 44 : 92));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [page]);
  useEffect(() => {
    let active = true;
    getDownloadedPack()
      .then((pack) => {
        if (!active) return;
        if (pack) activatePack(pack);
        else setStatus("locked");
      })
      .catch(() => {
        if (active) setStatus("locked");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function activatePack(pack) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(pack.audio);
    objectUrlRef.current = url;
    setAudioUrl(url);
    setLesson(enrichDemoLesson(pack.lesson));
    setStatus("ready");
  }

  function navigate(destination, id, tab = "lyrics") {
    if (destination === "song" && id) {
      setSongId(id);
      setSongTab(tab);
    }
    if (destination !== "quiz") setQuizSession(null);
    setSelectedWord(null);
    setPage(destination);
    // Reveal the next view at its top, rather than playing its entrance
    // animation while the previous page is still scrolling away.
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function enterQuiz(kind, questions, returnTab = "lyrics") {
    if (status !== "ready" || !lesson || !questions.length) {
      navigate("song", DEMO_ID);
      return;
    }
    // Questions have their own screen: pause the track instead of hiding a
    // player that would continue playing invisibly behind the exercise.
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setToast("");
    setSelectedWord(null);
    setQuizSession({ kind, questions, returnTab });
    setPage("quiz");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openSongQuiz(returnTab = "lyrics") {
    enterQuiz("song", demoQuiz.questions, returnTab);
  }

  function openReviewQuiz(words) {
    if (!words?.length || !lesson) return;
    enterQuiz("review", buildDailyQuestions(words, lesson));
  }

  function exitQuiz() {
    if (quizSession?.kind === "review") navigate("leitner");
    else navigate("song", DEMO_ID, quizSession?.returnTab || "lyrics");
  }

  async function download() {
    if (status === "downloading" || status === "checking") return;
    setStatus("downloading");
    setProgress(0);
    try {
      const started = Date.now();
      const pack = await downloadDemoPack(setProgress);
      // Keep the transition legible even when the local asset downloads instantly.
      await new Promise((resolve) =>
        window.setTimeout(resolve, Math.max(0, 650 - (Date.now() - started))),
      );
      activatePack(pack);
      setToast(
        t(
          "بستهٔ آهنگ آماده‌ست. حالا می‌تونی گوش بدی و یاد بگیری.",
          "Song pack ready. You can listen and learn now.",
        ),
      );
    } catch {
      setStatus("locked");
      setToast(
        t(
          "دانلود انجام نشد؛ دوباره تلاش کن.",
          "Download failed. Please try again.",
        ),
      );
    }
  }

  function isMarked(type, id) {
    return marks[type]?.includes(id) || false;
  }

  function toggleMark(type, id) {
    const saved = isMarked(type, id);
    setMarks((current) => ({
      ...current,
      [type]: saved
        ? current[type].filter((item) => item !== id)
        : [...current[type], id],
    }));
    if (type === "words")
      setCards((current) => {
        const updated = { ...current };
        if (saved) delete updated[id];
        else updated[id] = { stage: 1, due: Date.now() };
        return updated;
      });
    setToast(
      saved
        ? t("از نشان‌شده‌ها برداشته شد.", "Removed from saved items.")
        : t(
            type === "words"
              ? "به جعبهٔ لایتنر اضافه شد."
              : "به کتابخانه اضافه شد.",
            type === "words"
              ? "Added to your Leitner box."
              : "Saved to your library.",
          ),
    );
  }

  function completeSongQuiz(result) {
    const missed = missedQuizWords(
      result.answers,
      demoQuiz.questions,
      lesson?.vocabulary,
    );
    setLastQuizResult(result);
    if (!missed.length) return;
    const now = Date.now();
    setMarks((current) => ({
      ...current,
      words: [...new Set([...(current.words || []), ...missed])],
    }));
    setCards((current) => queueMissedCards(current, missed, now));
  }

  function review(word, remembered, showToast = true) {
    setCards((current) => {
      const card = current[word];
      if (!card) return current;
      return { ...current, [word]: scheduleReviewCard(card, remembered) };
    });
    if (showToast)
      setToast(
        remembered
          ? t(
              "عالیه! این واژه یک خانه جلو رفت.",
              "Nice! This word moved to the next box.",
            )
          : t(
              "اشکالی نداره؛ این واژه دوباره برمی‌گرده.",
              "No worries. This word will come back soon.",
            ),
      );
  }

  function openWord(token, line) {
    setSelectedWord({ token, line });
  }
  function speak(word, locale = "en-US") {
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setToast(
        t(
          "مرورگر امکان پخش تلفظ ندارد.",
          "Pronunciation is not available in this browser.",
        ),
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = window.speechSynthesis.getVoices();
    const requested = locale.toLowerCase();
    const voice =
      voices.find((item) => item.lang.toLowerCase() === requested) ||
      voices.find((item) =>
        item.lang.toLowerCase().startsWith(requested.slice(0, 2)),
      );
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || locale;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  async function togglePlay() {
    if (status !== "ready") {
      navigate("song", DEMO_ID);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setHasStartedPlayback(true);
      } catch {
        setToast(
          t(
            "پخش صدا در این مرورگر ممکن نشد.",
            "Audio playback could not start.",
          ),
        );
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }
  function seek(time) {
    if (audioRef.current && status === "ready") {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  }
  function skip(seconds) {
    seek(currentTime + seconds);
  }

  const currentSong = songs.find((song) => song.id === songId) || demoSong;
  const isSongPage = page === "song";
  const isQuizPage = page === "quiz";
  const isImmersivePage = isSongPage || isQuizPage;
  const showMiniPlayer =
    !isImmersivePage && status === "ready" && hasStartedPlayback;
  return (
    <div
      className={`app-shell ${showMiniPlayer ? "has-mini-player" : ""} ${isSongPage ? "song-layout" : ""} ${isQuizPage ? "quiz-layout" : ""} ${navCondensed && !isImmersivePage ? "nav-condensed" : ""}`}
    >
      {!isImmersivePage && (
        <AppNavigation page={page} navigate={navigate} lang={lang} t={t} />
      )}
      <main className="main-area">
        <div className="main-inner">
          {!isImmersivePage && (
            <Topbar
              lang={lang}
              setLang={setLang}
              navigate={navigate}
              page={page}
              t={t}
            />
          )}
          {page === "home" && (
            <HomePage
              lang={lang}
              t={t}
              navigate={navigate}
              ready={status === "ready"}
            />
          )}
          {page === "explore" && (
            <ExplorePage lang={lang} t={t} navigate={navigate} />
          )}
          {page === "starter" && (
            <StarterPage
              lang={lang}
              t={t}
              navigate={navigate}
              language={starterLanguage}
              setLanguage={setStarterLanguage}
              progress={starterProgress}
              setProgress={setStarterProgress}
              onSpeak={speak}
            />
          )}
          {page === "song" && (
            <SongPage
              key={currentSong.id}
              song={currentSong}
              initialTab={songTab}
              lang={lang}
              t={t}
              navigate={navigate}
              status={status}
              progress={progress}
              download={download}
              lesson={lesson}
              playing={playing}
              currentTime={currentTime}
              duration={duration}
              loop={loop}
              muted={muted}
              togglePlay={togglePlay}
              skip={skip}
              seek={seek}
              setLoop={setLoop}
              setMuted={setMuted}
              marks={marks}
              onMark={toggleMark}
              onWord={openWord}
              onSpeak={speak}
              onOpenQuiz={openSongQuiz}
              finishedSong={finishedSong}
            />
          )}
          {page === "quiz" && status === "ready" && lesson && quizSession && (
            <QuizPage
              session={quizSession}
              vocabulary={lesson.vocabulary}
              lastResult={lastQuizResult}
              lang={lang}
              t={t}
              onExit={exitQuiz}
              onSpeak={speak}
              onGrade={
                quizSession.kind === "review"
                  ? (question, grade) =>
                      review(question.wordIds[0], grade.correct, false)
                  : undefined
              }
              onComplete={
                quizSession.kind === "song" ? completeSongQuiz : undefined
              }
              onReview={() => navigate("leitner")}
            />
          )}
          {page === "leitner" && (
            <LeitnerPage
              cards={cards}
              lesson={lesson}
              review={review}
              lang={lang}
              t={t}
              navigate={navigate}
              onOpenReview={openReviewQuiz}
            />
          )}
          {page === "library" && (
            <LibraryPage
              marks={marks}
              lesson={lesson}
              ready={status === "ready"}
              navigate={navigate}
              onSpeak={speak}
              lang={lang}
              t={t}
            />
          )}
          {page === "profile" && (
            <ProfilePage
              lang={lang}
              t={t}
              navigate={navigate}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
              fontSize={fontSize}
              setFontSize={setFontSize}
              reduceMotion={reduceMotion === true}
              setReduceMotion={setReduceMotion}
              rating={rating}
              setRating={setRating}
              savedWords={marks?.words?.length || 0}
              hasDemo={status === "ready"}
              onToast={setToast}
            />
          )}
          {!isQuizPage && (
            <footer className="hydro-credit" dir="ltr">
              <button type="button" onClick={() => navigate("profile")}>
                developed with ❤️ by HYDRO team
              </button>
            </footer>
          )}
        </div>
      </main>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="metadata"
        loop={loop}
        muted={muted}
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 64)
        }
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onEnded={() => {
          setPlaying(false);
          setFinishedSong(true);
          setToast(
            t(
              "آهنگ تموم شد؛ آزمون ۵ سؤالی منتظرته.",
              "Track finished — your 5-question quiz is ready.",
            ),
          );
        }}
      />
      {showMiniPlayer && (
        <MiniPlayer
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          togglePlay={togglePlay}
          navigate={navigate}
          lang={lang}
          t={t}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      <WordSheet
        selected={selectedWord}
        lesson={lesson}
        close={() => setSelectedWord(null)}
        isMarked={isMarked}
        onMark={toggleMark}
        onSpeak={speak}
        locale={songLanguages[currentSong.language]?.locale || "en-US"}
        lang={lang}
        t={t}
      />
    </div>
  );
}
