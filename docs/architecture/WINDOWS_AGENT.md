# دستور کار ایجنت ویندوز — Reedance Content Studio

**ماموریت:** برنامهٔ نصب‌شدنیِ Windows با Electron بساز که **JSON خامِ فقط محتواییِ تولیدشده از متن آهنگ** را وارد کند؛ مدیر **فایل صوتی را خودش از سیستم انتخاب کند**، لیریک‌ها را **در تایم‌لاین اختصاصی با waveform، سطر به سطر به صوت سینک کند** و همهٔ بخش‌ها/جداول/آزمون‌ها را ویرایش و بازبینی کند؛ برنامه فقط پس از تکمیل سینک و تأیید، **یک بستهٔ رمزنگاری‌شدهٔ صوت+محتوای زمان‌دار** و manifest امضاشده صادر کند؛ خروجی‌ها و آمار تجمیعی را به تفکیک زبان مقصد مدیریت کند. این سند را همراه با [مرجع معماری](README.md)، [قرارداد هنجاری v1](PACKAGE_V1.md) و [`contracts/v1`](../../contracts/v1/) بخوان. `src/` پروتوتایپ وب است، ویرایشگر محتوای آماده نیست. **در این مرحله ادعای وجود محصول ویندوزی نکن.**

## مرز کار و انتخاب فنی

- مالک کد `desktop/` و، با هماهنگی ایجنت محتوا، `tools/content-cli/`. کد اندروید را دست‌کاری نکن؛ schemaها، fixture و تست مشترک را با هر دو ایجنت تغییر بده.
- Electron + TypeScript؛ renderer می‌تواند React/TS باشد تا ظاهر پروتوتایپ الهام بگیرد، اما فایل/SQLite/کلید/رمزنگاری/امضا/شبکه فقط در **main process** و سرویس‌های محدود انجام شوند. `preload` فقط IPC تایپ‌شدهٔ allowlist را به `contextBridge` بدهد. React وب را مستقیم «CMS موجود» معرفی نکن.
- `contextIsolation: true`، `nodeIntegration: false`، `sandbox: true`، `webSecurity: true`، CSP سخت‌گیرانه (بدون `unsafe-eval`/script از اینترنت)، بدون WebView یا remote content؛ رشته‌های raw JSON متن ساده باشند، HTML اجرا نشود. فایل صوتی فقط با file picker محلیِ امن انتخاب و در main process کپی/بررسی شود؛ preview صوت بزرگ با پروتکل محلی allowlist و stream محدود، نه خواندن مسیر arbitrary در renderer. برای کاور Blob یا پروتکل محلی امن با سقف حجم. IPC schema validation + محدودسازی طول/انواع/مسیرها، SQL parameterized و dialogهای محدود.
- SQLite محلی (مثلاً `better-sqlite3` با build native مخصوص نسخهٔ Electron و migration نسخه‌دار) برای کتابخانه و گزارش؛ فایل‌های صوت/نسخه‌ها در پوشهٔ بایگانیِ انتخاب‌شدهٔ کاربر، نه BLOB در DB. رمزهای تولید در بستهٔ installer، مخزن، DB بدون حفاظت، crash log یا کاتالوگ قرار نگیرند.

### ساختار پیشنهادی

```text
desktop/
  src/main/{ipc,db,import,validation,project,media,timeline,export,signing,publication,stats}/
  src/preload/
  src/renderer/{library,editor,waveform,timeline,review,statistics,settings}/
  tests/{contract,raw-import,media,timeline,export,stats,security}/
  build/                      # خروجی تولیدی؛ به Git نرود
contracts/v1/                   # مشترک، فقط با هماهنگی
```

## چرخهٔ کار اپراتور (UI و وضعیت‌ها)

