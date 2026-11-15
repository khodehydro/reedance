# دستور کار ایجنت CMS — مدیریت فراداده با Cloudflare Free

**ماموریت:** یک CMS کوچک، عمومی برای خواندن و محافظت‌شده برای ویرایش/انتشار بساز؛ **فقط زبان‌ها، فهرست آهنگ‌های هر زبان و URLهای فایل روی هاست مالک**. فایل درس/صوت/تصویر یا `.rdpack`/`latest.json` را Cloudflare ذخیره، آپلود، پروکسی یا cache نکند. API و امضا دقیقاً طبق [CATALOG_V1.md](CATALOG_V1.md) و schema/fixtureهای [`contracts/catalog/v1`](../../contracts/catalog/v1/)؛ فرمت بستهٔ Windows در [PACKAGE_V1.md](PACKAGE_V1.md) بدون تغییر باقی می‌ماند. **در این مخزن فعلاً CMS deploy نشده؛ این سند تحویل کار است، نه ادعای راه‌اندازی سرویس.**

## انتخاب معماری کم‌هزینه و مرز اجرا

```text
مالک → هاست شخصی: .rdpack immutable + latest.json امضاشده + [cover.webp]
مالک → Cloudflare Access → Admin Worker (فرم زبان/آهنگ/URL/انتشار)
                                  ↓ D1 Free: فقط draft metadata و signed snapshots
               catalog-only Ed25519 secret در Admin Worker هنگام publish
Android → Public Worker (فقط GET زبان‌ها/آهنگِ یک زبان) → signed snapshot در D1
Android ───────────────────────────────────────────→ هاست شخصی: latest.json → .rdpack / cover
```

- **دو Worker** روی همان حساب Free: public فقط GET و بدون کلید خصوصی؛ admin دارای D1 binding و secret امضای *کاتالوگ* و محافظت‌شده با **Cloudflare Access Free** (یک مدیر). روی public هیچ مسیر POST/PUT/DELETE یا فرم عمومی نباشد. حتی اگر D1 مشترک باشد، public Worker فقط query read-only اجرا کند و توان امضای دوباره نداشته باشد. API عمومی Worker **مستقیماً از D1 snapshot می‌خواند، هرگز fetch به هاست محتوا نمی‌زند**؛ `coverUrl` یک URL است نه پروکسی تصویری. Cloudflare R2/Images/KV/Pages/Supabase و backend پولی لازم نیست.
- برای محیط عملی، subdomainهای `catalog.<دامنهٔ-مالک>` و `admin-catalog.<دامنهٔ-مالک>` روی **zone فعال Cloudflare** توصیه می‌شوند؛ دامنه/هاست محتوا همچنان مستقل و خارج Cloudflare می‌ماند. `workers.dev` برای تست ممکن است، ولی برای production و سیاست Access/host باید مسیرهای واقعی و تنظیمات نهایی را آزمود. `workers_dev=false` روی admin برای حذف مسیر عمومی غیرلازم است؛ **به‌تنهایی preview/version URLها را نمی‌بندد**: آن‌ها را با Access هم بپوشان/غیرفعال کن. Access روی *کل admin Worker/دامنه* با allow policy فقط هویت مالک اعمال شود؛ در handler نیز fail-closed با `ctx.access` تأییدشده (یا validation واقعی JWT با issuer/audience/JWKS) و هویت مجاز، نه صرف وجود هدر دست‌ساز. بدون Access، deployment مدیریت ممنوع؛ login/رمز ثابت در JS نساز.
- admin UI تنها فرم‌های متن/URL دارد و `POST multipart/form-data`، upload/octet-stream، تصویر Base64، متن لیریک، فایل صوتی و فیلدهای ناشناخته را **رد** می‌کند. سقف body JSON هر mutation مثلاً ۱۶ KiB، Content-Type دقیق JSON، CSRF token + بررسی `Origin` هم‌مبدأ روی همهٔ mutationها؛ cookie/JWT نه در `localStorage` و نه در public endpoint. پاسخ‌های admin `Cache-Control: no-store`، CSP محدود، HTML با escape متن، لاگ بدون secret/پسورد/هدر Access؛ CORS نوشتنی برای origin دیگر باز نکن. از prepared statements استفاده کن.

