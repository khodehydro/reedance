# قرارداد کاتالوگ زندهٔ Reedance — نسخهٔ مستقل ۱

> **مشخصات پیشنهادی برای پیاده‌سازی CMS و Android؛ هنوز API/اتصال Android در این مخزن راه‌اندازی نشده است.** این قرارداد *جدا* از فرمت بسته/manifest در [PACKAGE_V1.md](PACKAGE_V1.md) و [`contracts/v1/`](../../contracts/v1/) است. کاتالوگ فقط فراداده و **نشانی‌های هاست مالک** را نگه می‌دارد؛ Cloudflare جای هاست فایل نیست. Schemaها و بردارهای آزمون در [`contracts/catalog/v1/`](../../contracts/catalog/v1/) هستند.

## مرز داده و اعتماد

| دارایی | محل قرارگیری | مسئولیت |
| --- | --- | --- |
| `.rddraft.json` بی‌صوت/بی‌زمان، صوت انتخابی، پروژه/مدارک حقوقی | رایانه و پشتیبان امن مالک | ایجنت فقط از متن درس خام می‌سازد؛ Windows صوت را جدا انتخاب، لیریک را در تایم‌لاین سینک و نتیجه را تأیید می‌کند. |
| `.rdpack` رمزنگاری‌شدهٔ **درس+صوت+کاور اختیاری**، `latest.json` امضاشده، کاور عمومی اختیاری | **هاست HTTPS خود مالک** | `.rdpack` immutable کنار `latest.json` ثابت. تصویر عمومی در صورت نیاز جدا روی همان هاست/هاست تصویریِ ازپیش‌مجاز. هیچ‌کدام در Worker/D1/KV/R2/Pages یا پروکسی Cloudflare ذخیره/ارسال نشوند. |
| زبان‌ها، عنوان/هنرمند/سطح/مدت اختیاری، `songId`، `manifestUrl` و `coverUrl` اختیاری | Cloudflare Workers Free + D1 Free | فقط فرم مدیریت، نسخهٔ منتشرشدهٔ فهرست و پاسخ JSON. هیچ lyric، درس، صوت، بایت تصویر، URL دارای توکن، کلید بسته یا اطلاعات کاربر در DB/لاگ. |
| امضای کاتالوگ | secret ایجنت مدیریت Cloudflare، **کلید جدا از امضای بسته** | کلید خصوصی *فقط کاتالوگ* برای snapshot هنگام «انتشار»؛ کلید خصوصی Ed25519ِ `latest.json` فقط نزد Windows/مالک می‌ماند. public key هر دو دامنه جداگانه در Android pin می‌شود. |

کاتالوگ **مجوز/اصالت بسته نیست**: حتی URL موجود در کاتالوگِ امضاشده فقط یک اشاره‌گر است. Android باید `latest.json` را با کلید *دیگر* و شناسه/زبان مورد انتظار اعتبارسنجی کند و سپس hash/GCM/lesson را مانند قبل کنترل کند. مالکیت/مجوز نشر را CMS به‌تنهایی اثبات نمی‌کند.

## API عمومی — فقط فهرستِ زبان انتخابی

| درخواست بدون login | پاسخ `200 application/json; charset=utf-8` | حالت‌های دیگر |
| --- | --- | --- |
| `GET /v1/languages` | envelope امضاشدهٔ `kind=languages`، زبان‌های فعال و نام‌های فارسی/انگلیسی | `503` اگر هنوز هیچ snapshot منتشر نشده؛ هرگز از draft پاسخ نساز. |
| `GET /v1/languages/{code}/songs` | envelope امضاشدهٔ `kind=songs`، `language=code`، فقط آهنگ‌های visible همان زبان؛ آرایهٔ خالی هم **امضاشده** است | `404` اگر زبان منتشر/فعال نیست؛ `503` در اختلال DB بدون snapshot معتبر. |

