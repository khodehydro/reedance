# Fixture مشترکِ قرارداد v1 — فقط تست، نه آهنگ یا کلید تولید

این پوشه با `node scripts/generate_contract_fixture.mjs` ساخته می‌شود: ابتدا **JSON خامِ فقط آموزشیِ بدون صوت/زمان** تولید می‌کند؛ سپس **مرحلهٔ فرضیِ ویندوز** را شبیه‌سازی می‌کند: انتخاب جداگانهٔ `audio.wav` از سیستم، ثبت زمان دو سطر در `0` و `2000` میلی‌ثانیه و ساخت درس نهایی/بسته. `npm test` تفاوت دو schema، نبود صوت/زمان در خام، امضای Ed25519، هش بسته، AES-256-GCM با AAD هدر و ZIP صوت+درس را بررسی می‌کند. **کلید AES در `keys.test.json` عمداً آشکار است** و signing seed نیز در اسکریپت تست قابل بازسازی است؛ هرگز از این‌ها برای انتشار یا build release استفاده نکنید. nonce تست از هش ZIP مشتق می‌شود تا golden fixture قابل تکرار باشد؛ در خروجی واقعی حتی برای دو بسته با محتوای یکسان **nonce تصادفیِ تازه از CSPRNG** بگیرید. اسکریپت نمونهٔ آزمون است، نه exporter امنِ production یا validator کامل ZIP.

| فایل | نقش |
| --- | --- |
| `quiet-step.rddraft.json` | **یک فایل خامِ واردکردنی به ویندوز:** لیریک، لغت، گرامر/جدول و چهار نوع سؤال؛ هیچ `media`، صوت یا `startMs/endMs` در آن نیست. `sources` فقط منبع آزمونیِ متن/درس را شرح می‌دهد. |
| `audio.wav`، `lesson.json` | WAV جداگانهٔ چهار ثانیه **سکوت**، و JSON منتشرشدهٔ فرضی با `startMs` دو سطر (`0` و `2000`) و hash همین WAV. صدای متن خوانده نشده؛ فقط برای آزمون فرمت/آفلاین. |
| `v000001-<sha256>.rdpack` | یک ciphertext شامل ZIPِ دقیقاً `lesson.json` و `audio.wav`؛ نمونهٔ بازکردن در Kotlin. |
| `latest.json`، `manifest-payload.json` | envelope امضاشده و payload اصلی بایت‌به‌بایت. |
| `keys.test.json` | IDها، کلید متقارن **TEST ONLY**، public key خام Ed25519 (۳۲ بایت) و nonceِ آزمونی؛ هیچ private key تولیدی ندارد. |
| `bootstrap-catalog.test.json` | URL ساختگی `content.example.invalid`؛ فقط برای تست fake HTTPS server، نه نشانی انتشار. |

فرمت `.rdpack` در [PACKAGE_V1.md](../../../docs/architecture/PACKAGE_V1.md) آمده؛ header از magic **۸بایتی `RDPACK1\0`** آغاز می‌شود (ASCII هفت‌بایتی `RDPACK1` + NUL). ایجنت ویندوز باید این JSON خام را **بدون صوت وارد** کند، سپس WAV جدا را انتخاب و تک‌تک سطرها را تایم‌لاین کند؛ ایجنت Android هرگز JSON خام را نمی‌بیند. هر دو ایجنت باید از فایل تولیدیِ واقعی ویندوز **با nonce تازه**، نه فقط از این golden vector، آزمون بین‌سکویی بگیرند. `npm test` فقط ابزار نمونه/وب و قرارداد را می‌سنجد، نه رابط تایم‌لاینِ واقعی یا نصب روی Android/Windows.

برای بازتولید fixture:

```bash
node scripts/generate_contract_fixture.mjs
npm test
```

اگر generator را تغییر دادید، فایل `.rdpack` قدیمی با hash قبلی را خودتان از همین پوشه حذف کنید تا فقط یکی باقی بماند؛ schema، وکتور و هر دو consumer را با هم به‌روز کنید. هیچ credential، کلید signing واقعی یا صوت دارای حق‌نشر را داخل fixture نگه ندارید.
