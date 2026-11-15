# قرارداد مشترک بسته/درس v1 (تاریخی و همچنان معتبر برای bytes)

این پوشه مشخصات و fixture تست `.rddraft.json` → Windows Studio → `.rdpack`/`latest.json` است، **نه export تولیدی**. مرجع هنجاری: [PACKAGE_V1.md](../../docs/architecture/PACKAGE_V1.md). پروژهٔ Android بومی در repo جدا وجود دارد؛ fixture تست ساخت/اجرای آن را ثابت نمی‌کند.

- [شمای draft](draft.schema.json): **یک فایل خامِ آموزشی از متن آهنگ** بدون صوت/رسانه و `startMs/endMs`؛ [نمونه](fixtures/quiet-step.rddraft.json).
- [شمای lesson](lesson.schema.json): `lesson.json` **بعد از انتخاب صوت از سیستم توسط مالک، سینک تمام سطرها در تایم‌لاین Windows و تأیید محتوا/حقوق**، فقط داخل pack رمزنگاری‌شده. شمای draft برای تعریف‌های مشترک از `$id` محلی `urn:reedance:lesson:v1` استفاده می‌کند؛ هر دو schema را بدون شبکه ثبت کنید.
- [شمای envelope](manifest-envelope.schema.json) و [payload](manifest-payload.schema.json): manifest امضاشدهٔ publisher یعنی `latest.json` روی **هاست مالک**؛ امضای آن با امضای catalog Cloudflare فرق دارد.
- [شمای legacy bootstrap در APK](bootstrap-catalog.schema.json): قرارداد قدیمی فهرستِ ثابت؛ **منبع اضافه‌کردن آهنگ جدید نیست**. برای فهرست زبان‌ها و آهنگ‌ها/URLهای هاست مالک به [قرارداد مستقل catalog/v1](../catalog/v1/README.md) و [CATALOG_V1.md](../../docs/architecture/CATALOG_V1.md) مراجعه کنید.
- [`fixtures/`](fixtures/): نمونهٔ کوچک test-only با صوت WAV **جدا از draft** و کلید تست؛ generator مرحلهٔ انتخاب صوت/علامت‌گذاریِ فرضی Windows را شبیه‌سازی می‌کند. بردار AES آزمایشی `enc-test-v1` با پروفایل password-derived `enc-main` شاخهٔ Android یکی نیست.

JSON Schema فقط ساختار را کنترل می‌کند؛ صحت انتخاب صوت، زمان‌بندی/مجوز، ارجاعات، ZIP/SHA/AES-GCM و ضد rollback طبق PACKAGE_V1 لازم است. Schemaهای مرجع این نسخه en/es/ko را محدود می‌کنند؛ runtime Android برای tr extension دارد، اما تا سازگاری نسخه‌دارِ Windows/Android/قرارداد به‌طور مشترک تأیید نشود نباید این اختلاف را با انتشار خودسرانهٔ CMS پنهان کرد. تغییر ناسازگار به نسخهٔ جدید همراه با تست تعامل‌پذیری نیاز دارد.