- `code` مطابق `^[a-z]{2,3}$` و فقط یک segment؛ مسیر/متد دیگر برای public رد شود. `GET` نه pagination دارد، نه query، نه auth، نه کاربرمحور کردن جواب؛ سقف v1 **۱۰۰ آهنگ در هر زبان**، ۳۲ زبان و payload بازشده **۱۲۸ KiB** است. برای بیشتر از آن، قرارداد pagination نسخه‌دار جدا لازم است؛ فهرست را بی‌صدا truncate نکنید. API هرگز کل آهنگ‌های همهٔ زبان‌ها را در یک پاسخ برنمی‌گرداند.
- نمونهٔ نمایشی، **دامنهٔ غیرواقعی**: `https://catalog.example.invalid/v1/languages/en/songs` پاسخ `songs-en-r1-envelope.test.json` در fixtures؛ `payload` Base64URL آن پس از تأیید امضا، JSON زیر است:

```json
{
  "catalogVersion": 1, "kind": "songs", "revision": 1,
  "publishedAt": "2026-11-13T00:00:00Z", "language": "en",
  "songs": [{
    "songId": "quiet-step", "targetLanguage": "en", "title": "Quiet Step (TEST ONLY)",
    "artist": "Reedance Contract Tests",
    "manifestUrl": "https://content.example.invalid/reedance/en/quiet-step/latest.json",
    "coverUrl": "https://content.example.invalid/art/quiet-step.webp",
    "level": "A1", "durationMs": 4000
  }]
}
```

- نام‌های دقیق فیلدهای payload و envelope در schemaهاست؛ `kind=languages` دارای `languages: [{code,nameFa,nameEn}]` و **فاقد `songs`** است. ترتیب زبان/آهنگ طبق `sort_order` و سپس `code/songId` به‌شکل قطعی هنگام publish تثبیت می‌شود. `revision` عدد صحیحِ سراسری و صعودی **برای هر انتشارِ کل کاتالوگ**، مستقل از `contentVersionCode` هر آهنگ و مستقل از APK است؛ `publishedAt` نمایشی است و ساعت دستگاه مبنای امنیت نیست. هر snapshot زبان و فهرست آهنگِ همان publish شمارهٔ یکسان دارد؛ cache ممکن است موقتاً شماره‌های متفاوت نشان دهد، بنابراین کلاینت ضد rollback را **برای هر endpoint جداگانه** حفظ می‌کند و عدم‌برابری موقت را به بستهٔ نامعتبر تبدیل نمی‌کند.
- `manifestUrl` باید URL HTTPS ثابتِ **`latest.json` روی هاست مالک** باشد؛ بسته با `package.fileName` امضاشده و relative به این URL، **روی همان origin** resolve می‌شود. `coverUrl` اگر هست فقط اشاره به تصویر *روی هاست مالک* است، نه بایت تصویر داخل CMS؛ نمایش تصویر اختیاری است. URIهای userinfo، query/fragment، port ناشناخته، IP literal، redirect خارج origin و host خارج allowlist ازپیش‌ثابت اپ/مدیر ممنوع. path باید با `/` شروع شود، از segmentهای ASCII سادهٔ `[A-Za-z0-9._~-]+` بدون `.`/`..`/segment خالی/`%`/`\\` تشکیل شود؛ manifest به `/latest.json` ختم شود و cover به `.jpg`/`.png`/`.webp`. ورودی URL پیش از/بعد از parse نباید normalize و معنایش تغییر کند. CMS درخواست دانلود/HEAD/پروکسی برای رسانه نفرستد. allowlist در APK/پیکربندیِ امنِ Worker است و از خود catalog خوانده نمی‌شود. اگر هاست‌های جداگانهٔ manifest/cover لازم‌اند، هر دو مستقل و صریح در allowlist تنظیم شوند. cover خراب/ناموجود placeholder است، نه مانع نمایش آهنگ نصب‌شده.
- `songId` سراسری یکتا و `targetLanguage` بعد از اولین انتشار تغییرناپذیرند؛ CMS یکتایی را در DB اعمال کند و Android در صورت برخورد ID بین cache دو زبان آن snapshot متعارض را رد کند. همان `songId`/زبان در **manifest امضاشده و lesson احرازشده** باید برابر باشد. title/artist/level/duration فقط اطلاعات نمایشی‌اند؛ پس از نصب، `lesson.json` معتبر منبع اطلاعات درس است. فهرست ریموت نه `.rdpack`، نه URL مستقیم صوت، نه متن، نه کلید AES دارد. خرید/اشتراک/«پولی» در این قرارداد تعریف نشده؛ از ردیف نمایشیِ بدون مجوز بستهٔ قابل‌دانلود نسازید.

