# دستور کار ایجنت اندروید — Reedance Native

**ماموریت:** اپ مستقل **بومی Android با Kotlin در Android Studio**؛ نه WebView، نه React Native، نه تبدیل CSS/JS وب به پوستهٔ اپ. تجربه و محتواهای `src/`/`public/` فقط مرجع طراحی و مهاجرت داده‌اند. قبل از نوشتن downloader، [معماری کل](README.md)، [قرارداد v1 بایت‌به‌بایت](PACKAGE_V1.md) و [`contracts/v1`](../../contracts/v1/) را بخوان و با ایجنت Windows روی fixture مشترک توافق کن. **این مخزن در حال حاضر APK/ماژول Android ندارد.** فایل خامِ `*.rddraft.json` فقط ورودیِ Windows Studio است و هیچ‌گاه در Android دانلود/parse نمی‌شود. Android فقط `lesson.json` **با زمان‌بندی تمام سطرها و media صوتیِ انتخاب‌شده در ویندوز** را از داخل `.rdpack` معتبر می‌خواند؛ نبود `startMs`، صوت یا hash آن باید نصب را رد کند.

## انتخاب فنی و مرزبندی ماژول‌ها

- مالک `android/`؛ با هماهنگی مشترک schema/fixture را تغییر بده، اما برای اصلاح ناسازگار قرارداد به‌صورت یک‌جانبه format تازه نساز. Android Studio + Kotlin + Gradle، `minSdk` پیشنهادی ۲۶ و `targetSdk` مطابق الزامات روز انتشار. UI با Jetpack Compose/Material 3 (RTL/LTR و accessible)، Coroutines/Flow؛ شبکه با OkHttp، کار ادامه‌دار با WorkManager؛ Room برای دادهٔ نصب/پیشرفت، DataStore برای تنظیمات؛ Media3/ExoPlayer برای پخش فایل خصوصی. برای Ed25519 روی حداقل SDK انتخاب‌شده، provider/library ممیزی‌شدهٔ پشتیبان همان SDK را با وکتور fixture تست کن (به وجود `Signature.getInstance("Ed25519")` در همهٔ نسخه‌ها فرض نکن). AES-GCM با provider پشتیبانی‌شده و **tag verification کامل**.
- نام پوشه‌ها/اینترفیس‌های پیشنهادی:

```text
android/
  app/src/main/assets/bootstrap_catalog.json  # URLهای واقعی را مالک قبل از release می‌دهد
  app/src/main/res/                     # logo.png اصلی + اسپلش و فونت/تصویر مجاز
  core/contract/                        # schema v1 types + strict parser/verifier
  core/network/                         # signed manifest fetch + host policy
  core/storage/                         # Room, file staging, crash recovery
  core/media/                           # Media3, player lifecycle
  feature/catalog/ feature/song/ feature/starter/
  feature/quiz/ feature/review/ feature/library/ feature/profile/
  test/ androidTest/                     # fixture + آفلاین/ارتقا/خرابی
```

`bootstrap_catalog.json` با [`bootstrap-catalog.schema.json`](../../contracts/v1/bootstrap-catalog.schema.json) در APK همراه باشد. هر ردیف `songId`، زبان مقصد، عنوان، هنرمند، `manifestUrl` HTTPS ثابت و thumbnail محلیِ اختیاری دارد؛ URL ساختگیِ مثال‌ها را در release نگذار. `latest.json` بستهٔ همان آهنگ را معرفی می‌کند. افزودن آهنگ تازه در v1 نیازمند افزودن ردیف و انتشار APK است؛ اصلاح آهنگ موجود با همان URL **بدون APK جدید** ممکن است، مگر schema/کلید تغییر کند. تنها محتوای مجاز/در دسترس به‌عنوان قابل‌دانلود نمایش داده شود؛ کارت‌های معروفِ دموی وب بدون مجوز/فایل واقعی صرفاً mock هستند. اگر صاحب پروژه «آهنگ تازه بدون APK» خواست، catalog ازراه‌دور باید جداگانه امضا و در scope جدید تعریف شود.

## مسیر کاربر و صفحه‌ها