### مدل دادهٔ D1 (پیشنهاد migration برای ایجنت)

```sql
CREATE TABLE languages (
  code TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1))
);
CREATE TABLE songs (
  song_id TEXT PRIMARY KEY, language_code TEXT NOT NULL REFERENCES languages(code),
  title TEXT NOT NULL, artist TEXT NOT NULL, manifest_url TEXT NOT NULL UNIQUE,
  cover_url TEXT, level TEXT, duration_ms INTEGER,
  sort_order INTEGER NOT NULL, visible INTEGER NOT NULL DEFAULT 0 CHECK (visible IN (0,1))
);
CREATE INDEX songs_for_language ON songs(language_code, visible, sort_order, song_id);
CREATE TABLE catalog_state (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  draft_revision INTEGER NOT NULL, published_revision INTEGER NOT NULL
);
CREATE TABLE published_snapshots (
  scope TEXT PRIMARY KEY, revision INTEGER NOT NULL,
  envelope_json TEXT NOT NULL, etag TEXT NOT NULL, published_at TEXT NOT NULL
);
```

Scopeهای snapshot فقط `languages` و `songs/<code>` اند. `song_id`/`language_code` پس از **اولین انتشار** باید immutable باشند (schema DB به‌تنهایی آن را تضمین نمی‌کند؛ در admin enforce و audit شود). حذف/غیرفعال‌کردن ردیف منتشرشده فقط از **فهرست** برداشته می‌شود، نه پاک‌کردن پیشرفت/بستهٔ نصب‌شده؛ حذف فیزیکی DB برای جلوگیری از reuse شناسه لازم نیست. نام/کاور قابل ویرایش و انتشار با revision جدید است؛ URL `latest.json` بعد از اولین انتشار ثابت بماند. اگر تغییر host/کلید لازم شد، ابتدا migration و سازگاری Android/manifest را هماهنگ کن.

### API مدیریت، state و انتشار

