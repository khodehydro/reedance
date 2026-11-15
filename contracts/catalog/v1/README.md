# قرارداد مستقل catalog/v1 — فقط فرادادهٔ امضاشده

مرجع هنجاری: [CATALOG_V1.md](../../../docs/architecture/CATALOG_V1.md). این مسیر **جایگزین** `contracts/v1/lesson.schema.json`، `manifest-*.schema.json` یا فرمت `.rdpack` نیست و به [`bootstrap-catalog.schema.json`](../../v1/bootstrap-catalog.schema.json) تاریخیِ همراه APK وابسته نیست.

| فایل | مصرف |
| --- | --- |
| [`catalog-envelope.schema.json`](catalog-envelope.schema.json) | envelope یکسان برای GET زبان‌ها و GET فهرست یک زبان؛ `cat-` و domain امضا کاملاً جدا از `latest.json`. |
| [`languages-payload.schema.json`](languages-payload.schema.json) | payload امضاشدهٔ فقط زبان‌های منتشرشده. |
| [`songs-payload.schema.json`](songs-payload.schema.json) | payload امضاشدهٔ فقط یک زبان با `manifestUrl`/`coverUrl` هاست مالک. |
| [`fixtures/`](fixtures/) | JSON payload و envelope واقعیِ قابل بررسی با Ed25519، نسخهٔ ۱ و ۲ِ فهرست انگلیسی، زبان اسپانیاییِ فعال با فهرست خالی امضاشده و کلید عمومی **TEST ONLY**. `example.invalid` دامنهٔ نمونه است؛ URL قابل استفاده برای انتشار نیست. |

بازسازی deterministic بردارهای تست: `node scripts/generate_catalog_fixture.mjs` در ریشه؛ `npm test` آزمون ساختار، امضا، domain separation، URL و ضد rollback را اجرا می‌کند. Seed ثابتِ RFC 8032 در اسکریپت **کلید خصوصی تولید نیست**؛ برای release ممنوع است. Android باید همین envelopeها را مستقل با raw32 public test key در JVM/دستگاه بررسی کند، ولی کلید test وارد release نشود.

قواعد غیرقابل‌بیان با schema: UTF-8 سخت‌گیر، رد duplicate key، امضا بر بایت‌های اصلی پیش از parse، Base64URL canonical، سقف بایت، یکتایی زبان و `songId`، تطبیق `language/targetLanguage` با endpoint و با `latest.json` امضاشده/`lesson.json`، HTTPS/URL canonical/host allowlist، ضد rollback و نگهداری cache معتبر. Worker و Android هر دو باید این چک‌ها را پیاده کنند. هیچ فایل صوتی/درس/تصویر/رمز یا URL دارای توکن در این قرارداد یا fixture نیست.
