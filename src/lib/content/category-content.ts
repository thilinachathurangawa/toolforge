// src/lib/content/category-content.ts
// Long-form editorial content for category landing pages, keyed by category value.
// Kept separate from the CATEGORIES registry (which holds routing + the short
// description) so the landing pages carry substantial, unique copy beyond a
// single sentence. Each block is hand-written per category, not templated.

export interface CategoryLongContent {
  /** 2–3 unique paragraphs: what the category covers, who it's for, real use cases. */
  intro: string[];
  /** 3–5 question/answer pairs relevant to the whole category. */
  faqs: { question: string; answer: string }[];
}

export const CATEGORY_CONTENT: Record<string, CategoryLongContent> = {
  image: {
    intro: [
      `Images are usually the heaviest thing on a web page and the most fiddly to get right — too large and the page crawls, the wrong format and it will not display, the wrong dimensions and it looks stretched. ToolForge's image tools handle the whole pipeline: compress a photo to a fraction of its size, resize it to exact or social-media dimensions, crop it to a clean shape, convert between JPG, PNG, WebP, and GIF, strip hidden metadata, and pull a color palette from any picture.`,
      `What ties them together is that every one runs entirely in your browser on an HTML canvas — your photos are never uploaded to a server. That matters for personal pictures, client work, and screenshots that may contain sensitive details, and it also means there is no file-size queue or account to create. Web developers optimizing assets, social media managers hitting platform specs, and anyone who just needs a smaller or differently-shaped image can do it here in seconds.`,
    ],
    faqs: [
      {
        question: `Are my images uploaded when I use these tools?`,
        answer: `No. Every image tool here processes your file locally in the browser using the canvas API, so the image never leaves your device. This makes them safe for private photos, confidential screenshots, and client work.`,
      },
      {
        question: `Which image format should I use for the web?`,
        answer: `WebP usually gives the smallest file at good quality and supports transparency, making it the best default for the web. Use PNG when you need lossless quality or transparency without WebP, and JPG for photographs where a small file matters more than perfect detail.`,
      },
      {
        question: `Will compressing or resizing ruin image quality?`,
        answer: `Compression and downscaling are designed to preserve visible quality while cutting file size, and the results are usually indistinguishable at normal viewing sizes. Enlarging beyond an image's original dimensions is the one operation that softens detail, since pixels cannot be invented.`,
      },
      {
        question: `Why should I remove metadata from photos before sharing?`,
        answer: `Photos often embed hidden EXIF data including the camera, timestamp, and the exact GPS coordinates where they were taken. Stripping that before posting protects your privacy, which is why the metadata remover exists alongside the editing tools.`,
      },
    ],
  },

  text: {
    intro: [
      `Words are the raw material of the web, and shaping them well takes more than a word processor. ToolForge's text tools count words and characters as you type, analyze readability, generate placeholder Lorem Ipsum, convert between letter cases, compare two versions line by line, and preview Markdown — the small jobs that crop up constantly when you are writing, editing, or laying out content.`,
      `Writers and bloggers lean on the word and character counts to hit length targets, editors use the diff and readability tools to tighten drafts, and designers drop in Lorem Ipsum to mock up a layout. Everything works instantly in the browser with nothing to install, so you can paste a draft, get the numbers or the transformation you need, and get back to writing.`,
    ],
    faqs: [
      {
        question: `Do these text tools work offline or store my writing?`,
        answer: `They run entirely in your browser, so your text is processed on your device and never uploaded or stored on a server. That keeps unpublished drafts and sensitive documents private.`,
      },
      {
        question: `What is a good word count or reading level for web content?`,
        answer: `It depends on the goal, but plain, scannable writing tends to perform best online — many writers aim for a Flesch Reading Ease of 60 or above. Use the word counter to hit length targets and the readability checker to keep the prose accessible.`,
      },
      {
        question: `What is Lorem Ipsum used for?`,
        answer: `Lorem Ipsum is placeholder text used to fill a design or layout so you can judge spacing and typography without real copy distracting you. It has been a standard in publishing and web design for decades.`,
      },
    ],
  },

  developer: {
    intro: [
      `Developers spend a surprising amount of time on small data chores — pretty-printing a JSON blob, decoding a token, testing a regex, encoding a string, formatting a query. ToolForge gathers those utilities in one place: format and validate JSON and explore it by path, encode and decode Base64 and URLs, test and explain regular expressions, generate UUIDs, decode JWTs, format SQL, convert and diff text, minify code, and more.`,
      `Crucially, these all run client-side in your browser, so the code, tokens, and API payloads you paste never travel to a server — a real concern when you are debugging with production data. There is no sign-up and no rate limit, so they fit naturally into a debugging session whether you are building an API, integrating a third-party service, or just trying to read a minified response.`,
    ],
    faqs: [
      {
        question: `Is it safe to paste sensitive data like tokens into these tools?`,
        answer: `These developer tools process everything locally in your browser, so the data you paste is not uploaded. That said, on a shared or untrusted computer, treat any secret with caution as a general practice, and remember that decoding a token does not make it less valid.`,
      },
      {
        question: `Why is my JSON showing as invalid?`,
        answer: `The usual culprits are trailing commas, single quotes instead of double quotes, unquoted keys, or an unclosed bracket — JSON is stricter than JavaScript object syntax. The JSON formatter and parser report the exact error so you can find and fix it.`,
      },
      {
        question: `Do these tools work without an internet connection or account?`,
        answer: `No account is ever required, and because the logic runs in your browser, most will keep working even offline once the page has loaded. A few — such as DNS or header lookups in the network section — do call external services, but the core developer utilities are fully local.`,
      },
      {
        question: `Which JSON tool should I use?`,
        answer: `Use the formatter to pretty-print and validate, the parser to clean a minified string, the path finder to extract a specific value, the filter to narrow an array, and the diff to compare two documents. Each focuses on one job so the right tool is quick to reach for.`,
      },
    ],
  },

  converter: {
    intro: [
      `Converting between units and formats is one of those tasks that interrupts real work — you just need to know what 5 miles is in kilometers, or to turn a JSON export into a spreadsheet. ToolForge's converters handle measurement units across length, weight, temperature, area, volume, speed, and time, alongside data conversions like JSON to CSV.`,
      `Students check homework, engineers and cooks convert between metric and imperial, and developers reshape data for import elsewhere. The conversions are instant and run in your browser, so there is no waiting and nothing to install — type a value, pick the units or formats, and read the result.`,
    ],
    faqs: [
      {
        question: `How accurate are the unit conversions?`,
        answer: `Conversions use standard, exact conversion factors, so they are accurate to the precision shown. For everyday use the results are reliable; for scientific or engineering work, just be mindful of how many decimal places your application requires.`,
      },
      {
        question: `Can I convert between metric and imperial units?`,
        answer: `Yes. The unit converter handles both systems across length, weight, temperature, volume, and more, so you can move freely between, say, kilograms and pounds or Celsius and Fahrenheit.`,
      },
      {
        question: `Do these converters work in my browser?`,
        answer: `Yes, the conversions run locally and instantly with no upload or sign-up, so you can convert as many values as you like without any limit.`,
      },
    ],
  },

  generator: {
    intro: [
      `Sometimes you need the computer to produce something for you — a scannable QR code, a strong password, a unique identifier, a block of placeholder text. ToolForge's generators cover those: create QR codes for URLs, WiFi, and contact details, generate cryptographically strong passwords, produce UUIDs, and spin up Lorem Ipsum on demand.`,
      `Marketers and business owners generate QR codes for print and signage, developers grab UUIDs and test data, and the security-minded create passwords that are genuinely hard to crack. Each generator runs in the browser with no account, and the ones that matter for security — passwords and UUIDs — draw on your browser's cryptographic random source rather than a weak substitute.`,
    ],
    faqs: [
      {
        question: `Are generated passwords and UUIDs truly random?`,
        answer: `The security-focused generators use your browser's cryptographically secure random source, which is suitable for real passwords and identifiers — far stronger than ordinary random functions. Everything is generated locally and never transmitted.`,
      },
      {
        question: `What can I put in a QR code?`,
        answer: `QR codes can encode website URLs, plain text, contact details, WiFi credentials, and more. The generated code can be downloaded and printed or displayed, and it works with any standard QR scanner or phone camera.`,
      },
      {
        question: `Do the generators store what they create?`,
        answer: `No. Generation happens entirely in your browser, so passwords, codes, and identifiers are never sent to or kept on a server — what you generate is yours alone.`,
      },
    ],
  },

  calculator: {
    intro: [
      `From a quick tip split to a mortgage amortization schedule, calculators turn fiddly arithmetic into an instant answer — and ToolForge has one of the web's broadest collections, spanning financial, health and fitness, math, science, and everyday calculators. Whether you are projecting investment growth, finding your BMI, solving a quadratic, or estimating concrete for a slab, there is a dedicated calculator built for that exact job.`,
      `The financial calculators help with loans, interest, savings, and budgeting; the health and fitness set covers BMR, calories, body composition, and more; the math tools handle everything from fractions to standard deviation; the science calculators apply real physics and chemistry formulas; and the everyday calculators tackle dates, time, grades, fuel, and home projects. Every one runs instantly in your browser with no sign-up, and the more involved ones show their working — amortization tables, step-by-step breakdowns, and formulas — so you understand the result, not just see it.`,
    ],
    faqs: [
      {
        question: `Are these calculators accurate enough to rely on?`,
        answer: `They use established formulas and show their working where it helps, so the math is sound. For consequential financial, medical, or engineering decisions, treat the results as a well-grounded estimate and confirm with a professional, since real outcomes depend on factors a calculator cannot capture.`,
      },
      {
        question: `Do the calculators save or share what I enter?`,
        answer: `No. Every calculation runs locally in your browser, so the figures you enter — including financial and health data — are never uploaded or stored on a server.`,
      },
      {
        question: `What types of calculators are available?`,
        answer: `The collection is organized into financial (loans, interest, investing, budgeting), health and fitness (BMI, calories, body metrics), math (algebra, statistics, geometry), science (physics and chemistry), and everyday calculators (dates, time, grades, home projects).`,
      },
      {
        question: `Do I need to install anything or create an account?`,
        answer: `No. Every calculator works instantly in the browser with no installation, no sign-up, and no limit on how many calculations you run.`,
      },
    ],
  },

  security: {
    intro: [
      `Good security habits often come down to small, concrete actions — using a strong unique password, verifying a file's checksum, encoding data safely. ToolForge's security tools support those: generate cryptographically strong passwords and produce MD5, SHA-1, SHA-256, and SHA-512 hashes for integrity checks and fingerprinting.`,
      `Because these tools handle sensitive material, it matters that they run entirely client-side — passwords are generated and hashes computed in your browser, with nothing transmitted to a server. Developers verify checksums and generate digests, while anyone tightening up their accounts can create passwords that resist guessing and brute-force attacks, all without an account or a trace left behind.`,
    ],
    faqs: [
      {
        question: `Are passwords generated here safe to use?`,
        answer: `Yes. They are created in your browser using a cryptographically secure random source and are never transmitted or stored, so each password is private to you. For maximum safety, generate them on a device you trust and store them in a password manager.`,
      },
      {
        question: `What is the difference between hashing and encryption?`,
        answer: `Hashing is a one-way fingerprint — you cannot reverse it to recover the input — and is used to verify integrity. Encryption is reversible with a key, used to protect data you need to read back later. The hash generator here produces fingerprints, not encryption.`,
      },
      {
        question: `Which hash algorithm should I use?`,
        answer: `SHA-256 is the modern default for integrity and general use, with SHA-512 stronger still. MD5 and SHA-1 remain useful for quick non-security checksums but are considered broken for security purposes, so avoid them for passwords or signatures.`,
      },
    ],
  },

  seo: {
    intro: [
      `Search visibility is built from many small, gettable-right details — a title that fits, a description that earns the click, clean meta tags, a valid sitemap, readable content. ToolForge's SEO tools cover that groundwork: generate and preview meta tags, see your Google snippet before it goes live, check title and description lengths, analyze keyword density and readability, build robots.txt and sitemaps, and tidy tracking-laden URLs.`,
      `Content writers, digital marketers, and site owners use them to ship pages that are technically sound and click-worthy. They run in the browser with no account, and the ones that work on your own content — readability, keyword density, meta generation — keep your unpublished drafts private. Together they cover the on-page and technical basics that make the difference between a page that ranks and one that languishes.`,
    ],
    faqs: [
      {
        question: `How long should my title tag and meta description be?`,
        answer: `Aim for a title under about 60 characters and a description under about 160, since search engines truncate beyond those lengths. The SERP preview and length checker show exactly where your text would be cut so you can keep it fully visible.`,
      },
      {
        question: `Does the meta description affect rankings?`,
        answer: `It is not a direct ranking factor, but a compelling description improves click-through rate, which reflects how useful searchers find your result. A strong title and description earn more clicks from the same position.`,
      },
      {
        question: `What is keyword density and what should it be?`,
        answer: `Keyword density is the share of your content made up by a given term. There is no magic number, but keeping a primary keyword in the low single digits reads naturally; far higher looks like keyword stuffing, which the density checker helps you avoid.`,
      },
      {
        question: `Do I need both a robots.txt and a sitemap?`,
        answer: `They serve different purposes: robots.txt tells crawlers which paths they may visit, while a sitemap lists the pages you want discovered. Most sites benefit from both, and referencing your sitemap inside robots.txt helps crawlers find it.`,
      },
    ],
  },

  network: {
    intro: [
      `When something is not connecting, the questions are basic but the answers are hard to get at — is the site up, where does this domain resolve, is the certificate valid, where does this link really go? ToolForge's network tools answer them from your browser: look up IP geolocation, query DNS records, check SSL certificates and WHOIS data, inspect HTTP headers, trace redirects, test ports, and check whether a site is responding.`,
      `Developers, sysadmins, and curious users use them to diagnose problems and investigate domains without installing command-line utilities. Because a browser cannot do everything a native tool can, some of these rely on external services — DNS queries, SSL analysis, WHOIS, and header inspection call out to specialized APIs — and each tool's page is upfront about what it sends where. Others, like the redirect tracer, work directly from your browser.`,
    ],
    faqs: [
      {
        question: `Do these network tools send my queries to external services?`,
        answer: `Some do, by necessity. DNS lookups, SSL certificate analysis, WHOIS, and header inspection rely on specialized external APIs, because a browser cannot perform those directly — each tool's page states which service it uses. Tools like the redirect tracer run directly from your browser.`,
      },
      {
        question: `Why can't a browser do a real ping or port scan?`,
        answer: `Browsers cannot open raw network sockets for security reasons, so true ICMP ping and low-level TCP port scanning are not possible from a web page. These tools approximate the checks using HTTP requests, which is reliable for web-facing services but differs from native command-line tools.`,
      },
      {
        question: `Why might a site show as down here but work in my browser?`,
        answer: `Many servers block the kind of background request these tools make, even while serving pages normally to a browser tab. A single "down" or failed result can reflect that restriction rather than a real outage, so confirm by opening the site directly.`,
      },
    ],
  },

  creative: {
    intro: [
      `Creative work on the web is often quick and playful — a meme for a group chat, a sticker, ASCII art for a README, a filtered photo, a hypnotic pattern. ToolForge's creative tools cover that fun, expressive end: build memes and layered sticker compositions, generate ASCII art from images, apply photo filters and effects, and create animated optical illusions.`,
      `Social media creators, designers, and hobbyists use them to make shareable visuals without opening heavy software. Like the image tools, they render everything on an in-browser canvas, so your uploads stay on your device and exports come out clean with no watermark. Whether you are reacting to a post or prototyping a graphic, you can make it and download it in a couple of minutes.`,
    ],
    faqs: [
      {
        question: `Do the creative tools add a watermark?`,
        answer: `No. Everything is composited on a canvas in your browser and downloaded directly, so the files you save are clean — no watermark or branding is added.`,
      },
      {
        question: `Are my uploaded images kept private?`,
        answer: `Yes. The meme, sticker, ASCII, and filter tools all process your image locally in the browser without uploading it, so personal photos used as a base or source stay on your device.`,
      },
      {
        question: `What formats can I download my creations in?`,
        answer: `Most of the creative tools export to standard image formats like PNG and JPG (and WebP in places), with PNG recommended when you want crisp text or transparency. The ASCII art generator additionally exports as a plain text file.`,
      },
    ],
  },
};

