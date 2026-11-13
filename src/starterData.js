// Original, introductory examples for the UI prototype. The language paths
// are independent of the catalog previews and do not contain licensed lyrics.
import { createLearningTable } from "./lib/learningTable.js";

function letters(glyphs, names, persianHints) {
  const characters = Array.from(glyphs);
  const readings = names.split("|");
  const hints = persianHints.split("|");
  if (
    characters.length !== readings.length ||
    characters.length !== hints.length
  ) {
    throw new Error("Starter alphabet letters and readings must match");
  }
  return characters.map((glyph, index) => ({
    glyph,
    name: readings[index],
    faHint: hints[index],
  }));
}

export const starterCourses = {
  en: {
    locale: "en-GB",
    heroGlyph: "Aa",
    scriptFa: "خط لاتین",
    scriptEn: "Latin script",
    introFa:
      "از نام حروف تا صدای واقعی‌شان در واژه‌ها؛ چند قدم کوتاه پیش از خواندن اولین لیریک.",
    introEn:
      "Go from letter names to their sounds in words, then read your first lyric line.",
    alphabetFa: "۲۶ حرف؛ یک شروع آشنا",
    alphabetEn: "26 letters, one familiar start",
    alphabetTipFa:
      "نام حرف همیشه همان صدایی نیست که در واژه می‌شنوی. مثلاً نام A صدای /eɪ/ دارد، اما در cat صدای /æ/ می‌دهد.",
    alphabetTipEn:
      "A letter's name is not always its sound in a word. A is /eɪ/ as a name, but /æ/ in cat.",
    alphabetGroups: [
      {
        nameFa: "حروف انگلیسی",
        nameEn: "English letters",
        letters: letters(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          "/eɪ/|/biː/|/siː/|/diː/|/iː/|/ef/|/dʒiː/|/eɪtʃ/|/aɪ/|/dʒeɪ/|/keɪ/|/el/|/em/|/en/|/əʊ/|/piː/|/kjuː/|/ɑː/|/es/|/tiː/|/juː/|/viː/|/ˈdʌbəl.juː/|/eks/|/waɪ/|/zɛd/",
          "اِی|بی|سی|دی|ای|اِف|جی|اِیچ|آی|جِی|کِی|اِل|اِم|اِن|اُو|پی|کیو|آر|اِس|تی|یو|وی|دابِل‌یو|اِکس|وای|زِد",
        ),
      },
    ],
    sounds: [
      {
        symbol: "A /æ/",
        example: "cat",
        reading: "/kæt/",
        faReading: "کَت",
        tipFa: "در این واژه A صدای کوتاه /æ/ دارد، نه نامِ خودش را.",
        tipEn: "Here A has a short /æ/ sound, not its letter name.",
      },
      {
        symbol: "TH /θ/",
        example: "think",
        reading: "/θɪŋk/",
        faReading: "ثینک (زبان میان دندان‌ها)",
        tipFa:
          "در think، نوک زبان میان دندان‌ها قرار می‌گیرد؛ «ث» فارسی معادل دقیق این صدا نیست.",
        tipEn:
          "In think, the tongue meets the teeth; this is not the sound of T alone.",
      },
      {
        symbol: "SH /ʃ/",
        example: "shine",
        reading: "/ʃaɪn/",
        faReading: "شاین",
        tipFa:
          "دو حرف کنار هم یک صدای «ش» می‌سازند؛ در لیریک‌ها زیاد می‌بینیش.",
        tipEn: "Two letters make one sh sound, a common pattern in lyrics.",
      },
    ],
    grammar: [
      {
        titleFa: "فاعل + فعل",
        titleEn: "Subject + verb",
        pattern: "I + walk",
        example: "I walk home.",
        translationFa: "من پیاده به خانه می‌روم.",
        translationEn: "The speaker walks home.",
        tipFa:
          "فاعل معمولاً پیش از فعل می‌آید؛ اول بپرس «چه کسی؟» و بعد «چه می‌کند؟». گاهی در لیریک‌ها ترتیب برای آهنگ تغییر می‌کند.",
        tipEn:
          "Look for who does the action, then the verb. Lyrics may bend the usual order for rhythm.",
        tone: "mint",
        tables: [
          {
            titleFa: "چه کسی چه می‌کند؟",
            titleEn: "Who does what?",
            columns: [
              { fa: "فاعل", en: "Subject" },
              { fa: "فعل", en: "Verb" },
              { fa: "جمله", en: "Sentence" },
            ],
            rows: [
              ["I", "walk", "I walk home."],
              ["She", "walks", "She walks home."],
              ["They", "walk", "They walk home."],
            ],
          },
        ],
        check: {
          promptFa: "She ___ home. شکل درست walk را انتخاب کن.",
          promptEn: "She ___ home. Which form of walk fits?",
          answerFa: "walks؛ در حال ساده برای she به فعل s اضافه می‌شود.",
          answerEn: "walks — simple-present she usually takes an -s ending.",
        },
      },
      {
        titleFa: "a و the",
        titleEn: "a and the",
        pattern: "a light → the light",
        example: "A light is on.",
        translationFa: "چراغی روشن است.",
        translationEn: "One light is on.",
        tipFa:
          "a برای چیزی نامشخص است؛ the برای چیزی که مشخص شده. در عبارت‌های آهنگ دنبالش بگرد.",
        tipEn:
          "a introduces something; the points to something already known or specific.",
        tone: "amber",
        tables: [
          {
            titleFa: "کدام حرف تعریف؟",
            titleEn: "Which article?",
            columns: [
              { fa: "عبارت", en: "Phrase" },
              { fa: "زمان استفاده", en: "Use it when" },
            ],
            rows: [
              ["a light", { fa: "چراغی نامشخص", en: "any one light" }],
              ["the light", { fa: "چراغی مشخص", en: "a specific light" }],
              [
                "an idea",
                {
                  fa: "صدای آغاز واژه واکه است",
                  en: "the next word starts with a vowel sound",
                },
              ],
            ],
            footerFa:
              "در انگلیسی حرف تعریف جنسیت دستوریِ اسم را نشان نمی‌دهد؛ در اسپانیایی موضوع متفاوت است.",
            footerEn:
              "English articles don't mark noun gender; Spanish articles work differently.",
          },
        ],
      },
      {
        titleFa: "حال ساده",
        titleEn: "Simple present",
        pattern: "she + sings",
        example: "She sings at night.",
        translationFa: "او شب‌ها آواز می‌خواند.",
        translationEn: "She sings at night.",
        tipFa:
          "برای he / she / it در جملهٔ مثبتِ حال ساده، معمولاً به فعل s اضافه می‌شود.",
        tipEn:
          "With he, she or it, a positive simple-present verb usually adds s.",
        tone: "rose",
        tables: [
          {
            titleFa: "فاعل و شکل فعل sing",
            titleEn: "The verb sing by subject",
            columns: [
              { fa: "فاعل", en: "Subject" },
              { fa: "فعل", en: "Verb" },
              { fa: "نمونه", en: "Example" },
            ],
            rows: [
              ["I / you / we / they", "sing", "They sing at night."],
              ["he / she / it", "sings", "She sings at night."],
            ],
            footerFa:
              "این قانون برای جملهٔ مثبتِ حال ساده است؛ شکل سؤال یا منفی فرق می‌کند.",
            footerEn:
              "This is for positive simple-present statements; questions and negatives differ.",
          },
        ],
        takeawayFa:
          "برای he / she / it در جملهٔ مثبتِ حال ساده معمولاً s اضافه می‌شود.",
        takeawayEn:
          "He / she / it usually adds -s in positive simple-present statements.",
      },
    ],
    wordsIntroFa:
      "در انگلیسی اسم‌ها جنسیت دستوری ندارند؛ نقشِ یک واژه گاهی با جای آن در جمله تغییر می‌کند.",
    wordsIntroEn:
      "English nouns have no grammatical gender. A word's role can change with its place in a sentence.",
    words: [
      {
        word: "hope",
        translationFa: "امید / امیدوار بودن",
        translationEn: "hope",
        partFa: "اسم و فعل",
        partEn: "noun and verb",
        example: "I keep a little hope alive.",
        exampleFa: "ذره‌ای امید را زنده نگه می‌دارم.",
        exampleEn: "I hold on to a bit of hope.",
        tone: "mint",
      },
      {
        word: "light",
        translationFa: "نور / روشن کردن",
        translationEn: "light",
        partFa: "اسم و فعل",
        partEn: "noun and verb",
        example: "The light is on.",
        exampleFa: "چراغ روشن است.",
        exampleEn: "The light is on.",
        tone: "amber",
      },
      {
        word: "step",
        translationFa: "قدم / قدم برداشتن",
        translationEn: "step",
        partFa: "اسم و فعل",
        partEn: "noun and verb",
        example: "One step at a time.",
        exampleFa: "هر بار یک قدم.",
        exampleEn: "One small step at a time.",
        tone: "apricot",
      },
      {
        word: "night",
        translationFa: "شب",
        translationEn: "night",
        partFa: "اسم",
        partEn: "noun",
        example: "She sings at night.",
        exampleFa: "او شب‌ها آواز می‌خواند.",
        exampleEn: "She sings at night.",
        tone: "rose",
      },
    ],
    vocabularyTables: [
      {
        titleFa: "یک واژه، دو نقش",
        titleEn: "One word, two roles",
        introFa:
          "معنی و نقش واژه را در جمله تشخیص بده؛ جدول، لیست لغت را کامل می‌کند.",
        introEn: "Look at a word in context to tell a noun from a verb.",
        columns: [
          { fa: "واژه", en: "Word" },
          { fa: "در نقش اسم", en: "As a noun" },
          { fa: "در نقش فعل", en: "As a verb" },
        ],
        rows: [
          ["hope", "There is hope.", "I hope so."],
          ["light", "The light is on.", "I light a candle."],
          ["step", "One step at a time.", "Step forward."],
        ],
        footerFa:
          "اسم‌های انگلیسی جنسیت دستوری ندارند؛ برای جدول جنسیت و حرف تعریف به واژگان اسپانیایی برو.",
        footerEn:
          "English nouns have no grammatical gender; see the Spanish vocabulary table for articles and gender.",
      },
    ],
    practice: {
      line: "I keep a little hope alive.",
      faReading: "آی کیپ اِ لیتِل هوپ اَلایو",
      translationFa: "ذره‌ای امید را زنده نگه می‌دارم.",
      translationEn: "I hold on to a bit of hope.",
      tipFa:
        "این جمله از متنِ اختصاصیِ آهنگ نمایشی است. بخش‌هایش را لمس کن، سپس ترجمه را آشکار کن.",
      tipEn:
        "An original line from the demo. Tap its parts, then reveal the meaning.",
      pieces: [
        { text: "I", fa: "من", en: "the speaker" },
        { text: "keep", fa: "نگه می‌دارم", en: "hold on to" },
        { text: "a little hope", fa: "ذره‌ای امید", en: "a bit of hope" },
        { text: "alive.", fa: "زنده", en: "still living" },
      ],
    },
  },
  es: {
    locale: "es-ES",
    heroGlyph: "Ññ",
    scriptFa: "الفبای اسپانیایی",
    scriptEn: "Spanish alphabet",
    introFa:
      "حروف آشنا، چند صدای تازه و اولین الگوهای جمله؛ برای خواندن متن اسپانیایی آماده شو.",
    introEn:
      "Familiar letters, a few new sounds and your first sentence patterns for Spanish text.",
    alphabetFa: "۲۷ حرف؛ با Ñ آشنا شو",
    alphabetEn: "27 letters, including Ñ",
    alphabetTipFa:
      "اسپانیایی ۲۷ حرف دارد. Ñ یک حرف مستقل است؛ واکه‌های á، é، í، ó و ú همان حروف با نشانهٔ تکیه هستند. بعضی صداها در اسپانیا و آمریکای لاتین فرق می‌کنند.",
    alphabetTipEn:
      "Spanish has 27 letters. Ñ is its own letter; á, é, í, ó and ú mark stress. Some sounds vary between Spain and Latin America.",
    alphabetGroups: [
      {
        nameFa: "حروف اسپانیایی",
        nameEn: "Spanish letters",
        letters: letters(
          "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
          "a|be|ce|de|e|efe|ge|hache|i|jota|ka|ele|eme|ene|eñe|o|pe|cu|erre|ese|te|u|uve|uve doble|equis|ye|zeta",
          "آ|بِه|ثِه / سِه|دِه|اِه|اِفِه|خِه|آچِه|ای|خوتا|کا|اِلِه|اِمِه|اِنِه|اِن‌یه|اُ|پِه|کو|اِرِه|اِسِه|تِه|او|اووِه|اووِه‌دوبلِه|اِکیس|یِه|ثِتا / سِتا",
        ),
      },
    ],
    sounds: [
      {
        symbol: "Ñ /ɲ/",
        example: "niño",
        reading: "/ˈniɲo/",
        faReading: "نین‌یو",
        tipFa:
          "Ñ صدای «نی» پیوسته می‌دهد؛ یک حرف است، نه N به‌علاوهٔ نشانهٔ تزئینی.",
        tipEn:
          "Ñ makes a palatal ny sound. It is a separate letter, not just a decorated N.",
      },
      {
        symbol: "J /x/",
        example: "jardín",
        reading: "/xaɾˈdin/",
        faReading: "خاردین",
        tipFa: "J معمولاً صدایی نزدیک «خ» دارد؛ شبیه J انگلیسی نیست.",
        tipEn:
          "J commonly has a breathy kh-like sound, not the English J sound.",
      },
      {
        symbol: "H /∅/",
        example: "hola",
        reading: "/ˈola/",
        faReading: "اُلا",
        tipFa: "H در آغاز hola نوشته می‌شود، اما به‌تنهایی خوانده نمی‌شود.",
        tipEn: "H is written at the start of hola, but it is silent by itself.",
      },
      {
        symbol: "LL /ʝ/",
        example: "llama",
        reading: "/ˈʝama/",
        faReading: "یاما (در بسیاری از لهجه‌ها)",
        tipFa:
          "دو حرف ll در بسیاری از لهجه‌ها صدایی نزدیک «ی» می‌دهند: llama ≈ «یاما». در آرژانتین و اروگوئه ممکن است نزدیک «ژ/ش» شنیده شود؛ برخی گویش‌ها /ʎ/ را حفظ کرده‌اند. تلفظ را با صدای گوینده بسنج.",
        tipEn:
          "LL often sounds like Spanish y (roughly Persian ی). In parts of Argentina and Uruguay it can sound like zh/sh; some dialects keep /ʎ/. Listen to the speaker's accent.",
      },
    ],
    grammar: [
      {
        titleFa: "فاعل و شکل فعل",
        titleEn: "Subject and verb form",
        pattern: "yo + canto",
        example: "Yo canto.",
        translationFa: "من می‌خوانم.",
        translationEn: "I sing.",
        tipFa:
          "پایان فعل با فاعل تغییر می‌کند. گاهی yo حذف می‌شود و از خودِ canto می‌فهمی فاعل «من» است.",
        tipEn:
          "Verb endings change with the subject. Yo can disappear because canto already signals I.",
        tone: "apricot",
        tables: [
          createLearningTable({
            titleFa: "صرفِ cantar در زمان حال",
            titleEn: "Cantar in the present tense",
            introFa: "فاعل تغییر می‌کند؛ به پایانِ فعل دقت کن.",
            introEn: "The ending changes with the person.",
            grid: [
              [
                { fa: "فاعل", en: "Subject" },
                { fa: "فعل", en: "Verb" },
                { fa: "معنی", en: "Meaning" },
              ],
              ["yo", "canto", { fa: "من می‌خوانم", en: "I sing" }],
              [
                "tú",
                "cantas",
                { fa: "تو می‌خوانی", en: "you sing (informal)" },
              ],
              [
                "él / ella / usted",
                "canta",
                {
                  fa: "او می‌خواند / شما می‌خوانید (رسمی)",
                  en: "he/she sings; you sing (formal)",
                },
              ],
              [
                "nosotros / nosotras",
                "cantamos",
                { fa: "ما می‌خوانیم", en: "we sing" },
              ],
              [
                "vosotros / vosotras",
                "cantáis",
                {
                  fa: "شماها می‌خوانید (رایج در اسپانیا)",
                  en: "you all sing (mainly Spain)",
                },
              ],
              [
                "ellos / ellas / ustedes",
                "cantan",
                {
                  fa: "آن‌ها می‌خوانند / شماها می‌خوانید",
                  en: "they sing / you all sing",
                },
              ],
            ],
            footerFa:
              "در بسیاری از کشورهای آمریکای لاتین به‌جای vosotros از ustedes + cantan استفاده می‌شود.",
            footerEn:
              "In much of Latin America, ustedes + cantan is used instead of vosotros.",
          }),
        ],
        check: {
          promptFa: "Yo ___ una canción. شکل درستِ cantar چیست؟",
          promptEn: "Yo ___ una canción. Which form of cantar fits?",
          answerFa: "canto؛ پایانِ فعل نشان می‌دهد فاعل «من» است.",
          answerEn: "canto — the ending already tells you the subject is I.",
        },
      },
      {
        titleFa: "جنسیت اسم‌ها",
        titleEn: "Noun gender",
        pattern: "la luna · el sol",
        example: "La luna brilla.",
        translationFa: "ماه می‌درخشد.",
        translationEn: "The moon shines.",
        tipFa:
          "la و el از نشانه‌های رایجِ جنسیت دستوری هستند. اسم‌ها را همراه حرف تعریف‌شان یاد بگیر.",
        tipEn:
          "la and el are common gendered articles. Learn a noun together with its article.",
        tone: "rose",
        tables: [
          {
            titleFa: "حرف تعریف با جنسیت و شمار",
            titleEn: "Articles by gender and number",
            columns: [
              { fa: "جنسیت دستوری", en: "Grammatical gender" },
              { fa: "مفرد", en: "Singular" },
              { fa: "جمع", en: "Plural" },
              { fa: "نمونه", en: "Example" },
            ],
            rows: [
              [
                { fa: "مذکر", en: "Masculine" },
                "el",
                "los",
                "el sol → los soles",
              ],
              [
                { fa: "مؤنث", en: "Feminine" },
                "la",
                "las",
                "la luna → las lunas",
              ],
            ],
            footerFa:
              "جنسیت دستوری دربارهٔ شکلِ واژه است، نه جنسیت واقعیِ شیء؛ پایانِ o / a فقط سرنخ است و استثنا هم دارد.",
            footerEn:
              "Grammatical gender is about word forms, not the object's real-world sex. -o / -a are clues, not reliable rules.",
          },
        ],
        takeawayFa:
          "اسم را با حرف تعریف یاد بگیر: el día با وجود پایانِ a مذکر است و la mano با پایانِ o مؤنث.",
        takeawayEn:
          "Learn the article with the noun: el día ends in -a but is masculine; la mano ends in -o but is feminine.",
      },
      {
        titleFa: "جای صفت",
        titleEn: "Adjective position",
        pattern: "noche + tranquila",
        example: "Una noche tranquila.",
        translationFa: "شبی آرام.",
        translationEn: "A quiet night.",
        tipFa:
          "بسیاری از صفت‌ها بعد از اسم می‌آیند؛ هنگام خواندن یک عبارت به ترتیب واژه‌ها دقت کن.",
        tipEn:
          "Many descriptive adjectives follow the noun; watch the order in a phrase.",
        tone: "mint",
        tables: [
          {
            titleFa: "صفت alto هم‌خوان با اسم",
            titleEn: "Alto agrees with the noun",
            columns: [
              { fa: "اسم", en: "Noun" },
              { fa: "صفت", en: "Adjective" },
              { fa: "عبارت", en: "Phrase" },
            ],
            rows: [
              ["el niño", "alto", "el niño alto"],
              ["la niña", "alta", "la niña alta"],
              ["los niños", "altos", "los niños altos"],
              ["las niñas", "altas", "las niñas altas"],
            ],
            footerFa:
              "این الگو برای صفت‌هایی مثل alto که به o ختم می‌شوند کاربرد دارد؛ همهٔ صفت‌ها این‌طور تغییر نمی‌کنند.",
            footerEn:
              "This pattern fits -o adjectives like alto; not every adjective changes this way.",
          },
        ],
        check: {
          promptFa: "La niña ___ . شکل درستِ alto چیست؟",
          promptEn: "La niña ___ . Which form of alto fits?",
          answerFa: "alta؛ با اسم مؤنثِ مفرد هماهنگ می‌شود.",
          answerEn: "alta — it agrees with a feminine singular noun.",
        },
      },
      {
        titleFa: "دیروز، امروز، فردا",
        titleEn: "Yesterday, today, tomorrow",
        pattern: "canto · canté · cantaré",
        example: "Mañana cantaré.",
        translationFa: "فردا خواهم خواند.",
        translationEn: "Tomorrow I will sing.",
        tipFa:
          "فعل cantar با زمان هم تغییر می‌کند. فعلاً فقط تغییرِ شکل و نشانهٔ تکیه را در این سه نمونه ببین؛ لازم نیست همهٔ زمان‌ها را حفظ کنی.",
        tipEn:
          "Cantar changes with time too. For now, just notice the forms and accents in these three examples; you don't need to memorise every tense.",
        tone: "coral",
        tables: [
          {
            titleFa: "یک فاعل، سه زمان",
            titleEn: "One subject, three time frames",
            columns: [
              { fa: "زمان", en: "Time" },
              { fa: "فعل با yo", en: "Verb with yo" },
              { fa: "جمله", en: "Sentence" },
            ],
            rows: [
              [
                { fa: "امروز / حال", en: "Today / present" },
                "canto",
                "Hoy canto.",
              ],
              [
                { fa: "دیروز / گذشتهٔ ساده", en: "Yesterday / preterite" },
                "canté",
                "Ayer canté.",
              ],
              [
                { fa: "فردا / آینده", en: "Tomorrow / future" },
                "cantaré",
                "Mañana cantaré.",
              ],
            ],
            footerFa:
              "در نمونه‌های اسپانیاییِ بالا، فاعل yo می‌تواند حذف شود چون شکل فعل آن را نشان می‌دهد.",
            footerEn:
              "Yo can be left out in these Spanish examples because the verb form signals I.",
          },
        ],
      },
    ],
    wordsIntroFa:
      "در اسپانیایی جنسیت اسم دستوری است؛ واژه را همراه حرف تعریف و جمعش یاد بگیر. رنگ کارت‌ها جنسیت را نشان نمی‌دهد.",
    wordsIntroEn:
      "Spanish noun gender is grammatical. Learn each noun with its article and plural; card colours do not code gender.",
    words: [
      {
        word: "luna",
        article: "la",
        plural: "las lunas",
        genderFa: "مؤنث",
        genderEn: "feminine",
        translationFa: "ماه",
        translationEn: "moon",
        example: "La luna brilla.",
        exampleFa: "ماه می‌درخشد.",
        exampleEn: "The moon shines.",
        tone: "amber",
      },
      {
        word: "sol",
        article: "el",
        plural: "los soles",
        genderFa: "مذکر",
        genderEn: "masculine",
        translationFa: "خورشید",
        translationEn: "sun",
        example: "El sol brilla.",
        exampleFa: "خورشید می‌درخشد.",
        exampleEn: "The sun shines.",
        tone: "mint",
      },
      {
        word: "noche",
        article: "la",
        plural: "las noches",
        genderFa: "مؤنث",
        genderEn: "feminine",
        translationFa: "شب",
        translationEn: "night",
        example: "La noche es tranquila.",
        exampleFa: "شب آرام است.",
        exampleEn: "The night is quiet.",
        tone: "blue",
      },
      {
        word: "día",
        article: "el",
        plural: "los días",
        genderFa: "مذکر",
        genderEn: "masculine",
        translationFa: "روز",
        translationEn: "day",
        example: "El día empieza.",
        exampleFa: "روز شروع می‌شود.",
        exampleEn: "The day begins.",
        noteFa: "پایان a دارد اما مذکر است؛ همراه el حفظ کن.",
        noteEn: "Ends in -a but is masculine; remember el día.",
        tone: "coral",
      },
      {
        word: "mano",
        article: "la",
        plural: "las manos",
        genderFa: "مؤنث",
        genderEn: "feminine",
        translationFa: "دست",
        translationEn: "hand",
        example: "La mano está fría.",
        exampleFa: "دست سرد است.",
        exampleEn: "The hand is cold.",
        noteFa: "پایان o دارد اما مؤنث است؛ همراه la حفظ کن.",
        noteEn: "Ends in -o but is feminine; remember la mano.",
        tone: "apricot",
      },
      {
        word: "libro",
        article: "el",
        plural: "los libros",
        genderFa: "مذکر",
        genderEn: "masculine",
        translationFa: "کتاب",
        translationEn: "book",
        example: "El libro es nuevo.",
        exampleFa: "کتاب تازه است.",
        exampleEn: "The book is new.",
        tone: "rose",
      },
    ],
    vocabularyTables: [
      createLearningTable({
        titleFa: "جنسیت، حرف تعریف و جمعِ اسم‌ها",
        titleEn: "Noun gender, articles and plurals",
        introFa:
          "جنسیت را با رنگ حدس نزن؛ حرف تعریف و نامِ جنسیت در هر سطر آمده است.",
        introEn:
          "Don't guess gender from a colour; read the article and gender in each row.",
        grid: [
          [
            { fa: "اسم با حرف تعریف", en: "Noun + article" },
            { fa: "جنسیت", en: "Gender" },
            { fa: "جمع با حرف تعریف", en: "Plural + article" },
            { fa: "معنی", en: "Meaning" },
          ],
          [
            "la luna",
            { fa: "مؤنث", en: "feminine" },
            "las lunas",
            { fa: "ماه", en: "moon" },
          ],
          [
            "el sol",
            { fa: "مذکر", en: "masculine" },
            "los soles",
            { fa: "خورشید", en: "sun" },
          ],
          [
            "la noche",
            { fa: "مؤنث", en: "feminine" },
            "las noches",
            { fa: "شب", en: "night" },
          ],
          [
            "el día",
            { fa: "مذکر · پایان a", en: "masculine · ends in -a" },
            "los días",
            { fa: "روز", en: "day" },
          ],
          [
            "la mano",
            { fa: "مؤنث · پایان o", en: "feminine · ends in -o" },
            "las manos",
            { fa: "دست", en: "hand" },
          ],
          [
            "el libro",
            { fa: "مذکر", en: "masculine" },
            "los libros",
            { fa: "کتاب", en: "book" },
          ],
        ],
        footerFa:
          "el día و la mano نشان می‌دهند که پسوند a / o قانون قطعی نیست. همیشه اسم را با حرف تعریف یاد بگیر.",
        footerEn:
          "el día and la mano show why -a / -o aren't foolproof. Learn the article with the noun.",
      }),
    ],
    practice: {
      line: "La luna brilla esta noche.",
      faReading: "لا لونا بری‌یا اِستا نوچِه",
      translationFa: "ماه امشب می‌درخشد.",
      translationEn: "The moon shines tonight.",
      tipFa:
        "این جملهٔ تمرینی، متنِ آهنگِ دارای مجوز نیست. واژه‌ها را جدا کن و بعد معنی کامل را ببین.",
      tipEn:
        "This is an original practice sentence, not licensed song lyrics. Break it into parts first.",
      pieces: [
        { text: "La", fa: "حرف تعریف زنانه", en: "feminine the" },
        { text: "luna", fa: "ماه", en: "moon" },
        { text: "brilla", fa: "می‌درخشد", en: "shines" },
        { text: "esta noche.", fa: "امشب", en: "tonight" },
      ],
    },
  },
  ko: {
    locale: "ko-KR",
    heroGlyph: "한글",
    scriptFa: "هانگول؛ خط کره‌ای",
    scriptEn: "Hangul, the Korean script",
    introFa:
      "چند حرف پایه را به هجا تبدیل کن، صدای‌شان را بشنو و ترتیب جملهٔ کره‌ای را بشناس.",
    introEn:
      "Turn basic letters into syllable blocks, hear their sounds and meet Korean word order.",
    alphabetFa: "حروف پایهٔ هانگول",
    alphabetEn: "The basic Hangul letters",
    alphabetTipFa:
      "۱۴ صامت و ۱۰ واکهٔ پایه در بلوک‌های هجا کنار هم قرار می‌گیرند: ㄱ + ㅏ = 가. صدای بعضی صامت‌ها با جایگاه‌شان تغییر می‌کند.",
    alphabetTipEn:
      "14 basic consonants and 10 vowels form syllable blocks: ㄱ + ㅏ = 가. Some consonant sounds vary by position.",
    alphabetGroups: [
      {
        nameFa: "۱۴ صامت پایه",
        nameEn: "14 basic consonants",
        letters: letters(
          "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ",
          "기역|니은|디귿|리을|미음|비읍|시옷|이응|지읒|치읓|키읔|티읕|피읖|히읗",
          "کی‌یُک · گ/ک|نی‌اُن · ن|دی‌گِت · د/ت|ری‌اُل · ر/ل|می‌اُم · م|بی‌اُپ · ب/پ|سی‌اُت · س|ای‌اونگ · آغاز بی‌صدا، پایان نگ|جی‌اُت · ج/چ|چی‌اُت · چ|کی‌اُک · کِ پُرنَفَس|تی‌اُت · تِ پُرنَفَس|پی‌اُپ · پِ پُرنَفَس|هی‌اُت · ه",
        ),
      },
      {
        nameFa: "۱۰ واکهٔ پایه",
        nameEn: "10 basic vowels",
        letters: letters(
          "ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ",
          "아|야|어|여|오|요|우|유|으|이",
          "آ|یا|صدایی بین اَ و اُ|یَ / یُ|اُ|یُ|او|یو|واکه‌ای بدون معادل دقیق|ای",
        ),
      },
    ],
    sounds: [
      {
        symbol: "ㅏ /a/",
        example: "아",
        reading: "a",
        faReading: "آ",
        tipFa:
          "این واکه صدایی نزدیک «آ» دارد و می‌تواند با ㅇ خاموش یک هجا بسازد.",
        tipEn:
          "This vowel sounds close to a; it makes a syllable with a silent initial ㅇ.",
      },
      {
        symbol: "ㄴ /n/",
        example: "나",
        reading: "na",
        faReading: "نا",
        tipFa:
          "ㄴ با ㅏ ترکیب می‌شود و بلوکِ نا را می‌سازد؛ هر بلوک معمولاً یک هجا است.",
        tipEn:
          "ㄴ joins ㅏ to make 나 (na). Each block is usually one syllable.",
      },
      {
        symbol: "ㅇ /∅, ŋ/",
        example: "아 · 강",
        speech: "아, 강",
        reading: "a · gang",
        faReading: "آ · کانگ (پایان «نگ»)",
        tipFa:
          "ㅇ در آغاز هجا بی‌صدا است؛ در پایان هجا صدایی نزدیک «نگ» می‌دهد.",
        tipEn:
          "ㅇ is silent at a syllable's start and makes an ng sound at its end.",
      },
    ],
    grammar: [
      {
        titleFa: "فعل در پایان جمله",
        titleEn: "Verb at the end",
        pattern: "من + موسیقی را + می‌شنوم",
        example: "저는 음악을 들어요.",
        translationFa: "من به موسیقی گوش می‌دهم.",
        translationEn: "I listen to music.",
        tipFa:
          "در جملهٔ معمول کره‌ای، فعل اغلب آخر می‌آید؛ هنگام خواندن تا پایان جمله منتظرش بمان.",
        tipEn:
          "In a typical Korean sentence, the verb comes last. Look to the end of the line.",
        tone: "blue",
        tables: [
          {
            titleFa: "جای هر بخش در جمله",
            titleEn: "The role of each part",
            columns: [
              { fa: "بخش", en: "Part" },
              { fa: "نقش", en: "Role" },
              { fa: "معنی", en: "Meaning" },
            ],
            rows: [
              ["저는", { fa: "موضوع", en: "Topic" }, { fa: "من", en: "I" }],
              [
                "음악을",
                { fa: "مفعول", en: "Object" },
                { fa: "موسیقی را", en: "music" },
              ],
              [
                "들어요",
                { fa: "فعل", en: "Verb" },
                { fa: "گوش می‌دهم", en: "listen (polite)" },
              ],
            ],
          },
        ],
      },
      {
        titleFa: "نشانه‌های نقش واژه",
        titleEn: "Little word markers",
        pattern: "저는 · 음악을",
        example: "저는 음악을 들어요.",
        translationFa: "من به موسیقی گوش می‌دهم.",
        translationEn: "I listen to music.",
        tipFa:
          "پسوندِ 는 موضوع جمله را و 을 مفعول را نشان می‌دهد؛ این ذره‌ها به واژه می‌چسبند.",
        tipEn:
          "는 marks the topic and 을 marks the object; these particles attach to words.",
        tone: "mint",
        tables: [
          {
            titleFa: "نشانه با پایانِ واژه هماهنگ می‌شود",
            titleEn: "Choose a particle by the word's ending",
            columns: [
              { fa: "نقش", en: "Role" },
              { fa: "بعد از واکه", en: "After a vowel" },
              { fa: "بعد از صامت", en: "After a consonant" },
            ],
            rows: [
              [{ fa: "فاعل", en: "Subject" }, "노래가", "밤이"],
              [{ fa: "مفعول", en: "Object" }, "노래를", "음악을"],
            ],
            footerFa:
              "این جدول نشانهٔ فاعل و مفعول را نشان می‌دهد؛ نشانهٔ موضوع (은/는) مسیر جداگانه‌ای دارد.",
            footerEn:
              "These are subject and object markers; topic markers (은/는) form another pair.",
          },
        ],
        check: {
          promptFa:
            "밤___ 와요. چون 밤 به صامت ختم می‌شود، برای فاعل کدام نشانه می‌آید؟",
          promptEn:
            "밤___ 와요. 밤 ends in a consonant: which subject marker fits?",
          answerFa: "이؛ می‌شود 밤이 와요.",
          answerEn: "이 — the phrase becomes 밤이 와요.",
        },
      },
      {
        titleFa: "پایان مؤدبانه",
        titleEn: "Polite verb endings",
        pattern: "와 + 요 → 와요",
        example: "밤이 와요.",
        translationFa: "شب از راه می‌رسد.",
        translationEn: "Night is coming.",
        tipFa:
          "پایانِ 요 در این نمونه لحن را مؤدبانه‌تر می‌کند. در لیریک‌ها ممکن است صورت خودمانی هم ببینی.",
        tipEn:
          "The ending 요 makes this example polite. Lyrics can also use more casual endings.",
        tone: "amber",
        tables: [
          {
            titleFa: "یک فعل با دو لحن",
            titleEn: "One verb, two speech levels",
            columns: [
              { fa: "عبارت", en: "Phrase" },
              { fa: "لحن", en: "Tone" },
              { fa: "کجا؟", en: "Use" },
            ],
            rows: [
              [
                "밤이 와.",
                { fa: "خودمانی", en: "Casual" },
                { fa: "با افراد صمیمی", en: "With close friends" },
              ],
              [
                "밤이 와요.",
                { fa: "مؤدبانه", en: "Polite" },
                {
                  fa: "در گفت‌وگوی معمولِ محترمانه",
                  en: "Everyday polite conversation",
                },
              ],
            ],
          },
        ],
        takeawayFa:
          "پایان فعل، لحن جمله را عوض می‌کند؛ معنی اصلیِ «آمدن» باقی می‌ماند.",
        takeawayEn:
          "The ending changes the social tone; the meaning of coming stays.",
      },
    ],
    wordsIntroFa:
      "کره‌ای جنسیت دستوریِ اسم ندارد؛ نشانه‌ها به آخرِ واژه می‌چسبند و نقش آن را در جمله نشان می‌دهند.",
    wordsIntroEn:
      "Korean nouns have no grammatical gender; particles attach to words and show their role in a sentence.",
    words: [
      {
        word: "밤",
        translationFa: "شب",
        translationEn: "night",
        partFa: "اسم",
        partEn: "noun",
        example: "밤이 와요.",
        exampleFa: "شب از راه می‌رسد.",
        exampleEn: "Night is coming.",
        tone: "blue",
      },
      {
        word: "음악",
        translationFa: "موسیقی",
        translationEn: "music",
        partFa: "اسم",
        partEn: "noun",
        example: "음악을 들어요.",
        exampleFa: "به موسیقی گوش می‌دهم.",
        exampleEn: "I listen to music.",
        tone: "mint",
      },
      {
        word: "노래",
        translationFa: "آهنگ",
        translationEn: "song",
        partFa: "اسم",
        partEn: "noun",
        example: "노래를 불러요.",
        exampleFa: "آهنگ می‌خوانم.",
        exampleEn: "I sing a song.",
        tone: "rose",
      },
      {
        word: "길",
        translationFa: "راه",
        translationEn: "road / way",
        partFa: "اسم",
        partEn: "noun",
        example: "길을 걸어요.",
        exampleFa: "در راه قدم می‌زنم.",
        exampleEn: "I walk along the road.",
        tone: "apricot",
      },
    ],
    vocabularyTables: [
      {
        titleFa: "واژهٔ تنها و واژهٔ در جمله",
        titleEn: "A word on its own and in a sentence",
        introFa:
          "در کره‌ای نشانه‌ها به اسم می‌چسبند و نقش آن را نشان می‌دهند؛ این زبان جنسیت دستوریِ اسم ندارد.",
        introEn:
          "Particles attach to Korean nouns to show their role; Korean nouns have no grammatical gender.",
        columns: [
          { fa: "اسم", en: "Noun" },
          { fa: "با نشانه", en: "With a particle" },
          { fa: "نقش در مثال", en: "Role in the example" },
        ],
        rows: [
          [
            "밤",
            "밤이",
            {
              fa: "فاعلِ «شب از راه می‌رسد»",
              en: "subject in 'Night is coming'",
            },
          ],
          [
            "음악",
            "음악을",
            { fa: "مفعولِ «گوش می‌دهم»", en: "object of 'listen to'" },
          ],
          [
            "노래",
            "노래를",
            { fa: "مفعولِ «می‌خوانم»", en: "object of 'sing'" },
          ],
          [
            "길",
            "길을",
            { fa: "مفعولِ «قدم می‌زنم»", en: "object of 'walk along'" },
          ],
        ],
        footerFa:
          "به‌جای حفظ‌کردن اسمِ تنها، آن را با جمله و نشانهٔ کنارش هم تمرین کن.",
        footerEn:
          "Practise each noun with a sentence and its particle, not only on its own.",
      },
    ],
    practice: {
      line: "밤이 와요.",
      faReading: "بامی وایو",
      translationFa: "شب از راه می‌رسد.",
      translationEn: "Night is coming.",
      tipFa:
        "یک جملهٔ کوتاهِ اختصاصی برای تمرین: بلوک‌های هجا را بخوان، نقشِ 이 را پیدا کن و معنی را آشکار کن.",
      tipEn:
        "An original practice line: read the syllable blocks, spot the marker 이 and reveal the meaning.",
      pieces: [
        { text: "밤이", fa: "شب + نشانهٔ فاعل", en: "night + subject marker" },
        { text: "와요.", fa: "می‌آید؛ مؤدبانه", en: "comes; polite form" },
      ],
    },
  },
};