### امضا، سقف‌ها و ضد rollback

Envelope با کلیدهای **دقیقاً** `catalogKeyId`, `payload`, `signature`، `payload` = Base64URL بدون padding از **بایت‌های اصلی** JSON UTF-8 و `signature` = Base64URL بدون padding از Ed25519 خامِ ۶۴بایتی:

```text
message = UTF8("REEDANCE-CATALOG-V1\n")
        || UTF8(catalogKeyId) || UTF8("\n") || decodedPayloadBytes
signature = Ed25519.sign(catalogOnlyPrivateKey, message)
```

- کلید عمومی pin شدهٔ raw32 با `catalogKeyId` (پیشوند `cat-`) انتخاب می‌شود؛ **نه** کلید `signatureKeyId` بسته (پیشوند `sig-`). تغییر دامنه/کلید کاتالوگ و افزودن کلید تازه ابتدا به rollout APK سازگار نیاز دارد. کلید test `cat-test-v1`/fixture هرگز در production یا release استفاده نشود؛ کلید خصوصی test حتی اگر در اسکریپت generator وجود دارد عمومی و ناامن است.
- Android **پیش از parse payload**: سقف پاسخ envelope **۱۹۲ KiB** و decoded payload **۱۲۸ KiB**؛ UTF-8 strict بدون BOM، JSON بدون کلید تکراری/NaN/field ناشناخته/عمق نامحدود، Base64URL canonical، طول signature ۶۴، امضای بایت‌های اصلی. سپس schema مناسب، `kind`, `language` مسیر، unique `code` و `songId`، `targetLanguage == language`، URLها و host policy، نسخه و زبان‌های پشتیبانی‌شده را بررسی کند. `catalogVersion` ناشناخته/کلید ناشناخته = نیاز به اپ تازه، **نه** fallback به دادهٔ امضانشده. JSON Schema **کافی نیست**؛ این کنترل‌های معنایی دوطرفه‌اند.
- برای هر endpoint، بزرگ‌ترین `revision` معتبر دیده‌شده و SHA-256 بایت‌های decoded payload در storage محلی پایدار بماند. revision پایین‌تر یا **همان revision با payload متفاوت** رد؛ نسخهٔ نصب‌شده/کاتالوگ قبلی معتبر محفوظ. هیچ روشی با این مدل replayِ یک snapshot قدیمیِ معتبر را **در اولین نصب** به‌طور مطلق تشخیص نمی‌دهد. «حذف آهنگ» از کاتالوگ به معنی پاک‌کردن بستهٔ نصب‌شده یا لغو دسترسی آفلاین نیست.

### HTTP/cache و تجربهٔ آفلاین

