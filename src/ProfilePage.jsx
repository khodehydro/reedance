import React, { useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  Computer,
  Copy,
  Crown,
  Info,
  Languages,
  Library,
  LockKeyhole,
  Moon,
  Settings,
  Share,
  Star,
  Sun,
  TextSize,
  User,
} from "./icons.jsx";

const appearanceModes = [
  { id: "light", fa: "روشن", en: "Light", icon: Sun },
  { id: "dark", fa: "تاریک", en: "Dark", icon: Moon },
  { id: "system", fa: "دستگاه", en: "System", icon: Computer },
];
const fontSizes = [
  { id: "normal", fa: "عادی", en: "Default" },
  { id: "large", fa: "خواناتر", en: "Larger" },
  { id: "xlarge", fa: "درشت", en: "Largest" },
];

export default function ProfilePage({
  lang,
  t,
  navigate,
  setLang,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  reduceMotion,
  setReduceMotion,
  rating,
  setRating,
  savedWords,
  hasDemo,
  onToast,
}) {
  const subscriptionRef = useRef(null);
  const aboutRef = useRef(null);
  const ratingRef = useRef(null);
  const shareInputRef = useRef(null);
  const Forward = lang === "fa" ? ArrowLeft : ArrowRight;
  const previewUrl = `${window.location.origin}${window.location.pathname}`;

  function goTo(ref) {
    ref.current?.scrollIntoView({
      behavior:
        reduceMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      block: "start",
    });
    ref.current?.focus({ preventScroll: true });
  }

  function selectShareLink() {
    shareInputRef.current?.focus();
    shareInputRef.current?.select();
    onToast(
      t(
        "لینک را از کادر انتخاب‌شده کپی کن.",
        "Select and copy the link from the field.",
      ),
    );
  }

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("No clipboard access");
      await navigator.clipboard.writeText(previewUrl);
      onToast(t("لینک پیش‌نمایش کپی شد.", "Preview link copied."));
    } catch {
      selectShareLink();
    }
  }

  async function sharePreview() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Reedance",
          text: t(
            "ری‌دنس؛ یادگیری زبان با موسیقی (پیش‌نمایش رابط)",
            "Reedance · learn languages through music (UI preview)",
          ),
          url: previewUrl,
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
        // Some browsers expose share() but cannot share this URL. Copy instead.
      }
    }
    await copyLink();
  }

  const shortcuts = [
    {
      icon: Crown,
      titleFa: "خرید اشتراک",
      titleEn: "Membership",
      detailFa: "طرح‌ها را ببین",
      detailEn: "Explore plans",
      className: "subscription",
      action: () => goTo(subscriptionRef),
    },
    {
      icon: Info,
      titleFa: "دربارهٔ برنامه",
      titleEn: "About Reedance",
      detailFa: "داستان و منابع",
      detailEn: "Story & credits",
      className: "about",
      action: () => goTo(aboutRef),
    },
    {
      icon: Share,
      titleFa: "ارسال به دیگران",
      titleEn: "Share the app",
      detailFa: "لینک همین پیش‌نمایش",
      detailEn: "Share this preview",
      className: "share",
      action: sharePreview,
    },
    {
      icon: Star,
      titleFa: "امتیاز دادن",
      titleEn: "Rate the preview",
      detailFa: "بازخورد محلی",
      detailEn: "Local feedback",
      className: "rating",
      action: () => goTo(ratingRef),
    },
  ];

  return (
    <div className="page-content page-appear profile-page">
      <div className="page-heading profile-heading">
        <span className="heading-eyebrow">
          <span /> {t("فضای شخصی تو", "YOUR LISTENING SPACE")}
        </span>
        <h1>{t("اینجا، ریتم مال توئه.", "Make it your own.")}</h1>
        <p>
          {t(
            "ظاهر برنامه را تنظیم کن، مسیر یادگیری‌ات را ببین و با ری‌دنس بیشتر آشنا شو.",
            "Set your listening mood, revisit your progress and get to know Reedance.",
          )}
        </p>
      </div>

      <section
        className="profile-hero"
        aria-label={t("پروفایل من", "My profile")}
      >
        <div className="profile-hero-copy">
          <span className="profile-hero-eyebrow">
            <User size={17} />{" "}
            {t("فضای من · حالت مهمان", "MY SPACE · GUEST MODE")}
          </span>
          <h2>{t("آهنگ تو، مسیر تو.", "Your music. Your way.")}</h2>
          <p>
            {t(
              "فعلاً حساب کاربری نداریم؛ پیشرفت و تنظیمات همین‌جا، در مرورگر تو می‌مانند.",
              "No account is needed for this preview. Your progress and preferences stay in this browser.",
            )}
          </p>
          <div className="profile-hero-stats">
            <span>
              <strong>
                {savedWords.toLocaleString(lang === "fa" ? "fa-IR" : "en-US")}
              </strong>
              {t("واژهٔ ذخیره‌شده", "saved words")}
            </span>
            <span>
              <strong>
                {hasDemo ? t("آماده", "Ready") : t("هنوز نه", "Not yet")}
              </strong>
              {t("بستهٔ آهنگ دمو", "demo song pack")}
            </span>
          </div>
          <button
            type="button"
            className="profile-library-link"
            onClick={() => navigate("library")}
          >
            <Library size={17} /> {t("دیدن کتابخانه‌ام", "Open my library")}
            <Forward size={16} />
          </button>
        </div>
        <div className="profile-hero-art" aria-hidden="true">
          <div className="profile-record">
            <div className="profile-record-label">
              <AudioLines size={36} />
            </div>
          </div>
          <span className="profile-floating-note">REEDANCE / MY MIX</span>
        </div>
      </section>

      <div className="profile-dashboard">
        <section
          className="profile-quick-section"
          aria-label={t("میان‌برها", "Shortcuts")}
        >
          <div className="profile-section-heading">
            <span>{t("فضای تو", "YOUR SPACE")}</span>
            <h2>{t("هر چیزی یک قدم دورتر", "Everything close by")}</h2>
          </div>
          <div className="profile-shortcuts">
            {shortcuts.map(
              ({
                icon: Icon,
                titleFa,
                titleEn,
                detailFa,
                detailEn,
                className,
                action,
              }) => (
                <button
                  type="button"
                  className={`profile-shortcut ${className}`}
                  key={className}
                  onClick={action}
                >
                  <span className="profile-shortcut-icon">
                    <Icon size={23} />
                  </span>
                  <strong>{t(titleFa, titleEn)}</strong>
                  <small>{t(detailFa, detailEn)}</small>
                  <Forward size={16} />
                </button>
              ),
            )}
          </div>
        </section>

        <section
          className="profile-settings"
          aria-labelledby="profile-settings-heading"
        >
          <div className="profile-section-heading">
            <span>{t("سلیقهٔ تو", "YOUR PREFERENCES")}</span>
            <h2 id="profile-settings-heading">
              {t("تنظیمات نمایش", "Display settings")}
            </h2>
          </div>
          <div className="profile-settings-card">
            <div className="profile-setting">
              <div className="profile-setting-title">
                <span className="profile-setting-icon">
                  <Sun size={19} />
                </span>
                <div>
                  <strong>{t("حالت نمایش", "Appearance")}</strong>
                  <small>
                    {t(
                      "روشن، تاریک یا مطابق دستگاه",
                      "Light, dark or follow your device",
                    )}
                  </small>
                </div>
              </div>
              <div
                className="profile-choice-row"
                role="group"
                aria-label={t("حالت نمایش", "Appearance")}
              >
                {appearanceModes.map(({ id, fa, en, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    className={theme === id ? "selected" : ""}
                    aria-pressed={theme === id}
                    onClick={() => setTheme(id)}
                  >
                    <Icon size={16} /> {t(fa, en)}
                  </button>
                ))}
              </div>
            </div>
            <div className="profile-setting">
              <div className="profile-setting-title">
                <span className="profile-setting-icon">
                  <TextSize size={19} />
                </span>
                <div>
                  <strong>{t("اندازهٔ نوشته‌ها", "Text size")}</strong>
                  <small>
                    {t(
                      "برای خواندن راحت‌تر لیریک و درس‌ها",
                      "Easier reading across songs and lessons",
                    )}
                  </small>
                </div>
              </div>
              <div
                className="profile-choice-row profile-size-options"
                role="group"
                aria-label={t("اندازهٔ نوشته‌ها", "Text size")}
              >
                {fontSizes.map(({ id, fa, en }) => (
                  <button
                    type="button"
                    key={id}
                    className={fontSize === id ? "selected" : ""}
                    aria-pressed={fontSize === id}
                    onClick={() => setFontSize(id)}
                  >
                    {t(fa, en)}
                  </button>
                ))}
              </div>
            </div>
            <div className="profile-setting profile-setting-inline">
              <div className="profile-setting-title">
                <span className="profile-setting-icon">
                  <Languages size={19} />
                </span>
                <div>
                  <strong>{t("زبان رابط", "Interface language")}</strong>
                  <small>{t("فارسی یا انگلیسی", "Persian or English")}</small>
                </div>
              </div>
              <button
                type="button"
                className="profile-inline-button"
                onClick={() => setLang(lang === "fa" ? "en" : "fa")}
                aria-label={t("تغییر زبان به انگلیسی", "Switch to Persian")}
              >
                {lang === "fa" ? "English" : "فارسی"} <Forward size={14} />
              </button>
            </div>
            <div className="profile-setting profile-setting-inline">
              <div className="profile-setting-title">
                <span className="profile-setting-icon">
                  <Settings size={19} />
                </span>
                <div>
                  <strong>{t("حرکت کمتر", "Reduce motion")}</strong>
                  <small>
                    {t(
                      "انیمیشن‌ها را خاموش کن",
                      "Turn off interface animations",
                    )}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className={`profile-switch ${reduceMotion ? "on" : ""}`}
                role="switch"
                aria-checked={reduceMotion}
                aria-label={t("حرکت کمتر", "Reduce motion")}
                onClick={() => setReduceMotion(!reduceMotion)}
              >
                <span />
              </button>
            </div>
          </div>
          <p className="profile-settings-note">
            {t(
              "تنظیمات روی همین مرورگر ذخیره می‌شوند و به دستگاه دیگری منتقل نمی‌شوند.",
              "Preferences are saved in this browser only and do not sync across devices.",
            )}
          </p>
        </section>
      </div>

      <section
        className="profile-plans profile-section"
        ref={subscriptionRef}
        tabIndex={-1}
        aria-labelledby="profile-plans-heading"
      >
        <div className="profile-section-heading">
          <span>{t("ری‌دنس بیشتر", "MORE REEDANCE")}</span>
          <h2 id="profile-plans-heading">
            {t("اشتراک‌ها؛ فعلاً در حد یک ایده", "Memberships · coming later")}
          </h2>
          <p>
            {t(
              "صفحهٔ خرید فقط طرح رابط است؛ هیچ پرداخت یا محتوای پولیِ فعالی در این نسخه وجود ندارد.",
              "This is a UI concept. Payments and paid content are not available in this preview.",
            )}
          </p>
        </div>
        <div className="profile-plan-grid">
          <div className="profile-plan profile-plan-free">
            <span className="profile-plan-kicker">
              <BookOpen size={17} /> {t("نسخهٔ نمایشی", "THE PREVIEW")}
            </span>
            <h3>{t("رایگان شروع کن", "Start for free")}</h3>
            <p>
              {t(
                "استارتر سه‌زبانه و دموی مستقل قابل‌دانلود، همین حالا در دسترس‌اند.",
                "Explore the three-language starter and download the original demo song.",
              )}
            </p>
            <span className="profile-plan-status">
              <Check size={16} /> {t("همین حالا قابل تجربه", "Available now")}
            </span>
          </div>
          <div className="profile-plan profile-plan-plus">
            <span className="profile-plan-kicker">
              <Crown size={17} /> REEDANCE PLUS
            </span>
            <h3>{t("بیشتر یاد بگیر، بعداً", "More to learn, later")}</h3>
            <p>
              {t(
                "جایگاه طرح اشتراک آینده اینجاست؛ قیمت، خرید و محتوای دارای مجوز هنوز تعیین یا فعال نشده‌اند.",
                "A future membership concept. Pricing, purchases and licensed songs have not been set up.",
              )}
            </p>
            <button type="button" disabled>
              <LockKeyhole size={16} />{" "}
              {t("خرید اشتراک · به‌زودی", "Purchase · not available yet")}
            </button>
          </div>
        </div>
      </section>

      <div className="profile-bottom-grid">
        <section
          className="profile-rating profile-section"
          ref={ratingRef}
          tabIndex={-1}
          aria-labelledby="profile-rating-heading"
        >
          <div className="profile-section-heading">
            <span>{t("نظرت برای ما مهمه", "YOUR THOUGHTS")}</span>
            <h2 id="profile-rating-heading">
              {t("به این پیش‌نمایش امتیاز بده", "Rate this preview")}
            </h2>
          </div>
          <div className="profile-rating-card">
            <span className="profile-rating-icon">
              <Star size={24} />
            </span>
            <p>
              {t(
                "تجربه‌ات از طراحی ری‌دنس چطور بود؟",
                "How did the Reedance design feel to you?",
              )}
            </p>
            <div
              className="profile-stars"
              role="group"
              aria-label={t("امتیاز از پنج ستاره", "Rating out of five stars")}
              dir="ltr"
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  className={score <= rating ? "selected" : ""}
                  aria-pressed={rating === score}
                  aria-label={t(
                    `${score.toLocaleString("fa-IR")} ستاره`,
                    `${score} stars`,
                  )}
                  onClick={() => {
                    setRating(score);
                    onToast(
                      t(
                        "امتیازت در همین مرورگر ذخیره شد.",
                        "Rating saved in this browser.",
                      ),
                    );
                  }}
                >
                  <Star size={24} />
                </button>
              ))}
            </div>
            <small role="status">
              {rating
                ? t("ممنون! امتیاز محلی ثبت شد.", "Thanks! Saved locally.")
                : t("یک تا پنج ستاره انتخاب کن.", "Choose one to five stars.")}
            </small>
            <p className="profile-clarification">
              {t(
                "این امتیاز فقط در همین مرورگر می‌ماند؛ به فروشگاه یا تیم سازنده ارسال نمی‌شود.",
                "This rating stays in this browser; it is not sent to an app store or the team.",
              )}
            </p>
          </div>
        </section>

        <section
          className="profile-share profile-section"
          aria-labelledby="profile-share-heading"
        >
          <div className="profile-section-heading">
            <span>{t("یک آهنگ، یک دوست", "PASS IT ON")}</span>
            <h2 id="profile-share-heading">
              {t("ری‌دنس رو معرفی کن", "Share Reedance")}
            </h2>
          </div>
          <div className="profile-share-card">
            <span className="profile-share-icon">
              <Share size={23} />
            </span>
            <p>
              {t(
                "لینک پیش‌نمایش را برای دوستت بفرست.",
                "Send a friend the link to this preview.",
              )}
            </p>
            <div className="profile-share-link" dir="ltr">
              <input
                ref={shareInputRef}
                type="text"
                value={previewUrl}
                readOnly
                aria-label={t("لینک پیش‌نمایش", "Preview link")}
                onFocus={(event) => event.target.select()}
              />
              <button
                type="button"
                onClick={copyLink}
                aria-label={t("کپی کردن لینک", "Copy link")}
              >
                <Copy size={17} />
              </button>
            </div>
            <button
              type="button"
              className="profile-share-button"
              onClick={sharePreview}
            >
              <Share size={17} /> {t("ارسال پیش‌نمایش", "Share preview")}
            </button>
            <small>
              {t(
                "این لینک موقتی است و فقط تا وقتی پیش‌نمایش اجرا می‌شود کار می‌کند.",
                "This temporary link works only while the preview is running.",
              )}
            </small>
          </div>
        </section>
      </div>

      <section
        className="profile-about profile-section"
        ref={aboutRef}
        tabIndex={-1}
        aria-labelledby="profile-about-heading"
      >
        <div className="profile-section-heading">
          <span>{t("پشت صحنه", "BEHIND THE MUSIC")}</span>
          <h2 id="profile-about-heading">
            {t("دربارهٔ ری‌دنس", "About Reedance")}
          </h2>
        </div>
        <div className="profile-about-card">
          <div className="profile-about-brand">
            <AudioLines size={25} />
            <strong>REEDANCE</strong>
          </div>
          <p>
            {t(
              "ری‌دنس یک نمونهٔ فرانت‌اند برای یادگیری زبان از راه موسیقی است؛ استارتر، پلیر، ترجمهٔ تعاملی و لایتنر را کنار هم می‌آورد. موسیقی دموی مستقل است و آهنگ‌های شناخته‌شده فقط پیش‌نمایش کاتالوگ‌اند.",
              "Reedance is a frontend concept for learning languages through music. It brings together a starter path, player, interactive lyrics and Leitner review. Only the original demo is playable; well-known songs are catalog previews.",
            )}
          </p>
          <div className="profile-credits">
            <div>
              <span>{t("ساخته‌شده با ♥ توسط", "Made with ♥ by")}</span>
              <strong>HYDRO team</strong>
            </div>
            <div>
              <span>{t("اعتبار آیکن‌ها", "Icon attribution")}</span>
              <a
                href="https://www.flaticon.com/uicons"
                target="_blank"
                rel="noopener noreferrer"
              >
                Uicons by Flaticon <Forward size={14} />
              </a>
            </div>
          </div>
          <p className="profile-about-footnote">
            {t(
              "آیکن‌ها از بستهٔ رسمی Flaticon Uicons با سبک Regular Rounded هستند؛ اطلاعات مجوز و همهٔ پیوندها در README ریپازیتوری گردآوری شده‌اند.",
              "Icons use the official Flaticon Uicons Regular Rounded pack. Licensing and source links are collected in the repository README.",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