1. **اسپلش و شروع:** از فایل محلی `logo.png` موجود در همین مخزن استفاده کن؛ لوگو وسط صفحه، متن دقیق **`HYDRO team`** در پایینِ وسط. در Android 12+ SplashScreen سیستم محدودیت چیدمان دارد؛ لوگو را در splash سیستم و متن/چیدمان دقیق را در یک **صفحهٔ برندِ Compose پس از آن** هنگام بارگذاری واقعیِ محلی نشان بده، نه تأخیر اجباری و طولانی؛ کاهش حرکت/دسترس‌پذیری رعایت شود. نیاز به اینترنت برای بازشدن اپ نباشد.
2. **خانه و کاتالوگ:** زبان مقصد (انگلیسی/اسپانیایی/کره‌ای)، جست‌وجو/فیلتر، starter هر زبان، نشان «دانلود نشده / در حال دانلود / آمادهٔ آفلاین / به‌روزرسانی موجود / نیازمند نسخهٔ جدید اپ / خطا». عنوان/کاور bootstrap پیش از دانلود؛ درس فقط پس از نصب معتبر باز شود. زبان UI فارسی/انگلیسی مستقل از `targetLanguage` و با جهت مناسب، فونت فارسی و نمایش درست Hangul/diacritics.
3. **آموزش آغازین:** پنج‌گام `src/starterData.js`/تجربهٔ `src/StarterPage.jsx` را به دادهٔ **همراه APK** برای هر زبان تبدیل کن: حروف/صداها، خوانش تقریبی فارسی، مثال، گرامر/جدول/واژگان/پیشرفت محلی. starter در بستهٔ آهنگ نیست. صدای دستگاه/TTS ممکن است در حالت آفلاین موجود نباشد؛ قبل از وعدهٔ صوت، موتور/صدای محلی را چک و جایگزین متنی بگذار.
4. **صفحهٔ آهنگ:** با Media3 فایل صوتیِ بازشدهٔ خصوصی را پخش/مکث/seek/skip/repeat کن؛ پخش پس‌زمینه و lifecycle/MediaSession مطابق مجوزها. لیریک سطر زمان‌دار، ترجمهٔ خطی و token، tap روی واژه → entry/IPA/خوانش/مثال؛ تب‌های گرامر با جدول/نکته/پرسش آشکارشونده، لغت/اصطلاح/جمله و نشان‌کردن. همهٔ محتوا از **نصب‌شدهٔ `lesson.json`**، نه hardcodeِ `src/learningData.js`. رنگ `tone` فقط گروه‌بندی، برچسب‌های واقعی قابل‌خواندن باشند.
5. **آزمون مستقل:** چهار قالب `choice/match/order/typing` از `questions` همان بسته و بازخورد/توضیح بلافاصله پس از سؤال؛ صفحهٔ آزمون بدون پلیر/مینی‌پلیر/ناوبری آهنگ، پخش موجود با ورود مکث شود و موقعیت حفظ گردد؛ امتیاز/جزئیات و بازگشت به تب قبلی. غلط‌ها فقط `relatedLexemeIds` یا lexemeId جفت‌های غلط match را در لایتنر موعددار کنند؛ بقیهٔ کارت‌ها تغییر نکنند. سؤال تغییرکرده در نسخهٔ جدید بدون تمرین دوباره «حل‌شدهٔ جدید» نیست. `speech` در صورت فعال بودن با TTS آفلاین دستگاه؛ **صدای فایل آهنگ داخل آزمون پخش نشود**.
6. **کتابخانه و لایتنر:** نشان‌های جمله/اصطلاح/واژه، دسته‌کارت، مرحله/موعد لایتنر در Room؛ موفقیت از stage=۱ به ۲ با ۲ روز، سپس ۴/۸/۱۶ روز تا stage=۵؛ فراموشی به stage=۱ و یک دقیقه بعد؛ واژهٔ اشتباه آزمون فوراً due. دادهٔ واژه با `lexemeId` مشترک بین آهنگ‌ها یک وضعیت مرور دارد، اما هر آهنگ از نسخهٔ نصب‌شدهٔ خود رندر می‌شود. پیشرفت starter جداست.
7. **پروفایل مهمان/تنظیمات:** زبان UI، روشن/تاریک/دستگاه، سه اندازهٔ متن، کاهش حرکت، فضای ذخیره/پاک‌کردن آهنگ، about و اعتبار آیکن‌ها. اشتراک/پرداخت/حساب کاربری در v1 واقعی نیست؛ مؤلفهٔ نمایشی وب را به خرید جعلی تبدیل نکن. ترجیحات و پیشرفت بدون اینترنت پایدار باشند.