export function getCategoryContent(value: string): CategoryLongContent | undefined {
  return CATEGORY_CONTENT[value];
}

// ── Calculator subcategory landing-page content ──────────────────────
// These power the mid-level hub pages at /category/calculator/<subcategory>,
// grouping the 88 calculators into focused sections with their own editorial
// copy and FAQs.

export const SUBCATEGORY_CONTENT: Record<string, CategoryLongContent> = {
  'financial-calculators': {
    intro: [
      `Money decisions hinge on numbers most people would rather not work out by hand — what a loan really costs, how savings compound, whether a price leaves enough margin. ToolForge's financial calculators cover that ground: loan and EMI payments with full amortization schedules, compound and simple interest, future and present value, investment growth, ROI, savings and budgeting, debt and credit-card payoff, plus everyday money math like discounts, tips, sales tax, VAT, margin, and commission.`,
      `Borrowers compare loan terms before signing, savers project where a monthly deposit lands them, and small-business owners price products and plan budgets. The more involved tools show their working — amortization tables, year-by-year growth, and side-by-side comparisons — so you understand the trade-offs, not just the final figure. Every calculation runs privately in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `What is the difference between simple and compound interest?`,
        answer: `Simple interest is charged only on the original principal, so the same amount accrues each period. Compound interest is charged on the principal plus previously earned interest, so it grows faster over time. The dedicated calculators let you compare both for the same figures.`,
      },
      {
        question: `Are these financial calculators accurate enough for real decisions?`,
        answer: `They use standard financial formulas and show their working, so the math is reliable. For major decisions like a mortgage, treat the output as a well-grounded estimate and confirm specifics with your lender, since real terms include fees and conditions a calculator cannot know.`,
      },
      {
        question: `Is my financial information kept private?`,
        answer: `Yes. Every financial calculator runs entirely in your browser, so the amounts you enter are never uploaded or stored on a server.`,
      },
    ],
  },
  'health-fitness-calculators': {
    intro: [
      `Fitness and nutrition advice is full of numbers — calories, macros, BMI, target heart rate — and getting them right starts with calculating them for your own body. ToolForge's health and fitness calculators cover the essentials: BMR and TDEE for your energy needs, calorie and macro targets, BMI, body fat, lean body mass and ideal weight, protein and water intake, calories burned, one-rep max, running pace, target heart-rate zones, plus age, due-date, and cycle estimates.`,
      `People starting a weight goal use them to set a realistic daily calorie target, lifters and runners use them to program training and nutrition, and the health-curious use them to understand their own numbers. They apply recognized formulas — Mifflin-St Jeor for metabolism, the US Navy method for body fat, standard MET values for exercise — and run privately in your browser. They are educational estimates, not medical advice, so pair them with a professional for anything consequential.`,
    ],
    faqs: [
      {
        question: `How do BMR, TDEE, and calorie targets fit together?`,
        answer: `BMR is the calories your body burns at rest. Multiply it by an activity factor to get your TDEE — your full daily burn. Then adjust your TDEE up or down for your goal to get a calorie target. The calculators are designed to be used in that sequence.`,
      },
      {
        question: `Are these health calculators medically accurate?`,
        answer: `They use established formulas and give solid estimates for planning, but they are not a substitute for professional advice. Individual factors like body composition, health conditions, and metabolism affect real results, so consult a clinician or dietitian for medical or significant decisions.`,
      },
      {
        question: `Is my health and body data kept private?`,
        answer: `Yes. Every health and fitness calculator runs locally in your browser, so the personal measurements you enter are never transmitted or stored.`,
      },
    ],
  },
  'math-calculators': {
    intro: [
      `Math problems are easy to get wrong in the small steps — a misplaced decimal, the wrong formula, an arithmetic slip. ToolForge's math calculators cover the common ground from arithmetic to statistics: percentages, fractions, ratios, averages, rounding, exponents and roots, factors, prime factorization, GCF and LCM, standard deviation, mean-median-mode-range, probability, permutations and combinations, area and volume, the Pythagorean theorem, quadratic equations, and scientific notation.`,
      `Students check homework and learn the method, since most of these show step-by-step working, formulas, and breakdowns rather than just an answer. Teachers, engineers, and anyone facing a quick calculation use them too. Every tool runs instantly in your browser with no sign-up, and the worked steps make them as useful for understanding as for getting the result.`,
    ],
    faqs: [
      {
        question: `Do these calculators show the steps, not just the answer?`,
        answer: `Most do. Tools like the fraction, percentage, standard deviation, and quadratic calculators display the formula and a step-by-step breakdown, which makes them genuine learning aids rather than black boxes.`,
      },
      {
        question: `What is the difference between permutations and combinations?`,
        answer: `Permutations count arrangements where order matters, while combinations count selections where it does not. The dedicated calculator computes both at once and shows the factorial formulas behind each so the distinction is clear.`,
      },
      {
        question: `Can I use these for statistics homework?`,
        answer: `Yes. The mean-median-mode-range, standard deviation, and probability calculators cover core introductory statistics, accept a list of numbers, and show the supporting figures and working you would be expected to demonstrate.`,
      },
    ],
  },
  'science-calculators': {
    intro: [
      `Physics and chemistry problems live or die by applying the right formula with the right units. ToolForge's science calculators handle the staples: velocity, force, kinetic energy, projectile motion, and density from physics; Ohm's law and resistor color codes from electronics; and pH, molarity, and the ideal gas law from chemistry.`,
      `Students solve and check coursework, and anyone working with these relationships uses them to get a fast, reliable answer. Each calculator is built around the actual scientific formula — F = ma, v = d/t, PV = nRT — and supports the units these problems use, with results shown clearly. They run in your browser with no sign-up, making them handy for a quick check during study or lab work.`,
    ],
    faqs: [
      {
        question: `Which scientific formulas do these calculators use?`,
        answer: `They apply the standard relationships directly — for example velocity as distance over time, force as mass times acceleration, the ideal gas law as PV = nRT, and Ohm's law as V = IR. Each tool is built around the real formula for its topic.`,
      },
      {
        question: `Do they handle different units?`,
        answer: `Yes. The science calculators accept the units these problems commonly use and convert as needed, so you can work in the units your textbook or experiment uses and read the result in sensible units.`,
      },
      {
        question: `Can I solve for any variable in a formula?`,
        answer: `Many of the calculators let you solve for whichever quantity is unknown by entering the others — for instance finding velocity, distance, or time from the other two. Where that applies, the tool's controls let you pick what to calculate.`,
      },
    ],
  },
  'other-calculators': {
    intro: [
      `Not every calculation fits a neat category — sometimes you need to count days to a deadline, total a timesheet, work out a GPA, estimate fuel for a trip, or figure out how much concrete a slab needs. ToolForge's everyday calculators cover that practical miscellany: date and time math, work hours with overtime, time-zone conversion, GPA and grades, fuel cost, random numbers and dice, shoe-size conversion, and home-project estimators for square footage, concrete, and tile.`,
      `Students, professionals, travelers, and DIYers reach for these for the real-world arithmetic that crops up day to day. Whether you are planning a renovation, settling a schedule across time zones, or projecting a semester GPA, there is a focused tool for it. All of them run instantly in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `What kinds of everyday calculations are covered here?`,
        answer: `This group spans date and time math, work-hour and overtime tracking, time-zone conversion, academic GPA and grades, fuel cost, random number and dice generation, shoe-size conversion, and home-improvement estimates for square footage, concrete, and tile.`,
      },
      {
        question: `Are the home-project estimators accurate enough to buy materials?`,
        answer: `They give solid estimates and build in waste allowances where appropriate, which is the right approach for ordering. Because real spaces and jobs vary, treat the figures as a well-padded guide and confirm against your specific materials and layout.`,
      },
      {
        question: `Do these calculators need an account or internet connection?`,
        answer: `No account is required, and because they run in your browser, most work even offline once the page has loaded. Nothing you enter is uploaded or stored.`,
      },
    ],
  },
};

export function getSubcategoryContent(value: string): CategoryLongContent | undefined {
  return SUBCATEGORY_CONTENT[value];
}