1. **کتابخانه:** جست‌وجو/فیلتر زبان مقصد `en/es/ko`، فهرست آهنگ‌ها و **تمام نسخه‌ها/فایل‌های خروجی**؛ نام، `songId`، title، نسخه/هش/حجم/تاریخ، وضعیت پروژه `raw-imported / audio-selected / sync-incomplete / review-ready / approved` و وضعیت فایل `exported / published / superseded / missing`، URL manifest و خطای فایل گمشده. «همهٔ نسخه‌ها» را با «آخرین منتشرشده» اشتباه نگیر. دکمهٔ اسکن مجدد مسیر بایگانی و بازسازی ایندکس از manifest+pack معتبر، با گزارش فایل یتیم/مفقود.
2. **ورود فایل خام:** `File > Import *.rddraft.json` یا ساخت پروژهٔ محتوایی خالی. UTF-8/سقف ۴ MiB/کلیدهای تکراری/JSON Schema draft 2020-12 و قواعد معنایی [PACKAGE_V1](PACKAGE_V1.md) را بررسی کن؛ برای `$ref`های شمای draft، `lesson.schema.json` محلی را با ID `urn:reedance:lesson:v1` ثبت کن. سطرها **بی‌زمان** هستند و فایل نباید `media`، صوت، Base64، URL رسانه یا `startMs/endMs` داشته باشد. `draft.sources` فقط ادعای منبع lyrics/lesson است؛ فایل را به‌عنوان کد یا ZIP اجرا/باز نکن. همهٔ لغات/جداول/سؤال‌ها بدون انتخاب صوت باید قابل دیدن/ویرایش باشند؛ خطاها با مسیر دقیق (`lyrics[4].tokens[2]`) گزارش و snapshot خام با hash ذخیره شود. واردکردن معتبر = `raw-imported`، **نه مجوز export**.
3. **انتخاب صوت از سیستم توسط مدیر:** دکمهٔ «انتخاب فایل آهنگ» با file picker بومی برای MP3/M4A/WAV؛ فایل صوتی اصلاً در raw draft نیست. main process فایل مبدأ را با محدودهٔ اندازه/فرمت/codec/مدت و hash تأیید و در پوشهٔ پروژه به‌صورت immutable کپی کند؛ حذف یا تعویض فایل مبدأ پس از import نباید صدای پروژه را عوض کند. `audioPath`/source hash/codec/duration/حقوق و attribution را فقط در DB پروژه نگه دار؛ در خروجی نهایی bytes با نام استاندارد `audio.*` قرار می‌گیرند. کاور اختیاری نیز همین‌جا از سیستم انتخاب و بررسی شود. تعویض صوت پس از سینک، تمام markها را `needs-review` و approval پیشین را باطل کند؛ حتی اگر زمان‌های قبلی به‌عنوان پیشنهاد باقی بمانند.
4. **تایم‌لاین اختصاصی لیریک:** waveform/track با zoom، اسکرول، play/pause/seek، loop بخش کوتاه و playhead، فهرست سطرهای `id/text/translation` کنار آن. مدیر با «ثبت زمان سطر جاری» هنگام پخش (کلید میان‌بر)، drag نشانگر روی waveform یا ورود عددی `mm:ss.mmm`/میلی‌ثانیه، `startMs` **هر سطر** را تنظیم/بازبینی می‌کند؛ `endMs` در صورت نیاز قابل تنظیم است. همگام با پخش، سطر جاری highlight و متن/ترجمه preview شود. undo/redo و ذخیرهٔ خودکار markها/zoom برای ادامهٔ کار؛ ابزار auto-align فقط پیشنهاد و نیازمند تأیید دستی است. سطرِ بی‌زمان/خارج از مدت/زمان تکراری یا نامرتب مانع `review-ready` و export است؛ سکوتِ بین سطرها می‌تواند فاصله داشته باشد. split/merge/reorder یک سطر باید IDهای سؤال/جمله/واژهٔ وابسته و markهای مربوط را برای اصلاح نشان دهد؛ هیچ زمان و ID از روی موقعیت آرایه بی‌صدا جابه‌جا نشود.
5. **ویرایش کامل:** عنوان/credits، دو زبان متن رابط، زبان/locale/level، متن/توکن/ترجمهٔ هر سطر، واژگان با lemma/normalizedKey/IPA/خوانش فارسی/جنسیت/صرف/مثال، جدول‌های گرامر و واژه، اصطلاح، جمله، چهار نوع سؤال با جواب/توضیح و پیش‌نمایش رفتار اندروید. `grid` راحتِ سازندهٔ جدول به `columns/rows` قرارداد تبدیل شود. تغییر متن یک سطر یا ارجاع سؤال، mark همان سطر و آموزش مرتبط را `needs-review` کند؛ auto-save revisioned باشد و هر ویرایش بعد از approval دوباره آن را لغو کند.
6. **بازبینی انسانی اجباری:** چک‌لیست حقوق **صوتِ انتخاب‌شده از سیستم**/متنِ ورودی/کاور و اجازهٔ **دانلود و ذخیرهٔ آفلاین** با سند/تاریخ/تأییدکننده؛ بررسی تصویری **همهٔ markها روی تایم‌لاین با صدای واقعی**، غلط‌های آموزشی، پاسخ سؤالات، حروف/تلفظ/ترجمه و layout فارسی/اسپانیایی/کره‌ای. حالت demo صوت بی‌کلام/ساکت را فقط با برچسب روشن منتشر کنید؛ متن آن را lyricِ خوانده‌شده جلوه ندهید. مدرک حقوقی در پروژهٔ محلی نگه دارید و صرفاً ادعای ایجنت را نپذیرید. دو دکمهٔ «رد/اصلاح» و «تأیید نهایی»؛ approval به hash محتوای ویرایش‌شده + fingerprint صوت و مجموعهٔ زمان‌ها بسته باشد، نه صرفاً نام پروژه.
7. **صدور نسخه:** پیش از هر چیز از raw و تغییرات تأییدشده، `lesson.json` منتشرشده را **با هنرمند/سطح/اعتبارهای کامل، تمام `lyrics[].startMs`، `media.audio.path/mimeType/durationMs/sha256` و `credits.audio` واقعی** بساز و با schema + validator زمانی/ارجاعی بررسی کن؛ تا `audio-selected + all-lines-synced + review-ready + rights-approved` برقرار نشده دکمهٔ export غیرفعال باشد. شمارهٔ `contentVersionCode` بعد از آخرین شمارهٔ صادرشدهٔ همان آهنگ (حتی اگر منتشر نشده) رزرو و immutable شود؛ `displayVersion` فقط نمایشی. diff شناسه‌های واژه/سطر/گرامر/سؤال با نسخهٔ قبل و `idAliases` را بررسی کن. snapshot را freeze، ZIP استاندارد **فقط شامل `lesson.json` و همان صوتِ محلی و کاور اختیاری** بساز، AES-GCM (`.rdpack`) و Ed25519 (`latest.json`) را دقیقاً مطابق قرارداد اجرا کن. هر export nonce تازه؛ staging + fsync/rename و transaction/lock برای نسخه؛ hash/طول/media و بازکردن آزمایشی فایل صادرشده قبل از تحویل کنترل شود.
8. **انتشار روی هاست:** خروجی قابل انتخاب شامل فایل `.rdpack`، `latest.json`، راهنمای `manifestUrl` ثابت و چک‌لیست آپلود است. v1 می‌تواند آپلود را **دستی** بگذارد؛ اپراتور ابتدا `.rdpack` نسخه‌دار را آپلود و از راه دور هش/طول آن را stream-GET بررسی کند، بعد `latest.json` را جایگزین کند و از راه دور امضا/محتوا را بررسی کند. تنها پس از ثبت URL HTTPS واقعی و verification، «منتشرشده» شود؛ اعلان «آپلود شد» بدون رسید/آزمون غلط است. ابزار انتشار اختیاری آینده credential را در secret store نگه دارد، نه در پروژه. اگر هاست/شبکه در دسترس نیست، `exported` بماند.
9. **پشتیبان‌گیری/بازیابی:** DB با WAL checkpoint، JSON خامِ واردشده، **کپی صوتِ انتخاب‌شده و زمان‌های تایم‌لاین**، snapshotهای تأییدشده، خروجی‌های immutable، audit trail و مدارک حقوقی؛ کلید خصوصی و AES **جداگانه و رمزگذاری‌شده** backup شوند. restore روی دستگاه دوم قبل از روز انتشار تست شود؛ اگر کلید یا تاریخ نسخه‌ها گم شود، exportهای تازه ممکن است ناسازگار باشند.

