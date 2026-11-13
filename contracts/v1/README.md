# قرارداد مشترک v1

دو ایجنت (Kotlin/Android و Electron/Windows) باید همین فایل‌ها را در این مخزن مصرف کنند؛ نسخهٔ وب (`src/`/`public/`) مدل محصول است، نه پیاده‌سازی قرارداد بسته. **این پوشه فعلاً مشخصات و fixture تست است، نه export تولیدی.**

- [مشخصات هنجاری: بسته، فرمت بایت، امضا، کلید، نسخه و نصب](../../docs/architecture/PACKAGE_V1.md)
- [شمای JSON خام ایجنت](draft.schema.json): **یک فایل `*.rddraft.json` حاوی محتوای تولیدشده از لیریک، بدون صوت و بدون زمان‌بندی**. [`fixtures/quiet-step.rddraft.json`](fixtures/quiet-step.rddraft.json) مثال کامل آن است.
- [شمای درس منتشرشده](lesson.schema.json): `lesson.json` **بعد از انتخاب صوت از سیستم و سینک دستی سطرها در ویندوز**، داخل `.rdpack`؛ raw draft هرگز با این schema به‌عنوان منتشرشده پذیرفته نمی‌شود. شمای draft برای تعریف‌های مشترک به `$id` محلی `urn:reedance:lesson:v1` در این فایل ارجاع می‌دهد؛ هر دو را بدون شبکه در validator ثبت کنید.
- [شمای envelope](manifest-envelope.schema.json) و [شمای payload](manifest-payload.schema.json) مربوط به `latest.json`
- [شمای کاتالوگ bootstrap در APK](bootstrap-catalog.schema.json)
- [`fixtures/`](fixtures/): نمونهٔ کوچکِ مشترک با کلیدهای **فقط تست** و آزمون مصرف‌کننده؛ هر دو تیم باید آن را پاس کنند.

JSON Schema تنها ساختار را چک می‌کند؛ اتصال صوت محلی به پروژه، تکمیل/بازبینی `startMs` همهٔ سطرها، مرجع‌های متقابل، نام فایل، حقوق، SHA و ضد-rollback در PACKAGE_V1 لازم‌اند. نمونهٔ صوت fixture **فایلی جدا از draft** است و generator تست، مرحلهٔ فرضیِ انتخاب آن در ویندوز را شبیه‌سازی می‌کند. `contracts/v1` را بدون هماهنگی دو تیم ناسازگار تغییر ندهید؛ یک فیلد/رفتار ناسازگار به `v2` و تست ارتقا نیاز دارد.
