# نقشهٔ راه Reedance: Windows → هاست مالک + Cloudflare CMS → Android

> **وضعیت: قرارداد/راهنمای اجرا، نه سرویس مستقر.** این مخزن پروتوتایپ React/Vite و قراردادهای مشترک است؛ [پروژهٔ بومی Android جداگانه](https://github.com/khodehydro/reedance-android/tree/arena/f7c293e1-reedance-android) **وجود دارد** و در commit [`894a4609`](https://github.com/khodehydro/reedance-android/commit/894a4609d35eee0ec7fd6b33c96ffc5ddb1414a5) برای این نقشه بررسی شده است. CMS Cloudflare و اتصال شبکهٔ کاتالوگ Android هنوز طبق این سند پیاده‌سازی/استقرار نشده‌اند. تست‌های همین repo، build یا انتشار Android/Windows/CMS را ثابت نمی‌کنند.

## تصمیم محصول و مرز سه سامانه

1. **ایجنت محتوا** فقط متن آهنگ، شناسه/زبان و اطلاعاتی را که مالک می‌دهد می‌گیرد و [`*.rddraft.json`](../../contracts/v1/draft.schema.json) آموزشیِ بی‌صوت و بی‌زمان با لیریک/ترجمه/واژگان/گرامر/جداول/سؤال تولید می‌کند. به صوت دسترسی ندارد و زمان‌بندی نمی‌کند. [راهنما](AI_CONTENT_AGENT.md).
2. **Windows Studio** فایل خام را وارد می‌کند؛ مالک **بعداً جداگانه** صوت را از سیستم خود انتخاب، تک‌تک سطرهای لیریک را در تایم‌لاین اختصاصی با صدا هم‌زمان و همهٔ محتوای آموزشی/حقوق را اصلاح و تأیید می‌کند. فقط آن‌وقت `lesson.json` زمان‌دار + صوت انتخاب‌شده + کاور اختیاری را در یک `.rdpack` رمزنگاری و `latest.json` را با کلید ناشر امضا می‌کند. [راهنما](WINDOWS_AGENT.md)، [قرارداد بایت/امضا](PACKAGE_V1.md)، [`contracts/v1/`](../../contracts/v1/).
3. **هاست مالک** تنها محل فایل‌های منتشرشده است: `.rdpack` تغییرناپذیر، `latest.json` ثابت و تصویر عمومی اختیاری. **Cloudflare فقط CMS فراداده** (زبان‌ها، آهنگ‌های هر زبان، لینک‌های HTTPS همان هاست) با Workers Free + D1 Free + Access Free، و API عمومیِ **فهرست امضاشدهٔ زبان انتخابی** است؛ هیچ درس، lyric، صوت، کاور/بایت تصویر، `.rdpack` یا فایل انتشار در Cloudflare ذخیره/آپلود/پروکسی نمی‌شود. [قرارداد کاتالوگ](CATALOG_V1.md)، [دستور کار CMS](CMS_AGENT.md)، [`contracts/catalog/v1/`](../../contracts/catalog/v1/).
4. **Android بومی Kotlin/Compose**، نه WebView، رابط و پیشرفت محلی Room/Media3 را حفظ می‌کند. زبان‌های فعال را گاه‌به‌گاه و **فقط فهرست آهنگ زبان مقصد فعلی** را از CMS می‌خواند؛ آدرس `latest.json` هر آهنگ را از snapshot امضاشده می‌گیرد، manifest را با *کلید دیگری* راستی‌آزمایی می‌کند و بسته را مستقیم از **هاست مالک** با WorkManager نصب می‌کند. نصب‌شده‌ها، درس و پیشرفت آفلاین می‌مانند. افزودن آهنگ جدید برای زبان/schema/کلیدهای پشتیبانی‌شده **بدون APK تازه** با انتشار فهرست CMS ممکن است؛ افزودن زبان/کلید/schema ناشناخته ممکن است APK جدید بخواهد. [راهنمای اتصال به کد موجود](ANDROID_AGENT.md).

```text
مالک → متن آهنگ → ایجنت → <songId>.rddraft.json (درس خام، بی‌صوت/بی‌زمان)
  └→ Windows: import → انتخاب صوت محلی → سینک تمام سطرها در تایم‌لاین
      → ویرایش/مجوز/تأیید → .rdpack رمزنگاری‌شده + latest.json امضاشده
          → هاست HTTPS مالک: نخست pack نسخه‌دار، سپس latest؛ تصویر عمومی اختیاری
              └→ Cloudflare CMS: فقط ثبت زبان/عنوان/manifestUrl/coverUrl → publish
                  └→ Android: index امضاشده → فهرست زبان انتخابی
                      → هاست مالک: latest امضاشده → pack → نصب معتبر → آفلاین
```

### تفاوت «آپدیت یک آهنگ» و «آهنگ تازه»

- **آهنگ موجود:** `manifestUrl` ثابت روی هاست مالک می‌ماند؛ Windows نسخهٔ `contentVersionCode` بالاتر و pack immutable صادر می‌کند، مالک ابتدا pack و بعد manifest تازه را منتشر می‌کند. Android با همان URL آپدیت را می‌بیند؛ محتوای lesson در CMS نمی‌رود.
- **آهنگ تازه:** مالک فایل‌ها را بر هاست خودش منتشر، سپس ردیف `{songId, targetLanguage, title, artist, manifestUrl, coverUrl?}` را در CMS به زبان درست اضافه و **publish** می‌کند. API فقط متادیتای همان زبان را می‌فرستد؛ پس از refresh/TTL، کارت آهنگ بدون تغییر APK ظاهر می‌شود. اگر manifest/کلید/نسخهٔ درس ناسازگار است، کارت نباید به نصب جعلی تبدیل شود. ۳۰۴ فقط با cache محلی قبلاً معتبر؛ آفلاین/سهمیهٔ CF به «فهرست خالی» بدل نشود.

## نقشهٔ دقیق مخزن‌ها و اختلاف قرارداد

| منبع | واقعیت در snapshot بررسی‌شده / کار لازم |
| --- | --- |
| همین مخزن `src/`/`public/` | فقط مرجع تجربهٔ بصری، استارتر، quiz و دمو؛ آهنگ‌های مشهور نمایشی و فاقد فایل/مجوز انتشارند. `src/lib/offline.js` پروتکل بستهٔ بومی نیست. |
| `contracts/v1` | **قرارداد بستهٔ تاریخی و fixture تست**: draft، lesson، manifest و `bootstrap-catalog.schema.json` همراه APK. فرمت `.rdpack` و `latest.json` را برای CMS بازنویسی نکنید؛ bootstrap قدیمی منبع اصلی فهرست جدید نیست. |
| `contracts/catalog/v1` | قرارداد **مستقل** API کاتالوگ؛ امضای Ed25519 با domain/key جدا، schema و fixture و ضد rollback. بسته یا manifest را ذخیره نمی‌کند. |
| Android `data/LocalContentRepository.kt`/`AppModel.kt` | امروز `catalog_preview.json` را از assets می‌خوانند و با نصب‌های Room ترکیب می‌کنند؛ این خواندن باید به فهرست ریموتِ معتبرِ زبان انتخابی + cache و merge نصب‌شده‌ها تبدیل شود. |
| Android `install/PackInstaller.kt`/`PackInstallWorker.kt` | نصب شبکه‌ای و محلی **وجود دارد**؛ شبکه اکنون `pack_distribution.json` غیرعمومی و جدول `songs[id]={manifestUrl,language}` همراه APK می‌خواهد. باید URL/هویت آهنگ را از فهرست امضاشدهٔ CMS در **مرز معتبر** به installer بدهد، بدون حذف کنترل host، امضای manifest، GCM و نصب اتمیک. |
| Android `ui/Catalog.kt`/`data/Settings.kt` | فیلتر زبان کدهای en/es/ko/tr، کارت Gülüm II با تصویر drawable و `bundled_packs.json` با بستهٔ نمایشی/محلی دارد؛ کارت‌های جدید/کاور URL هاست مالک هنوز پیاده‌سازی نشده‌اند. Starter برخی زبان‌ها همراه APK است. |
| Android `docs/interop/ANDROID_INSTALLER.md` | پروفایل فایل فعلی `enc-main` با **رمز فایل Windows → PBKDF2 → کلید بستهٔ Keystore-wrapped در Android** کار می‌کند؛ **AES تولیدی را برای این شاخه خودسرانه داخل APK تزریق نکنید**. manifest شبکه‌ای همچنان امضای ناشر و public pin مستقل می‌خواهد. کلید تستی fixture/protocol قدیمی جای کلید واقعی نیست. |

`contracts/v1` مرجع هنوز زبان `en/es/ko` را محدود می‌کند، درحالی‌که Android (و طبق مستند همگام‌سازی‌اش Windows) `tr` را با extension محلی قبول کرده‌اند. این یک شکاف **واقعی** است: انتشار tr باید پس از هماهنگ‌سازیِ نسخه‌دارِ schema/Windows/Android و تست بین‌سکویی انجام شود؛ صرف داشتن گزینهٔ tr در UI یا ردیف CMS اثبات سازگاری نیست. زبان رابط فارسی/انگلیسی با زبان مقصد فرق دارد. داده‌های Starter همراه APK و فهرست آهنگ‌ها ریموت‌اند؛ افزودن آهنگ ≠ افزودن مسیر کامل آموزشی زبان تازه.

## امنیت، هزینه و حدود ادعا

- دو لایهٔ امضای جدا: **catalog-only** در Admin Worker (public key آن در APK) برای اعتماد به فهرست؛ **publisher manifest** در Windows (public key دیگری در APK) برای هویت/نسخه/هش `.rdpack`. CMS نه ناشر بسته است نه منبع کلید فایل. URL از لیست امضاشده هم باید HTTPS، host allowlist ثابت، بدون redirect نامجاز و مطابق `songId/language` manifest باشد. `lesson.json` فقط پس از SHA/GCM/ZIP/schema خوانده شود.
- بستهٔ آفلاین رمزنگاری‌شده DRM مطلق نیست. Android بررسی publisher را برای مسیر **شبکه‌ای `VERIFIED`** حفظ کند؛ نصب فایل انتخابی کاربر `LOCAL_PASSWORD` فقط با رمز/نام فایل است و نباید بی‌صدا به ناشر امضاشده ارتقا یابد. کلید خصوصی manifest و رمز فایل Windows هرگز در CMS، Git، URL یا چت ذخیره نشوند؛ کلید خصوصی *جداگانهٔ کاتالوگ* فقط در secret ادمین Worker (یا طرح امضای آفلاین توافقی) باشد.
- «کاملاً رایگان با Cloudflare» یعنی **زیر سقف‌های پلن رایگان** برای فراداده، نه رایگان تحت ترافیک نامحدود یا رایگان‌شدن هاست مالک. جزئیات و رفتار در اتمام سهمیه (Worker 1027، اتکا به cache محلی و درس نصب‌شده) در [CMS_AGENT.md](CMS_AGENT.md) آمده‌اند. هیچ Supabase، R2 یا اکانت کاربری اندروید برای این فهرست لازم نیست.

## تحویل/آزمون

1. [HANDOFF.md](HANDOFF.md): پیام آماده برای **ایجنت CMS، ایجنت Android موجود، Windows و ایجنت متن**. مالک دامنهٔ واقعی، URLهای HTTPS/allowlist، مجوزهای صوت/متن/کاور و public keyها را خارج از Git فراهم می‌کند؛ هیچ endpoint/کلید تولیدی در این اسناد حدس زده نشده است.
2. [TEST_PLAN.md](TEST_PLAN.md): علاوه بر fixture قدیمی draft→Windows→Android، fixture جدید catalog، آهنگ تازه بدون APK، زبان‌های مجاز/نامجاز، replay، اختلال/آفلاین، خطای auth/سهمیه و کاور خارج هاست را آزمون کنید. `npm test` و `npm run build` فقط همین repo را می‌سنجند.
3. قبل از release واقعی، Android Studio build/device QA، Windows export مستقل، D1/Access deployment و تست end-to-end با **فایل واقعی و مجوزدار روی هاست مالک** لازم است. در شاخهٔ بررسی‌شده guardِ Gradle انتشار Android هنوز بسته است؛ نوشتن سند به معنی آماده‌بودن APK تولید نیست.