## طراحی دادهٔ محلی و آمارِ دقیق

طرح پیشنهادی DB با migration و قیود FK/UNIQUE:

```text
songs(song_id PK, target_language immutable, title, artist, created_at)
projects(project_id PK, song_id FK, raw_json_path, raw_sha256, state, created_at)
project_media(project_id PK/FK, audio_copy_path, audio_sha256, mime_type,
              duration_ms, cover_copy_path NULL, imported_at)
lyric_marks(project_id FK, line_id, start_ms NULL, end_ms NULL,
            reviewed_audio_sha256 NULL, reviewed_revision_id NULL,
            PRIMARY KEY(project_id, line_id))
revisions(revision_id PK, project_id FK, song_id FK, snapshot_path,
          snapshot_sha256, media_sha256, timeline_sha256,
          status, imported_at, approved_at, approver, rights_checklist_ref)
exports(export_id PK, song_id FK, revision_id FK, version_code, display_version,
        pack_path, pack_sha256, pack_size, manifest_path, manifest_sha256,
        encryption_key_id, signature_key_id, exported_at,
        UNIQUE(song_id, version_code))
publications(export_id PK/FK, manifest_url, remote_pack_sha256,
             remote_manifest_sha256, verified_at, published_at)
export_lexemes(export_id FK, lexeme_id, normalized_key, lemma, target_language)
export_counts(export_id PK/FK, sentence_count, grammar_count, lyric_line_count,
              idiom_count, question_count)
lexeme_registry(target_language, lexeme_id, normalized_key,
                UNIQUE(target_language, lexeme_id))
audit_events(event_id PK, entity_id, kind, actor, at, before_hash, after_hash)
```