- UI/endpointهای admin (فقط مثال مسیر، **نه بخشی از API عمومی**): `GET/PUT /admin/v1/languages/{code}`؛ `GET/PUT /admin/v1/songs/{songId}`؛ `POST /admin/v1/publish`، `GET /admin/v1/preview`. فرم زبان: `code,nameFa,nameEn,sortOrder,active`؛ فرم آهنگ: `songId,targetLanguage,title,artist,manifestUrl,coverUrl?,level?,durationMs?,sortOrder,visible`. endpointهای مدیریت مقادیر اختیاری/draft را می‌گیرند، اما **هرگز فایل** نمی‌پذیرند. هر ویرایش draft_revision را جلو می‌برد؛ public تا publish آخرین snapshot قبلی را می‌بیند. `preview` diff افزوده/حذف/ویرایش را به مالک نشان دهد؛ `If-Match` یا CAS روی draft_revision برای جلوگیری از انتشار draft تغییرکرده و پاسخ `409` در تعارض.
- هنگام publish: کنترل `code/songId` یکتا و immutable، زبان‌های پشتیبانی‌شدهٔ نسخهٔ هدف، URL canonical HTTPS + هاست مجاز ثابت (نه برگرفته از DB)، `latest.json` basename، سقف هر زبان ۱۰۰ آهنگ و ۱۲۸ KiB payload، عدم ورود کلید/رسانه/متن، و تیک اپراتور برای صحت انتشار فایل/مجوز در **هاست خودش**. خود Worker **pack/cover/lesson را download/HEAD یا proxy نمی‌کند**؛ امضا/هشِ واقعی `latest.json` و pack را اپراتور با ابزار محلی/Windows/Android تأیید می‌کند. متن‌های ورودی صرفاً در UI escape می‌شوند.
- draftهای زبان/آهنگ را به‌صورت **snapshot سازگار** همراه با `draft_revision/published_revision` بخوان؛ payload زبان‌ها و تک‌تک زبان‌های فعال را در ترتیب قطعی بساز، اندازه‌ها را بسنج و با Ed25519ِ *catalog-only* و domain جدا امضا کن. در **یک تراکنش D1** (`batch()` با rollback روی خطا) با CAS **درون همان transaction** revision سراسری بعدی را رزرو، envelope/ETagهای immutable را جایگزین، scopeهای زبان غیرفعال را حذف و `published_revision` را بالا ببر. اگر draft/revision در این فاصله تغییر کرده، transaction باید **واقعاً abort/rollback** و `409` بدهد؛ precheck خارج تراکنش یا UPDATE شرطیِ بی‌اثر با ادامهٔ batch کافی نیست. سقف Worker Free CPU و D1 را با تست publish صد آهنگ بسنج؛ انتشار جزئی ممنوع. `publishedAt` یک مقدار واحد برای یک publish است. public از snapshotهای ذخیره‌شده پاسخ می‌دهد، نه از جدول draft و نه امضای در هر GET.
- کلید خصوصی Ed25519 کاتالوگ را روی سیستم امن و **جدا از کلید manifest ویندوز** بساز؛ PKCS#8 برای `crypto.subtle.importKey('pkcs8', ..., 'Ed25519', false, ['sign'])` در secret مدیر (مثل `wrangler secret put CATALOG_SIGNING_PKCS8`)، public raw32 + `catalogKeyId` برای APK از کانال مستقل. هرگز `keys.test.json`/RFC8032 test seed را deploy نکن؛ secret را در Git، صفحهٔ admin یا public Worker نگذار. Cloudflare مالک secret metadata-signing می‌شود؛ در صورت عدم تمایل مالک به نگه‌داری **حتی کلید کاتالوگ** در Cloudflare، یک مسیر publish با امضای آفلاین و ورود **فقط envelope JSON فراداده** لازم است، که scope مجزای توافقی است. کلید خصوصی `latest.json` همچنان فقط نزد مالک/Windows است.
- `GET` عمومی در cache-miss از `published_snapshots` با کلید indexed یک row می‌خواند؛ ETag بر **بایت پاسخ envelope ذخیره‌شده** است، ۳۰۴ فقط در تطبیق با snapshot منتخب (ممکن است تا ۵ دقیقه cache لبه باشد). `Cache-Control: public, max-age=60, s-maxage=300, must-revalidate`، Cache API برای کاهش خواندن D1؛ `no-cache` دستی باید cache را bypass کند و از D1 بخواند. کش لبه و با TTL محدود است؛ ویرایش draft هرگز cache را تغییر نمی‌دهد، انتشار با TTL حداکثر ۵ دقیقه ظاهر می‌شود. Cache API خود invocation Worker را از سهمیه مستثنا نمی‌کند. D1 خطا/سهمیه → HTTP `503` بدون دادهٔ draft؛ Android به verified local cache برمی‌گردد.

## راه‌اندازی عملیاتی/تحویل مورد انتظار

1. حساب **Workers Free + D1 Free + Zero Trust Access Free** و zone/routeهای مجاز را توسط مالک راه‌اندازی کن؛ public و admin را جدا deploy کن. یک D1 برای این فراداده کافی است. در پروژهٔ CMS migration، schema/validator، دو Worker و فرم admin را به‌شکل قابل تست تحویل بده؛ نام واقعی دامنه‌ها و `database_id` را فقط از حساب مالک و خارج این مخزن/چتِ حاوی secret بگیر. دستورهای Wrangler نمونه: `npx wrangler d1 create reedance-catalog`، ثبت binding واقعی در config، `npx wrangler d1 migrations apply reedance-catalog --local`، پس از تست/backup `--remote`، سپس `npx wrangler deploy` برای هر Worker. این دستورات **در این مخزن اجرا/سرویسی منتشر نشده‌اند**.
2. Access policy فقط مدیر مجاز؛ تست کن public بدون auth `GET` می‌دهد، admin بدون Access یا از workers.dev/preview/host دیگر **403** است. یک ردیف test-only با `example.invalid` فقط در لوکال؛ URL ساختگی/کلید تست در production publish نشود. بعد از provisioning کلید عمومی جدید/URL عمومی واقعی، APK build باید آن‌ها را pin کند؛ بدون این مرحله release ممنوع.
3. با فایل واقعیِ دارای مجوز، مالک اول `.rdpack` immutable را در هاست خودش قرار دهد و طول/هش را بیرون CF بسنجد؛ سپس `latest.json` معتبر/امضاشده را در همان مسیر بگذارد؛ در CMS زبان/آهنگ/`manifestUrl` و `coverUrl` عمومی را ثبت، preview و publish کند. `GET /v1/languages/{code}/songs` باید فقط همان آهنگ را نشان دهد. اصلاح آهنگ با نسخهٔ بالاتر manifest روی هاست، آهنگ جدید با ردیف CMS و publish؛ هر دو **بدون APK تازه** وقتی کلید/schema/زبان پشتیبانی می‌شوند.
4. backup منظم D1 **به مخزن امن خارج Git** همراه با `published_revision`/ETagها، backup جداگانهٔ کلید کاتالوگ و تست restore؛ restore قدیمی نباید revision مشاهده‌شدهٔ Android را پایین ببرد. Dashboard مصرف روزانهٔ Workers/D1 را پایش و در آستانه‌ها هشدار/کاهش دفعات refresh/ارائهٔ cache محلی داشته باش. از R2، Images، Workers Paid و ارتقای خودکار به پلن پولی استفاده نکن.