## مسیر شبکه و نصب ایمن (هر مرحله قابل تست)

```
Bundled catalog → HTTPS latest.json (ETag/304) → strict envelope + Ed25519
    → strict signed payload: ID/lang/version/host policy/size/keyId
    → .rdpack → private .part → length + SHA-256 → header/AAD/AES-GCM
    → complete tag verification → safe ZIP in private staging → lesson/media
    → semantic schema + cross-check → versioned directory + Room pointer
    → Media3 reads private audio; UI reads verified lesson; offline forever
```

- manifest باید بر بایت‌های اصلی payload امضای Ed25519 معتبر داشته باشد؛ از JSON parser سخت‌گیر (کلید تکراری رد) و Base64URL بدون padding استفاده کن. public key خام ۳۲بایتی را با `signatureKeyId` از APK انتخاب کن. manifest/URL فقط hostهای allowlist و HTTPS؛ redirect بررسی شود؛ `fileName` از payload فقط basename با الگوی امضاشده. cache HTTP هرگز جای بررسی امضا را نمی‌گیرد؛ ۳۰۴ فقط وقتی cache manifest قبلاً تأیید شده قابل استفاده است. مشکل شبکه/آفلاین نباید وارد صفحهٔ درس نصب‌شده شود.
- WorkManager با constraint شبکه برای دانلودِ خودکار و مسیر «دانلود» دستی مناسب؛ برای انتقال طولانی foreground notification/permission مطابق نسخهٔ اندروید. انصراف کاربر، پیشرفت بایت‌ها، فضای خالی (`.part` + ZIP staging + نسخهٔ فعال + فایل extract) و خطاهای قابل بازگشت را نمایش بده. Resume فقط با Range/ETag/Content-Range مطمئن؛ ساده‌تر در MVP، پس از قطعی از صفر شروع کن. دانلود نیمه‌کاره **هیچ‌وقت** نسخهٔ نصب‌شده نباشد.
- `.rdpack` فقط در storage خصوصی برنامه؛ اول اندازه، hash، magic/len/keyId، سپس AES-256-GCM با `AAD = header` و tag کامل؛ از plaintext قبل از تأیید tag برای UI، Media3 یا ZIP parser استفاده نکن. رمزگشایی به فایل ZIP موقت خصوصی، بعد استخراج فقط نام‌های allowlist با اندازه/entry-count محدود و جلوگیری از symlink/Zip Slip/ZIP bomb/CRC خراب؛ JSON UTF-8 محدود و `schemaVersion` شناخته‌شده، هش رسانه و metadata متقابل را بررسی کن. اگر keyId AES در APK نیست: «آپدیت اپ لازم است»، نه دانلود دوبارهٔ بی‌پایان. فایل بازشده در storage خصوصی می‌ماند؛ مالک دستگاه rooted می‌تواند آن را ببیند و رمزنگاری فایل سرور DRM نیست.
- نصب از دید UI اتمیک است: staging روی همان volume با نوشتن کامل/تثبیت، انتقال به `filesDir/packs/<songId>/<versionCode>/`، Room transaction برای تغییر pointerِ active بعد از راستی‌آزمایی و سپس پاک‌سازی نسخهٔ قدیمی **پس از** آزادشدن player/مراجع باز. اگر crash بین فایل و DB رخ داد، recovery در شروع، pointer را با دایرکتوری معتبر تطبیق و staging/یتیم را پاک کند. هرگز قبل از کامل‌شدن نسخهٔ جدید، قبلی را پاک نکن. حافظهٔ کاربر، نشان‌ها و لایتنر بیرون پوشهٔ pack و جدا از حذف فایلِ آهنگ باشد.
- از Room حداقل این جداول را داشته باش: `InstalledPackage(songId PK, activeVersionCode, signedPayloadSha256, activePath, state, lastCheckedAt)`, `SeenManifest(songId PK, highestVersionCode, packageSha256)`, `SongPlayback(songId PK, positionMs)`, `Bookmark(songId, itemType, itemId, createdAt)`, `ReviewCard(lexemeId PK, stage, dueAt, savedAt)`, `QuizResult(songId, questionId, versionCode, answer, gradedAt)`, `StarterProgress(targetLanguage, stepId, completedAt)`. مبدا همهٔ زمان‌های موعد UTC؛ اعلان محلی/زمان دستگاه بدون اتکا به سرور. migration Room نسخه‌دار و تست restore/backup.
- تغییر نسخهٔ درس: IDهای ثابت همان دادهٔ کاربر را حفظ می‌کنند؛ aliasِ یک‌به‌یکِ تأییدشده مهاجرت می‌دهد؛ آیتم حذف‌شده/سؤالِ دیگرگونه‌ با تاریخچهٔ آرشیوشده حفظ می‌شود. bookmark قدیمیِ بدون مقصد معتبر را «در نسخهٔ پیشین» نشان بده یا آرشیو کن، **حذف بی‌اطلاع** نه. اگر versionCode همان ولی هش متفاوت یا نسخهٔ پایین‌تر دیدی، رد و log غیرحساس کن. نتیجهٔ آزمون را به versionCode گره بزن.