- پروژهٔ خام می‌تواند بدون `project_media` و با `lyric_marks.start_ms = NULL` وجود داشته باشد؛ این **وضعیتِ طبیعیِ پس از import** است، نه خطای فایل خام. `reviewed_audio_sha256` و hash revision/زمان‌بندی باید به نسخهٔ فعلی اشاره کنند؛ با تغییر صوت، لیریک یا mark، review/approval باطل و export قفل شود. ساخت snapshotِ تأییدشده فقط پس از تأیید جداگانهٔ همهٔ سطرها و مدرک حقوق مجاز است.
- `exports` هرگز overwrite یا حذف فیزیکی بی‌ردپا نشود. `missing` برچسب ناشی از اسکن فایل است؛ publication فقط پس از remote verification ثبت شود. اگر بستهٔ آخرین نسخه در بایگانی گم شد، آمار را با هشدار **ناقص/غیرقابل‌تأیید** نشان بده؛ بی‌سروصدا نسخهٔ دیگری جایگزین نکن.
- نمای پیش‌فرض آمار = برای هر `song_id` **آخرین نسخهٔ منتشرشدهٔ سالم**؛ وقتی هنوز چیزی منتشر نشده، تب «آخرین خروجی صادرشده» و «پیش‌نویس‌ها» جداگانه است. برای گزارش all versions حتماً نشان بده جمع آن تاریخچه است نه تعداد واقعی محتوای فعال. خروجی‌های همهٔ زبان‌ها با تفکیک/فیلتر زبان و صفحهٔ جزئیات آهنگ/نسخه در دسترس باشند.
- «تعداد واژگان غیرتکراری هر زبان» = `COUNT(DISTINCT normalized_key)` در `export_lexemes` از مجموعهٔ نسخه‌های منتخب **همان زبان**. کلید ویرایشگر-تأییدشدهٔ lemma است (NFC، حالت کوچک، بدون حذف accent)؛ پیشنهاد تشخیص هم‌پوشانی ماشینی است، تعیین نهایی با اپراتور. `hope` در دو آهنگ یک واژه؛ `run` به‌عنوان اسم/فعل یک lemma اگر یک کلید دارند؛ `sí` و `si` جدا؛ برای کره‌ای lemma را از شکل صرف‌شده جدا ثبت کن. `lexeme_registry` نباید اجازه دهد یک ID در نسخهٔ دیگر به واژه/زبان متفاوت اشاره کند. تعداد occurrence، مدخل/حس‌های جدا و تعداد کارت مرور را **جدا** گزارش کن.
- «جمله‌ها» = `sentences.length` در آخرین خروجی منتخب، **نه** تعداد خط‌های `lyrics`؛ «نکات گرامر» = `grammar.length` (تعداد کارت‌ها، نه تعداد ردیف‌های جدول). `idioms.length`/`lyrics.length`/`questions.length` جدا. واژه‌های یکتا را از `export_lexemes` و شمار جمله/گرامر را از `export_counts` **در دو aggregate جداگانه** حساب کن؛ join کردن ردیف‌های واژگان با countها پیش از `SUM` جمع‌ها را چندبرابر می‌کند. اگر «مفهوم گرامری یکتا» لازم شد، فقط روی `conceptId`های موجود با distinct زبان+ID محاسبه و موارد بی-ID را جدا نشان بده.
- آمار CSV/JSON با `targetLanguage`، scope (`latest-published`/`latest-exported`/`drafts`/`all-versions`)، زمان محاسبه، شمار آهنگ/نسخه و هش مجموعهٔ منابع صادر شود. آمار با هر import/export/publication/delete/re-scan به‌روز گردد؛ تست fixtures چندآهنگی با واژهٔ مشترک، اصطلاح و نسخهٔ اصلاحی ضروری است.