## رایگان به‌معنی «زیر سقف رایگان»، نه بی‌نهایت

طبق مستندات رسمی Cloudflare (بررسی ۲۰۲۶-۱۱-۱۳)، Workers Free حدود **۱۰۰٬۰۰۰ درخواست در روز برای کل حساب** و **۱۰ms CPU در هر invocation** دارد [1](https://developers.cloudflare.com/workers/platform/pricing/)؛ بیش از سهمیه، در fail-closed خطای **1027** و بازنشانی روزانه ساعت ۰۰:۰۰ UTC رخ می‌دهد [2](https://developers.cloudflare.com/workers/platform/limits/). D1 Free **۵ میلیون row-read و ۱۰۰٬۰۰۰ row-write در روز**، **۵GB مجموع**، **۵۰۰MB برای هر DB** و تا **۱۰ DB** دارد [1](https://developers.cloudflare.com/workers/platform/pricing/) [3](https://developers.cloudflare.com/d1/platform/limits/). Access Free برای **تا ۵۰ مدیر/کاربر** است [4](https://www.cloudflare.com/plans/zero-trust-services/). Cache API بار D1 را کم می‌کند ولی invocation همچنان سهمیهٔ Worker مصرف می‌کند [5](https://developers.cloudflare.com/workers/runtime-apis/cache/). `batch()` D1 تراکنشی است [6](https://developers.cloudflare.com/d1/worker-api/d1-database/). **هاست/دامنه/پهنای‌باند فایل‌های مالک هزینه/سقف مستقل دارند**؛ نمی‌توان «کل سیستم زیر هر ترافیکی مجانی» یا SLA تضمین کرد. وقتی سهمیه تمام شد، خواندن/ویرایش جدید ممکن نیست؛ Android بسته‌های نصب‌شده و آخرین snapshot معتبر محلی را نگه می‌دارد. اگر scale از سهمیه فراتر رود، باید مالک دربارهٔ هزینه یا معماری جدید تصمیم بگیرد، نه اینکه بی‌سروصدا دادهٔ امضانشده ارائه شود.

## آزمون تحویل CMS

- Fixtureهای `contracts/catalog/v1/fixtures` را دقیقاً byte/signature تولید/تأیید کن؛ تغییر یک بایت، کلید، `kind`، زبان مسیر، Base64URL، URL و metadata نامجاز رد شود. POST فایل/multipart/lyric/صوت/تصویر/secret باید 4xx و **بدون نوشتن D1** باشد.
- دو ادمین هم‌زمان و publish خطادار → 409/rollback، هیچ فهرست نیمه‌منتشرشده؛ زبان غیرفعال `404`، زبان فعال بدون آهنگ snapshot امضاشدهٔ `[]`؛ عکس/manifest خراب در هاست **هیچ‌وقت از Worker پروکسی نشود**.
- refresh/ETag/304/Cache-Control، `no-cache`، D1 failure/قطع شبکه/سهمیهٔ 1027، و بازیابی از backup آزموده شود؛ re-publish با همان revision یا کاهش revision ممنوع. گزارش هزینه/سهمیه و راهنمای تنظیم دامنه/Access/backup و راهنمای انتشار مالک تحویل داده شود. تست‌های `npm test` این مخزن **وجود CMS یا راه‌اندازی Cloudflare را اثبات نمی‌کند**.