## کلید و محرمانگی؛ release ایمن

- کلید خصوصی Ed25519 **هرگز** به APK/سرویس اندروید وارد نمی‌شود. public key raw32 pin به ازای `signatureKeyId`، و کلید AES تولیدی ۳۲بایتی به ازای `encryptionKeyId` در build release از secret خارج Git تزریق می‌شود. release در صورت نبود کلید/URL/manifest host واقعی باید fail شود؛ fixture key فقط در debug/test variant با برچسب TEST ONLY مجاز است و در release به‌طور خودکار ممنوع. تزریق build جلوی استخراج AES از APK را نمی‌گیرد؛ آن را DRM یا مالکیت انحصاری محتوا معرفی نکن.
- rotation: APK جدید ابتدا public signing key/کلید AES تازه را همراه قبلی می‌گیرد؛ بعد Windows با شناسهٔ تازه بسته را منتشر می‌کند. Android قدیمی نسخهٔ نصب‌شده را حفظ و برای کلید ناشناخته آپدیت APK درخواست می‌کند. برای دستگاه جدید با APK قدیمی از راه دور قابل‌حل نیست. هیچ طرحِ remote key در v1 تعریف نشده است.
- hostها `network_security_config` روشن و سخت‌گیر، بدون cleartext، pin کردن **کلید امضای محتوا** لازم است؛ pin TLS اختیاری و به سیاست مدیریت گواهی وابسته. `android:allowBackup` یا backup policy را طوری تنظیم کن که کلیدها/بسته‌های حجیم بی‌توجه به cloud backup نروند؛ در عین حال بازیابی پیشرفت محلی را به کاربر صادقانه توضیح بده.

## تحویل‌ها و آزمون پذیرش

| گام | خروجی | قبولی |
| --- | --- | --- |
| A0 | پروژهٔ Android Studio، Compose navigation/theme/splash/RTL، کاتالوگ bundled | لوگوی همین مخزن وسط و `HYDRO team` پایین؛ بازشدن کاملاً آفلاین. |
| A1 | parser/verify/installer v1، fake HTTPS server و WorkManager | fixture از Windows بدون تبدیل باز شود؛ امضا/هش/GCM/schema بد یا قطع دانلود **نسخهٔ قبلی را نگه دارد**. |
| A2 | Media3 و درس داده‌محور، starter bundled، Room/تنظیمات | صوت/متن/ترجمه/گرامر/جدول در حالت هواپیما؛ token فارسی/کره‌ای درست. |
| A3 | آزمون چهارنوعه، کتابخانه/لایتنر/تاریخچه، مهاجرت نسخه | سؤال‌های غلط کارت درست را موعددار کنند؛ v1→v2 حفظِ نشان/مرور و عدم بازآزمایی جعلی. |
| A4 | UI به‌روزرسانی، حذف بسته، تست دستگاه/دسترس‌پذیری و AAB/APK | پرواز، مجوز، کمبود فضا، بازکردن پس از restart و crash، رابط فارسی RTL و انگلیسی LTR. |

**در پایان:** فایل راهنمای build/run Android Studio، پیکربندیِ secretهای release بدون مقدارِ واقعی، APK/AAB تست (نه کلید تست در release)، تست unit/instrumented، و گزارش دانلود و بازکردن همان بستهٔ Windows روی یک دستگاه واقعی تحویل بده. بدون URL/مجوز/کلید تولیدیِ مالک، فقط preview/test قابل تحویل است.