## مدیریت کلید و امضای فایل با امضای installer فرق دارد

- کلید خصوصی Ed25519 را در اپ نصب‌شونده جاسازی نکن؛ در پروفایل اپراتور به‌شکل فایل PKCS#8 رمزدار با passphrase قوی یا ماژول کلید ایمن مناسب ذخیره کن؛ بازکردن صریح برای export و پشتیبان جدا. کلید عمومی **raw 32 byte** با `signatureKeyId` برای Android منتشر و در APK pin شود. کلید توزیع AES-256 (۳۲ بایت) در محل محافظت‌شده (مثلاً با DPAPI/`safeStorage` برای at-rest محلی + بکاپ رمزدارِ مستقل)؛ این حفاظت در برابر بدافزار/اپراتور صاحب دستگاه DRM نیست. امکان keyIdهای قدیم و جدید برای بازکردن بایگانی را حفظ کن.
- قبل از صدور با `encryptionKeyId` یا `signatureKeyId` جدید، هماهنگی نسخهٔ اندرویدِ پین‌شده را در UI هشدار بده؛ بدون آن کلاینت قدیمی بسته را نمی‌گشاید. فایل fixture/کلید تست از release جدا باشد؛ تست build اگر test key را تشخیص داد fail کند. لاگ فقط keyId/هش، **نه key bytes**.
- امضای Windows installer با گواهی code-signing (Authenticode) هدف انتشار جداگانه است؛ **جایگزین Ed25519 manifest محتوا نیست**. نصب‌کنندهٔ NSIS با `electron-builder`، migration داده و uninstall بدون حذف پروژه‌های کاربر مگر با تأیید جدا؛ QA نصب/به‌روزرسانی/حذف روی Windows واقعی.

## تحویل‌ها و آزمون پذیرش

| گام | خروجی | قبولی |
| --- | --- | --- |
| W0 | اسکلت Electron، main/preload/renderer، SQLite migration، تست امن IPC | هیچ node/API فایل در renderer، نصب/اجرا روی Windows. |
| W1 | import `*.rddraft.json`، ویرایش کل محتوای آموزشی، validator و نگهداری snapshot خام | JSON سالم **بدون صوت/زمان** قابل واردکردن و ویرایش است؛ رسانه/تایم‌کدِ جاسازی‌شده، JSON ناسالم/کلید تکراری و کد رد؛ export غیرفعال. |
| W2 | file picker صوت محلی، کپی و hash/duration، waveform/تایم‌لاین سطر‌به‌سطر، approval | تک‌تک سطرها را با صدای انتخاب‌شده mark/preview کن؛ بدون صوت یا mark یک سطر export ممنوع؛ تعویض صوت/اصلاح سطر approval را باطل کند. |
| W3 | بایگانی نسخه‌ها/آمار زبان، CSV/JSON، diff و audit trail | چند آهنگ یک زبان با lemma مشترک **یک** واژه حساب شود؛ نسخهٔ قدیمی آمار پیش‌فرض را زیاد نکند. |
| W4 | ساخت `lesson.json` زمان‌دار + `.rdpack` و `latest.json` دقیقاً طبق قرارداد، کلید/backup | ZIP نهایی صوت انتخابی + درس کامل است؛ Android و fixture test **بدون تبدیل** باز کنند؛ tag/امضا/هش مخدوش رد شود. |
| W5 | انتشار/تأیید remote، installer و راهنمای اپراتور | pack قبل از manifest، URL ثابت، نسخهٔ ۲/اصلاح و بازیابی DB/کلید روی Windows واقعی آزموده شود. |

**در پایان:** دستور build/test/installer، شمای DB/migrations، **فایل نمونهٔ خامِ `*.rddraft.json` و فایل صوتیِ آزمایشیِ جدا** و خروجی رمزنگاری‌شدهٔ صرفاً تستی، اسکرین‌شات تایم‌لاین + داشبورد سه زبان، گزارش شمارش غیرتکراری و نتیجهٔ تست cross-platform را تحویل بده. نشانی هاست و کلیدهای واقعی فقط از مالک پروژه و خارج Git تأمین می‌شوند.