- محتوای published از snapshot immutable در D1 پاسخ داده می‌شود؛ `ETag: "sha256-<hex-of-envelope-response-bytes>"` و `Cache-Control: public, max-age=60, s-maxage=300, must-revalidate`. Worker روی `If-None-Match` برابر **snapshot انتخاب‌شدهٔ معتبر** (از edge cache تا حداکثر TTL یا D1 در cache-miss/درخواست `no-cache`) `304` بدون body می‌دهد؛ snapshot لبه ممکن است تا ۵ دقیقه از D1 عقب باشد. ۳۰۴ فقط با یک کپی محلی **از پیش تأییدشده و کامل** قابل استفاده است. ۳۰۴ بدون cache معتبر → GET بدون شرط یا خطا، نه کاتالوگ خالی. Cache API در Worker بار D1 را کم می‌کند اما خود درخواست Worker را رایگان/نامحدود نمی‌کند؛ جوابِ منتشرنشده/مدیریتی هرگز cache نشود.
- Android در startup **بدون انتظار شبکه** از cache معتبرِ زبان فعلی و نصب‌های Room نمایش می‌دهد؛ زبان‌ها را روزی یک‌بار یا هنگام تغییر تنظیمات و فهرست زبان منتخب را حداکثر هر ۶ ساعت/ورود فعال یا با دکمهٔ «بازخوانی» می‌گیرد. بازخوانی دستی می‌تواند `Cache-Control: no-cache` بفرستد تا Worker snapshot تازهٔ D1 را بخواند؛ Worker همچنان امضا/etag همان انتشار را برمی‌گرداند. بعد از publish، کاربر بدون نصب APK جدید با refresh یا حداکثر چرخهٔ بعدی فهرست آهنگ تازه را می‌بیند؛ **زمان آنی تضمین نیست** (cache تا ۵ دقیقه/دورهٔ fetch). شبکه/سهمیه/خطای URL نباید کاتالوگ را به `[]` تبدیل کند: cache معتبر + هشدارِ «فهرست به‌روز نیست»؛ نصب‌ها همچنان آفلاین.
- زبان *رابط* فارسی/انگلیسی مستقل از زبان مقصد است. زبان مقصدِ ناشناخته را Android نادیده بگیرد؛ CMS فقط زبان‌هایی را برای نسخهٔ منتشرشده فعال کند که APK + قرارداد درس/manifest + تجربهٔ مربوط آن‌ها را واقعاً پشتیبانی می‌کنند. **افزودن آهنگ تازه برای زبان پشتیبانی‌شده بدون APK است؛ افزودن زبان/schema/کلید ناشناخته لزوماً بدون APK نیست.** شاخهٔ Android بررسی‌شده `tr` را در runtime extension قبول می‌کند ولی `contracts/v1/` مرجع هنوز en/es/ko است؛ پیش از انتشار `tr`، Windows و Android باید این ناسازگاری را با قرارداد نسخه‌دار هماهنگ/آزمون کنند، نه اینکه CMS به‌تنهایی آن را فعال کند.

## اتصال به انتشار محتوای مالک

`متن → .rddraft.json → Windows: انتخاب صوت محلی + تایم‌لاین و تأیید → .rdpack + latest.json (امضای ناشر) → آپلود pack سپس latest روی هاست مالک → ثبت لینک latest/cover در CMS به‌صورت draft → publish فهرست امضاشده → Android: فهرست زبان منتخب → manifest امضاشده → نصب معتبر و آفلاین.`

نخست بستهٔ immutable را روی هاست مالک آپلود و از همانجا hash/اندازه را بررسی کنید؛ **بعد** `latest.json` را قرار دهید و امضا/شناسه/لینک آن را از بیرون Cloudflare آزمون کنید؛ در آخر ردیف CMS را منتشر کنید. ویرایش بستهٔ موجود نسخهٔ `contentVersionCode` بالاتر/manifest تازه می‌خواهد؛ تغییر کاور URL با path نسخه‌دار و انتشار catalog revision تازه انجام شود. اصلاح همان آهنگ با manifest URL ثابت به API CMS وابسته به تغییر revision نیست؛ اما افزودن آهنگ تازه نیاز به publish ردیف جدید دارد. هیچ کلید/صوت/کاور/lesson را به صفحهٔ مدیریت ارسال نکنید.
