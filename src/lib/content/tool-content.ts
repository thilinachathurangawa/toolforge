// src/lib/content/tool-content.ts
// Long-form, per-tool editorial content rendered alongside each tool widget.
//
// This lives OUTSIDE the tool registry (src/lib/constants/tools.ts) on purpose:
// the registry drives routing/SEO and must stay lean, while this file holds the
// substantial, hand-written prose that gives every tool page unique value.
//
// Every block must be genuinely tool-specific. Facts in `steps` and `why` are
// pulled from the actual component implementation — never invented. Prose is
// written fresh per tool, not mail-merged from a template.

export interface ToolRelatedLink {
  slug: string; // must exist in TOOLS
  note: string; // one sentence: why someone using this tool might also need that one
}

export interface ToolLongContent {
  /** 2–3 unique paragraphs: what it does, who needs it, concrete real-world use cases. */
  intro: string[];
  /** Numbered, tool-specific steps that match the real UI/inputs. */
  steps: string[];
  /** 2–4 genuine differentiators, grounded in the implementation (no false claims). */
  why: string[];
  /** 3–5 question/answer pairs based on real search intent for this tool. */
  faqs: { question: string; answer: string }[];
  /** 2–3 internal links to genuinely related tools, each with a reason. */
  related: ToolRelatedLink[];
}

export const TOOL_CONTENT: Record<string, ToolLongContent> = {
  // ── Pilot batch (representative, 15 tools) ──────────────────────────

  'string-converter': {
    intro: [
      `Naming things consistently is one of those small chores that eats real time. The String Converter takes a word or phrase and rewrites it into any of ten naming conventions — camelCase, snake_case, kebab-case, PascalCase, SCREAMING_SNAKE_CASE, train-case, dot.case, space case, lowercase, or UPPERCASE — and converts directly between them.`,
      `It is built for the moments developers hit constantly: turning a database column like first_name into the firstName your API layer expects, converting a React component name into the kebab-case slug its file should use, or reformatting a list of constants into SCREAMING_SNAKE_CASE before pasting them into a config. Technical writers and translators reach for it too, when a glossary needs to move between human-readable "space case" and machine-friendly identifiers.`,
      `Because you pick both a "From" and a "To" format, the tool understands the structure of what you paste rather than blindly lower-casing it — so MyVariableName splits correctly into the words "my", "variable", "name" before it is reassembled.`,
    ],
    steps: [
      `Paste or type your text into the "Input String" box.`,
      `Choose the format your text is currently in from the "From" dropdown (for example, PascalCase).`,
      `Choose the format you want from the "To" dropdown (for example, snake_case).`,
      `Read the converted result instantly — it updates as you type or change either dropdown.`,
      `Use the swap button between the two dropdowns to reverse the direction without re-selecting, then click Copy to send the result to your clipboard.`,
    ],
    why: [
      `Conversion runs entirely in your browser in JavaScript — nothing you paste is uploaded, so internal variable names and unreleased identifiers stay on your machine.`,
      `It handles all ten common conventions in one place and converts between any pair, rather than only "to camelCase" like many single-purpose converters.`,
      `The dedicated "From" selector means the tool parses word boundaries correctly instead of guessing, so compound names round-trip cleanly.`,
      `Results are live and there is no length limit in the code, so you can convert a single token or a whole pasted block at once.`,
    ],
    faqs: [
      {
        question: `What is the difference between camelCase and PascalCase?`,
        answer: `Both join words without separators, but camelCase leaves the first word lowercase (myVariableName) while PascalCase capitalizes every word including the first (MyVariableName). camelCase is conventional for variables and functions in many languages; PascalCase is common for class and component names.`,
      },
      {
        question: `Why does my converted text look wrong?`,
        answer: `Most often the "From" format does not match the actual format of your input. The tool relies on that setting to find word boundaries — if you pick camelCase but your text is already snake_case, it cannot split the words correctly. Set "From" to match your real input and the result will be accurate.`,
      },
      {
        question: `Is my text sent to a server?`,
        answer: `No. The conversion happens locally in your browser using plain JavaScript. Nothing is transmitted or stored, which makes it safe for proprietary code and internal naming.`,
      },
      {
        question: `Can I convert more than one line at a time?`,
        answer: `The tool converts the full contents of the input box as a single string. For converting many separate identifiers in bulk, paste them one per line and convert, or use a regex tool for line-by-line transformation.`,
      },
    ],
    related: [
      { slug: 'regex-tester', note: `When a rename is more than a case swap, a regular expression lets you match and rewrite more complex patterns.` },
      { slug: 'text-diff', note: `Compare the before and after of a bulk rename to confirm nothing else changed.` },
      { slug: 'base64-encoder', note: `Once identifiers are named, you may need to encode values for safe transport in URLs or tokens.` },
    ],
  },

  'jwt-decoder': {
    intro: [
      `A JSON Web Token looks like one long, unreadable string, but it is really three Base64URL-encoded sections — header, payload, and signature — joined by dots. The JWT Decoder splits that string apart and shows you the JSON inside each section in a readable, indented form.`,
      `Developers lean on it while debugging authentication: checking which claims an identity provider actually issued, confirming a token has not silently expired, or comparing the payload from a failing request against one that works. Because it decodes any well-formed token, it is just as useful for inspecting access tokens from an OAuth flow as it is for reading a session token pulled from local storage.`,
      `One detail worth understanding: decoding is not the same as verifying. This tool reveals what a token contains; it does not check that the signature is authentic, because that requires the issuer's secret or public key.`,
    ],
    steps: [
      `Paste your token into the "JWT Token" field — it should be the full string with two dots separating three parts.`,
      `Click Decode.`,
      `Read the Header section to see the signing algorithm and token type.`,
      `Read the Payload section for the claims; any "exp" (expires) and "iat" (issued at) timestamps are automatically shown in human-readable local time.`,
      `Use the copy button on the header or payload to grab the formatted JSON, and note that the Signature is shown as raw Base64 since it cannot be decoded without the key.`,
    ],
    why: [
      `Tokens are decoded in your browser with the native atob function — the token never leaves your device, which matters because JWTs often carry session identity.`,
      `Expiry and issued-at timestamps are converted from Unix epoch to readable dates automatically, so you can see at a glance whether a token is stale.`,
      `Header, payload, and signature are shown separately, each with its own copy button, instead of as one undifferentiated blob.`,
      `It is honest about its limits: it shows the signature without pretending to validate it, so you are never misled into trusting an unverified token.`,
    ],
    faqs: [
      {
        question: `Does this tool verify the token's signature?`,
        answer: `No. It decodes and displays the contents of all three parts but does not verify the signature, which would require the secret key (for HMAC) or public key (for RSA/ECDSA). Treat the decoded output as informational, not as proof the token is valid.`,
      },
      {
        question: `Is it safe to paste a real access token here?`,
        answer: `Decoding happens entirely in your browser and the token is never sent anywhere. That said, anyone with a valid token can use it until it expires, so avoid pasting production tokens into any tool on a shared or untrusted computer as a general precaution.`,
      },
      {
        question: `Why does it say "Invalid JWT format"?`,
        answer: `A JWT must have exactly three sections separated by dots. That error means your input has the wrong number of parts — often because a dot is missing, the string was truncated when copied, or you pasted something that is not actually a JWT.`,
      },
      {
        question: `What do "exp" and "iat" mean in the payload?`,
        answer: `"iat" is the time the token was issued and "exp" is the time it expires, both stored as Unix timestamps. This decoder converts them to readable dates so you can immediately tell when a token was created and whether it is still valid.`,
      },
    ],
    related: [
      { slug: 'base64-encoder', note: `JWT sections are Base64URL-encoded; decode or encode arbitrary Base64 strings here.` },
      { slug: 'hash-generator', note: `Generate the SHA/HMAC hashes named in a token's header to understand how it was signed.` },
      { slug: 'json-formatter', note: `Pretty-print, validate, and explore the JSON payload you extract from a token.` },
    ],
  },

  'regex-tester': {
    intro: [
      `Regular expressions are powerful and famously unforgiving — a single misplaced character can change everything a pattern matches. The Regex Tester gives you a live workbench: type a pattern, paste some sample text, and watch every match light up instantly.`,
      `It mirrors how people actually debug regex. A developer validating an email or phone format pastes a dozen real examples to see which ones slip through. Someone writing a log parser tweaks a capture group and immediately sees whether it grabs the timestamp correctly. Support engineers use it to build the search-and-replace pattern they will paste into another tool, confident it does what they expect first.`,
      `Matches are highlighted directly in your test text, and each one is broken out below with its capture groups, position, and length — so you are not just told "3 matches", you can see exactly where and what they are.`,
    ],
    steps: [
      `Type your pattern into the expression field (the slashes around it are shown for you).`,
      `Set flags either by typing them in the flags box or by clicking the g, i, m, s, u, and y toggle buttons.`,
      `Paste the text you want to test into the "Test Text" area.`,
      `Watch matches highlight in yellow as you type; the header shows the live match count.`,
      `Scroll the match details to inspect each capture group, index, and length, then click "Copy Regex" to copy your pattern in /pattern/flags form.`,
    ],
    why: [
      `It uses your browser's native JavaScript RegExp engine, so what you test here behaves exactly like the regex in your JavaScript code — no dialect surprises.`,
      `All six JavaScript flags (g, i, m, s, u, y) are available as one-click toggles, so you do not have to remember which letter does what.`,
      `Matches are highlighted in place and each is itemized with its capture groups, start index, and length, which makes debugging groups far easier than a bare match count.`,
      `Everything runs locally and updates in real time — paste sensitive log data without it ever being uploaded.`,
    ],
    faqs: [
      {
        question: `Which regex flavor does this tester use?`,
        answer: `It uses the JavaScript (ECMAScript) regular expression engine built into your browser. Patterns that rely on features from other flavors — such as PCRE lookbehind in older engines or named groups syntax differences — may behave differently than in Python, PHP, or Java.`,
      },
      {
        question: `What do the g and m flags actually do?`,
        answer: `The "g" (global) flag finds all matches instead of stopping at the first. The "m" (multiline) flag makes the ^ and $ anchors match at the start and end of each line rather than only the whole string. You can toggle both with the flag buttons and watch the matches change.`,
      },
      {
        question: `Why is only the first match highlighted?`,
        answer: `Without the global flag, a regex returns only the first match. Turn on the "g" flag (or click the g button) and the tester will find and highlight every match in your text.`,
      },
      {
        question: `My pattern shows an error — what is wrong?`,
        answer: `The tester reports the exact error from the RegExp engine, usually a syntax problem such as an unclosed bracket or group, or an invalid escape sequence. Fix the highlighted issue in the pattern and matching resumes automatically.`,
      },
    ],
    related: [
      { slug: 'regex-explainer', note: `Get a plain-English breakdown of what each piece of your pattern is doing.` },
      { slug: 'string-converter', note: `For a simple case change you often do not need a regex at all.` },
      { slug: 'text-diff', note: `Compare two blocks of text to design the pattern your replacement needs to catch.` },
    ],
  },

  'percent-off-calculator': {
    intro: [
      `"30% off" sounds simple until you are standing in a store doing mental math, or reconciling an invoice where the discount applies to several units. The Percent Off Calculator does the arithmetic for you: enter a price, a quantity, and a discount percentage, and it returns the sale price per item, the amount saved, and the totals across all units.`,
      `Shoppers use it to see the real price behind a sign before they reach the register. Small-business owners and freelancers use it the other way — to price a bulk discount for a client and know exactly how much margin they are giving away. Quick buttons for 10%, 20%, 25%, 50%, and 75% cover the most common sale signs without typing.`,
    ],
    steps: [
      `Enter the original price of a single item.`,
      `Enter the quantity you are buying (defaults to one).`,
      `Type the discount percentage, or tap one of the quick buttons — 10%, 20%, 25%, 50%, or 75%.`,
      `Read the per-item sale price and amount saved, both updated instantly.`,
      `Check the "Total for X items" and "Total Amount Saved" figures, then use Copy to save the full breakdown.`,
    ],
    why: [
      `It separates per-item and total figures, so a bulk purchase shows both the unit price and what you save across every unit — not just a single discounted number.`,
      `Five quick-percentage buttons match the discounts you actually see on sale tags, so common cases take one tap.`,
      `Amounts are formatted to two decimals with thousands separators, matching how prices appear on a receipt.`,
      `It runs instantly in your browser with no sign-up, so it works the moment the page loads, even on a phone in a checkout line.`,
    ],
    faqs: [
      {
        question: `How do I calculate a percentage discount by hand?`,
        answer: `Multiply the original price by the discount percentage divided by 100 to get the amount saved, then subtract that from the original price. For example, 30% off a $50 item is $50 × 0.30 = $15 saved, leaving $35. This calculator does that for you and multiplies across quantity.`,
      },
      {
        question: `Does this include sales tax?`,
        answer: `No. It calculates the discount on the price you enter, before tax. If you need the after-tax total, apply the discount here first, then run the result through a sales tax calculator.`,
      },
      {
        question: `Can I stack two discounts, like 20% then an extra 10%?`,
        answer: `Stacked discounts are not added together — a 20% then 10% discount is not 30% off. Apply the first percentage here, take the resulting sale price, and run it through the calculator again with the second percentage to get the true stacked price.`,
      },
    ],
    related: [
      { slug: 'discount-calculator', note: `Work the discount from a different angle, including final price and savings scenarios.` },
      { slug: 'sales-tax-calculator', note: `Add tax to the discounted price to find what you will actually pay.` },
      { slug: 'tip-calculator', note: `Splitting a discounted restaurant bill? Work out the tip and per-person share.` },
    ],
  },

  'tip-calculator': {
    intro: [
      `Splitting a restaurant bill should not require passing a phone around the table. The Tip Calculator takes the bill amount, the tip percentage you want to leave, and the number of people, and returns the tip, the grand total, and exactly what each person owes.`,
      `It is the tool you open at the end of a group dinner, but it is just as handy for a single diner deciding between an 18% and a 20% tip, or for someone budgeting travel where tipping norms differ from home. Preset buttons for 10%, 15%, 18%, 20%, and 25% map to the usual range so you can settle up in seconds.`,
    ],
    steps: [
      `Enter the total bill amount.`,
      `Set the tip percentage by typing it or tapping a preset — 10%, 15%, 18%, 20%, or 25%.`,
      `Enter how many people are splitting the bill under "Split Between".`,
      `Read the tip amount and the grand total.`,
      `Check the per-person breakdown — bill, tip, and total each diner owes — and Copy it to share.`,
    ],
    why: [
      `It splits the bill cleanly across any number of people, showing each person's share of the bill and the tip separately rather than only the combined total.`,
      `Common tip presets cover the usual 10–25% range, so the most frequent choices are a single tap.`,
      `The math is instant and currency-formatted, which makes it practical to use at the table on a phone.`,
      `No account, no app install, no data sent anywhere — open the page and it works.`,
    ],
    faqs: [
      {
        question: `Should I tip on the pre-tax or post-tax amount?`,
        answer: `Conventionally, tips are calculated on the pre-tax bill, though many people simply tip on the total for convenience. Enter whichever figure you prefer as the bill amount — the calculator applies your tip percentage to the number you give it.`,
      },
      {
        question: `What is a standard tip percentage?`,
        answer: `In the United States, 15–20% is typical for sit-down restaurant service, with 18–20% increasingly common. Norms vary widely by country and service type, which is why the presets here span 10% to 25%.`,
      },
      {
        question: `How does the per-person split work?`,
        answer: `The calculator divides both the bill and the tip evenly by the number of people, then shows each person's share of each plus their combined total. It does not handle uneven splits where people ordered different amounts.`,
      },
    ],
    related: [
      { slug: 'sales-tax-calculator', note: `Figure the tax portion of a bill before deciding how to tip.` },
      { slug: 'discount-calculator', note: `Apply a coupon or promotion to the bill before splitting it.` },
      { slug: 'percentage-calculator', note: `Need a tip percentage that is not a preset? Work out any percentage of any amount.` },
    ],
  },

  'calories-burned-calculator': {
    intro: [
      `How many calories did that workout actually burn? The Calories Burned Calculator estimates it using the MET (Metabolic Equivalent of Task) method, the same approach used in exercise science. You pick an activity, enter your body weight and how long you exercised, and it returns an estimate in kilocalories.`,
      `People use it to close the loop on a fitness plan — checking whether a 30-minute run roughly offsets a treat, or comparing the energy cost of cycling versus swimming for the same duration. It covers six common activities: running at moderate and fast paces, brisk walking, moderate cycling, light-to-moderate swimming, and vigorous weight lifting.`,
      `Because it is built on standardized MET values rather than tracking your heart rate, the result is a solid estimate for planning, not a medical measurement.`,
    ],
    steps: [
      `Enter your body weight in kilograms.`,
      `Enter how long you exercised, in minutes.`,
      `Choose your activity from the dropdown — each option lists its MET value.`,
      `Read the estimated energy burned, shown in kilocalories.`,
      `Use the copy button to save the result for a training log.`,
    ],
    why: [
      `It uses the established MET formula — MET × 3.5 × weight (kg) ÷ 200 × minutes — so the estimate follows recognized exercise-science methodology rather than a black box.`,
      `Each activity in the dropdown shows its MET value, so you can see why running scores higher than walking and adjust your expectations.`,
      `The calculation is instant and entirely local — your weight and activity never leave the browser.`,
      `It is free and requires no account, so it slots easily into a workout routine on any device.`,
    ],
    faqs: [
      {
        question: `What is a MET and how does it relate to calories?`,
        answer: `MET stands for Metabolic Equivalent of Task — a measure of how much energy an activity uses compared to sitting still, which is 1 MET. Running at a moderate pace is about 8 METs, meaning it burns roughly eight times the resting rate. The calculator multiplies your MET value by your weight and duration to estimate total calories.`,
      },
      {
        question: `Why does it ask for weight in kilograms only?`,
        answer: `The MET formula is defined using body weight in kilograms, so the calculator takes input in kg directly. To convert from pounds, divide your weight in pounds by 2.205.`,
      },
      {
        question: `How accurate is the estimate?`,
        answer: `MET-based estimates are good for planning and comparison but are population averages. Your actual burn depends on fitness level, intensity, terrain, and metabolism, so treat the number as a reasonable approximation rather than an exact figure.`,
      },
      {
        question: `Why aren't more activities listed?`,
        answer: `This tool focuses on six common activities spanning cardio and strength training. For an activity not listed, choose the closest match by intensity — its MET value is shown next to each option to help you compare.`,
      },
    ],
    related: [
      { slug: 'calorie-calculator', note: `Estimate the daily calories your body needs to set intake against what you burn.` },
      { slug: 'bmr-calculator', note: `Find your resting metabolic rate — the baseline calories you burn before any exercise.` },
      { slug: 'tdee-calculator', note: `Combine your activity level and BMR into a full daily energy expenditure figure.` },
    ],
  },

  'bmi-calculator': {
    intro: [
      `Body Mass Index is the quickest standardized way to see where your weight sits relative to your height. The BMI Calculator takes those two numbers and returns your BMI along with the category it falls into — underweight, normal, overweight, or obese — color-coded so the result is readable at a glance.`,
      `It is widely used as a starting point: by people tracking a fitness goal, by clinicians for a fast screen, and by anyone curious how their numbers compare to standard ranges. You can enter measurements in metric (kilograms and centimeters) or imperial (pounds and inches) with a single toggle, so there is no manual unit conversion.`,
      `BMI is a screening figure, not a diagnosis — it does not distinguish muscle from fat — but it remains a useful, universally understood reference point.`,
    ],
    steps: [
      `Choose Metric or Imperial units with the toggle.`,
      `Enter your weight (kilograms for metric, pounds for imperial).`,
      `Enter your height (centimeters for metric, inches for imperial).`,
      `Read your BMI value, shown to one decimal place.`,
      `Note the color-coded category beneath it, and copy the result if you want to keep a record.`,
    ],
    why: [
      `One toggle switches the whole form between metric and imperial, applying the correct formula for each — no converting your height to meters first.`,
      `The result is classified into the standard WHO categories with color coding (under 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, 30+ obese) so the number has immediate context.`,
      `It calculates the moment you have valid weight and height, with no submit step.`,
      `All math is done locally in the browser, so your health figures are never transmitted or stored.`,
    ],
    faqs: [
      {
        question: `What is a healthy BMI range?`,
        answer: `A BMI between 18.5 and 24.9 is classified as normal weight. Below 18.5 is underweight, 25 to 29.9 is overweight, and 30 or above is obese. These are general screening ranges for adults and do not account for individual factors like muscle mass.`,
      },
      {
        question: `How is BMI calculated?`,
        answer: `In metric units, BMI is your weight in kilograms divided by your height in meters squared. In imperial units, it is your weight in pounds divided by your height in inches squared, multiplied by 703. This calculator applies the right formula automatically based on the unit toggle.`,
      },
      {
        question: `Is BMI accurate for athletes or very muscular people?`,
        answer: `Not always. BMI does not distinguish between muscle and fat, so muscular individuals can register as overweight despite low body fat. For a fuller picture, pair BMI with a body fat percentage estimate.`,
      },
      {
        question: `Does this work for children?`,
        answer: `The categories used here are for adults. BMI for children and teens is interpreted against age- and sex-specific percentiles rather than fixed ranges, so consult a pediatric chart or clinician for under-18s.`,
      },
    ],
    related: [
      { slug: 'body-fat-calculator', note: `Estimate body fat percentage for a measure BMI cannot capture.` },
      { slug: 'ideal-weight-calculator', note: `See a target weight range for your height alongside your BMI.` },
      { slug: 'bmr-calculator', note: `Calculate the calories your body burns at rest to plan around your weight goals.` },
    ],
  },

  'percentage-calculator': {
    intro: [
      `Percentages turn up everywhere — tips, test scores, sales, interest, statistics — and the question is rarely phrased the same way twice. The Percentage Calculator handles the three forms people actually ask: "What is X% of Y?", "X is what percent of Y?", and "X is Y% of what?".`,
      `That flexibility is the point. A student checks what percentage a score of 47 out of 60 represents. A shopper works out what 35% of a price comes to. An analyst back-solves the original figure when they only know the part and the percentage. Each mode relabels its inputs and shows a step-by-step breakdown, so you can follow the math rather than just trust a number.`,
    ],
    steps: [
      `Pick the question that matches your problem from the three calculation types.`,
      `Enter the first value — the input label changes to match the mode you chose.`,
      `Enter the second value in the same way.`,
      `Read the result, formatted to two decimals (with a % sign where the answer is itself a percentage).`,
      `Review the step-by-step breakdown below to see exactly how the answer was derived, then Copy it if needed.`,
    ],
    why: [
      `Three distinct modes cover the common percentage questions, with inputs that relabel themselves so you always know which number goes where.`,
      `Every result comes with a worked, step-by-step explanation — useful for students who need to show their method, not just the answer.`,
      `It guards against division by zero, returning a clean zero instead of an error when a denominator is empty.`,
      `Calculations are instant and run entirely in your browser, free and without sign-up.`,
    ],
    faqs: [
      {
        question: `How do I find what percentage one number is of another?`,
        answer: `Divide the part by the total and multiply by 100. For example, 47 out of 60 is (47 ÷ 60) × 100 ≈ 78.33%. Use the "X is what percent of Y?" mode and the calculator shows each step.`,
      },
      {
        question: `How do I calculate a percentage of a number?`,
        answer: `Multiply the number by the percentage divided by 100. For 35% of 200, that is 200 × 0.35 = 70. The "What is X% of Y?" mode does this and displays the breakdown.`,
      },
      {
        question: `What does the third mode solve for?`,
        answer: `"X is Y% of what?" works backward to find the original total when you know a part and what percentage it represents. If 70 is 35% of a number, the calculator finds that number (200) by dividing 70 by 0.35.`,
      },
      {
        question: `Why does it show 0 instead of an answer?`,
        answer: `If a calculation would require dividing by zero — for instance, asking what percent a number is of zero — the tool returns 0 rather than an error. Check that your total or percentage field is not empty or zero.`,
      },
    ],
    related: [
      { slug: 'percentage-error-calculator', note: `Measure how far an estimate or measurement deviates from the true value.` },
      { slug: 'fraction-calculator', note: `Work with the fractions behind a percentage and convert between the two.` },
      { slug: 'ratio-calculator', note: `Scale or simplify ratios when your comparison is not a straight percentage.` },
    ],
  },

  'permutation-combination-calculator': {
    intro: [
      `When you need to count arrangements or selections, the difference between a permutation and a combination is everything — and it is easy to mix them up. This calculator computes both at once from the same two inputs: n, the total number of items, and r, how many you are choosing.`,
      `Permutations (nPr) count ordered arrangements — useful for problems like how many ways a race of n runners can finish in the top r places. Combinations (nCr) count unordered selections — how many r-person committees you can form from n people, or how many lottery tickets cover a draw. Students checking probability homework and anyone setting up a counting problem get both answers plus the factorial breakdown behind them.`,
    ],
    steps: [
      `Enter n, the total number of items, in the first field.`,
      `Enter r, the number of items being chosen, in the second field.`,
      `Read the permutation (nPr) and combination (nCr) results, both calculated automatically.`,
      `Expand the factorial breakdown to see n!, r!, and (n−r)! and how they combine.`,
      `Use Copy to save both formulas and values, or Reset to clear and start over.`,
    ],
    why: [
      `It computes both nPr and nCr simultaneously, so you can compare ordered and unordered counts side by side instead of running two tools.`,
      `Each answer is shown with its formula and a factorial breakdown — n!, r!, and (n−r)! — making it a genuine learning aid, not just a black-box number.`,
      `It validates the inputs, returning zero when r exceeds n or when a value is negative, so impossible cases do not produce misleading output.`,
      `Large results are formatted with thousands separators and computed instantly in the browser, with no sign-up.`,
    ],
    faqs: [
      {
        question: `What is the difference between a permutation and a combination?`,
        answer: `A permutation counts arrangements where order matters (nPr); a combination counts selections where order does not (nCr). Choosing a president and vice-president from a group is a permutation; choosing two committee members is a combination. For the same n and r, there are always at least as many permutations as combinations.`,
      },
      {
        question: `What does the factorial notation n! mean?`,
        answer: `n! ("n factorial") is the product of all positive integers up to n — for example 5! = 5 × 4 × 3 × 2 × 1 = 120. By definition 0! and 1! both equal 1. Factorials are the building blocks of the permutation and combination formulas shown in the breakdown.`,
      },
      {
        question: `Why do I get 0 as a result?`,
        answer: `The calculator returns 0 when the inputs describe an impossible selection — most commonly when r is larger than n, or when either value is negative. You cannot choose more items than exist, so check that r is no greater than n.`,
      },
      {
        question: `What are the formulas used?`,
        answer: `Permutations use nPr = n! ÷ (n−r)!, and combinations use nCr = n! ÷ [r! × (n−r)!]. The tool displays both formulas with your numbers substituted in so you can verify each step.`,
      },
    ],
    related: [
      { slug: 'probability-calculator', note: `Turn your counts into the probability of a specific event.` },
      { slug: 'factor-calculator', note: `Explore the factors of the numbers involved in your counting problem.` },
      { slug: 'standard-deviation-calculator', note: `Move from counting to describing the spread of a data set.` },
    ],
  },

  'ping-tool': {
    intro: [
      `Is a site actually reachable, and how quickly does it respond? The Ping Tool checks from your own browser by sending a short series of lightweight requests to a host and timing each round trip, then summarizing the results — how many succeeded, how many were lost, and the minimum, average, and maximum response times.`,
      `It is handy for a quick "is it up and is it slow?" check: confirming a server is responding before you dig into a deployment problem, comparing latency to two different endpoints, or sanity-checking a flaky connection. Because it runs in the browser, there is nothing to install and it works from any device.`,
      `One technical caveat: browsers cannot send true ICMP ping packets, so this tool measures HTTP round-trip time using fetch requests. It is an excellent reachability and latency indicator, but it is not identical to a command-line ICMP ping, and the TTL value shown is a fixed placeholder rather than a measured hop count.`,
    ],
    steps: [
      `Enter the host or IP address you want to check (a protocol is added automatically if you omit it).`,
      `Set how many packets to send using the slider — anywhere from 1 to 10.`,
      `Click Start Ping and watch the results table fill in, one request at a time.`,
      `Read the live rows for each request's sequence number, time, and status.`,
      `Review the statistics card for packets sent and received, packet loss percentage, and min/avg/max times — then Copy the summary, or hit Stop to end early.`,
    ],
    why: [
      `It runs entirely from your browser with no software to install and no account, so you can check a host from any machine instantly.`,
      `Results stream in live with per-request timing and a rolled-up statistics summary covering loss percentage and min, average, and max latency.`,
      `You control the packet count from 1 to 10, balancing a quick check against a more stable average.`,
      `It is transparent about its method: because browsers cannot issue raw ICMP, it measures real HTTP round-trip latency instead of overstating what it can do.`,
    ],
    faqs: [
      {
        question: `Is this the same as the ping command in a terminal?`,
        answer: `Not exactly. A terminal ping sends ICMP packets, which browsers are not allowed to do. This tool measures round-trip time using HTTP requests instead. It is a reliable indicator of whether a host responds and how fast, but the absolute numbers can differ from a native ICMP ping.`,
      },
      {
        question: `Why does the TTL always show 64?`,
        answer: `Time To Live (TTL) reflects how many network hops a packet may take, and that information is not available to browser-based requests. The tool displays a fixed value of 64 as a placeholder; it is not a measured hop count.`,
      },
      {
        question: `Why am I seeing packet loss or errors on a site I know is up?`,
        answer: `Many servers block or restrict cross-origin browser requests, which can register as timeouts or errors here even though the site loads normally in a tab. Some packet loss in this tool reflects those browser security policies rather than a genuine outage.`,
      },
      {
        question: `Can I ping an internal or local IP address?`,
        answer: `You can enter one, but browser security and network routing often prevent reaching private addresses from a web page. This tool is most reliable for checking public, internet-facing hosts.`,
      },
    ],
    related: [
      { slug: 'website-status-checker', note: `Confirm whether a site is up and what status code it returns.` },
      { slug: 'port-checker', note: `Check whether a specific port is open once you know the host responds.` },
      { slug: 'internet-speed-test', note: `Measure your own connection's download and upload speed, not just latency.` },
    ],
  },

  'dns-lookup': {
    intro: [
      `Every domain name relies on DNS records to point traffic to the right place — web servers, mail servers, verification strings, and more. The DNS Lookup tool queries those records for any domain and shows you what is actually published, grouped by record type.`,
      `It is a staple for anyone managing domains: verifying that an A record points to the new server after a migration, confirming MX records are set before email goes live, or checking the TXT records that hold SPF and domain-verification strings. You can request several record types in a single lookup and see them side by side.`,
      `Lookups are resolved through Google's public DNS service over a secure HTTPS query, so the domain you enter is sent to Google to be resolved — worth knowing if you are checking something confidential.`,
    ],
    steps: [
      `Enter the domain name you want to inspect (for example, example.com).`,
      `Select one or more record types to query — A, AAAA, MX, TXT, NS, CNAME, or SOA.`,
      `Click Lookup.`,
      `Read the results grouped under each record type, with "No records found" shown where a type is empty.`,
      `Use the per-type copy button to grab a record's values, and check the query time displayed at the top.`,
    ],
    why: [
      `You can query seven record types — A, AAAA, MX, TXT, NS, CNAME, and SOA — and select several at once for a combined view in one lookup.`,
      `Results are resolved through Google Public DNS, a fast, widely trusted resolver, rather than whatever your local network happens to cache.`,
      `Each record type has its own copy button, so pulling a single TXT or MX value into a config or ticket is one click.`,
      `It runs in any browser with no install, and reports the query time so you can gauge resolver responsiveness.`,
    ],
    faqs: [
      {
        question: `What do the different DNS record types mean?`,
        answer: `A and AAAA records map a domain to IPv4 and IPv6 addresses; MX records direct email to mail servers; TXT records hold arbitrary text such as SPF and verification strings; NS records list the authoritative name servers; CNAME records alias one name to another; and SOA records carry administrative details about the zone.`,
      },
      {
        question: `Is the domain I look up kept private?`,
        answer: `The lookup is performed by querying Google Public DNS over HTTPS, so the domain name you enter is sent to Google's resolver to be answered. The tool itself does not store your queries, but the request does leave your browser to reach the DNS service.`,
      },
      {
        question: `Why don't I see any records for a type I expected?`,
        answer: `A "No records found" result usually means that record type simply is not published for the domain — for example, a domain with no email service may have no MX records. It can also reflect recent changes that have not propagated yet.`,
      },
      {
        question: `Why might these results differ from my own computer's DNS?`,
        answer: `Your device or network may be caching older records or using a different resolver. This tool queries Google Public DNS directly, which can reflect a more current or simply different answer than your local cache during propagation.`,
      },
    ],
    related: [
      { slug: 'whois-lookup', note: `See who registered a domain and when it expires, beyond its DNS records.` },
      { slug: 'http-headers-checker', note: `Once DNS resolves, inspect the HTTP headers the server returns.` },
      { slug: 'ping-tool', note: `Confirm the address from an A record is actually responding.` },
    ],
  },

  'keyword-density-checker': {
    intro: [
      `Keyword density is the percentage of a page's words made up by a given term or phrase — a quick signal of whether content is naturally focused or awkwardly stuffed. This checker analyzes any block of text and ranks the most frequent words and phrases by how often they appear and what share of the content they represent.`,
      `Content writers and SEOs use it to audit a draft before publishing: confirming the target topic actually shows up, spotting a phrase that has been repeated too aggressively, or finding the unexpected filler words eating up the count. Because it can analyze two- and three-word phrases, not just single words, it surfaces the multi-word terms that often matter most for search.`,
    ],
    steps: [
      `Paste your content into the input box.`,
      `Choose a phrase length — 1, 2, or 3 words — to analyze single keywords or longer phrases.`,
      `Adjust the options: toggle "Exclude stop words", set a minimum word length, and turn case sensitivity on or off.`,
      `Click Analyze to see the ranked table of words or phrases with their counts and density percentages.`,
      `Sort by count, density, or alphabetically, then Copy the results or Export CSV for your records.`,
    ],
    why: [
      `It analyzes one-, two-, and three-word phrases, so you can audit the longer key phrases that single-word counters miss entirely.`,
      `A built-in stop-word filter removes 40-plus common words like "the" and "and" by default, so the ranking reflects meaningful terms — and you can switch it off when you need the raw count.`,
      `Results export to CSV and copy as text, fitting straight into a content audit spreadsheet or a report.`,
      `All analysis happens in your browser, so unpublished drafts are never uploaded.`,
    ],
    faqs: [
      {
        question: `What is a good keyword density?`,
        answer: `There is no official target, but most SEO guidance suggests keeping a primary keyword in the low single digits as a percentage — roughly 1–2% — to stay natural. Far higher densities can read as keyword stuffing. Use this tool to spot terms that are over-represented rather than chasing an exact number.`,
      },
      {
        question: `What are stop words and why exclude them?`,
        answer: `Stop words are extremely common words such as "the", "and", "is", and "to" that carry little topical meaning. Excluding them — the default here — keeps the ranking focused on words that actually describe your content. You can include them by unchecking the option.`,
      },
      {
        question: `What does phrase length do?`,
        answer: `It sets how many consecutive words count as a single term. At length 1 you see individual words; at length 2 or 3 the tool counts two- and three-word phrases, which is how you find meaningful multi-word key phrases instead of isolated words.`,
      },
      {
        question: `Is my content sent anywhere?`,
        answer: `No. The text is analyzed entirely in your browser with JavaScript and is never uploaded, so you can safely check drafts and unpublished pages.`,
      },
    ],
    related: [
      { slug: 'readability-checker', note: `Check how easy your text is to read alongside its keyword balance.` },
      { slug: 'meta-tag-generator', note: `Turn your target keywords into proper title, description, and meta tags.` },
      { slug: 'word-counter', note: `Get overall word, character, and sentence counts for the same text.` },
    ],
  },

  'meta-tag-generator': {
    intro: [
      `Meta tags tell search engines and social platforms how to title, describe, and preview a page — and getting them right is one of the highest-leverage SEO basics. The Meta Tag Generator builds the complete block of HTML for you: standard SEO tags, Open Graph tags for Facebook and LinkedIn, and Twitter Card tags, ready to paste into your page's head.`,
      `It is built for developers and marketers shipping pages who do not want to memorize tag syntax. Fill in a title and description and you get clean, correct markup; expand the optional sections to control how a link looks when it is shared on social media. Live character counters on the title and description turn from green to red as you approach the lengths search engines typically truncate, so you can write copy that displays in full.`,
    ],
    steps: [
      `Enter your page title and description — watch the character counters stay green within recommended limits.`,
      `Add keywords, author, and a canonical URL, and set the index/follow checkboxes for the robots tag.`,
      `Expand the Open Graph section to set social title, description, image, URL, and type (Website, Article, or Product).`,
      `Expand the Twitter Card section to choose a card type and set its title, description, and image.`,
      `Adjust the extra options (viewport, charset, language) if needed, click Generate Meta Tags, and Copy the output into your page's <head>.`,
    ],
    why: [
      `It generates all three layers — standard SEO, Open Graph, and Twitter Card — in one pass, so social previews and search listings are covered together.`,
      `Live, color-coded character counters flag when your title passes ~60 characters or your description passes ~160, the points where search engines tend to truncate.`,
      `Smart fallbacks reuse your page title and description for the social tags when you leave them blank, so you get complete markup without duplicating effort.`,
      `Everything is generated locally and copied as plain HTML — no account, and nothing you type is sent to a server.`,
    ],
    faqs: [
      {
        question: `How long should my title and description be?`,
        answer: `Aim for a title under about 60 characters and a description under about 160, since search engines commonly truncate beyond those lengths. The counters in this tool turn yellow as you approach the limit and red when you exceed it, so you can keep both fully visible in results.`,
      },
      {
        question: `What are Open Graph and Twitter Card tags for?`,
        answer: `They control how your link looks when shared on social platforms — the title, description, and preview image. Open Graph is used by Facebook, LinkedIn, and others; Twitter Cards are used by X/Twitter. Without them, platforms guess, often poorly.`,
      },
      {
        question: `Do meta keywords still matter for SEO?`,
        answer: `Major search engines no longer use the meta keywords tag as a ranking signal, so it is optional. The tool includes it for completeness, but your title, description, and on-page content carry far more weight.`,
      },
      {
        question: `Where do I put the generated tags?`,
        answer: `Paste the generated block inside the <head> section of your HTML document, before the closing </head> tag. If your site uses a framework or CMS, add them through its head or SEO settings so they render on every relevant page.`,
      },
    ],
    related: [
      { slug: 'open-graph-preview-generator', note: `Preview exactly how your Open Graph tags will render when shared.` },
      { slug: 'serp-snippet-preview', note: `See how your title and description will look in a Google search result.` },
      { slug: 'title-description-length-checker', note: `Double-check your title and description against pixel and character limits.` },
    ],
  },

  'image-cropper': {
    intro: [
      `Sometimes a photo just needs the right slice of it — a square for a profile picture, a 16:9 banner, or simply the distracting edges removed. The Image Cropper lets you draw a crop area on your image, lock it to a common aspect ratio, rotate or flip it, and download the result, all without uploading the file anywhere.`,
      `It fits the everyday cases: cropping a headshot to a clean 1:1 for a social avatar, trimming a screenshot down to the part that matters, or straightening a photo that was shot at an angle. The aspect-ratio presets — Free, 1:1, 16:9, 4:3, and 3:2 — cover the formats most platforms expect, and you can set exact pixel dimensions when you need a precise size.`,
    ],
    steps: [
      `Upload an image by clicking or dragging it in — JPG, PNG, WebP, and GIF are accepted.`,
      `Pick an aspect ratio (Free, 1:1, 16:9, 4:3, or 3:2) or set custom width and height in pixels and click Apply.`,
      `Drag and resize the crop box over the part of the image you want to keep.`,
      `Use the rotate and flip buttons to adjust orientation if needed.`,
      `Click Download PNG to save your cropped image.`,
    ],
    why: [
      `Your image is processed entirely in your browser on a canvas — it is never uploaded to a server, which keeps personal photos and screenshots private.`,
      `Five aspect-ratio presets plus exact pixel dimensions cover both quick social crops and precise size requirements.`,
      `Built-in rotate (90° steps) and horizontal/vertical flip let you fix orientation in the same step as cropping.`,
      `There is no sign-up and no file-size gate in the interface, so you can crop and download in seconds.`,
    ],
    faqs: [
      {
        question: `Are my images uploaded to a server?`,
        answer: `No. The cropper reads your file locally and does all processing on an in-browser canvas. The image never leaves your device, which makes it safe for private photos, IDs, and confidential screenshots.`,
      },
      {
        question: `What image formats can I crop?`,
        answer: `You can load JPG, PNG, WebP, and GIF images. The cropped result is saved as a PNG file, which preserves quality and supports transparency.`,
      },
      {
        question: `How do I crop to an exact size in pixels?`,
        answer: `Use the custom dimensions fields to enter a specific width and height (between 50 and 5000 pixels) and click Apply. The crop box will lock to those dimensions so your output matches the size you need.`,
      },
      {
        question: `Can I rotate or flip the image while cropping?`,
        answer: `Yes. Rotate buttons turn the image in 90-degree steps, and separate buttons flip it horizontally or vertically, so you can correct orientation before downloading without a separate editor.`,
      },
    ],
    related: [
      { slug: 'image-resizer', note: `Scale the whole image to a target size after cropping.` },
      { slug: 'image-compressor', note: `Shrink the file size of your cropped image for faster loading.` },
      { slug: 'image-converter', note: `Change the cropped image into a different format such as WebP.` },
    ],
  },

  'meme-generator': {
    intro: [
      `Memes are a language, and the Meme Generator gives you a quick way to speak it: upload any image and stack as much custom text on it as you want, positioned exactly where you like. It draws everything on a live canvas so you see the result update as you type.`,
      `Unlike the classic top-and-bottom-text generators, this one works in layers — start with the two defaults, add more, and style each independently. That makes it just as good for a straightforward image macro as it is for a multi-panel joke, a captioned reaction shot, or a quick social graphic. It starts with the meme-standard Impact font but offers four more, plus full control over size, color, and the outline that keeps text legible over busy images.`,
    ],
    steps: [
      `Upload your base image — JPG, PNG, or WebP — by clicking or dragging it onto the canvas.`,
      `Edit the two default text layers, or click Add Layer for more.`,
      `Select a layer to expand its controls: choose a font (Impact, Arial, Comic Sans MS, Times New Roman, or Courier New), set size, and pick text and stroke colors.`,
      `Drag the position sliders to place each layer exactly where you want it on the image.`,
      `Click Download PNG (or JPG) to save your finished meme.`,
    ],
    why: [
      `It supports unlimited text layers, each styled independently — not just a fixed top and bottom caption — so multi-line and multi-panel memes are easy.`,
      `Every change renders live on the canvas, including the optional black stroke that keeps white text readable over any background.`,
      `Five fonts (led by the meme-classic Impact) plus per-layer size, color, and position sliders give you real design control.`,
      `The whole thing runs on an in-browser canvas, so your image is never uploaded and there is no watermark on the output.`,
    ],
    faqs: [
      {
        question: `Is there a watermark on the finished meme?`,
        answer: `No. The image is rendered entirely on your device's canvas and downloaded directly, so the file you save is clean with no watermark or branding added.`,
      },
      {
        question: `Why is the meme font usually Impact?`,
        answer: `Impact became the default meme font because it is bold, condensed, and stays readable at large sizes over photos, especially with a contrasting outline. This generator uses it by default but also offers Arial, Comic Sans MS, Times New Roman, and Courier New.`,
      },
      {
        question: `How do I add more than two captions?`,
        answer: `Click the Add Layer button to create additional text layers. Each one is independent, so you can position and style every caption separately — handy for reaction images or multi-panel formats.`,
      },
      {
        question: `Are my uploaded images kept private?`,
        answer: `Yes. Your image is loaded and composited locally in the browser and is never sent to a server, so personal photos used as meme templates stay on your device.`,
      },
    ],
    related: [
      { slug: 'meme-sticker-studio', note: `Turn an image into stickers with cutouts and effects for chats and posts.` },
      { slug: 'image-cropper', note: `Crop your base image to the right framing before adding captions.` },
      { slug: 'ascii-art-generator', note: `Create text-based art for a different flavor of internet humor.` },
    ],
  },

  // ── Batch 2: Developer tools (15) ───────────────────────────────────

  'json-diff': {
    intro: [
      `When two versions of a JSON document should match but something has drifted, scanning them line by line is slow and error-prone. JSON Diff parses both sides and compares them structurally, then reports exactly which fields were added, removed, or changed — by their full path inside the object.`,
      `That structural approach is what makes it useful where a plain text diff falls short: reformatting, reordered keys, or different indentation do not create false differences, because the tool compares parsed values rather than characters. API developers reach for it to spot what changed between a working response and a broken one; config owners use it to see which setting differs between staging and production.`,
      `Arrays are compared by position and objects by key, so a change at users[2].email is reported precisely there rather than as a vague "something in this block changed".`,
    ],
    steps: [
      `Paste your first JSON document into the "JSON 1 (Original)" box.`,
      `Paste the version you want to compare into "JSON 2 (Modified)".`,
      `The comparison runs automatically as you edit — no button to press.`,
      `Read the results: each entry shows its path and whether it was added, removed, or modified, with the old and new values for changes.`,
      `Use Copy to export the diff as a readable +/-/~ list for a pull request or bug report.`,
    ],
    why: [
      `It compares parsed structure, not text, so reformatting or different indentation never shows up as a false change — only real value differences do.`,
      `Every difference is reported with its full path (such as items[0].price), so you can jump straight to what changed instead of hunting through nested blocks.`,
      `It distinguishes added, removed, and modified explicitly, including the before and after values for each change.`,
      `Both documents are parsed and compared entirely in your browser, so unreleased API payloads and config never leave your machine.`,
    ],
    faqs: [
      {
        question: `How is this different from a normal text diff?`,
        answer: `A text diff compares characters, so reordering keys or changing indentation registers as differences even when the data is identical. JSON Diff parses both documents first and compares the actual values, so it only flags genuine structural and value changes.`,
      },
      {
        question: `Does the order of keys matter?`,
        answer: `For objects, no — keys are matched by name, so {"a":1,"b":2} and {"b":2,"a":1} are treated as equal. For arrays, order does matter, because elements are compared by their index position.`,
      },
      {
        question: `Why am I getting an "invalid JSON" error?`,
        answer: `One of the two inputs is not valid JSON — often a trailing comma, a missing quote, or an unclosed bracket. Both sides must parse successfully before they can be compared; format each one in a JSON formatter first if you are unsure.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Clean up and validate each document before comparing them.` },
      { slug: 'text-diff', note: `Comparing plain text or code rather than JSON? Use a line-based diff instead.` },
      { slug: 'json-parse', note: `Re-indent a single document to inspect it on its own.` },
    ],
  },

  'json-stringify': {
    intro: [
      `Turning a loose JavaScript object into a clean, properly quoted JSON string is a constant need when you are moving data from code into a config file, a test fixture, or an API request body. JSON Stringify does exactly that: paste an object and it returns a valid, indented JSON string.`,
      `What sets it apart from a strict parser is tolerance for the way developers actually write objects. It accepts relaxed JavaScript syntax — unquoted keys, single quotes, trailing commas — and produces strict, double-quoted JSON from it, so you can copy an object straight out of your editor without first hand-fixing every quote.`,
      `You control the indentation, anywhere from compact single-line output to a generously spaced eight-space layout, which is handy whether you are minifying for a request or making a fixture readable.`,
    ],
    steps: [
      `Paste your JavaScript object into the "JavaScript Object" box — unquoted keys and single quotes are fine.`,
      `Set the "Spacing" value (0 to 8) to control indentation; 0 produces compact single-line JSON, 2 is the common default.`,
      `Read the formatted JSON string in the output.`,
      `Click Copy to grab it, or Download to save it as a .json file.`,
    ],
    why: [
      `It accepts relaxed JavaScript object syntax, not just strict JSON, so you can paste an object literal from your code without manually quoting every key first.`,
      `Indentation is adjustable from 0 to 8 spaces, covering both minified output and human-readable fixtures from one control.`,
      `Output can be copied or downloaded directly as a .json file, skipping the save-as dance.`,
      `Conversion happens locally in your browser, so object data you paste is never uploaded.`,
    ],
    faqs: [
      {
        question: `What is the difference between this and a JSON parser?`,
        answer: `A parser takes a JSON string and reads it into structured data (or re-indents it). This tool goes the other direction: it takes a JavaScript object and produces a JSON string from it, conveniently accepting relaxed syntax like unquoted keys on the way in.`,
      },
      {
        question: `Why does my output use double quotes when I typed single quotes?`,
        answer: `That is correct behavior. The JSON specification requires double quotes around strings and keys, so the tool converts your single-quoted, possibly unquoted input into spec-compliant double-quoted JSON.`,
      },
      {
        question: `What does a spacing of 0 do?`,
        answer: `It produces minified JSON on a single line with no extra whitespace — ideal for embedding in a request body or a compact config. Increase the spacing to 2 or 4 when you want the output indented and easy to read.`,
      },
    ],
    related: [
      { slug: 'json-parse', note: `Going the other way — turn a JSON string back into formatted, validated data.` },
      { slug: 'json-formatter', note: `Validate and pretty-print existing JSON with more formatting options.` },
      { slug: 'json-escape', note: `Escape the resulting string so it can be embedded inside another JSON value.` },
    ],
  },

  'json-parse': {
    intro: [
      `A minified or single-line JSON blob is valid but unreadable. JSON Parse takes that string, validates it, and re-emits it cleanly indented so you can actually see its structure — and tells you immediately if it is malformed.`,
      `It is the tool you paste an API response into when it arrives as one dense line, or when you have copied JSON out of a log and need to confirm it is well-formed before trusting it. Because parsing either succeeds or fails loudly, it doubles as a quick validity check: if it formats, your JSON is valid; if it errors, you get the parser's message pointing at the problem.`,
    ],
    steps: [
      `Paste your JSON string into the "JSON String" box.`,
      `The tool parses it and outputs a clean, two-space-indented version.`,
      `If the JSON is invalid, read the error message to find what needs fixing.`,
      `Click Copy to grab the formatted result, or Download to save it as parsed.json.`,
    ],
    why: [
      `It uses the browser's native JSON.parse, so validity here means validity everywhere — what passes is genuinely spec-compliant JSON.`,
      `Invalid input produces the exact parser error message, turning the tool into a fast way to locate a stray comma or unclosed bracket.`,
      `Formatted output can be copied or downloaded as a file in one click.`,
      `Everything runs in your browser, so sensitive payloads pasted from logs or APIs stay private.`,
    ],
    faqs: [
      {
        question: `Why is my JSON invalid?`,
        answer: `The most common causes are trailing commas, single quotes instead of double quotes, unquoted keys, or an unclosed bracket or brace. JSON is stricter than JavaScript object syntax — the error message shown here points to where parsing failed so you can fix it.`,
      },
      {
        question: `Does this tool change my data?`,
        answer: `No. It only re-formats the whitespace and indentation. The keys, values, and structure are preserved exactly; parsing and re-stringifying does not alter the actual data.`,
      },
      {
        question: `Can I choose the indentation level?`,
        answer: `This tool always formats with two-space indentation, the most common convention. If you need a different indentation width or minified output, use a JSON formatter or the stringify tool, which expose a spacing control.`,
      },
      {
        question: `Can it parse JSON with comments (JSONC)?`,
        answer: `No. Standard JSON does not allow comments, and this parser follows the strict specification, so a file with // or /* */ comments will be reported as invalid. Remove the comments first, or use a tool built specifically for JSONC if your config format permits them.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Need adjustable indentation or minify mode? Use the fuller formatter.` },
      { slug: 'json-stringify', note: `Build a JSON string from a JavaScript object instead of parsing one.` },
      { slug: 'json-path-finder', note: `Once it is readable, drill into a specific value by its path.` },
    ],
  },

  'json-path-finder': {
    intro: [
      `Large JSON responses bury the one value you actually want under layers of nesting. JSON Path Finder lets you write a path expression and pulls that value straight out, so you do not have to scroll and count brackets.`,
      `It is built for the everyday case of "I just need users[0].address.city out of this 400-line response." API developers use it to confirm where a field lives before writing code that reads it; testers use it to extract a single value to assert against. Quick-select buttons give you a starting point, and you refine the path from there.`,
      `The supported syntax is the practical core of JSONPath: the root token, dot notation for nested keys, and bracket notation for array indices — enough to reach any specific value in a typical document.`,
    ],
    steps: [
      `Paste your JSON into the "JSON Input" box.`,
      `Type a path in the expression field — start from $ and use dot notation for keys and [n] for array indices, e.g. $.users[0].email.`,
      `Use a quick-select button as a starting point if you want, then refine the expression.`,
      `Click Find to extract the value at that path.`,
      `Read the result (formatted as JSON) and Copy it; if the path does not exist, an error tells you where it failed.`,
    ],
    why: [
      `It evaluates real path expressions — root, nested keys, and array indices — so you extract exactly one value instead of eyeballing a huge document.`,
      `When a path does not resolve, it names the segment that failed, which helps you correct a typo or a wrong assumption about the structure.`,
      `Results come back as formatted JSON with a copy button, ready to paste into a test or a request.`,
      `Parsing and lookup run entirely in your browser, keeping response data private.`,
    ],
    faqs: [
      {
        question: `What path syntax does this support?`,
        answer: `It supports the common core of JSONPath: $ for the root, dot notation for object keys (such as $.user.name), and bracket notation for array indices (such as $.items[0]). You can combine them, like $.data.items[2].id, to reach a deeply nested value.`,
      },
      {
        question: `Does it support wildcards or filters?`,
        answer: `No. Advanced JSONPath features such as wildcards (selecting every element of an array) and filter expressions are not supported here — the tool resolves a single, concrete path to one value. For selecting many matching items, use a JSON filtering tool.`,
      },
      {
        question: `Why do I get "path not found"?`,
        answer: `The expression points to a key or index that does not exist in your JSON — often a misspelled key, the wrong array index, or a level of nesting that is not there. The error names the segment it could not resolve so you can adjust the path.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Pretty-print the document first so you can see the paths you want to target.` },
      { slug: 'json-filter', note: `Need to select many matching items rather than one path? Filter the data instead.` },
      { slug: 'json-diff', note: `Compare two documents when you are tracking down where a value changed.` },
    ],
  },

  'json-escape': {
    intro: [
      `Embedding one piece of JSON inside another — or stuffing a multi-line string into a single JSON value — breaks the moment a quote or newline is taken literally. JSON Escape converts a raw string into its safely escaped form, and reverses the process when you need the original back.`,
      `Developers hit this whenever a string has to travel through a JSON field that is itself a string: storing a JSON snippet as a value, pasting a code block into a config, or preparing a multi-line message for an API. Escape mode turns the dangerous characters into their backslash equivalents; unescape mode restores them so you can read the content as it was written.`,
    ],
    steps: [
      `Choose your direction with the Escape / Unescape toggle.`,
      `In Escape mode, paste the raw string you want to make JSON-safe; in Unescape mode, paste the escaped string.`,
      `Read the converted output as you type — quotes, backslashes, and whitespace characters are handled automatically.`,
      `Click Copy to grab the result for your JSON value or your editor.`,
    ],
    why: [
      `It handles the full set of characters that break JSON strings — quotes, backslashes, newlines, carriage returns, tabs, form feeds, and backspaces — not just quotes.`,
      `The single Escape/Unescape toggle works both directions, so you can round-trip a value without switching tools.`,
      `It processes any input without imposing a format, so you can escape a whole code block or a one-line string equally.`,
      `Conversion is local to your browser, keeping whatever you paste private.`,
    ],
    faqs: [
      {
        question: `When do I need to escape a string for JSON?`,
        answer: `Whenever a string value contains characters that have special meaning in JSON — most commonly double quotes and backslashes, or literal line breaks and tabs. Escaping them lets the string sit safely inside a JSON value without breaking the surrounding structure.`,
      },
      {
        question: `What characters does escaping affect?`,
        answer: `Backslash, double quote, newline, carriage return, tab, form feed, and backspace are converted to their backslash escape sequences (\\\\, \\", \\n, \\r, \\t, \\f, \\b). Unescape mode converts those sequences back into the original characters.`,
      },
      {
        question: `Is escaping the same as encoding?`,
        answer: `No. Escaping prepares a string for safe inclusion inside JSON by backslash-escaping special characters. Encoding schemes like Base64 or URL encoding serve different transport needs — use a dedicated encoder for those.`,
      },
      {
        question: `Why did my escaped string come back wrong after unescaping?`,
        answer: `Unescape expects input that was actually escaped — sequences like \\n and \\". If you unescape a string that contains a literal backslash that was never an escape sequence, the result can differ from what you expect. Make sure you are reversing genuinely escaped text, not raw input with stray backslashes.`,
      },
    ],
    related: [
      { slug: 'json-stringify', note: `Generate a full JSON string from an object, with strings already escaped.` },
      { slug: 'json-parse', note: `Validate and read the JSON your escaped string ends up inside.` },
      { slug: 'base64-encoder', note: `For a different kind of safe transport, encode the value as Base64.` },
    ],
  },

  'json-schema-visualizer': {
    intro: [
      `Understanding the shape of an unfamiliar JSON document is half the battle when integrating an API. JSON Schema Visualizer reads your data and renders its structure as a color-coded tree — every key, its inferred type, and how the pieces nest — so you can grasp the shape at a glance instead of reading raw braces.`,
      `It is most useful the first time you meet a payload: a developer pastes a sample response and immediately sees that data.items is an array of objects, each with a string id and a numeric price. Technical writers and analysts use it to document a structure without manually tracing every level.`,
      `Types are inferred directly from the values — object, array, string, number, boolean, or null — and arrays are described by the type of their elements, giving you a readable map of the data rather than a formal validation schema.`,
    ],
    steps: [
      `Paste a representative JSON sample into the "JSON Input" box.`,
      `Click Visualize Schema.`,
      `Explore the tree: each node shows its key, its inferred type, and (for arrays) what kind of items it holds.`,
      `Follow the color coding to tell types apart at a glance, and Copy the structure if you want to keep it.`,
    ],
    why: [
      `It infers and color-codes every type — object, array, string, number, boolean, and null — so the structure of an unfamiliar payload is readable instantly.`,
      `Arrays are labeled by their element type (for example, "Array of object"), which is exactly what you need to know when writing code against a list.`,
      `It renders the full nesting as an indented tree, turning a wall of braces into a navigable map.`,
      `Your sample is analyzed in the browser and never uploaded, so you can paste real responses safely.`,
    ],
    faqs: [
      {
        question: `Does this generate a formal JSON Schema document?`,
        answer: `No. It produces a readable, color-coded tree of your data's structure with inferred types — a visualization to help you understand the shape. It does not emit a formal JSON Schema (with $schema, required, and validation keywords) for use in automated validation.`,
      },
      {
        question: `How are the types determined?`,
        answer: `Types are inferred from the actual values in your sample. A quoted value is a string, a bare number is a number, true/false is a boolean, null is null, [...] is an array, and {...} is an object. For arrays, the element type is taken from the items present.`,
      },
      {
        question: `Why does a large array only show a few items?`,
        answer: `For readability, the visualizer previews the first several elements of an array rather than rendering thousands of identical nodes. The goal is to convey the structure — the element type and shape — not to reproduce the entire data set.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Pretty-print the raw JSON alongside its visualized structure.` },
      { slug: 'json-path-finder', note: `Once you understand the shape, extract a specific value by its path.` },
      { slug: 'json-diff', note: `Compare two payloads when their structures should match but do not.` },
    ],
  },

  'json-to-csv': {
    intro: [
      `Spreadsheets speak CSV, APIs speak JSON, and the gap between them is a frequent chore. JSON to CSV converts an array of JSON objects into clean, spreadsheet-ready CSV — collecting every field into columns and lining up the rows.`,
      `It is the quick bridge for getting data into Excel, Google Sheets, or a database import: exporting an API result for a non-technical colleague, turning a list of records into a report, or prepping a bulk upload. Nested objects are flattened into dot-notation columns, so {"user":{"name":"Ann"}} becomes a user.name column rather than an unreadable blob.`,
    ],
    steps: [
      `Paste a JSON array of objects (or a single object) into the "JSON Input" box.`,
      `The tool collects all keys across your objects to build the CSV header row.`,
      `Read the generated CSV; nested object fields appear as dot-notation columns like address.city.`,
      `Click Copy to paste into a sheet, or Download to save it as data.csv.`,
    ],
    why: [
      `It flattens nested objects into dot-notation columns automatically, so structured records become a flat table without manual reshaping.`,
      `It gathers the union of all keys across every object, so records with different fields still line up correctly, with blanks where a value is missing.`,
      `Values containing commas, quotes, or line breaks are quoted and escaped following the standard CSV rules, so the output imports cleanly into Excel and Google Sheets.`,
      `Conversion runs in your browser and the result downloads as a .csv file directly — no upload, no account.`,
    ],
    faqs: [
      {
        question: `What JSON structure does this expect?`,
        answer: `An array of objects works best — each object becomes a row and each key becomes a column. A single object is also accepted and produces a one-row CSV. Deeply nested objects are flattened into dot-notation columns.`,
      },
      {
        question: `How are nested objects handled?`,
        answer: `Nested objects are flattened using dot notation, so {"user":{"name":"Ann","age":30}} becomes two columns, user.name and user.age. This keeps the structure visible while fitting into a flat table.`,
      },
      {
        question: `Can I change the delimiter to a semicolon or tab?`,
        answer: `This tool outputs standard comma-separated values. If your spreadsheet locale expects a semicolon, most spreadsheet apps let you choose the delimiter on import, or you can find-and-replace after pasting.`,
      },
      {
        question: `What happens to values with commas in them?`,
        answer: `They are automatically wrapped in double quotes, and any double quotes inside the value are doubled — the standard CSV escaping. This ensures a value like "Smith, John" stays in a single column when imported.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Validate and inspect the JSON before converting it to a table.` },
      { slug: 'json-schema-visualizer', note: `See the structure first to know which columns you will get.` },
      { slug: 'json-parse', note: `Clean up a minified JSON string so it is ready to convert.` },
    ],
  },

  'regex-explainer': {
    intro: [
      `Reading someone else's regular expression — or your own from six months ago — can feel like decoding hieroglyphics. Regex Explainer breaks a pattern into its individual tokens and describes what each one does in plain language, turning a cryptic string into a readable list.`,
      `It is a learning and code-review aid: a developer inherits a validation pattern and wants to know what it actually accepts; a student is building intuition for how quantifiers and character classes work; a reviewer needs to confirm a pattern does what its author claims. Instead of guessing, you get a token-by-token account.`,
      `It recognizes the common building blocks — character classes, anchors, quantifiers, capturing and non-capturing groups, and escape sequences like \\d and \\w — and labels each as it appears in your pattern.`,
    ],
    steps: [
      `Type or paste your regular expression into the "Regular Expression" field.`,
      `Click Explain.`,
      `Read the breakdown: each token in your pattern is listed with a description of what it matches.`,
      `Use Copy to export the full explanation as text for documentation or a code comment.`,
    ],
    why: [
      `It explains the pattern token by token — character classes, anchors, quantifiers, groups, and escapes — so you understand each piece rather than the whole at once.`,
      `It validates the pattern as it reads it, so a syntactically broken regex is caught and reported instead of silently mis-explained.`,
      `The breakdown copies out as plain text, which makes it easy to paste a regex explanation into a code comment or a review note.`,
      `Analysis is entirely in-browser, so internal patterns stay private.`,
    ],
    faqs: [
      {
        question: `What do \\d, \\w, and \\s mean?`,
        answer: `\\d matches any digit (0–9), \\w matches a word character (letters, digits, or underscore), and \\s matches whitespace (spaces, tabs, newlines). Their uppercase versions (\\D, \\W, \\S) match the opposite. The explainer labels each of these where they appear in your pattern.`,
      },
      {
        question: `What is the difference between a capturing and a non-capturing group?`,
        answer: `A capturing group (...) groups part of a pattern and remembers what it matched so you can reference it later. A non-capturing group (?:...) groups without storing the match, which is slightly more efficient when you only need the grouping for structure. The explainer identifies both.`,
      },
      {
        question: `Will this tell me if my regex is wrong?`,
        answer: `It will catch syntax errors — if the pattern cannot be compiled, it reports the problem rather than explaining it. It does not judge whether the pattern matches what you intended; pair it with a regex tester to check behavior against real input.`,
      },
    ],
    related: [
      { slug: 'regex-tester', note: `Test the explained pattern against real text to confirm it matches what you expect.` },
      { slug: 'string-converter', note: `For simple transformations, a case conversion may be all you need instead of a regex.` },
      { slug: 'text-diff', note: `Compare sample inputs to figure out what your pattern needs to capture.` },
    ],
  },

  'uuid-generator': {
    intro: [
      `Unique identifiers are the quiet backbone of modern software — primary keys, request IDs, file names that must never collide. The UUID Generator produces version 4 UUIDs, the random variety, as many as you need at once.`,
      `Developers grab them constantly: seeding a database with test records, generating a correlation ID to trace a request through logs, or creating a unique key for a new resource without round-tripping to a server. Because UUID v4 is built from random data, two generated values colliding is astronomically unlikely, which is exactly why it is the default choice for distributed systems.`,
      `Need one or need a hundred — set the count and generate them in a single batch, then copy them all or download them as a file.`,
    ],
    steps: [
      `Set the "Count" field to how many UUIDs you need (1 to 100).`,
      `Click Generate.`,
      `Read the list of version 4 UUIDs.`,
      `Use an individual copy button for a single value, "Copy All" to grab the whole list, or Download to save them as uuids.txt.`,
    ],
    why: [
      `It uses the browser's built-in crypto.randomUUID where available, so the values come from a cryptographically strong random source rather than a weak pseudo-random one, with a safe fallback for older browsers.`,
      `You can generate up to 100 at once and export them with Copy All or as a downloadable text file — useful for seeding data in bulk.`,
      `Generation is instant and local; no value is requested from or recorded by any server.`,
      `It is free with no sign-up, so it fits straight into a scripting or testing workflow.`,
    ],
    faqs: [
      {
        question: `What is a version 4 UUID?`,
        answer: `A version 4 UUID is a 128-bit identifier generated mostly from random numbers, written as 32 hexadecimal digits in five hyphen-separated groups. The "4" appears in a fixed position to mark the version. It is the most common UUID type because it needs no central coordination to stay unique.`,
      },
      {
        question: `Are these UUIDs guaranteed to be unique?`,
        answer: `Not literally guaranteed, but the probability of a collision is so vanishingly small that it is treated as unique for practical purposes. With 122 random bits, you would need to generate billions of UUIDs before a collision became remotely likely.`,
      },
      {
        question: `Are the generated UUIDs random and private?`,
        answer: `Yes. They are generated in your browser using a cryptographically secure random source where available, and no value is sent to or stored on any server, so the UUIDs you create are yours alone.`,
      },
      {
        question: `Can I generate other UUID versions like v1 or v7?`,
        answer: `This tool generates version 4 (random) UUIDs, which suit the large majority of use cases. Time-ordered versions like v1 or v7 are not produced here; if you specifically need sortable, timestamp-based identifiers, use a library that supports those versions.`,
      },
    ],
    related: [
      { slug: 'password-generator', note: `Need a random secret rather than an identifier? Generate a strong password.` },
      { slug: 'hash-generator', note: `Produce a deterministic fingerprint of data with MD5 or SHA hashes.` },
      { slug: 'jwt-decoder', note: `Inspect tokens that often carry a UUID as their subject or identifier.` },
    ],
  },

  'html-viewer': {
    intro: [
      `Sometimes you just want to see what a snippet of HTML actually renders to — without spinning up a file, a server, or an editor. HTML Viewer takes your markup and shows the live result instantly, while checking that your tags are properly opened and closed.`,
      `It is handy for quick checks: previewing the HTML a CMS or email template produced, sanity-checking a block of markup pasted from a colleague, or confirming that a structure renders the way you expect before committing it. The built-in tag validation catches the most common breakage — an unclosed or mismatched tag — and tells you which one is at fault.`,
    ],
    steps: [
      `Paste your HTML into the "HTML Input" box.`,
      `Click Preview to render it.`,
      `Read the live preview of how the markup displays.`,
      `If a tag is unclosed or mismatched, read the error that names the offending tag, fix it, and preview again; use Copy to grab your markup.`,
    ],
    why: [
      `It renders your HTML live so you see the actual output, not a description of it.`,
      `A tag-stack check flags unclosed or mismatched tags and names the specific tag, correctly ignoring void elements like img and br that need no closing tag.`,
      `It works on any snippet without boilerplate — no need to wrap your markup in a full document first.`,
      `Rendering happens locally in your browser, so nothing you paste is uploaded.`,
    ],
    faqs: [
      {
        question: `Will this validate my HTML against the full standard?`,
        answer: `It performs a practical structural check — making sure tags are opened and closed correctly and recognizing self-closing void elements — rather than a complete W3C conformance audit. It is designed to catch the common, render-breaking mistakes quickly, not to certify full spec compliance.`,
      },
      {
        question: `Which tags count as self-closing?`,
        answer: `Void elements such as img, br, hr, input, meta, link, area, base, col, embed, source, track, and wbr do not need a closing tag, and the validator treats them accordingly so they do not trigger false "unclosed tag" errors.`,
      },
      {
        question: `Is it safe to paste any HTML here?`,
        answer: `The markup is rendered in your own browser and nothing is uploaded, so your content stays private. Because it renders real HTML, only paste markup you trust — exactly as you would treat any code you run in your own browser.`,
      },
      {
        question: `Why does my CSS or JavaScript not apply in the preview?`,
        answer: `The preview renders your HTML structure, so inline styles and basic markup display, but external stylesheets and scripts referenced by the snippet are not loaded. To see a fully styled result, include the relevant CSS inline within the markup you paste.`,
      },
    ],
    related: [
      { slug: 'markdown-to-html', note: `Writing in Markdown? Convert it to HTML, then preview the result here.` },
      { slug: 'code-minifier', note: `Strip whitespace and comments from your HTML once it renders correctly.` },
      { slug: 'css-grid-generator', note: `Generate the CSS grid layout to drop into the markup you are previewing.` },
    ],
  },

  'code-minifier': {
    intro: [
      `Every byte of whitespace and every comment ships to the browser unless you strip it first. Code Minifier removes the comments, redundant spacing, and line breaks from JavaScript, CSS, and HTML, then shows you exactly how many bytes you saved.`,
      `It suits the quick optimization pass: shrinking an inline script or stylesheet before pasting it into a template, trimming a snippet for an embed, or just seeing how much fat a file is carrying. It works on three languages, and for JavaScript it is careful to preserve URLs while removing comments, so a // inside an http:// link does not accidentally eat the rest of the line.`,
      `Smaller files mean fewer bytes over the wire and faster page loads, which is why minification is a standard step before code ships to production — and seeing the byte count drop makes the benefit concrete.`,
    ],
    steps: [
      `Choose the language of your code: JavaScript, CSS, or HTML.`,
      `Paste your code into the "Code Input" box.`,
      `Click Minify.`,
      `Read the minified output along with the before/after byte sizes and the percentage saved, then Copy the result.`,
    ],
    why: [
      `It handles three languages — JavaScript, CSS, and HTML — each with rules tuned to that language's comment and whitespace conventions.`,
      `For JavaScript it preserves URLs while stripping comments, avoiding the classic bug where removing // mangles a link.`,
      `It reports the original and minified sizes with the percentage reduction, so you can see the payoff immediately.`,
      `Minification runs entirely in your browser, so proprietary code is never uploaded.`,
    ],
    faqs: [
      {
        question: `Is this a safe, full minifier like Terser or cssnano?`,
        answer: `It is a lightweight minifier that removes comments and collapses whitespace, which is great for quick savings on simple snippets. It does not rename variables or perform the deep, AST-based transformations of build-tool minifiers, so for production bundles of complex code, use a dedicated build tool.`,
      },
      {
        question: `Will minifying change how my code behaves?`,
        answer: `For well-formed code, removing comments and excess whitespace does not change behavior. Because this tool uses pattern-based minification rather than full parsing, review the output for unusual code (such as whitespace-sensitive template strings) before shipping it.`,
      },
      {
        question: `How much smaller will my file get?`,
        answer: `It depends on how many comments and how much spacing the original contains — heavily commented, generously formatted code can shrink substantially, while already-compact code saves little. The tool shows the exact percentage so you can judge per file.`,
      },
    ],
    related: [
      { slug: 'html-viewer', note: `Confirm your HTML still renders correctly after minifying it.` },
      { slug: 'css-grid-generator', note: `Generate grid CSS, then minify it before adding it to your stylesheet.` },
      { slug: 'markdown-to-html', note: `Produce HTML from Markdown, then minify the output for delivery.` },
    ],
  },

  'cron-builder': {
    intro: [
      `Cron's five-field syntax is compact but unforgiving, and most people end up looking up "what does 0 9 * * 1 mean again?" every single time. Cron Builder lets you set each field — minute, hour, day of month, month, day of week — and assembles the expression for you, with common schedules available as one-click presets.`,
      `It is the helper you reach for when configuring a scheduled job, a backup, or a recurring task: pick "Every Monday at 9 AM" from the presets, or dial in custom values when your schedule is more specific. It also lists an approximate preview of upcoming run dates so you can sanity-check that you built the schedule you intended.`,
    ],
    steps: [
      `Start from a preset — such as "Every day at midnight" or "Every Monday at 9 AM" — or skip straight to the fields.`,
      `Set the five fields as needed: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6).`,
      `Click Build Expression to assemble the cron string.`,
      `Review the approximate "next scheduled runs" preview, then Copy the expression into your crontab or scheduler.`,
    ],
    why: [
      `Six presets cover the most common schedules, so routine cases like hourly or daily-at-midnight take a single click.`,
      `Each of the five fields is labeled with its valid range, removing the guesswork about which position controls what.`,
      `It shows an upcoming-runs preview, clearly marked approximate, so you can gut-check the schedule before deploying it.`,
      `It runs in the browser with no sign-up, producing a standard five-field expression you can paste anywhere cron is used.`,
    ],
    faqs: [
      {
        question: `What do the five fields in a cron expression mean?`,
        answer: `In order, they are minute (0–59), hour (0–23), day of the month (1–31), month (1–12), and day of the week (0–6, where 0 is Sunday). An asterisk in a field means "every" value for that position. So 0 9 * * 1 means 9:00 AM every Monday.`,
      },
      {
        question: `How accurate is the "next runs" preview?`,
        answer: `It is a rough approximation to help you visualize the schedule, not a precise cron evaluation. The expression itself is standard and will run exactly as your real cron daemon interprets it; treat the preview as a sanity check rather than an authoritative schedule.`,
      },
      {
        question: `Does this support ranges, lists, or step values like */5?`,
        answer: `The builder focuses on single values and presets per field. You can always edit the generated expression by hand to add advanced syntax such as */5 (every five), ranges (1-5), or lists (1,3,5), which standard cron supports.`,
      },
    ],
    related: [
      { slug: 'regex-tester', note: `Another compact syntax worth verifying before you rely on it.` },
      { slug: 'css-grid-generator', note: `A similar generator that hands you ready-to-paste output from simple inputs.` },
      { slug: 'json-formatter', note: `Tidy up the config files your scheduled jobs read.` },
    ],
  },

  'css-grid-generator': {
    intro: [
      `CSS Grid is powerful, but writing grid-template-columns: repeat(...) by hand and guessing at gaps slows down quick layout work. CSS Grid Generator gives you simple controls for columns, rows, and gap, then hands back clean, copy-ready CSS alongside a live preview of the layout.`,
      `It fits the prototyping moment: roughing out a gallery, a dashboard, or a card layout and wanting the boilerplate CSS without typing it from memory. Adjust the numbers, watch the preview grid update with numbered cells, and paste the generated rules straight into your stylesheet.`,
    ],
    steps: [
      `Set the number of columns (1–12) and rows (1–12).`,
      `Enter a gap value — any valid CSS length such as 16px or 1rem.`,
      `Click Generate Grid.`,
      `Check the live preview of the grid, then Copy the generated .grid-container CSS into your stylesheet.`,
    ],
    why: [
      `A live preview renders the actual grid as you configure it, so you see the layout before touching your codebase.`,
      `It outputs clean, standard grid CSS using repeat() and fractional units, ready to paste without editing.`,
      `The gap field accepts any CSS length unit, so you are not locked into pixels.`,
      `It runs entirely in the browser, free and without sign-up.`,
    ],
    faqs: [
      {
        question: `What does the fr unit in the generated CSS mean?`,
        answer: `fr stands for "fraction" and distributes available space proportionally. repeat(3, 1fr) creates three columns that each take an equal share of the container's width, which is the most common way to build a responsive, evenly divided grid.`,
      },
      {
        question: `Can I use rem or percentages for the gap?`,
        answer: `Yes. The gap field accepts any valid CSS length, so 16px, 1rem, 2%, or similar all work. The value you enter is placed directly into the gap property of the generated CSS.`,
      },
      {
        question: `How do I place items within the grid?`,
        answer: `The generated CSS sets up the container and even columns and rows; items flow into cells automatically. To position a specific item across multiple cells, add grid-column or grid-row rules to that item — the generator gives you the container foundation to build on.`,
      },
      {
        question: `Will this grid be responsive on mobile?`,
        answer: `A fixed column count stays fixed at every screen size. To make it adapt, wrap the grid in a media query that reduces the column count on narrow screens, or replace repeat(N, 1fr) with repeat(auto-fit, minmax(...)) so columns wrap automatically — both build directly on the CSS this tool generates.`,
      },
    ],
    related: [
      { slug: 'html-viewer', note: `Preview the HTML markup that your grid CSS will style.` },
      { slug: 'code-minifier', note: `Minify the generated CSS before adding it to production.` },
      { slug: 'color-palette', note: `Pull a color scheme for your grid items from an image.` },
    ],
  },

  'har-viewer': {
    intro: [
      `A HAR file is a complete recording of the network activity your browser captured — every request, its timing, and its response — but opened as raw JSON it is an unreadable wall of text. HAR Viewer parses that file and lays out a clean summary: how many requests were made, and for each one its method, URL, and response status.`,
      `It is the tool you open when someone sends you a HAR export to debug a problem: a support engineer scanning which requests failed, a developer confirming the order calls fired in, or a tester verifying a 401 really did come back from the API. Upload the file or paste its contents and the noise becomes a readable list.`,
    ],
    steps: [
      `Upload a .har file with the "Upload HAR" button, or paste its JSON contents into the text box.`,
      `The tool parses it and shows a summary: HAR version, number of entries, and number of pages.`,
      `Scan the request list — each row shows the HTTP method, the URL, and the response status.`,
      `Use Copy to export the parsed data as formatted JSON for sharing or further inspection.`,
    ],
    why: [
      `It accepts both file upload and pasted content, so you can open a HAR however it reached you.`,
      `It surfaces the details that matter for debugging — method, URL, and response status per request — instead of making you scroll raw JSON.`,
      `It validates that the file is a real HAR (checking for the log structure) and reports a clear error if it is not.`,
      `Parsing happens entirely in your browser, which matters because HAR files often contain sensitive headers, cookies, and tokens that should never be uploaded.`,
    ],
    faqs: [
      {
        question: `What is a HAR file and how do I create one?`,
        answer: `A HAR (HTTP Archive) file is a JSON record of a browser session's network requests. You generate one from your browser's developer tools — in the Network tab, record activity and choose "Save all as HAR" (or "Export HAR"). The resulting file captures every request and response.`,
      },
      {
        question: `Is it safe to open a HAR file here?`,
        answer: `Yes — the file is parsed locally in your browser and never uploaded. This is important because HAR files frequently contain authentication headers, cookies, and other sensitive data, so keeping the parsing client-side protects that information.`,
      },
      {
        question: `Why does it only show some of the requests?`,
        answer: `For readability, the viewer lists the first batch of entries and indicates how many more exist, since real HAR files can contain hundreds of requests. The summary count tells you the total number of entries captured.`,
      },
    ],
    related: [
      { slug: 'security-header-analyzer', note: `Check whether the responses in your capture set the right security headers.` },
      { slug: 'http-headers-checker', note: `Fetch and inspect the live headers a specific URL returns.` },
      { slug: 'json-formatter', note: `Pretty-print the raw HAR JSON when you need the full detail.` },
    ],
  },

  'security-header-analyzer': {
    intro: [
      `HTTP security headers are a frontline defense against attacks like cross-site scripting and clickjacking, yet they are easy to forget to configure. Security Header Analyzer reviews a set of response headers, checks for the ones that matter, rates how complete your coverage is, and explains what each missing header would protect against.`,
      `It is built for a security or deployment review: paste the response headers from a site and instantly see whether Content-Security-Policy, Strict-Transport-Security, and the rest are present, with a score that summarizes your posture. Developers use it to harden a site before launch; auditors use it to document gaps with concrete recommendations.`,
      `Note that it analyzes headers you paste in — it does not fetch a URL for you — so you control exactly which response is being assessed.`,
    ],
    steps: [
      `Copy the response headers from your site (from your browser's network tab or a curl -I command).`,
      `Paste them into the "HTTP Headers" box, one per line in Header-Name: value form.`,
      `Click Analyze.`,
      `Read the security score and the per-header results: which are present, their severity, and a recommendation for each, then Copy the summary.`,
    ],
    why: [
      `It checks eight key security headers and assigns each a severity (from critical for Content-Security-Policy down to low), so you know which gaps to fix first.`,
      `It produces a coverage score and a specific recommendation per header, turning a review into an actionable checklist.`,
      `Because it analyzes headers you paste, you can assess any response — including staging environments or authenticated requests — that a URL-fetching scanner could not reach.`,
      `Analysis is entirely client-side, so headers that may include sensitive values are never uploaded.`,
    ],
    faqs: [
      {
        question: `Which security headers does it check?`,
        answer: `It evaluates eight: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, and Cache-Control — each tied to a specific protection such as preventing XSS, enforcing HTTPS, or blocking clickjacking.`,
      },
      {
        question: `Does this tool scan a website by URL?`,
        answer: `No. It analyzes the headers you paste into it rather than fetching a site itself. That design lets you assess responses a public scanner cannot see — like internal environments or authenticated pages — but it means you need to supply the headers. To capture live headers from a URL, use an HTTP headers checker first.`,
      },
      {
        question: `How is the security score calculated?`,
        answer: `The score reflects how many of the eight checked headers are present in what you pasted, expressed as a percentage. It is a quick coverage indicator; the per-header severity and recommendations tell you which missing headers carry the most risk.`,
      },
      {
        question: `Where do I find my site's response headers?`,
        answer: `Open your browser's developer tools, go to the Network tab, reload the page, click the main document request, and read the Response Headers section. Alternatively, run curl -I https://yoursite.com from a terminal and copy the output.`,
      },
    ],
    related: [
      { slug: 'http-headers-checker', note: `Fetch the live response headers from a URL to feed into this analyzer.` },
      { slug: 'har-viewer', note: `Inspect a full network capture to see headers across many requests.` },
      { slug: 'ssl-certificate-checker', note: `Verify the HTTPS certificate that headers like HSTS depend on.` },
    ],
  },

  // ── Batch 3: Financial calculators (15) ─────────────────────────────

  'discount-calculator': {
    intro: [
      `A discount calculator answers the one question every sale poster leaves out: what do I actually pay? Enter the original price and the discount percentage, and this tool returns the dollars knocked off and the final price, plus a clear "you save" line.`,
      `It is the everyday companion for clearance racks, flash sales, and coupon codes — the moment you want to know whether "40% off" is the bargain it sounds like before committing. Budget-minded shoppers use it to compare two deals quickly; resellers use it to confirm a markdown still leaves room above cost.`,
    ],
    steps: [
      `Enter the original price in the first field.`,
      `Enter the discount percentage being offered.`,
      `Read the discount amount and the final price you will pay.`,
      `Check the "you save" line to see the saving in both dollars and percent, then Copy the result if you need it.`,
    ],
    why: [
      `It shows the saving as a dollar figure alongside the percentage, so an abstract "40% off" becomes a concrete amount you can weigh.`,
      `Input is validated — a percentage above 100 or a price of zero is rejected rather than producing a nonsense result.`,
      `The math is instant and runs locally in your browser, so it works on a phone in a store aisle with no account.`,
      `It stays deliberately focused on a single price and discount, which makes it faster than multi-field tools when you just need the bottom line.`,
    ],
    faqs: [
      {
        question: `How do I work out a discount in my head?`,
        answer: `Convert the percentage to a decimal and multiply: 25% off a $80 item is 0.25 × 80 = $20 off, leaving $60. For trickier numbers, this calculator does it exactly, including the final price.`,
      },
      {
        question: `Can I apply two discounts at once?`,
        answer: `Discounts do not simply add together. To apply "20% off then an extra 15%", calculate the first discount here, then enter the resulting price and the second percentage for a second pass — that gives the true combined price.`,
      },
      {
        question: `Does this add sales tax?`,
        answer: `No, it works on the pre-tax price. Calculate the discount first, then run the final price through a sales tax calculator if you want the amount you will actually be charged at checkout.`,
      },
      {
        question: `Is a higher discount percentage always the better deal?`,
        answer: `Not necessarily — what matters is the dollars saved on the price you actually pay. 30% off an expensive item can save more than 50% off a cheap one. Use the "you save" figure here to compare the real saving rather than just the headline percentage.`,
      },
    ],
    related: [
      { slug: 'percent-off-calculator', note: `Calculating a discount across several units? This one totals the saving by quantity.` },
      { slug: 'sales-tax-calculator', note: `Add tax to your discounted price to find the real checkout total.` },
      { slug: 'tip-calculator', note: `Eating out with a coupon? Apply the discount, then sort the tip and split.` },
    ],
  },

  'sales-tax-calculator': {
    intro: [
      `Sales tax turns a tidy shelf price into an awkward total at the register, and rates differ from one place to the next. This calculator takes a pre-tax price, a quantity, and a tax rate, and tells you the tax per item and the full amount due — so there are no surprises at checkout.`,
      `Shoppers use it to budget before buying; small sellers and freelancers use it to add the correct tax to an invoice or quote. Because it multiplies by quantity, it is equally happy with a single purchase or a bulk order where the per-item tax needs to scale up.`,
    ],
    steps: [
      `Enter the price of one item before tax.`,
      `Enter the quantity you are buying.`,
      `Enter your local sales tax rate as a percentage.`,
      `Read the tax per item, the single-item total, and the grand total across all units, then Copy if needed.`,
    ],
    why: [
      `It breaks out tax per item separately from the order total, so you can see both the unit cost and what a bulk purchase comes to.`,
      `The quantity field scales everything correctly, which matters when you are pricing several units rather than one.`,
      `Inputs are validated against zero and negative values, so the figures it returns are always sensible.`,
      `It calculates instantly client-side with no sign-up, ready whenever you need a quick total.`,
    ],
    faqs: [
      {
        question: `How do I calculate sales tax on a purchase?`,
        answer: `Multiply the price by the tax rate as a decimal: a 7% tax on a $50 item is 50 × 0.07 = $3.50, for a total of $53.50. Enter the price, quantity, and rate here and the calculator handles per-item and total amounts for you.`,
      },
      {
        question: `What sales tax rate should I enter?`,
        answer: `Use the combined rate for your location, which may stack state, county, and city taxes. Rates vary widely by jurisdiction, so check the rate that applies where the purchase happens and enter that single combined percentage.`,
      },
      {
        question: `Is sales tax the same as VAT?`,
        answer: `They are similar consumption taxes but work differently — sales tax is added once at the final sale, while VAT is collected at each stage of production. If you need to add or strip VAT from a price, use the dedicated VAT calculator instead.`,
      },
      {
        question: `Are some items exempt from sales tax?`,
        answer: `Often, yes. Many jurisdictions exempt or reduce tax on essentials like groceries, prescription medicine, or clothing, and rules vary by location. If an item is exempt, simply leave it out or enter a 0% rate for it; this calculator applies whatever rate you specify.`,
      },
    ],
    related: [
      { slug: 'vat-calculator', note: `Outside the US? Add or remove value-added tax instead of sales tax.` },
      { slug: 'discount-calculator', note: `Apply a markdown to the price before tax is added.` },
      { slug: 'tip-calculator', note: `Work out a tip on the pre- or post-tax amount of a bill.` },
    ],
  },

  'margin-calculator': {
    intro: [
      `Profit margin and markup are easy to confuse, and mixing them up can quietly wreck your pricing. The Margin Calculator takes a cost price and a selling price and reports both numbers clearly: the profit in dollars, the profit margin as a percentage of the sale, and the markup as a percentage of the cost.`,
      `It is a daily tool for anyone who sets prices — a shop owner deciding what to charge, a freelancer quoting a project, or a reseller checking that a deal still earns. Seeing margin and markup side by side makes the difference obvious: a 50% markup is only a 33% margin, and this tool spells that out instead of leaving you to guess.`,
    ],
    steps: [
      `Enter your cost price — what the item or service costs you.`,
      `Enter your selling price — what the customer pays.`,
      `Read the profit amount, color-coded green for a gain or red for a loss.`,
      `Compare the markup percentage (profit over cost) with the profit margin percentage (profit over selling price), then Copy the figures.`,
    ],
    why: [
      `It reports margin and markup as distinct metrics, so you never accidentally treat one as the other when setting prices.`,
      `Profit is color-coded — green when you are making money, red when the selling price is below cost — for an instant read.`,
      `It handles the edge case of a zero selling price gracefully rather than dividing by zero.`,
      `Calculations run in your browser with no account, so confidential cost data stays on your device.`,
    ],
    faqs: [
      {
        question: `What is the difference between margin and markup?`,
        answer: `Markup is profit as a percentage of your cost, while margin is profit as a percentage of the selling price. A product that costs $10 and sells for $15 has a 50% markup but a 33.3% margin. They describe the same profit from two different angles.`,
      },
      {
        question: `How do I set a price for a target margin?`,
        answer: `To hit a desired margin, divide your cost by (1 minus the margin as a decimal). For a 40% margin on a $12 cost, that is 12 ÷ 0.6 = $20. Enter cost and candidate prices here to check the margin each one produces.`,
      },
      {
        question: `Why is my profit showing in red?`,
        answer: `A red profit means your selling price is below your cost — you would lose money on the sale. Raise the selling price above the cost price to move into profit, which the calculator shows in green.`,
      },
    ],
    related: [
      { slug: 'break-even-calculator', note: `Find how many units you must sell to cover your fixed costs at this margin.` },
      { slug: 'roi-calculator', note: `Measure the return on a purchase or investment rather than per-unit profit.` },
      { slug: 'commission-calculator', note: `Factor a salesperson's cut into your pricing and earnings.` },
    ],
  },

  'commission-calculator': {
    intro: [
      `For anyone paid on what they sell, knowing the commission before payday matters. This calculator takes a sales amount and a commission rate, adds any fixed base salary, and returns the commission earned and the total take-home.`,
      `Salespeople use it to forecast a paycheck from a strong month; managers use it to model what a rate change would cost; recruiters use it to explain an offer's earning potential. Because it folds in an optional base salary, it works for pure-commission roles and for the common base-plus-commission structure alike.`,
    ],
    steps: [
      `Enter the total sales amount the commission is based on.`,
      `Enter your commission rate as a percentage.`,
      `Optionally enter a fixed base salary to add on top.`,
      `Read the commission earned and the combined total earnings, then Copy the breakdown.`,
    ],
    why: [
      `It combines commission with an optional base salary, matching real base-plus-commission pay structures rather than commission alone.`,
      `The result separates the commission from total earnings, so you can see exactly what your sales contributed.`,
      `It validates against negative or zero inputs, so the earnings figure is always meaningful.`,
      `Everything is calculated locally and instantly, with no sign-up — handy for a quick paycheck estimate.`,
    ],
    faqs: [
      {
        question: `How is sales commission calculated?`,
        answer: `Multiply the sales amount by the commission rate as a decimal: 5% commission on $40,000 of sales is 40,000 × 0.05 = $2,000. If you also receive a base salary, the calculator adds it to give your total earnings.`,
      },
      {
        question: `Does this handle tiered or graduated commission?`,
        answer: `It calculates a single flat commission rate plus an optional base. For a tiered plan where different rates apply to different sales bands, calculate each band separately at its own rate and add the results together.`,
      },
      {
        question: `Should commission be figured on revenue or profit?`,
        answer: `That depends on your plan — some pay on gross sales revenue, others on profit or margin. Enter whichever figure your agreement is based on as the sales amount, and apply your contracted rate to it.`,
      },
      {
        question: `What is a typical commission rate?`,
        answer: `Rates vary widely by industry — retail and many sales roles sit in the low single digits, while real estate commissions are often around 5–6% and some high-value B2B deals run higher. Enter the rate your specific agreement specifies; this calculator works for any percentage.`,
      },
    ],
    related: [
      { slug: 'salary-calculator', note: `Convert your base salary between annual, monthly, and hourly figures.` },
      { slug: 'margin-calculator', note: `Check the profit behind the sales your commission is paid on.` },
      { slug: 'sales-tax-calculator', note: `Separate tax from the sale value before applying your rate.` },
    ],
  },

  'future-value-calculator': {
    intro: [
      `Money today is worth more than the same money later, and the Future Value Calculator shows exactly how much more. Enter a present sum, an interest rate, and a time horizon, and it projects what that money will grow to with compounding — optionally adding a regular monthly deposit along the way.`,
      `Savers use it to see where a nest egg lands in ten years; planners use it to test whether a savings habit reaches a goal. The compounding-frequency control lets you model daily, monthly, quarterly, or annual compounding on a lump sum, while the monthly-deposit option layers in steady contributions for a more realistic savings picture.`,
    ],
    steps: [
      `Enter the present value — the amount you are starting with.`,
      `Enter the annual interest rate and the time period in years.`,
      `Choose a compounding frequency (daily, monthly, quarterly, or annually) for the lump sum.`,
      `Optionally add a monthly deposit to model regular contributions.`,
      `Read the projected future value, total contributions, and total interest earned, then Copy the result.`,
    ],
    why: [
      `It models both a one-time lump sum and ongoing monthly deposits, so you can project realistic savings, not just idle capital.`,
      `Four compounding frequencies let you match how your account actually compounds, which changes the result more than people expect.`,
      `It separates total contributions from total interest, making it clear how much growth came from your money versus from compounding.`,
      `It runs entirely client-side with no sign-up, so your financial figures stay private.`,
    ],
    faqs: [
      {
        question: `What is future value?`,
        answer: `Future value is what a sum of money today will be worth at a later date once interest or returns have compounded. It is the core idea behind savings growth: a dollar invested now becomes more than a dollar later because it earns on itself over time.`,
      },
      {
        question: `Why does compounding frequency change the result?`,
        answer: `The more often interest is compounded, the sooner earned interest starts earning its own interest. Daily compounding produces slightly more than annual compounding at the same rate, because growth is credited and reinvested more frequently.`,
      },
      {
        question: `What happens when I add a monthly deposit?`,
        answer: `The calculator then treats your contributions as a monthly series compounded over the full term, on top of the growth of your starting balance. This models a regular savings habit rather than a single deposit left to grow.`,
      },
    ],
    related: [
      { slug: 'present-value-calculator', note: `Work backward to find what a future sum is worth in today's money.` },
      { slug: 'investment-calculator', note: `Project an investment with contributions and see a year-by-year breakdown.` },
      { slug: 'compound-interest-calculator', note: `Focus purely on how compounding grows a balance over time.` },
    ],
  },

  'roi-calculator': {
    intro: [
      `Return on investment boils any venture down to one comparable number: how much you gained relative to what you put in. The ROI Calculator takes your initial investment and its final value and returns the ROI percentage and the profit or loss in dollars — and if you supply a time period, it also computes the annualized return.`,
      `Investors use it to compare opportunities on equal footing; marketers use it to justify a campaign's spend; anyone weighing a purchase uses it to check whether the payoff was worth it. The annualized figure is what makes it genuinely useful for comparison: a 50% return over five years is far less impressive than 50% in one, and this tool surfaces that difference.`,
    ],
    steps: [
      `Enter the initial investment — the amount you put in.`,
      `Enter the final value — what it is worth now or what you sold it for.`,
      `Optionally enter the investment period and choose its unit (days, months, or years).`,
      `Read the ROI percentage and the profit or loss, color-coded, plus the annualized ROI when a period is given.`,
    ],
    why: [
      `It computes annualized ROI (a CAGR-style figure) when you provide a time period, so returns over different durations can be compared fairly.`,
      `Profit or loss is shown in dollars and color-coded, alongside the percentage, for an immediate read on the outcome.`,
      `It accepts a loss scenario — a final value below the initial — rather than rejecting it, so down results are handled honestly.`,
      `Calculations are instant and local, with no account required.`,
    ],
    faqs: [
      {
        question: `How is ROI calculated?`,
        answer: `ROI is the profit divided by the initial investment, expressed as a percentage: a $2,000 gain on a $10,000 investment is a 20% ROI. The calculator computes this automatically and shows the underlying profit or loss.`,
      },
      {
        question: `What is annualized ROI and why does it matter?`,
        answer: `Annualized ROI expresses your total return as an equivalent yearly rate, accounting for how long the money was invested. It lets you compare a two-year investment with a five-year one fairly, since raw ROI alone hides the role of time.`,
      },
      {
        question: `Can ROI be negative?`,
        answer: `Yes. If the final value is less than what you invested, ROI is negative and represents a loss. This calculator accepts that case and shows the shortfall in red so the result is clear.`,
      },
    ],
    related: [
      { slug: 'investment-calculator', note: `Project future growth with regular contributions rather than a single return.` },
      { slug: 'margin-calculator', note: `Measure per-sale profitability instead of investment return.` },
      { slug: 'future-value-calculator', note: `See what a sum will grow to at a given rate over time.` },
    ],
  },

  'vat-calculator': {
    intro: [
      `Value-added tax is baked into prices across much of the world, which means you sometimes need to add it and sometimes need to pull it back out. This VAT Calculator does both: switch to "Add VAT" to find the gross price from a net one, or "Remove VAT" to recover the net price hidden inside a VAT-inclusive total.`,
      `Businesses use the reverse calculation constantly — recovering the net figure from a receipt for bookkeeping, or confirming the VAT element of a supplier invoice. Sellers use the forward mode to quote tax-inclusive prices. A quantity field scales either calculation across multiple units.`,
    ],
    steps: [
      `Choose your mode: "Add VAT" to add tax to a net price, or "Remove VAT" to extract it from an inclusive price.`,
      `Enter the price — net in Add mode, gross in Remove mode.`,
      `Enter the quantity and the VAT rate as a percentage.`,
      `Read the price excluding VAT, the VAT amount, the price including VAT, and the total across all units.`,
    ],
    why: [
      `It works in both directions — adding VAT to a net price and reverse-calculating the net price from a VAT-inclusive total — which most simple tax tools cannot do.`,
      `The reverse mode correctly divides by (1 + rate) rather than naively subtracting the percentage, so the recovered net figure is accurate.`,
      `A quantity field scales either calculation, and inputs are validated against impossible rates.`,
      `It runs locally with no sign-up, suitable for quick bookkeeping checks.`,
    ],
    faqs: [
      {
        question: `How do I remove VAT from a price?`,
        answer: `You divide rather than subtract. To strip 20% VAT from a £120 inclusive price, divide by 1.20 to get £100 net, making the VAT £20. Subtracting 20% of £120 would be wrong — this calculator's "Remove VAT" mode handles it correctly.`,
      },
      {
        question: `What is the difference between adding and removing VAT?`,
        answer: `Adding VAT starts from a net (tax-free) price and calculates the gross price a customer pays. Removing VAT starts from a gross (tax-inclusive) price and works back to the net price and the tax within it. Pick the mode that matches the figure you already have.`,
      },
      {
        question: `Is VAT the same everywhere?`,
        answer: `No — VAT rates differ by country and sometimes by product category, and some regions use sales tax instead. Enter the rate that applies to your situation; the calculator is rate-agnostic and works for any percentage you provide.`,
      },
    ],
    related: [
      { slug: 'sales-tax-calculator', note: `In the US? Use sales tax, which is added only at the final sale.` },
      { slug: 'discount-calculator', note: `Apply a markdown to the net price before tax is added.` },
      { slug: 'margin-calculator', note: `Check the profit in a price once tax is separated out.` },
    ],
  },

  'student-loan-calculator': {
    intro: [
      `Student debt rarely comes with a clear picture of the road ahead. This calculator takes a loan balance, an interest rate, and a repayment plan, then builds the full payoff story: your monthly payment, how long it takes, the total interest, and a month-by-month amortization schedule you can expand and inspect.`,
      `Graduates use it to compare what Standard, Graduated, and Extended plans really cost over time; prospective borrowers use it to understand the long-term weight of a balance before signing. The detailed schedule is the standout — instead of a single payment figure, you can watch the balance fall and see how much of each payment is interest versus principal.`,
    ],
    steps: [
      `Enter your student loan amount.`,
      `Enter the annual interest rate.`,
      `Choose a repayment plan: Standard (10-year fixed), Graduated (payments that rise over time), or Extended (25-year fixed).`,
      `Read your monthly payment, payoff time, total interest, and total paid.`,
      `Expand the payment schedule to see each month's principal, interest, and remaining balance.`,
    ],
    why: [
      `It generates a full amortization schedule, so you can see exactly how each payment splits between interest and principal over the life of the loan.`,
      `It models three distinct plans — including a graduated plan whose payments rise over time — rather than assuming one fixed structure.`,
      `Payoff time is shown in plain years-and-months, and total interest is highlighted so the true cost of borrowing is unmistakable.`,
      `All calculations are client-side, keeping your loan details private.`,
    ],
    faqs: [
      {
        question: `What is the difference between Standard, Graduated, and Extended plans?`,
        answer: `Standard spreads fixed payments over 10 years, the fastest and cheapest in total interest. Graduated starts with lower payments that increase over time, easing early budgets. Extended stretches payments over 25 years, lowering the monthly amount but raising total interest substantially.`,
      },
      {
        question: `Why does a longer repayment plan cost more?`,
        answer: `A longer term means the balance accrues interest for more years, so even with smaller monthly payments you pay more interest overall. The calculator's total-interest figure makes this trade-off between affordability and total cost concrete.`,
      },
      {
        question: `Does paying extra each month help?`,
        answer: `Yes — extra payments go straight to principal, shrinking the balance that future interest is charged on and shortening the term. While this tool models the standard plans, you can approximate the effect by entering a shorter term or comparing scenarios.`,
      },
    ],
    related: [
      { slug: 'loan-calculator', note: `Model a mortgage, auto, or personal loan with the same amortization detail.` },
      { slug: 'debt-payoff-calculator', note: `See how a fixed monthly payment clears a debt and what interest it costs.` },
      { slug: 'salary-calculator', note: `Convert your income to monthly figures to plan repayments against it.` },
    ],
  },

  'investment-calculator': {
    intro: [
      `Investing is a long game, and seeing the trajectory makes it easier to stick with. The Investment Calculator combines a starting amount with regular monthly contributions and an expected annual return, then projects the final value — backed by a year-by-year table showing how the balance, contributions, and profit grow.`,
      `It suits anyone building wealth steadily: someone modeling a retirement account, a parent saving toward college, or an investor sanity-checking whether a contribution rate meets a goal. Beyond the headline number, it reports total invested, total profit, simple ROI, and an annualized return, so you understand not just where you end up but how efficiently you got there.`,
    ],
    steps: [
      `Enter your initial investment.`,
      `Enter your monthly contribution.`,
      `Enter the expected annual return as a percentage and the investment period in years.`,
      `Read the final value, total invested, total profit, ROI, and annualized return.`,
      `Expand the yearly projection to see the balance build year by year.`,
    ],
    why: [
      `It pairs a lump sum with recurring monthly contributions and shows a full year-by-year projection, so compounding growth is visible rather than abstract.`,
      `It reports both simple ROI and annualized return (CAGR), separating the headline gain from the time-adjusted rate.`,
      `Total invested is shown next to total profit, making clear how much of the final value you contributed versus what the market added.`,
      `Everything is computed locally and instantly, with no account or data sharing.`,
    ],
    faqs: [
      {
        question: `How is this different from a compound interest calculator?`,
        answer: `A compound interest tool typically grows a single balance. This calculator adds regular monthly contributions on top of that growth and produces a year-by-year projection plus ROI and annualized-return metrics, modeling an ongoing investing habit rather than a one-time deposit.`,
      },
      {
        question: `What return rate should I assume?`,
        answer: `Returns are never guaranteed, but many long-term investors model broad stock-market averages in the range of roughly 6–8% annually before inflation. Use a rate you can justify for your strategy, and test a conservative figure alongside an optimistic one.`,
      },
      {
        question: `Does this account for inflation or taxes?`,
        answer: `No. The projection shows nominal growth before inflation and taxes. To gauge real purchasing power, mentally discount the result by your inflation assumption, and remember that taxes on gains depend on the account type and jurisdiction.`,
      },
      {
        question: `How much should I contribute each month?`,
        answer: `There is no universal figure — it depends on your goal, timeline, and income. The power of this calculator is showing how even modest, consistent contributions compound over years. Try a contribution you can sustain, then raise it to see how much sooner you reach your target.`,
      },
    ],
    related: [
      { slug: 'future-value-calculator', note: `Project a sum's growth with flexible compounding frequencies.` },
      { slug: 'roi-calculator', note: `Measure the return on a single completed investment.` },
      { slug: 'compound-interest-calculator', note: `Isolate the effect of compounding on a balance over time.` },
    ],
  },

  'salary-calculator': {
    intro: [
      `Job offers and pay rates come in incompatible units — an hourly wage here, an annual figure there, a monthly number on a payslip — and comparing them means converting. The Salary Calculator translates any one of these into all the others: annual, monthly, bi-weekly, weekly, and hourly, at once.`,
      `Job seekers use it to compare a salaried offer against contract hourly work; freelancers use it to set an hourly rate that matches a target annual income; anyone budgeting uses it to break a yearly salary into the per-paycheck reality. You can also tune the work schedule — hours per week and weeks per year — so the conversion fits part-time or non-standard arrangements.`,
    ],
    steps: [
      `Choose what you are entering: annual salary, hourly wage, monthly, or weekly.`,
      `Enter the amount.`,
      `Adjust hours per week and weeks per year if your schedule differs from the standard 40 and 52.`,
      `Read the equivalent annual, monthly, bi-weekly, weekly, and hourly figures, then Copy them.`,
    ],
    why: [
      `It converts from any of four input types into five pay periods at once, so you can compare offers stated in different units instantly.`,
      `Adjustable hours-per-week and weeks-per-year fields make it accurate for part-time, contract, and non-standard schedules, not just full-time work.`,
      `It derives bi-weekly pay alongside the usual periods, matching how many employers actually run payroll.`,
      `It works entirely in your browser with no sign-up, keeping your salary figures private.`,
    ],
    faqs: [
      {
        question: `How do I convert an annual salary to an hourly wage?`,
        answer: `Divide the annual salary by the number of hours worked per year. At 40 hours a week for 52 weeks (2,080 hours), a $50,000 salary is about $24.04 an hour. The calculator does this and adjusts automatically if you change the hours or weeks.`,
      },
      {
        question: `Does this show take-home pay after taxes?`,
        answer: `No. It converts gross pay between periods before any deductions. Actual take-home depends on taxes, benefits, and withholdings specific to your location and situation, which this tool does not estimate.`,
      },
      {
        question: `Why change the weeks-per-year value?`,
        answer: `The default of 52 assumes you are paid for every week. If you take unpaid weeks off, or work a contract with fewer paid weeks, lowering this number gives a more accurate hourly-to-annual conversion.`,
      },
      {
        question: `How many working hours are in a year?`,
        answer: `A standard full-time schedule of 40 hours a week across 52 weeks is 2,080 hours a year. That figure is the basis for converting between hourly and annual pay; if your real hours differ, adjust the hours-per-week and weeks-per-year fields and the calculator recalculates.`,
      },
    ],
    related: [
      { slug: 'budget-calculator', note: `Split your salary into needs, wants, and savings with a budgeting rule.` },
      { slug: 'commission-calculator', note: `Add sales commission on top of your base pay.` },
      { slug: 'debt-payoff-calculator', note: `Plan repayments against your monthly take-home figure.` },
    ],
  },

  'budget-calculator': {
    intro: [
      `A budget only works if the numbers add up to your income, and that is exactly what this calculator enforces. Enter your monthly income and pick a budgeting framework, and it splits your money into needs, wants, and savings — with visual bars so the balance is easy to grasp.`,
      `It is aimed at anyone bringing order to their finances: someone starting their first budget, a household resetting spending after a raise, or a saver checking whether their targets are realistic. Choose a popular preset like the 50/30/20 rule, switch to 70/20/10, or set custom percentages when your priorities do not fit a template.`,
    ],
    steps: [
      `Enter your monthly income.`,
      `Choose a budgeting rule: 50/30/20, 70/20/10, or Custom.`,
      `If you picked Custom, enter your own needs and wants percentages — savings is calculated as the remainder.`,
      `Read the dollar amount and percentage allocated to needs, wants, and savings, shown as proportion bars.`,
    ],
    why: [
      `It offers two established budgeting rules plus a custom option, so you can start from a proven framework or tailor your own split.`,
      `Allocations are shown as both dollars and percentages with visual bars, turning an abstract rule into concrete monthly amounts.`,
      `The custom mode validates that your percentages do not exceed 100, automatically assigning the remainder to savings.`,
      `It runs locally with no sign-up, so your income figure never leaves your device.`,
    ],
    faqs: [
      {
        question: `What is the 50/30/20 budget rule?`,
        answer: `It allocates 50% of after-tax income to needs (housing, food, utilities), 30% to wants (dining out, entertainment), and 20% to savings and debt repayment. It is a simple, popular starting framework that this calculator applies to your income instantly.`,
      },
      {
        question: `What counts as a need versus a want?`,
        answer: `Needs are essentials you cannot easily avoid — rent or mortgage, groceries, utilities, minimum debt payments. Wants are discretionary — dining out, subscriptions, hobbies. The line can be personal, which is why the custom mode lets you set your own split.`,
      },
      {
        question: `Should I use my gross or net income?`,
        answer: `Budgeting rules like 50/30/20 are typically based on net (take-home) income, since that is the money actually available to allocate. Enter your monthly take-home pay for the most realistic breakdown.`,
      },
      {
        question: `What if my needs take up more than 50% of my income?`,
        answer: `In high-cost areas that is common, and it simply means a textbook 50/30/20 split may not fit. Switch to the Custom rule and set a higher needs percentage that reflects reality; the calculator assigns the remainder to savings so you can see the trade-off clearly.`,
      },
    ],
    related: [
      { slug: 'salary-calculator', note: `Convert your salary to a monthly figure to feed into your budget.` },
      { slug: 'savings-calculator', note: `Project how your monthly savings allocation grows over time.` },
      { slug: 'debt-payoff-calculator', note: `Turn the debt portion of your budget into a payoff timeline.` },
    ],
  },

  'debt-payoff-calculator': {
    intro: [
      `Watching a debt shrink is far more motivating when you can see the finish line. This calculator takes a balance, its interest rate, and the fixed monthly payment you can commit, then tells you how long until it is gone, the total interest you will pay, and the total amount paid.`,
      `It is for anyone tackling a credit card, a personal loan, or any single balance and wanting a clear payoff date. By comparing different monthly payments, you can see how much faster — and cheaper — a bit more each month makes the journey. A minimum-payment field guards against the trap of paying so little that interest outruns your payment.`,
    ],
    steps: [
      `Enter the debt balance you want to clear.`,
      `Enter the annual interest rate.`,
      `Enter the fixed monthly payment you plan to make.`,
      `Enter the minimum payment for the account.`,
      `Read the time to payoff, total interest, and total amount paid, then try a higher payment to compare.`,
    ],
    why: [
      `It works the payoff out month by month, accruing interest on the falling balance, rather than using a rough average — so the timeline reflects reality.`,
      `A minimum-payment field flags the dangerous case where your payment barely covers interest and the debt would never clear.`,
      `It surfaces total interest separately from the balance, making the real cost of carrying the debt impossible to ignore.`,
      `Calculations are private and instant, with no account required.`,
    ],
    faqs: [
      {
        question: `What is the debt snowball versus avalanche method?`,
        answer: `Both are strategies for paying off multiple debts. The avalanche method targets the highest interest rate first to minimize total interest; the snowball method targets the smallest balance first for quick wins and motivation. This tool models one debt at a time — calculate each, then prioritize which to attack with extra payments.`,
      },
      {
        question: `Why won't my debt pay off in the results?`,
        answer: `If your monthly payment is not larger than the monthly interest, the balance never falls — interest consumes the whole payment. The calculator flags this; the fix is to pay more than the interest accruing each month, which is why a payment above the minimum matters.`,
      },
      {
        question: `How much faster will paying extra clear my debt?`,
        answer: `Every extra dollar goes to principal, reducing future interest and shortening the term, often dramatically. Run the calculator at your current payment, then again with a higher one to see the difference in months and total interest.`,
      },
    ],
    related: [
      { slug: 'credit-card-payoff-calculator', note: `Tailored to credit cards, where minimum payments and high rates bite hardest.` },
      { slug: 'loan-calculator', note: `Model an installment loan with a full amortization schedule.` },
      { slug: 'budget-calculator', note: `Carve out a realistic monthly payment from your income first.` },
    ],
  },

  'break-even-calculator': {
    intro: [
      `Before a product can make money, it has to cover its costs — and the break-even point is exactly where that happens. This calculator takes your fixed costs, the variable cost per unit, and the selling price per unit, then tells you how many units you must sell to break even and the revenue that represents.`,
      `Founders use it to pressure-test a business idea; product managers use it to set sales targets; anyone pricing a new offering uses it to know the threshold for profitability. It also reports the contribution margin — the profit each unit adds toward fixed costs — and warns you outright when the selling price is below the variable cost, a model that can never break even.`,
    ],
    steps: [
      `Enter your total fixed costs (rent, salaries, and other costs that do not change with volume).`,
      `Enter the variable cost to produce one unit.`,
      `Enter the selling price per unit.`,
      `Read the contribution margin, the break-even unit count, and the break-even revenue.`,
      `Heed the warning if your selling price is at or below your variable cost.`,
    ],
    why: [
      `It reports contribution margin as its own figure, the key number that determines how quickly sales chip away at fixed costs.`,
      `It actively detects an unprofitable model — selling price at or below variable cost — and warns instead of returning a misleading number.`,
      `It translates the break-even point into both units and revenue, so you get a sales target and a money target together.`,
      `It runs locally with no sign-up, ideal for quick what-if pricing checks.`,
    ],
    faqs: [
      {
        question: `What is the break-even point?`,
        answer: `It is the sales volume at which total revenue exactly equals total costs, so profit is zero. Below it you lose money; above it you profit. It is found by dividing fixed costs by the contribution margin per unit.`,
      },
      {
        question: `What is contribution margin?`,
        answer: `Contribution margin is the selling price minus the variable cost per unit — the amount each sale contributes toward covering fixed costs and, beyond break-even, toward profit. A higher contribution margin means you break even on fewer units.`,
      },
      {
        question: `Why does it say the units are infinite or a loss?`,
        answer: `That appears when your selling price is not above your variable cost, so every unit loses money and no quantity can cover fixed costs. The fix is to raise the price or cut the per-unit cost until the contribution margin is positive.`,
      },
    ],
    related: [
      { slug: 'margin-calculator', note: `Set a selling price that yields a healthy profit margin per unit.` },
      { slug: 'roi-calculator', note: `Measure the return once your venture moves past break-even.` },
      { slug: 'commission-calculator', note: `Factor sales commissions into the cost of moving each unit.` },
    ],
  },

  'loan-calculator': {
    intro: [
      `Whether it is a mortgage, a car loan, or a personal loan, the questions are the same: what is the monthly payment, and how much will it cost in total? This Loan Calculator answers both, then lays out a complete amortization schedule so you can see every payment split between interest and principal.`,
      `Home buyers use it to test what they can afford at different rates; car shoppers compare financing terms; borrowers of any kind use it to understand the true cost beyond the sticker. The amortization table is the centerpiece — it reveals how early payments are mostly interest and how the balance accelerates downward over time, which a single monthly figure can never show.`,
    ],
    steps: [
      `Choose a loan type (mortgage, auto, personal, or other) to label your calculation.`,
      `Enter the loan amount and the annual interest rate.`,
      `Enter the loan term and choose whether it is in years or months.`,
      `Read the monthly payment, total interest, and total cost.`,
      `Expand the amortization schedule to see each payment's principal, interest, and remaining balance.`,
    ],
    why: [
      `It generates a full amortization schedule, showing how each payment divides between interest and principal across the entire term.`,
      `It accepts the term in either years or months, so it fits everything from a 30-year mortgage to a short personal loan.`,
      `It handles a zero-interest loan correctly rather than breaking on the math, and validates inputs against impossible values.`,
      `Everything is computed in your browser with no account, keeping loan figures private.`,
    ],
    faqs: [
      {
        question: `How is a monthly loan payment calculated?`,
        answer: `It uses the standard amortization formula, which spreads principal and interest evenly so every payment is the same. The payment depends on the loan amount, the monthly interest rate, and the number of payments — all of which this calculator takes as input.`,
      },
      {
        question: `Why is so much of my early payment interest?`,
        answer: `Interest is charged on the outstanding balance, which is highest at the start. Early payments therefore go largely to interest, with more shifting to principal as the balance falls. The amortization schedule shows this crossover month by month.`,
      },
      {
        question: `Does choosing a loan type change the result?`,
        answer: `The loan-type selector is a label to help you organize your calculations; the math is the same standard amortization regardless of type. Rates and terms differ between loan types in the real world, so enter the actual rate and term for your specific loan.`,
      },
    ],
    related: [
      { slug: 'emi-calculator', note: `Calculating an Indian-style loan in rupees? Use the EMI version.` },
      { slug: 'student-loan-calculator', note: `Compare student-loan repayment plans with their own schedules.` },
      { slug: 'debt-payoff-calculator', note: `Model paying down a revolving balance with a fixed monthly amount.` },
    ],
  },

  'emi-calculator': {
    intro: [
      `EMI — the Equated Monthly Installment — is how home, car, and education loans are quoted across India and much of South Asia, and this calculator is built around that convention. Enter the loan amount in rupees, the annual interest rate, and the tenure, and it returns your monthly EMI, the total interest, and the total payment, with figures formatted in the Indian numbering style.`,
      `Borrowers use it to compare offers from different banks, check how a longer tenure lowers the monthly EMI (while raising total interest), and budget around a fixed installment. Alongside the headline EMI it shows a principal-versus-interest breakdown and a full repayment schedule, so the composition of every installment is visible.`,
    ],
    steps: [
      `Choose your loan type (home, car, personal, education, or other) as a label.`,
      `Enter the loan amount in rupees and the annual interest rate.`,
      `Enter the tenure and choose years or months.`,
      `Read your monthly EMI, total interest, and total payment, plus the principal-to-interest split.`,
      `Expand the schedule to see how each installment is divided over the tenure.`,
    ],
    why: [
      `It is built for the EMI convention with rupee currency and Indian-style number formatting, so the output matches how lenders present loans locally.`,
      `It visualizes the principal-versus-interest split of your total payment, making the cost of borrowing immediately clear.`,
      `A full installment schedule shows how each EMI divides between principal and interest as the balance reduces.`,
      `It calculates instantly in your browser with no sign-up, keeping your loan details private.`,
    ],
    faqs: [
      {
        question: `What is an EMI?`,
        answer: `EMI stands for Equated Monthly Installment — a fixed payment a borrower makes each month so that the loan is fully repaid by the end of its tenure. Each EMI covers both interest on the outstanding balance and a portion of the principal.`,
      },
      {
        question: `How does loan tenure affect my EMI?`,
        answer: `A longer tenure spreads the principal over more months, lowering each EMI but increasing the total interest paid, since interest accrues for longer. A shorter tenure raises the monthly EMI but reduces the overall interest cost.`,
      },
      {
        question: `How is EMI different from the standard loan payment?`,
        answer: `Mathematically the EMI formula and a standard amortized loan payment produce the same result; the difference is convention and presentation. This calculator uses rupee formatting, EMI and tenure terminology, and a principal-interest breakdown suited to South Asian lending.`,
      },
    ],
    related: [
      { slug: 'loan-calculator', note: `Prefer dollar amounts and "loan term" terminology? Use the standard loan calculator.` },
      { slug: 'student-loan-calculator', note: `Compare education-loan repayment plans with detailed schedules.` },
      { slug: 'compound-interest-calculator', note: `Understand the compounding that drives the interest on your loan.` },
    ],
  },

  // ── Batch 4: Financial (5, finishes subcategory) + Health/Fitness (10) ──

  'compound-interest-calculator': {
    intro: [
      `Compound interest is the reason a modest sum left alone can grow into something substantial — interest earns interest, and the effect snowballs over time. This calculator projects that growth from a principal amount, a rate, and a time horizon, and optionally layers in a monthly deposit so you can model a balance that you keep feeding.`,
      `Savers use it to see what a deposit becomes in a decade; investors use it to compare how compounding frequency nudges the outcome. The year-by-year growth table is where it earns its keep, turning an abstract formula into a visible curve so you can watch the gap between contributions and earned interest widen each year.`,
    ],
    steps: [
      `Enter your principal — the starting amount.`,
      `Enter the annual interest rate and the number of years.`,
      `Pick a compounding frequency: daily, monthly, quarterly, or annually.`,
      `Optionally add a monthly deposit to model ongoing contributions.`,
      `Read the final amount, total interest, and total deposits, and expand the year-by-year table to see the growth build.`,
    ],
    why: [
      `It breaks results into final amount, total deposits, and total interest, so you can see precisely how much growth came from compounding versus from your own money.`,
      `The year-by-year table makes the exponential curve concrete rather than leaving it as a single end figure.`,
      `It supports four compounding frequencies for a lump sum, illustrating how more frequent compounding edges the total higher.`,
      `Calculations are local and instant, so your figures stay on your device.`,
    ],
    faqs: [
      {
        question: `What is compound interest?`,
        answer: `Compound interest is interest calculated on both your original principal and the interest already added to it. Unlike simple interest, which is charged only on the principal, compounding means your balance grows on itself, accelerating over time.`,
      },
      {
        question: `How does compounding frequency affect growth?`,
        answer: `More frequent compounding credits interest sooner, so it begins earning its own interest earlier. At the same annual rate, daily compounding produces slightly more than annual compounding — the difference is modest over short periods but adds up over many years.`,
      },
      {
        question: `Does adding a monthly deposit change the calculation?`,
        answer: `Yes. When you add a monthly deposit, the tool models your contributions as a monthly series growing alongside the principal, which reflects a regular saving habit rather than a single untouched sum. Total deposits are reported separately so you can see your contribution clearly.`,
      },
      {
        question: `What is the rule of 72?`,
        answer: `It is a quick mental shortcut: divide 72 by your annual interest rate to estimate the years it takes for money to double. At 6%, that is roughly 12 years. This calculator gives the exact figure, but the rule is a handy sanity check.`,
      },
    ],
    related: [
      { slug: 'simple-interest-calculator', note: `Compare against simple interest, where interest never compounds.` },
      { slug: 'savings-calculator', note: `Model a savings goal built from steady monthly deposits.` },
      { slug: 'investment-calculator', note: `Add return assumptions and see a full investment projection with ROI.` },
    ],
  },

  'savings-calculator': {
    intro: [
      `Reaching a savings goal is mostly about consistency, and this calculator shows where that consistency lands you. Start with an initial balance, add a fixed monthly deposit, apply an interest rate, and it projects the future value of your savings along with a yearly breakdown of balance, contributions, and interest.`,
      `It is the tool for goal-setting: building an emergency fund, saving toward a down payment, or checking whether $200 a month gets you where you want to be in five years. By separating what you contributed from what interest added, it shows how much of your goal your own discipline accomplishes versus how much the bank chips in.`,
    ],
    steps: [
      `Enter your initial savings amount (zero is fine if starting fresh).`,
      `Enter the monthly deposit you plan to make.`,
      `Set the annual interest rate and how many years you plan to save.`,
      `Read the future value, total contributions, and total interest earned.`,
      `Expand the yearly breakdown to track the balance growing year by year.`,
    ],
    why: [
      `It is built around regular monthly deposits, modeling a real saving habit rather than a one-time sum left to grow.`,
      `The yearly breakdown separates your contributions from earned interest, so the role of consistent deposits is unmistakable.`,
      `It compounds monthly throughout, matching how most savings accounts credit interest.`,
      `It runs entirely in your browser with no sign-up, keeping your savings figures private.`,
    ],
    faqs: [
      {
        question: `How much should I save each month?`,
        answer: `It depends on your goal and timeline rather than a fixed rule. Enter the deposit you can realistically sustain and see where it lands you; if it falls short of your target, the calculator shows how a higher deposit closes the gap.`,
      },
      {
        question: `How does interest help my savings grow?`,
        answer: `Each month, interest is added to your balance, and the next month's interest is calculated on that larger total. Over years this compounding meaningfully boosts your savings beyond the sum of your deposits — the "total interest earned" figure shows exactly how much.`,
      },
      {
        question: `Is this the same as a compound interest calculator?`,
        answer: `They overlap, but this tool is framed around a savings goal with required monthly deposits and a year-by-year balance view. A compound interest calculator focuses more on growing a principal and lets you vary the compounding frequency.`,
      },
      {
        question: `Does this account for taxes on interest?`,
        answer: `No. The projection shows gross growth before any tax on the interest earned. Depending on your account type and jurisdiction, some or all of that interest may be taxable, so treat the figure as a pre-tax estimate.`,
      },
    ],
    related: [
      { slug: 'compound-interest-calculator', note: `Vary the compounding frequency and see the year-by-year growth of a balance.` },
      { slug: 'budget-calculator', note: `Decide how much of your income to route into savings each month.` },
      { slug: 'future-value-calculator', note: `Project a lump sum or deposits to a target future value.` },
    ],
  },

  'credit-card-payoff-calculator': {
    intro: [
      `Credit card debt is uniquely punishing because of how interest compounds against you each month, and minimum payments are designed to keep you paying for years. This calculator shows the real timeline: enter your balance, the interest rate, the payment you plan to make, and the minimum payment, and it tells you how long until you are free, the total interest you will pay, and how much you save by paying more than the minimum.`,
      `Cardholders use it to break out of the minimum-payment trap — seeing in plain numbers that bumping a payment up shaves years and hundreds of dollars off the cost. It works the balance down month by month, so the timeline reflects how a card actually amortizes rather than a rough estimate.`,
    ],
    steps: [
      `Enter your current credit card balance.`,
      `Enter the card's annual interest rate (APR).`,
      `Enter the monthly payment you intend to make.`,
      `Enter the account's minimum payment.`,
      `Read the payoff time, total interest, and — if you pay above the minimum — how much you save compared with minimum-only payments.`,
    ],
    why: [
      `It directly compares your chosen payment against the minimum-only path, putting a dollar figure on the savings from paying more.`,
      `It works month by month on the declining balance, so the payoff time and interest reflect real card amortization.`,
      `It catches the dangerous case where your payment barely covers interest and warns instead of producing a misleading result.`,
      `Total interest is highlighted so the true cost of carrying a balance is impossible to overlook, and everything stays on your device.`,
    ],
    faqs: [
      {
        question: `Why does paying only the minimum cost so much?`,
        answer: `Minimum payments are typically a small percentage of the balance, so most of each one goes to interest while the principal barely moves. That stretches repayment over years and multiplies the interest paid — this calculator quantifies the difference against a larger payment.`,
      },
      {
        question: `What if my payment doesn't cover the interest?`,
        answer: `If your monthly payment is less than the interest accruing that month, the balance grows instead of shrinking and the debt never clears. The calculator detects this and stops, signaling that you need to pay more than the monthly interest to make progress.`,
      },
      {
        question: `Is APR the same as the monthly interest rate?`,
        answer: `No. APR is the annual rate; the monthly rate is roughly the APR divided by 12. Credit card interest is charged monthly on your balance, which is why a 20% APR translates to a meaningful charge every single month on what you owe.`,
      },
    ],
    related: [
      { slug: 'debt-payoff-calculator', note: `Model paying down any single debt with a fixed monthly amount.` },
      { slug: 'loan-calculator', note: `Compare against an installment loan with a fixed term and schedule.` },
      { slug: 'budget-calculator', note: `Free up room in your budget to put more toward the card each month.` },
    ],
  },

  'present-value-calculator': {
    intro: [
      `A promise of $10,000 in five years is not worth $10,000 today — money loses value to time and opportunity cost. The Present Value Calculator answers "what is a future sum worth right now?" by discounting it back at a rate you choose, the foundational idea behind investment valuation and net present value analysis.`,
      `Investors use it to decide whether a future payout justifies a price today; finance students use it to learn discounting; anyone weighing "money now versus money later" uses it to compare on equal terms. It is the mirror image of future value: instead of growing a sum forward, it shrinks a future amount back to today's dollars and shows the discount that time imposes.`,
    ],
    steps: [
      `Enter the future value — the amount you expect to receive later.`,
      `Enter the discount rate as a percentage.`,
      `Enter the time period in years.`,
      `Choose a compounding frequency: daily, monthly, quarterly, or annually.`,
      `Read the present value and the discount amount — how much value time strips away.`,
    ],
    why: [
      `It performs the discounting calculation correctly — dividing by the growth factor rather than naively subtracting a percentage — so the present value is accurate.`,
      `It reports the discount amount separately, making the time-value gap between future and present explicit.`,
      `Four compounding frequencies let you match the discounting convention your analysis requires.`,
      `It runs locally and instantly, with no account, keeping your figures private.`,
    ],
    faqs: [
      {
        question: `What is present value?`,
        answer: `Present value is what a future sum of money is worth in today's terms, after accounting for the rate of return you could otherwise earn. Because money can grow over time, a dollar received in the future is worth less than a dollar today, and present value quantifies exactly how much less.`,
      },
      {
        question: `What discount rate should I use?`,
        answer: `Use the rate of return you could realistically earn on the money elsewhere, sometimes called the opportunity cost of capital. A higher discount rate reflects more lucrative alternatives or more risk, and it shrinks the present value of a future amount more aggressively.`,
      },
      {
        question: `How is this different from a future value calculator?`,
        answer: `Future value grows a sum forward to find what it becomes; present value discounts a future sum backward to find what it is worth now. They are inverse operations — one multiplies by the growth factor, the other divides by it.`,
      },
    ],
    related: [
      { slug: 'future-value-calculator', note: `Run the opposite calculation — grow a present sum into the future.` },
      { slug: 'investment-calculator', note: `Project an investment forward with contributions and returns.` },
      { slug: 'compound-interest-calculator', note: `See how the same discount rate compounds growth over time.` },
    ],
  },

  'simple-interest-calculator': {
    intro: [
      `Not all interest compounds. Simple interest is charged only on the original principal, which makes it the model for many short-term loans, bonds, and informal lending arrangements. This calculator applies the classic formula — interest equals principal times rate times time — and shows the working so the result is easy to verify.`,
      `Students learning the fundamentals use it to check homework; borrowers and lenders use it for straightforward agreements where interest does not snowball. A time-unit selector handles years, months, or days, so it fits a multi-year note or a short-term advance equally, and the inline formula breakdown makes every figure transparent.`,
    ],
    steps: [
      `Enter the principal amount (P).`,
      `Enter the annual interest rate (R) as a percentage.`,
      `Enter the time (T) and choose its unit: years, months, or days.`,
      `Read the simple interest and the total amount due.`,
      `Check the formula breakdown, which shows I = P × R × T with your numbers filled in.`,
    ],
    why: [
      `It displays the full formula breakdown with your values substituted, so you can see and verify exactly how the interest was derived — a genuine learning aid.`,
      `A time-unit selector accepts years, months, or days, converting automatically, which suits short-term agreements that other calculators force into years.`,
      `It keeps to the linear simple-interest model rather than quietly compounding, so the result matches the kind of loan it is meant for.`,
      `The math is instant and local, with no sign-up.`,
    ],
    faqs: [
      {
        question: `What is the difference between simple and compound interest?`,
        answer: `Simple interest is calculated only on the original principal, so the same amount is charged each period. Compound interest is calculated on the principal plus previously accumulated interest, so it grows faster. Over the same term and rate, simple interest always totals less.`,
      },
      {
        question: `When is simple interest used?`,
        answer: `It is common for short-term loans, some car loans, certain bonds, and informal personal lending — situations where interest is not reinvested or compounded. Many introductory finance problems also use it to teach the basics before introducing compounding.`,
      },
      {
        question: `How do I calculate simple interest by hand?`,
        answer: `Multiply the principal by the rate (as a decimal) by the time in years. For $5,000 at 6% for 3 years: 5000 × 0.06 × 3 = $900 interest. This calculator does the conversion and arithmetic for you and shows the steps.`,
      },
    ],
    related: [
      { slug: 'compound-interest-calculator', note: `See how the same principal grows when interest compounds instead.` },
      { slug: 'loan-calculator', note: `Model an amortized loan where payments cover principal and interest.` },
      { slug: 'savings-calculator', note: `Project savings that earn compounding interest over time.` },
    ],
  },

  'bac-calculator': {
    intro: [
      `Blood alcohol concentration estimates how much alcohol is in your bloodstream, expressed as a percentage. This calculator uses the well-established Widmark formula, factoring in your sex, body weight, the number of standard drinks, and the time elapsed since you started drinking, and flags when the estimate crosses the common 0.08% legal driving limit.`,
      `People use it to understand how drinks accumulate and how slowly alcohol clears — useful for planning a night out or appreciating why "just a couple" can still register hours later. It is strictly an educational estimate: individual metabolism, food, medication, and many other factors mean your true BAC can differ significantly, and no calculator can tell you it is safe to drive.`,
    ],
    steps: [
      `Select your sex (it sets the body-water distribution constant in the formula).`,
      `Provide your body weight in kilograms.`,
      `Enter the number of standard drinks consumed (each counted as 14 grams of alcohol).`,
      `Enter the hours elapsed since you began drinking.`,
      `Read your estimated BAC, with a warning shown if it is at or above 0.08%.`,
    ],
    why: [
      `It uses the Widmark method with sex-specific distribution constants (0.68 for men, 0.55 for women), the standard scientific approach to estimating BAC.`,
      `It accounts for elimination over time, subtracting roughly 0.015% per hour, so it reflects how alcohol clears rather than just how much you drank.`,
      `It defines a drink as 14 grams of pure alcohol, the standard-drink convention, so counts are consistent.`,
      `It runs entirely in your browser — nothing about your drinking is uploaded.`,
    ],
    faqs: [
      {
        question: `How accurate is this BAC estimate?`,
        answer: `It is an approximation. The Widmark formula uses population averages and cannot account for your individual metabolism, food in your stomach, medications, hydration, or health conditions. Your actual BAC may be higher or lower, so never treat the result as a green light to drive.`,
      },
      {
        question: `What counts as one standard drink?`,
        answer: `This calculator uses the common standard of 14 grams of pure alcohol per drink — roughly a 12 oz regular beer, a 5 oz glass of wine, or a 1.5 oz shot of spirits. Stronger or larger servings count as more than one drink.`,
      },
      {
        question: `How long does it take for BAC to return to zero?`,
        answer: `Alcohol leaves the bloodstream at roughly 0.015% per hour, and that rate cannot be sped up by coffee, water, or food. Depending on how much you drank, it can take many hours to reach zero, which is why a BAC can still be significant the morning after.`,
      },
      {
        question: `Is it safe to drive below 0.08%?`,
        answer: `Not necessarily. Impairment begins well before 0.08%, the limit is lower in many places and for commercial or young drivers, and any amount of alcohol can affect reaction time. This tool is educational only and is not a measure of fitness to drive.`,
      },
    ],
    related: [
      { slug: 'water-intake-calculator', note: `Plan your hydration, which alcohol depletes.` },
      { slug: 'bmr-calculator', note: `Understand your baseline metabolism, which influences how your body processes energy.` },
      { slug: 'calorie-calculator', note: `Account for the calories that alcoholic drinks add to your day.` },
    ],
  },

  'bmr-calculator': {
    intro: [
      `Your basal metabolic rate is the number of calories your body burns at complete rest just to keep you alive — breathing, circulating blood, maintaining temperature. This calculator estimates it using the Mifflin-St Jeor equation, the modern standard, from your sex, age, weight, and height.`,
      `BMR is the starting point for any calorie plan: it is the floor below which you should rarely eat, and the base that activity is added to in order to find your full daily needs. Anyone setting a weight-loss, maintenance, or muscle-gain target uses it as the anchor number before factoring in exercise.`,
    ],
    steps: [
      `Select your sex.`,
      `Enter your age in years.`,
      `Enter your weight in kilograms.`,
      `Enter your height in centimeters.`,
      `Read your BMR in calories per day, then carry it into a TDEE calculator to factor in activity.`,
    ],
    why: [
      `It uses the Mifflin-St Jeor equation, which research has found more accurate for most people than the older Harris-Benedict formula.`,
      `It asks only for the four inputs the equation actually needs — sex, age, weight, height — keeping it fast and free of guesswork.`,
      `The result is a clean daily calorie figure ready to feed into activity and goal calculations.`,
      `It calculates locally and instantly, so your body metrics never leave your device.`,
    ],
    faqs: [
      {
        question: `What is the difference between BMR and TDEE?`,
        answer: `BMR is the calories you burn at complete rest. TDEE (total daily energy expenditure) is BMR multiplied by an activity factor to include movement and exercise. BMR is the baseline; TDEE is the fuller picture of what you burn in a typical day.`,
      },
      {
        question: `Why does the Mifflin-St Jeor equation matter?`,
        answer: `It is the equation this calculator uses because studies have shown it predicts resting metabolic rate more accurately for the general population than older formulas. It bases the estimate on sex, age, weight, and height.`,
      },
      {
        question: `Should I eat at my BMR to lose weight?`,
        answer: `Generally no. Eating below your BMR for long periods is not advised, because it is the energy your body needs at rest. Weight loss is usually pursued by eating below your TDEE — your activity-adjusted needs — not below your BMR.`,
      },
      {
        question: `Does BMR change over time?`,
        answer: `Yes. BMR tends to decline with age and changes with weight and body composition — more muscle raises it, and significant weight loss lowers it. Recalculate periodically as your stats change to keep your calorie targets accurate.`,
      },
    ],
    related: [
      { slug: 'tdee-calculator', note: `Multiply your BMR by an activity level to find your full daily calorie burn.` },
      { slug: 'calorie-calculator', note: `Turn your needs into a target for losing, maintaining, or gaining weight.` },
      { slug: 'macro-calculator', note: `Split your calorie target into protein, carbs, and fat.` },
    ],
  },

  'body-fat-calculator': {
    intro: [
      `Body fat percentage tells you more about composition than weight or BMI ever can — two people at the same weight can carry very different amounts of fat and muscle. This calculator estimates yours using the US Navy circumference method, which needs only a tape measure rather than calipers or a scan.`,
      `Fitness-minded people use it to track recomposition that the scale hides, when fat drops while muscle holds steady. Because the method relies on body measurements — neck, waist, and for women also the hips — alongside height, it gives a usable estimate at home without specialized equipment.`,
    ],
    steps: [
      `Select your sex (this changes which measurements and formula are used).`,
      `Enter your height in centimeters.`,
      `Measure and enter your neck and waist circumference in centimeters.`,
      `If you are female, also enter your hip circumference.`,
      `Read your estimated body fat percentage, calculated with the US Navy method.`,
    ],
    why: [
      `It uses the US Navy circumference formula, so all you need is a tape measure — no calipers, scales, or lab equipment.`,
      `It applies the correct sex-specific equation, including hip circumference for women, rather than a one-size-fits-all estimate.`,
      `It reports a body composition figure that BMI cannot, distinguishing fat from overall weight.`,
      `Measurements are processed in your browser and never uploaded.`,
    ],
    faqs: [
      {
        question: `How accurate is the US Navy body fat method?`,
        answer: `It is a reasonable estimate for most people and tracks changes well over time, but it is not as precise as a DEXA scan or hydrostatic weighing. Accurate, consistent tape measurements matter — measure at the same spots each time for reliable trend tracking.`,
      },
      {
        question: `Where exactly do I measure?`,
        answer: `Measure the neck just below the larynx, the waist at the navel for men and at the narrowest point for women, and the hips at the widest point for women. Keep the tape snug but not compressing the skin, and stand relaxed.`,
      },
      {
        question: `What is a healthy body fat percentage?`,
        answer: `Healthy ranges differ by sex and age, but general fitness guidelines often cite roughly 10–20% for men and 18–28% for women, with athletes typically lower. These are broad references, not medical thresholds, so consider them alongside other health markers.`,
      },
      {
        question: `Why does the female calculation need hip measurement?`,
        answer: `The US Navy formula for women includes hip circumference because fat distribution differs by sex, and adding the hip measurement improves the estimate's accuracy. The male formula uses only neck and waist.`,
      },
    ],
    related: [
      { slug: 'bmi-calculator', note: `Compare with BMI, a quicker but composition-blind weight measure.` },
      { slug: 'lean-body-mass-calculator', note: `Estimate the muscle and non-fat mass behind your body fat figure.` },
      { slug: 'ideal-weight-calculator', note: `See a target weight range for your height to pair with composition.` },
    ],
  },

  'ovulation-calculator': {
    intro: [
      `Knowing when ovulation is likely helps with both trying to conceive and understanding your cycle. This calculator estimates your ovulation date and fertile window from the start date of your last period and your average cycle length, using the standard luteal-phase model.`,
      `People trying to conceive use it to identify the days that matter most; others use it simply to understand their cycle's rhythm. It estimates ovulation as roughly 14 days before the next period and marks a fertile window spanning the five days before ovulation through the day after — the span when conception is most likely. It is an estimate based on a regular cycle, not a guarantee or a form of contraception.`,
    ],
    steps: [
      `Select the start date of your last period.`,
      `Enter your average cycle length in days (28 is typical, but use your own).`,
      `Read your estimated ovulation date.`,
      `Note the highlighted fertile window — the range of days when conception is most likely.`,
    ],
    why: [
      `It calculates ovulation using the standard 14-day luteal phase, the convention clinicians use for cycle estimates.`,
      `It marks a six-day fertile window — five days before ovulation through one day after — reflecting how long sperm survive and the egg remains viable.`,
      `It adapts to your own cycle length rather than assuming a fixed 28 days.`,
      `All dates are computed in your browser, so your cycle information stays completely private.`,
    ],
    faqs: [
      {
        question: `How is the ovulation date estimated?`,
        answer: `The calculator counts back roughly 14 days from your expected next period, based on the typical length of the luteal phase. It adds your cycle length to your last period's start date to project the next period, then subtracts 14 days.`,
      },
      {
        question: `What is the fertile window?`,
        answer: `It is the stretch of days when intercourse is most likely to lead to conception — here, the five days before ovulation plus the day of and after. Sperm can survive several days, so the window opens before the egg is released.`,
      },
      {
        question: `Can I rely on this for birth control?`,
        answer: `No. This is an estimate for awareness and conception planning, not a contraceptive method. Cycles vary month to month, ovulation can shift, and calendar-based prediction is not a reliable way to prevent pregnancy.`,
      },
      {
        question: `What if my cycle is irregular?`,
        answer: `The estimate assumes a fairly regular cycle of the length you enter. If your cycles vary widely, the predicted ovulation date becomes less reliable; tracking methods like basal body temperature or ovulation tests give more personalized signals.`,
      },
    ],
    related: [
      { slug: 'period-calculator', note: `Predict when your next periods are due based on your cycle.` },
      { slug: 'due-date-calculator', note: `If you conceive, estimate your due date from your last period.` },
    ],
  },

  'period-calculator': {
    intro: [
      `Knowing roughly when your next period will arrive makes planning easier, from travel to events to simply being prepared. This calculator projects your upcoming periods from the start date of your last one and your average cycle length, looking two cycles ahead.`,
      `It is a simple tracking aid for anyone who wants a heads-up on their cycle without an app or account. By adding your cycle length to your last start date, it estimates the next period and the one after that. The projection assumes consistent cycles, so it works best when your periods are fairly regular.`,
    ],
    steps: [
      `Pick the date your last period began.`,
      `Enter your average cycle length in days.`,
      `Read the predicted start date of your next period.`,
      `Check the following cycle's estimated start date shown beneath it.`,
    ],
    why: [
      `It projects two cycles ahead, not just one, so you can plan a little further out.`,
      `It uses your own cycle length rather than assuming a standard 28 days, tailoring the estimate to you.`,
      `It needs only two inputs and shows results instantly — no app install or account.`,
      `Your dates are calculated locally and never leave your browser.`,
    ],
    faqs: [
      {
        question: `How does the calculator predict my next period?`,
        answer: `It adds your average cycle length to the start date of your last period to estimate the next start date, then repeats once more for the following cycle. It assumes your cycle length stays consistent from month to month.`,
      },
      {
        question: `Why is my actual period different from the prediction?`,
        answer: `Cycle length naturally varies with stress, illness, travel, hormonal changes, and other factors, so a calendar projection is an estimate rather than a certainty. Tracking several cycles helps you find a more accurate average to enter.`,
      },
      {
        question: `What counts as a normal cycle length?`,
        answer: `Cycle length is commonly anywhere from about 21 to 35 days, measured from the first day of one period to the first day of the next. Use your own observed average for the most accurate prediction rather than a generic figure.`,
      },
      {
        question: `Should I see a doctor about irregular cycles?`,
        answer: `Occasional variation is normal, but consistently irregular, very long, very short, or absent cycles can have medical causes worth discussing with a healthcare provider. This tool is for general planning, not medical diagnosis.`,
      },
    ],
    related: [
      { slug: 'ovulation-calculator', note: `Estimate your fertile window and ovulation date within the cycle.` },
      { slug: 'due-date-calculator', note: `Project a due date if you become pregnant.` },
    ],
  },

  'tdee-calculator': {
    intro: [
      `Total daily energy expenditure is the number of calories you actually burn in a day once movement and exercise are added to your resting metabolism. This calculator takes your BMR and multiplies it by an activity factor to give that full-day figure — the number that drives any sensible eating plan.`,
      `Anyone managing weight uses TDEE as the dividing line: eat below it to lose, around it to maintain, above it to gain. By keeping BMR as a separate input, the tool lets you slot in a value from a BMR calculation and instantly see how different activity levels change your daily burn.`,
    ],
    steps: [
      `Enter your BMR in calories per day (calculate it first with a BMR calculator if you don't know it).`,
      `Choose your activity level from the dropdown, from sedentary to extra active.`,
      `Read your TDEE — the estimated calories you burn in a full day.`,
      `Use it as your maintenance baseline, adjusting up or down for your goal.`,
    ],
    why: [
      `It uses the standard activity multipliers — 1.2 sedentary, 1.375 lightly active, 1.55 moderately active, 1.725 very active, and 1.9 extra active — so the estimate follows established methodology.`,
      `Each activity option spells out what it means (exercise frequency), so you can pick honestly rather than guessing.`,
      `Taking BMR as a direct input keeps it flexible — pair it with any BMR source and compare activity scenarios instantly.`,
      `It calculates locally with no sign-up.`,
    ],
    faqs: [
      {
        question: `How is TDEE calculated?`,
        answer: `TDEE is your BMR multiplied by an activity multiplier that reflects how active you are. For example, a BMR of 1,600 at a moderately active level (×1.55) gives a TDEE of about 2,480 calories per day.`,
      },
      {
        question: `Which activity level should I choose?`,
        answer: `Be honest and account for your whole week. "Sedentary" suits desk jobs with little exercise; "moderately active" fits training three to five days a week; the highest levels are for daily hard training or physically demanding jobs. Overestimating activity is a common reason calorie plans stall.`,
      },
      {
        question: `How do I use TDEE to lose or gain weight?`,
        answer: `Eat below your TDEE to lose weight and above it to gain, with a moderate gap of a few hundred calories being sustainable for most people. Your TDEE is the maintenance point around which you set that deficit or surplus.`,
      },
      {
        question: `Why does this ask for BMR instead of my height and weight?`,
        answer: `This calculator focuses on the activity step and expects a BMR figure as input, which keeps it simple and lets you reuse a BMR from any source. Calculate your BMR first from your age, sex, height, and weight, then enter it here.`,
      },
    ],
    related: [
      { slug: 'bmr-calculator', note: `Calculate the BMR figure this tool needs as its starting point.` },
      { slug: 'calorie-calculator', note: `Turn your TDEE into a goal-specific daily calorie target.` },
      { slug: 'macro-calculator', note: `Divide your daily calories into protein, carbs, and fat.` },
    ],
  },

  'macro-calculator': {
    intro: [
      `Hitting a calorie target is only half the story — how those calories split across protein, carbohydrates, and fat shapes your results. This Macro Calculator takes your daily calorie target and a diet style and converts it into grams of each macronutrient to aim for.`,
      `People following a structured eating plan use it to translate a calorie goal into a shopping-and-cooking reality, whether they are eating balanced, cutting carbs, prioritizing protein, or going keto. Each diet preset carries its own ratio, and the tool does the calorie-to-gram math — accounting for the fact that protein and carbs carry 4 calories per gram while fat carries 9.`,
    ],
    steps: [
      `Enter your daily calorie target (use a TDEE or calorie calculator to find it).`,
      `Choose a diet type: Balanced, Low Carb, High Protein, or Keto.`,
      `Read the grams of protein, carbs, and fat to aim for each day.`,
      `Note the percentage split shown alongside each macro, then Copy the targets.`,
    ],
    why: [
      `It offers four ready-made diet profiles — balanced, low-carb, high-protein, and keto — each with its split shown right in the option label.`,
      `It correctly converts calories to grams using 4 calories per gram for protein and carbs and 9 for fat, so the gram targets are accurate.`,
      `It shows all three macros at once with both grams and percentages, giving you a complete daily picture.`,
      `Calculations are instant and client-side, with no account required.`,
    ],
    faqs: [
      {
        question: `What are macronutrients?`,
        answer: `Macronutrients — protein, carbohydrates, and fat — are the three nutrients that provide energy. Protein and carbs supply about 4 calories per gram and fat about 9, which is why the same calorie target yields different gram amounts depending on the split.`,
      },
      {
        question: `Which diet split should I pick?`,
        answer: `It depends on your goal and preference. Balanced suits general health, higher protein supports muscle retention and satiety, low-carb appeals to some for fat loss, and keto pushes fat very high and carbs very low. There is no single best split — pick one you can sustain.`,
      },
      {
        question: `How do I turn calories into grams of each macro?`,
        answer: `Multiply your calorie target by each macro's percentage, then divide by that macro's calories per gram — 4 for protein and carbs, 9 for fat. This calculator runs that math automatically for the diet style you select.`,
      },
      {
        question: `Do I need to hit my macros exactly?`,
        answer: `Treat the numbers as targets to aim for, not strict rules. Getting reasonably close most days matters far more than perfection at every meal, and protein is usually the macro worth tracking most closely.`,
      },
    ],
    related: [
      { slug: 'calorie-calculator', note: `Set the daily calorie target that this tool splits into macros.` },
      { slug: 'tdee-calculator', note: `Find your maintenance calories before choosing a deficit or surplus.` },
      { slug: 'protein-calculator', note: `Dial in a protein target based on your body weight and goals.` },
    ],
  },

  'one-rep-max-calculator': {
    intro: [
      `Your one-rep max — the most weight you can lift for a single repetition — is the benchmark strength training programs are built around, but testing it directly is risky and tiring. This calculator estimates it from a lighter set you have already done, using the weight lifted and the number of reps.`,
      `Lifters use it to set training percentages, track progress without maxing out, and program their next cycle. It computes two well-known estimates side by side — the Epley and Brzycki formulas — so you can see how they compare on the same lift rather than trusting a single number.`,
    ],
    steps: [
      `Enter the weight you lifted for the set.`,
      `Enter the number of reps you completed with that weight.`,
      `Read the Epley estimated one-rep max, shown prominently.`,
      `Compare it against the Brzycki estimate shown alongside, and Copy the result.`,
    ],
    why: [
      `It calculates two established formulas — Epley and Brzycki — at once, so you see the range rather than relying on one estimate.`,
      `It lets you gauge your max from a submaximal set, avoiding the injury risk of a true one-rep attempt.`,
      `The estimate works for any lift and any weight unit, since it depends only on reps and load.`,
      `It runs instantly in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `How is one-rep max estimated from multiple reps?`,
        answer: `Formulas like Epley (weight × (1 + reps/30)) and Brzycki (weight ÷ (1.0278 − 0.0278 × reps)) use the relationship between the load you lifted and how many reps you managed to project the weight you could lift just once. Fewer reps give a more accurate estimate.`,
      },
      {
        question: `Why do Epley and Brzycki give different numbers?`,
        answer: `They are different mathematical models fitted to strength data, so they diverge slightly, especially at higher rep counts. Showing both gives you a realistic range rather than a single false-precision figure — your true max likely sits near them.`,
      },
      {
        question: `How many reps should I use for the best estimate?`,
        answer: `Estimates are most accurate from sets of around 2 to 6 reps. Beyond about 10 reps, fatigue and technique introduce more error, so the projection becomes less reliable. Use a challenging but clean set in the lower rep range.`,
      },
      {
        question: `Should I actually test my true one-rep max?`,
        answer: `Estimating is safer and sufficient for most training purposes. A true max attempt carries injury risk and requires proper warm-up, technique, and ideally a spotter, so many lifters rely on calculated estimates for programming instead.`,
      },
    ],
    related: [
      { slug: 'target-heart-rate-calculator', note: `Find your training heart-rate zones for conditioning work.` },
      { slug: 'calories-burned-calculator', note: `Estimate the energy your strength sessions burn.` },
      { slug: 'macro-calculator', note: `Set protein and calorie targets to support strength gains.` },
    ],
  },

  'pace-calculator': {
    intro: [
      `Pace is the language of running — minutes per kilometer is how runners gauge effort, plan races, and compare workouts. This calculator turns a distance and a finishing time into your pace, expressed in the familiar minutes-and-seconds-per-kilometer format.`,
      `Runners use it after a session to see how fast they actually moved, or before a race to check whether a goal time is realistic for their distance. Splitting time into hours, minutes, and seconds lets you enter anything from a short interval to a marathon precisely, and the result comes back in the clean M:SS format every running watch uses.`,
    ],
    steps: [
      `Enter the distance covered in kilometers.`,
      `Enter your time across the hours, minutes, and seconds fields.`,
      `Read your pace in minutes and seconds per kilometer.`,
      `Copy the pace to compare against past runs or a race target.`,
    ],
    why: [
      `It accepts time as separate hours, minutes, and seconds, so you can enter a precise finishing time without converting anything.`,
      `It returns pace in the standard M:SS per-kilometer format that matches running watches and race results.`,
      `The math is exact and instant, handling everything from a sprint interval to a long-distance time.`,
      `It runs locally in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `How is running pace calculated?`,
        answer: `Pace is your total time divided by the distance. The calculator converts your hours, minutes, and seconds into total seconds, divides by the distance in kilometers, then formats the result as minutes and seconds per kilometer.`,
      },
      {
        question: `What is the difference between pace and speed?`,
        answer: `Pace is time per unit distance (minutes per kilometer), while speed is distance per unit time (kilometers per hour). Runners usually think in pace because it directly answers "how long will each kilometer take?", which makes race planning easier.`,
      },
      {
        question: `How do I use pace to plan a race?`,
        answer: `Decide your goal finishing time, work out the pace it requires for the race distance, and check whether you can hold that pace in training. This calculator lets you test paces against distances so your target is grounded in reality.`,
      },
      {
        question: `Does this work in miles?`,
        answer: `This calculator works in kilometers, returning pace per kilometer. To approximate pace per mile, multiply your per-kilometer pace by about 1.609, or enter your distance converted to kilometers.`,
      },
    ],
    related: [
      { slug: 'calories-burned-calculator', note: `Estimate the calories your run burned based on duration and effort.` },
      { slug: 'target-heart-rate-calculator', note: `Find the heart-rate zones to train at different intensities.` },
      { slug: 'one-rep-max-calculator', note: `Track strength progress alongside your running.` },
    ],
  },

  'water-intake-calculator': {
    intro: [
      `Hydration needs are personal — they depend on your body size and how much you move — yet most advice defaults to a flat "eight glasses a day." This calculator gives a tailored estimate, combining a baseline from your body weight with an added amount for the time you spend active.`,
      `People use it to set a realistic daily water goal, especially around exercise when sweat losses climb. The formula adds roughly 35 millilitres per kilogram of body weight to extra water for each minute of activity, so an active day produces a higher target than a sedentary one — a more honest picture than a fixed number.`,
    ],
    steps: [
      `Enter your weight in kilograms.`,
      `Enter your daily active time in minutes.`,
      `Read your recommended daily water intake in millilitres.`,
      `Copy the goal and spread it across the day rather than drinking it all at once.`,
    ],
    why: [
      `It personalizes the target with a two-part formula — a body-weight baseline plus an activity allowance — instead of a one-size-fits-all number.`,
      `Factoring in active minutes accounts for the extra fluid you lose through exercise, which generic guidance ignores.`,
      `It returns a precise millilitre figure you can track against a bottle of known size.`,
      `It calculates instantly in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `How much water should I drink a day?`,
        answer: `It varies with body size, activity, climate, and health. This calculator estimates a baseline of about 35 ml per kilogram of body weight plus extra for active minutes, giving a personalized figure rather than the generic "eight glasses" rule.`,
      },
      {
        question: `Does food and other drinks count toward this?`,
        answer: `Yes. A meaningful share of daily fluid comes from food and other beverages, so you do not need to drink the entire figure as plain water. Use the number as a total fluid target, leaning on water for the bulk of it.`,
      },
      {
        question: `Should I drink more on workout days?`,
        answer: `Yes, which is why the calculator adds water for active minutes. Exercise increases fluid loss through sweat and breathing, so hydration needs rise with training volume, heat, and intensity.`,
      },
      {
        question: `Can I drink too much water?`,
        answer: `In rare cases, drinking excessive amounts very quickly can dangerously dilute blood sodium. For nearly everyone, spreading intake through the day and drinking to thirst alongside this target is safe — treat the figure as a guide, not a quota to force.`,
      },
    ],
    related: [
      { slug: 'calorie-calculator', note: `Set daily calorie needs to pair with your hydration goal.` },
      { slug: 'bmr-calculator', note: `Understand your baseline metabolism, another body-size-driven figure.` },
      { slug: 'calories-burned-calculator', note: `Gauge how much your active time burns, which also drives water needs.` },
    ],
  },

  // ── Batch 5: Health/Fitness (10, finishes subcategory) + Math (5) ──

  'calorie-calculator': {
    intro: [
      `Whether you want to lose, maintain, or gain weight, it all comes down to one number: how many calories to eat each day. This calculator takes your total daily energy expenditure and adjusts it for your goal, giving you a clear daily intake target to aim for.`,
      `It works as the final step after you know what your body burns. Someone aiming to lose weight gets a target set below their burn rate; someone building muscle gets one above it; someone holding steady gets their maintenance figure. Pairing it with a TDEE estimate turns "eat less" or "eat more" into an actual number you can plan meals around.`,
    ],
    steps: [
      `Enter your daily TDEE in calories (find it with a TDEE calculator if you don't know it).`,
      `Choose your goal: lose weight, maintain, or gain weight.`,
      `Read your target daily calorie intake.`,
      `Plan your meals around that figure, and recalculate as your weight or activity changes.`,
    ],
    why: [
      `It applies a moderate, sustainable adjustment — a 500-calorie deficit for loss or surplus for gain — rather than an aggressive swing that is hard to maintain.`,
      `By taking TDEE as input, it stays accurate for anyone, since your burn rate already reflects your size and activity.`,
      `The output is a single, actionable number you can build a meal plan or food log around.`,
      `It calculates instantly in your browser with no account.`,
    ],
    faqs: [
      {
        question: `How big a calorie deficit should I aim for?`,
        answer: `A deficit of around 500 calories a day — what this calculator applies for weight loss — targets roughly half a kilogram (about a pound) of fat loss per week, a pace most people can sustain. Larger deficits speed results but are harder to maintain and can cost muscle.`,
      },
      {
        question: `Why does this need my TDEE instead of my height and weight?`,
        answer: `It focuses on the goal-adjustment step and expects your total daily energy expenditure as input. Calculate your TDEE first — from your BMR and activity level — then enter it here to get a goal-specific target.`,
      },
      {
        question: `Will eating at this target guarantee weight change?`,
        answer: `Calorie targets are estimates, and real results depend on accurate tracking, consistency, and individual metabolism. Use the figure as a starting point, monitor your weight over a few weeks, and adjust if progress stalls or moves too fast.`,
      },
      {
        question: `Should I eat the same calories every day?`,
        answer: `A consistent daily target is simplest, but some people prefer to vary intake across the week while keeping the weekly total the same. Either approach works as long as your average lands near the target this calculator gives you.`,
      },
    ],
    related: [
      { slug: 'tdee-calculator', note: `Calculate the daily burn figure this tool adjusts for your goal.` },
      { slug: 'macro-calculator', note: `Split your calorie target into protein, carbs, and fat.` },
      { slug: 'bmr-calculator', note: `Find the resting metabolism that underpins your daily needs.` },
    ],
  },

  'ideal-weight-calculator': {
    intro: [
      `There is no single "ideal weight", which is exactly why this calculator shows four. It runs your height and sex through the Devine, Robinson, Miller, and Hamwi formulas — the classic clinical estimates — and reports each result alongside their average, so you get a sensible range rather than one arbitrary figure.`,
      `These formulas were developed for medical contexts like dosing and are widely used as healthy-weight references. Seeing all four together is the value here: they disagree slightly, and the spread between them is a more honest picture than any one number. Anyone setting a weight goal can use the range as a grounded target rather than chasing a single point.`,
    ],
    steps: [
      `Select your sex.`,
      `Enter your height in centimeters.`,
      `Read the estimated average ideal weight.`,
      `Compare the individual Devine, Robinson, Miller, and Hamwi results to see the range they suggest.`,
    ],
    why: [
      `It computes four established formulas at once and averages them, giving a defensible range instead of a single, falsely precise number.`,
      `Showing each named formula's result lets you see how much the methods differ for your height.`,
      `It needs only height and sex, the inputs these formulas actually use, so it is quick and unambiguous.`,
      `Everything is calculated locally, so your figures never leave your device.`,
    ],
    faqs: [
      {
        question: `Why are there four different ideal weight formulas?`,
        answer: `The Devine, Robinson, Miller, and Hamwi formulas were developed at different times for clinical use and each weights height slightly differently. None is definitively "correct," so this calculator shows all four and their average to give you a realistic range.`,
      },
      {
        question: `Is ideal weight the same as a healthy weight?`,
        answer: `Not exactly. These formulas estimate a reference weight based only on height and sex; they do not account for muscle mass, frame size, or body composition. Treat the result as a guideline alongside measures like BMI and body fat percentage.`,
      },
      {
        question: `Why doesn't it ask for my current weight?`,
        answer: `The formulas estimate a target weight from height and sex alone — your current weight is not an input. Compare the result to your actual weight yourself to see how far above or below the estimated range you are.`,
      },
      {
        question: `Do frame size and muscle affect the result?`,
        answer: `The formulas ignore both, using only height and sex. A muscular or large-framed person may sit healthily above the estimate, while a small-framed person may sit below it — another reason to read the four-formula range alongside body composition rather than treating one number as a goal.`,
      },
    ],
    related: [
      { slug: 'bmi-calculator', note: `Check where your current weight sits relative to your height.` },
      { slug: 'body-fat-calculator', note: `Estimate composition, which a weight target alone cannot capture.` },
      { slug: 'lean-body-mass-calculator', note: `Separate muscle and non-fat mass from total body weight.` },
    ],
  },

  'protein-calculator': {
    intro: [
      `Protein needs scale with your body weight and how hard you train, and "get enough protein" is useless without a number. This calculator gives you that number: enter your weight and pick the activity profile that matches you, and it returns a daily protein target in grams.`,
      `It serves a spectrum of goals through four profiles — from a sedentary baseline of 0.8 grams per kilogram up to 2.2 grams for serious strength athletes. Someone recovering from training, a runner building endurance, or a lifter chasing muscle each gets a target grounded in their actual demand rather than a generic recommendation.`,
    ],
    steps: [
      `Input your body weight in kilograms.`,
      `Pick the profile that fits you, from sedentary to high training / bodybuilding.`,
      `Read your recommended daily protein intake in grams.`,
      `Spread that total across your meals through the day.`,
    ],
    why: [
      `Four activity profiles map to established protein guidelines (0.8 to 2.2 g/kg), so the target reflects your real training demand, not a one-size figure.`,
      `It bases the number on body weight, the variable that protein needs actually scale with.`,
      `The result is a concrete daily gram target you can divide across meals.`,
      `It runs instantly and locally with no account.`,
    ],
    faqs: [
      {
        question: `How much protein do I need per day?`,
        answer: `It depends on activity: roughly 0.8 g/kg of body weight for sedentary people, rising to around 1.6 g/kg for muscle gain and up to about 2.2 g/kg for intense strength training. This calculator applies the multiplier for the profile you choose.`,
      },
      {
        question: `Can I eat too much protein?`,
        answer: `For healthy people, intakes in the ranges this tool suggests are well tolerated. Very high intakes offer little extra benefit for most goals and displace other nutrients, so there is usually no reason to exceed the high-training range unless advised.`,
      },
      {
        question: `Does it matter when I eat protein?`,
        answer: `Total daily protein matters most, but spreading it across meals — rather than loading it all at once — helps your body use it efficiently for muscle repair. Aim to include a protein source at each meal to reach the daily target.`,
      },
      {
        question: `Should I use my current or goal body weight?`,
        answer: `Most guidelines use current body weight. If you carry significant excess fat, some prefer to base protein on a target or lean weight, but for general purposes entering your current weight gives a reasonable target.`,
      },
    ],
    related: [
      { slug: 'macro-calculator', note: `See protein in context alongside your carb and fat targets.` },
      { slug: 'calorie-calculator', note: `Set the daily calorie goal your protein fits within.` },
      { slug: 'one-rep-max-calculator', note: `Track the strength progress your protein intake supports.` },
    ],
  },

  'target-heart-rate-calculator': {
    intro: [
      `Training by heart rate keeps your effort honest — too easy and you stall, too hard and you burn out. This calculator finds your personal training zones using the Karvonen method, which factors in your resting heart rate rather than relying on age alone, for ranges tailored to your fitness.`,
      `Runners, cyclists, and gym-goers use it to train deliberately: staying in the fat-burning zone for steady cardio, or pushing into the aerobic zone to build endurance. By starting from your heart rate reserve — the gap between your maximum and resting rates — it gives more individualized targets than a simple percentage of max heart rate.`,
    ],
    steps: [
      `Enter your age (used to estimate your maximum heart rate).`,
      `Enter your resting heart rate in beats per minute.`,
      `Read your estimated maximum heart rate.`,
      `Use the fat-burning and aerobic zone ranges to guide your workout intensity.`,
    ],
    why: [
      `It uses the Karvonen heart-rate-reserve method, which incorporates your resting heart rate for more personalized zones than an age-only formula.`,
      `It reports concrete beats-per-minute ranges for the fat-burning and aerobic zones, so you know exactly what to aim for on a monitor.`,
      `It estimates your maximum heart rate for you from your age, so you do not need to test it.`,
      `Calculations are instant and run entirely in your browser.`,
    ],
    faqs: [
      {
        question: `What is the Karvonen method?`,
        answer: `The Karvonen method calculates target heart rate using your heart rate reserve — the difference between your maximum and resting heart rates — rather than a flat percentage of maximum. Because it includes your resting rate, it produces zones tailored to your individual fitness level.`,
      },
      {
        question: `How is maximum heart rate estimated?`,
        answer: `This calculator uses the common estimate of 220 minus your age. It is a population average, so your true maximum may differ by several beats; for precision, a supervised stress test is the gold standard, but the estimate works well for everyday training.`,
      },
      {
        question: `What is the difference between the fat-burning and aerobic zones?`,
        answer: `The fat-burning zone (a lower-intensity range) emphasizes steady effort where a higher share of energy comes from fat. The aerobic zone is more intense, building cardiovascular endurance. Both are useful; the right one depends on your workout goal.`,
      },
      {
        question: `Do I need a heart rate monitor to use these zones?`,
        answer: `To train by them accurately, yes — a chest strap or wrist monitor lets you keep your heart rate within the target range during exercise. Without one, you can approximate effort using perceived exertion, but a monitor is far more precise.`,
      },
    ],
    related: [
      { slug: 'calories-burned-calculator', note: `Estimate the energy burned during a session at a given intensity.` },
      { slug: 'pace-calculator', note: `Pair heart-rate zones with running pace for structured training.` },
      { slug: 'one-rep-max-calculator', note: `Set strength-training loads to complement your cardio work.` },
    ],
  },

  'sleep-calculator': {
    intro: [
      `Waking up groggy often is not about how long you slept but when in a sleep cycle your alarm went off. This calculator works with your body's roughly 90-minute cycles: tell it when you plan to fall asleep, and it suggests wake-up times that land at the end of a cycle rather than the middle of one.`,
      `It is for anyone setting an alarm who wants to wake feeling refreshed — students timing an early start, shift workers planning rest, or anyone deciding between "a bit more sleep" options. It even allows about 15 minutes to actually drift off, so the suggested times reflect real bedtime rather than the moment you get into bed.`,
    ],
    steps: [
      `Enter the time you plan to go to sleep.`,
      `Review the suggested wake-up times, each set to complete a whole number of sleep cycles.`,
      `Pick the option that gives you enough rest — the cards show 4.5, 6, 7.5, and 9 hours of sleep.`,
      `Set your alarm for the chosen time.`,
    ],
    why: [
      `It times wake-ups to the end of 90-minute sleep cycles, the principle behind waking less groggy than a mid-cycle alarm.`,
      `It builds in roughly 15 minutes of sleep-onset latency, so the suggestions account for the time it takes to actually fall asleep.`,
      `It presents several whole-cycle options (from 4.5 to 9 hours) so you can choose based on how much time you have.`,
      `It runs instantly in your browser with no account.`,
    ],
    faqs: [
      {
        question: `Why does waking up at the end of a cycle feel better?`,
        answer: `Sleep moves through stages, and waking during deep sleep tends to leave you groggy, an effect called sleep inertia. Cycles run about 90 minutes, so aligning your alarm to the end of one means waking from lighter sleep, which usually feels more refreshing.`,
      },
      {
        question: `How long is a sleep cycle?`,
        answer: `A full sleep cycle averages around 90 minutes, though it varies by person and across the night. This calculator uses the 90-minute average to suggest wake times at 3, 4, 5, or 6 complete cycles after you fall asleep.`,
      },
      {
        question: `Why does it add 15 minutes?`,
        answer: `Most people do not fall asleep instantly. The calculator allows about 15 minutes of sleep-onset latency so the suggested wake times are measured from when you actually drift off, not from the moment you lie down.`,
      },
      {
        question: `How many cycles of sleep do I need?`,
        answer: `Most adults do well on five to six cycles, roughly 7.5 to 9 hours. The calculator shows options across this range so you can pick what fits your schedule, but consistent, sufficient sleep matters more than hitting an exact cycle count.`,
      },
    ],
    related: [
      { slug: 'water-intake-calculator', note: `Another daily wellness baseline worth dialing in.` },
      { slug: 'target-heart-rate-calculator', note: `Plan training intensity, which affects recovery and rest needs.` },
      { slug: 'age-calculator', note: `Sleep needs shift with age — check yours precisely.` },
    ],
  },

  'lean-body-mass-calculator': {
    intro: [
      `Lean body mass is everything in your body that is not fat — muscle, bone, organs, and water. Knowing it helps you understand body composition and set realistic goals, since it is the part of your weight you generally want to keep or build, not lose. This calculator splits your total weight into lean mass and fat mass from your weight and body fat percentage.`,
      `Lifters use it to confirm a cut is shedding fat while preserving muscle; anyone tracking a recomposition uses it to see past the scale. Because it separates the two components, it reveals whether weight changes are coming from the right place.`,
    ],
    steps: [
      `Enter your total body weight in kilograms.`,
      `Enter your body fat percentage (estimate it first if you don't know it).`,
      `Read your lean body mass in kilograms.`,
      `Check the fat mass figure shown alongside it.`,
    ],
    why: [
      `It breaks your weight into both lean mass and fat mass, so you see the full composition rather than a single total.`,
      `The calculation is transparent — lean mass is simply your weight minus the fat portion — making the result easy to trust and reproduce.`,
      `It pairs naturally with a body fat estimate, turning that percentage into concrete kilograms.`,
      `Everything is computed locally with no sign-up.`,
    ],
    faqs: [
      {
        question: `What is lean body mass?`,
        answer: `Lean body mass is your total weight minus your fat mass — it includes muscle, bone, organs, connective tissue, and body water. It is the metabolically active part of your body and the component most people aim to maintain or increase.`,
      },
      {
        question: `Why track lean body mass instead of just weight?`,
        answer: `Scale weight hides what is changing underneath. During a diet you might lose fat while keeping muscle, or lose both. Tracking lean mass and fat mass separately shows whether your training and nutrition are preserving the tissue you want to keep.`,
      },
      {
        question: `How do I find my body fat percentage to enter here?`,
        answer: `You can estimate it with a body fat calculator using tape measurements, or get a more precise reading from calipers, a smart scale, or a DEXA scan. The accuracy of your lean mass figure depends directly on the body fat percentage you provide.`,
      },
      {
        question: `What is a typical lean body mass percentage?`,
        answer: `It varies with sex and fitness, but lean mass commonly makes up around 75–85% of body weight in men and a somewhat lower share in women, who naturally carry more essential fat. Rather than chasing a number, most people aim to preserve or grow lean mass while reducing fat.`,
      },
    ],
    related: [
      { slug: 'body-fat-calculator', note: `Estimate the body fat percentage this calculator needs as input.` },
      { slug: 'bmi-calculator', note: `Compare with BMI, which cannot distinguish muscle from fat.` },
      { slug: 'protein-calculator', note: `Set a protein target to help preserve and build lean mass.` },
    ],
  },

  'fat-intake-calculator': {
    intro: [
      `Dietary fat is essential, but how much you should eat is usually given as a percentage of calories rather than a number you can act on. This calculator converts your daily calorie target into a practical fat range in grams — and flags a separate limit for saturated fat.`,
      `It suits anyone structuring a diet who wants their fat intake grounded in guidelines rather than guesswork. Using the widely cited 20–35% of calories for total fat, it returns a sensible daily gram range, and it calls out the recommendation to keep saturated fat under 10% with a clear warning figure.`,
    ],
    steps: [
      `Enter your daily calorie target in kilocalories.`,
      `Read your recommended total fat range in grams (based on 20–35% of calories).`,
      `Note the separate saturated fat limit, highlighted as a cap to stay under.`,
      `Use the range to plan your meals and fat sources.`,
    ],
    why: [
      `It translates abstract percentage guidelines into grams of fat you can actually count, using the standard 20–35% of calories range.`,
      `It separates a saturated-fat limit (under 10% of calories) and highlights it, since that is the type most guidelines urge you to restrict.`,
      `It correctly converts calories to grams using fat's 9 calories per gram.`,
      `It calculates instantly and locally with no account.`,
    ],
    faqs: [
      {
        question: `How much fat should I eat per day?`,
        answer: `Common dietary guidelines recommend total fat make up 20–35% of your daily calories. This calculator converts that range into grams for your specific calorie target — for a 2,000-calorie diet, that is roughly 44 to 78 grams of fat per day.`,
      },
      {
        question: `Why is saturated fat shown separately?`,
        answer: `Health guidelines advise keeping saturated fat — found in fatty meats, butter, and many processed foods — below about 10% of daily calories, because high intakes are linked to raised cholesterol. The calculator flags this limit separately so you can watch it alongside total fat.`,
      },
      {
        question: `Are all fats bad for me?`,
        answer: `No. Unsaturated fats from sources like olive oil, nuts, avocados, and fish are an important part of a healthy diet. The goal is usually to favor these while limiting saturated and trans fats, not to minimize fat overall.`,
      },
      {
        question: `Why divide calories by 9?`,
        answer: `Each gram of fat provides about 9 calories — more than the 4 calories per gram in protein or carbohydrates. To convert a calorie amount of fat into grams, you divide by 9, which is exactly what this tool does.`,
      },
    ],
    related: [
      { slug: 'macro-calculator', note: `See fat alongside your full protein and carbohydrate split.` },
      { slug: 'calorie-calculator', note: `Set the daily calorie target your fat range is based on.` },
      { slug: 'protein-calculator', note: `Balance fat with an appropriate daily protein intake.` },
    ],
  },

  'body-surface-area-calculator': {
    intro: [
      `Body surface area is a measure clinicians rely on for things like medication dosing and assessing metabolic needs, because it reflects body size better than weight alone. This calculator computes it from your weight and height using the two most established equations — DuBois and Mosteller — side by side.`,
      `Healthcare students and professionals use BSA where precise body-size scaling matters, such as chemotherapy dosing or estimating cardiac index. Showing both formulas lets you cross-check, since they can differ slightly, and gives confidence in the figure you carry forward.`,
    ],
    steps: [
      `Enter your weight in kilograms.`,
      `Enter your height in centimeters.`,
      `Read the DuBois body surface area result in square meters.`,
      `Compare it against the Mosteller result shown alongside.`,
    ],
    why: [
      `It computes both the DuBois and Mosteller formulas at once, letting you compare the two standard methods rather than trusting one.`,
      `It reports results in square meters to two decimals, the precision clinical use expects.`,
      `It needs only weight and height, the inputs both formulas use, keeping it simple.`,
      `All math runs locally in your browser, so the figures stay private.`,
    ],
    faqs: [
      {
        question: `What is body surface area used for?`,
        answer: `BSA is used in medicine to scale things to body size — most notably dosing certain medications such as chemotherapy, and computing indices like cardiac output relative to body size. It often tracks physiological needs better than body weight alone.`,
      },
      {
        question: `What is the difference between the DuBois and Mosteller formulas?`,
        answer: `Both estimate BSA from height and weight but use different equations — DuBois employs exponents on height and weight, while Mosteller uses a simpler square-root formula. They usually agree closely; showing both lets you verify the estimate.`,
      },
      {
        question: `Which BSA formula should I use?`,
        answer: `Mosteller is popular for its simplicity and is widely used in clinical dosing, while DuBois is a long-standing standard. For most purposes they are interchangeable; follow whichever your institution or protocol specifies.`,
      },
      {
        question: `Does body surface area change if I gain or lose weight?`,
        answer: `Yes. Because both weight and height feed the formulas, a change in weight shifts your BSA — though less dramatically than it shifts weight itself, since BSA grows slowly with size. Recalculate after a significant weight change if you are using BSA for dosing or metabolic estimates.`,
      },
    ],
    related: [
      { slug: 'bmi-calculator', note: `Another height-and-weight measure, used for weight classification.` },
      { slug: 'ideal-weight-calculator', note: `Estimate a healthy weight range for your height.` },
      { slug: 'bmr-calculator', note: `Estimate resting energy needs, which also scale with body size.` },
    ],
  },

  'age-calculator': {
    intro: [
      `"How old am I, exactly?" is harder to answer than it sounds once you go beyond whole years. This calculator takes your date of birth and returns your precise age broken into years, months, and days — accounting for the uneven lengths of months and for leap years.`,
      `People use it for forms that demand an exact age, to settle the friendly debate over who is older by how much, or to work out age on a specific milestone. Because it reports the full year-month-day breakdown rather than rounding to years, it gives the exact answer those situations need.`,
    ],
    steps: [
      `Select your date of birth from the date picker.`,
      `Read your current age expressed as years, months, and days.`,
      `Use the precise breakdown wherever an exact age is required.`,
    ],
    why: [
      `It reports age as years, months, and days, not just whole years, so you get the exact figure rather than a rounded one.`,
      `It correctly handles the differing lengths of months and leap years, borrowing days and months so the result is accurate.`,
      `It needs only a birth date and updates instantly.`,
      `The calculation happens entirely in your browser, so your birth date is never uploaded.`,
    ],
    faqs: [
      {
        question: `How does the calculator handle months of different lengths?`,
        answer: `When the day of the month you were born is later than today's day, it borrows days from the previous month using that month's actual length, then adjusts the months and years accordingly. This keeps the years-months-days breakdown accurate rather than assuming every month is 30 days.`,
      },
      {
        question: `Does it account for leap years?`,
        answer: `Yes. Because it works from the actual calendar dates rather than a fixed day count, leap years are naturally included in the day-by-day calculation, so the result stays correct across February 29ths.`,
      },
      {
        question: `Can I calculate age at a past or future date?`,
        answer: `This calculator computes your age as of today from your date of birth. To find an age difference between two specific dates, a dedicated date-difference calculator is the better tool.`,
      },
      {
        question: `Why does my exact age differ from just subtracting birth year from this year?`,
        answer: `Subtracting years alone assumes your birthday has already passed this year, which is only true for part of the year. This calculator checks the actual month and day, so before your birthday it correctly shows one year less than the simple subtraction would.`,
      },
    ],
    related: [
      { slug: 'due-date-calculator', note: `Estimate a pregnancy due date from a last-period date.` },
      { slug: 'date-calculator', note: `Find the exact span between any two dates.` },
      { slug: 'sleep-calculator', note: `Sleep needs change with age — plan your rest accordingly.` },
    ],
  },

  'due-date-calculator': {
    intro: [
      `For expectant parents, the estimated due date is the anchor everything else is planned around. This calculator applies Naegele's rule — the standard method clinicians use — adding 280 days to the first day of your last menstrual period to estimate when your baby is due.`,
      `It gives a quick, recognized estimate for early planning, appointments, and counting down the weeks. While an ultrasound and your healthcare provider give the most accurate dating, the last-period method this tool uses is the widely accepted starting point and matches how due dates are first calculated.`,
    ],
    steps: [
      `Select the first day of your last menstrual period.`,
      `Read your estimated due date, calculated as 280 days later.`,
      `Use it as a planning anchor, and confirm timing with your healthcare provider.`,
    ],
    why: [
      `It uses Naegele's rule (last period plus 280 days), the standard method clinicians use to estimate due dates.`,
      `It needs just one date and returns the estimate immediately, with no forms or sign-up.`,
      `The result is a clear calendar date you can plan around.`,
      `Your information is processed locally and never leaves your browser.`,
    ],
    faqs: [
      {
        question: `How is a due date calculated?`,
        answer: `The common method, Naegele's rule, adds 280 days (40 weeks) to the first day of your last menstrual period. This calculator applies that rule directly. It assumes a regular 28-day cycle, which is why a provider may adjust the date.`,
      },
      {
        question: `How accurate is the estimated due date?`,
        answer: `It is an estimate — only about 1 in 20 babies arrive exactly on their due date, and most are born within a couple of weeks either side. An early ultrasound often refines the date, especially if your cycle is irregular.`,
      },
      {
        question: `What if I don't know my last period date or have irregular cycles?`,
        answer: `The last-period method is less reliable with irregular cycles or an uncertain date. In those cases, dating is usually based on ultrasound measurements, so check with your healthcare provider for a more accurate estimate.`,
      },
      {
        question: `Can the due date change later in pregnancy?`,
        answer: `Yes. Providers often refine the date after an early ultrasound, which measures the baby directly and can be more accurate than the last-period estimate, especially with irregular cycles. The figure here is a starting point, not a fixed appointment.`,
      },
    ],
    related: [
      { slug: 'ovulation-calculator', note: `Estimate your fertile window and likely conception timing.` },
      { slug: 'period-calculator', note: `Track your cycle and predict upcoming periods.` },
      { slug: 'age-calculator', note: `Once the baby arrives, track their exact age in months and days.` },
    ],
  },

  'standard-deviation-calculator': {
    intro: [
      `Standard deviation measures how spread out a set of numbers is — whether they cluster tightly around the average or scatter widely. This calculator computes it from a list of values and, crucially, lets you choose between the population and sample formulas, which give different answers and are easy to confuse.`,
      `Students check statistics homework with it; analysts use it to quantify variability in data; anyone summarizing measurements uses it to describe consistency. Beyond the standard deviation itself, it shows the variance, mean, count, sum, and the sum of squared differences, with the steps laid out so you can follow exactly how the result was built.`,
    ],
    steps: [
      `Paste or type your numbers into the box, separated by commas, spaces, or new lines.`,
      `Choose whether your data is a full population or a sample.`,
      `Read the standard deviation and variance.`,
      `Review the supporting figures — mean, count, sum, and sum of squared differences — and the step-by-step breakdown.`,
    ],
    why: [
      `It offers both population and sample standard deviation, dividing by n or by n−1 respectively, so you get the statistically correct figure for your situation.`,
      `It shows the full working — mean, variance, and the sum of squared differences — turning a single number into a transparent calculation you can verify or learn from.`,
      `It accepts numbers separated however you have them, by commas, spaces, or lines.`,
      `Everything is computed in your browser, so your data is never uploaded.`,
    ],
    faqs: [
      {
        question: `What is the difference between population and sample standard deviation?`,
        answer: `Population standard deviation divides by the number of values (n) and is used when your data covers the entire group. Sample standard deviation divides by n−1 and is used when your data is a sample meant to represent a larger population. The sample version is slightly larger and corrects for sampling bias.`,
      },
      {
        question: `Which one should I use?`,
        answer: `Use population standard deviation only when your numbers represent every member of the group you care about. If they are a subset drawn to estimate a wider population — which is most real-world cases — use the sample version.`,
      },
      {
        question: `What does standard deviation actually tell me?`,
        answer: `It describes spread. A small standard deviation means the values sit close to the mean; a large one means they are widely dispersed. It is expressed in the same units as your data, which makes it easy to interpret.`,
      },
      {
        question: `What is variance, and how does it relate?`,
        answer: `Variance is the average of the squared differences from the mean, and standard deviation is its square root. Variance is shown here too, but standard deviation is usually more intuitive because it shares the units of your original data.`,
      },
    ],
    related: [
      { slug: 'mean-median-mode-range-calculator', note: `Get the central-tendency stats that pair with spread.` },
      { slug: 'average-calculator', note: `Quickly find the mean of a list of numbers on its own.` },
      { slug: 'percentage-error-calculator', note: `Measure how far a value deviates from an expected one.` },
    ],
  },

  'percentage-error-calculator': {
    intro: [
      `Percentage error tells you how far off a measurement or estimate is from the true value, as a proportion — the standard way to express accuracy in science and engineering. This calculator takes the exact value and the approximate value and returns the percentage error, along with the absolute and relative error behind it.`,
      `Students use it to grade the accuracy of lab measurements; anyone comparing an estimate to a known figure uses it to quantify how close they got. By breaking out absolute and relative error too, it shows the full chain from raw difference to final percentage, and it handles the awkward case where the exact value is zero gracefully.`,
    ],
    steps: [
      `Enter the exact (true) value.`,
      `Enter the approximate (measured or estimated) value.`,
      `Read the percentage error.`,
      `Review the absolute error and relative error shown in the step-by-step breakdown.`,
    ],
    why: [
      `It reports all three related figures — percentage error, absolute error, and relative error — so you see how the final percentage is derived.`,
      `It uses the standard formula, taking the absolute difference over the true value, so signs never distort the result.`,
      `It handles a zero exact value gracefully, showing the absolute error rather than producing a division error.`,
      `Calculations are instant and run locally with no account.`,
    ],
    faqs: [
      {
        question: `How is percentage error calculated?`,
        answer: `It is the absolute difference between the approximate and exact values, divided by the absolute exact value, multiplied by 100. For an exact value of 100 and an approximate of 95, the percentage error is |95−100| ÷ 100 × 100 = 5%.`,
      },
      {
        question: `What is the difference between absolute and relative error?`,
        answer: `Absolute error is the raw difference between the measured and true values, in the original units. Relative error is that difference divided by the true value, a unitless ratio. Percentage error is simply the relative error expressed as a percentage.`,
      },
      {
        question: `Why can't I use an exact value of zero?`,
        answer: `Percentage and relative error require dividing by the exact value, and division by zero is undefined. When the exact value is zero, this calculator shows the absolute error instead, since a meaningful percentage cannot be computed.`,
      },
      {
        question: `What counts as a good percentage error?`,
        answer: `It depends entirely on context — a low percentage error means the approximation is close to the true value. Many school labs treat under 5% as good, but precision fields demand far smaller errors, while rough estimates may tolerate more. Lower is always better.`,
      },
    ],
    related: [
      { slug: 'percentage-calculator', note: `Work out any percentage relationship between two numbers.` },
      { slug: 'standard-deviation-calculator', note: `Measure the spread and consistency of repeated measurements.` },
      { slug: 'rounding-calculator', note: `Round measured values cleanly before comparing them.` },
    ],
  },

  'exponent-calculator': {
    intro: [
      `Raising a number to a power is everywhere in math and science, from compound growth to scientific notation, but large exponents quickly exceed what you can do in your head. This calculator computes any base raised to any exponent and shows the result in expanded form and scientific notation where it helps.`,
      `Students use it to check powers and understand what an exponent represents; anyone working with very large or small numbers uses the scientific-notation output to keep them readable. For small whole-number exponents it even writes out the full multiplication chain, making the concept concrete rather than abstract.`,
    ],
    steps: [
      `Enter the base number.`,
      `Enter the exponent (the power to raise it to).`,
      `Read the result.`,
      `Check the expanded multiplication form (for small whole exponents) and the scientific-notation version in the breakdown.`,
    ],
    why: [
      `It shows the expanded multiplication chain for small whole-number exponents, making clear that an exponent is just repeated multiplication.`,
      `It converts large or small results into scientific notation, keeping otherwise unwieldy numbers readable.`,
      `It accepts decimal bases and exponents, not just whole numbers, so it handles roots and growth rates too.`,
      `Results compute instantly in the browser, with no sign-up.`,
    ],
    faqs: [
      {
        question: `What does raising a number to a power mean?`,
        answer: `An exponent tells you how many times to multiply the base by itself. For example, 2 to the power of 5 means 2 × 2 × 2 × 2 × 2 = 32. This calculator shows that expanded chain for small whole exponents so the idea is clear.`,
      },
      {
        question: `Can I use decimal or negative exponents?`,
        answer: `Yes. A decimal exponent represents a root (for instance, raising to the power 0.5 is a square root), and a negative exponent represents a reciprocal. The calculator accepts decimals and negatives and computes the result accordingly.`,
      },
      {
        question: `Why is the answer shown in scientific notation?`,
        answer: `Powers grow or shrink fast, producing numbers with many digits. Scientific notation expresses them compactly as a value between 1 and 10 multiplied by a power of ten, which is far easier to read and compare than a long string of digits.`,
      },
      {
        question: `What is any number raised to the power of zero?`,
        answer: `Any non-zero number raised to the power of zero equals 1 — a rule that keeps the laws of exponents consistent. The calculator returns 1 for a zero exponent, and you can verify it by noticing that dividing a power by itself leaves the base to the power zero.`,
      },
    ],
    related: [
      { slug: 'root-calculator', note: `Run the inverse operation — find roots instead of powers.` },
      { slug: 'scientific-notation-calculator', note: `Convert numbers to and from scientific notation directly.` },
      { slug: 'prime-factorization-calculator', note: `Break a number into the prime powers that make it up.` },
    ],
  },

  'area-calculator': {
    intro: [
      `Finding the area of a shape means remembering the right formula, and there is a different one for every shape. This calculator collects seven of the most common — rectangle, square, circle, triangle, trapezoid, parallelogram, and ellipse — into one tool that picks the right formula and does the math once you choose a shape and enter its dimensions.`,
      `Students use it to check geometry homework; people planning real projects use it to size a room, a garden bed, or a piece of material. It returns not just the area but the perimeter (or circumference, for a circle) and shows the formula and steps, so the result is something you can learn from rather than just copy.`,
    ],
    steps: [
      `Choose your shape from the dropdown (rectangle, square, circle, triangle, trapezoid, parallelogram, or ellipse).`,
      `Enter the dimensions the chosen shape requires — the input fields change to match.`,
      `Read the calculated area in square units.`,
      `Check the perimeter or circumference and the formula breakdown shown with it.`,
    ],
    why: [
      `One tool covers seven shapes with the correct formula for each, so you do not need to look any of them up.`,
      `Input fields adapt to the chosen shape, asking only for the dimensions that shape needs.`,
      `It returns perimeter or circumference alongside area, and shows the formula and steps for learning and verification.`,
      `Everything is computed locally and instantly with no account.`,
    ],
    faqs: [
      {
        question: `Which shapes can this calculate?`,
        answer: `Seven: rectangle (length × width), square (side²), circle (π × radius²), triangle (½ × base × height), trapezoid (½ × (base1 + base2) × height), parallelogram (base × height), and ellipse (π × semi-major × semi-minor). The required inputs change with your selection.`,
      },
      {
        question: `What units does the area come out in?`,
        answer: `The area is in square units of whatever units you enter — if you input centimeters, the area is in square centimeters. The calculator does not assume a unit, so keep your inputs consistent and interpret the result in matching square units.`,
      },
      {
        question: `Does it also give the perimeter?`,
        answer: `Yes. Along with the area, it reports the perimeter for straight-sided shapes and the circumference for a circle, so you get both measurements from a single calculation.`,
      },
      {
        question: `How do I find the area of a shape that isn't listed?`,
        answer: `Break it into shapes that are. Most irregular outlines can be split into rectangles, triangles, and circle segments; calculate each piece here and add the areas together. Subtract pieces for cut-outs, such as a circular hole in a rectangular panel.`,
      },
    ],
    related: [
      { slug: 'volume-calculator', note: `Move from flat area to the volume of three-dimensional shapes.` },
      { slug: 'pythagorean-theorem-calculator', note: `Find a missing triangle side before computing its area.` },
      { slug: 'square-footage-calculator', note: `Calculate floor area in square feet for real-world projects.` },
    ],
  },

  'mean-median-mode-range-calculator': {
    intro: [
      `The four basic statistics — mean, median, mode, and range — each describe a data set in a different way, and together they give a quick, rounded summary. This calculator computes all four at once from a list of numbers, plus the count, sum, minimum, and maximum, and shows your data sorted.`,
      `Students use it to work through statistics problems; anyone summarizing a set of values — test scores, prices, measurements — uses it to capture the center and spread in one go. It handles the tricky details properly: averaging the two middle values for an even count, listing every mode when several tie, and reporting "no mode" when every value is unique.`,
    ],
    steps: [
      `Enter your numbers in the box, separated by commas, spaces, or new lines.`,
      `Read the mean, median, mode, and range together.`,
      `Check the extra figures — count, sum, minimum, and maximum.`,
      `Review the automatically sorted list of your values shown beneath.`,
    ],
    why: [
      `It computes all four core statistics — mean, median, mode, and range — in a single pass, plus count, sum, min, and max.`,
      `It handles edge cases correctly: it averages the two middle numbers for an even-sized set, lists multiple modes when there is a tie, and reports "no mode" when all values are unique.`,
      `It sorts and displays your numbers, which makes the median and range easy to verify by eye.`,
      `All processing happens locally, so your data stays private.`,
    ],
    faqs: [
      {
        question: `What is the difference between mean, median, and mode?`,
        answer: `The mean is the arithmetic average (sum divided by count). The median is the middle value when the numbers are sorted. The mode is the value that appears most often. Each can tell a different story, especially when a few extreme values skew the mean.`,
      },
      {
        question: `What happens if there is no mode?`,
        answer: `If every number appears exactly once, there is no value that repeats, so the calculator reports "no mode." When several values tie for the most frequent, it lists all of them, since a data set can legitimately have more than one mode.`,
      },
      {
        question: `How is the median found for an even number of values?`,
        answer: `With an even count there is no single middle value, so the median is the average of the two middle numbers after sorting. The calculator sorts your list and does this automatically.`,
      },
      {
        question: `What does the range tell me?`,
        answer: `The range is the difference between the largest and smallest values, a simple measure of spread. A large range signals widely scattered data, though it only reflects the extremes — for a fuller picture of spread, look at standard deviation.`,
      },
    ],
    related: [
      { slug: 'standard-deviation-calculator', note: `Measure spread more precisely than the range alone.` },
      { slug: 'average-calculator', note: `Compute just the mean when that is all you need.` },
      { slug: 'probability-calculator', note: `Move from summarizing data to calculating likelihoods.` },
    ],
  },

  // ── Batch 6: Math (13, finishes subcategory) + Other (2) ──

  'fraction-calculator': {
    intro: [
      `Fraction arithmetic trips up students and adults alike, because adding or dividing fractions means juggling common denominators and then simplifying. This calculator does all of it: pick an operation, enter two fractions, and it returns the answer fully simplified, as a mixed number, and as a decimal — with the steps shown.`,
      `It is a homework checker for students learning fractions and a quick utility for anyone scaling a recipe, splitting measurements, or working in trades where fractional inches are everyday. Because it shows the common-denominator step and the simplification, it teaches the method rather than just handing over a result.`,
    ],
    steps: [
      `Choose an operation: add, subtract, multiply, or divide.`,
      `Enter the numerator and denominator of the first fraction.`,
      `Enter the numerator and denominator of the second fraction.`,
      `Read the simplified result, its mixed-number form, and its decimal equivalent.`,
      `Follow the step-by-step breakdown to see the common denominator and simplification.`,
    ],
    why: [
      `It returns three forms at once — a simplified fraction, a mixed number, and a decimal — so you have whichever you need.`,
      `It reduces the answer to lowest terms automatically using the greatest common divisor, and shows that simplification step.`,
      `The worked steps reveal the common-denominator process, making it a genuine learning aid rather than a black box.`,
      `All arithmetic runs locally with no account required.`,
    ],
    faqs: [
      {
        question: `How do you add fractions with different denominators?`,
        answer: `You first rewrite both fractions over a common denominator, then add the numerators and keep that denominator, and finally simplify. This calculator finds the common denominator, performs the addition, and reduces the result, showing each step.`,
      },
      {
        question: `What is a mixed number?`,
        answer: `A mixed number combines a whole number with a proper fraction, like 1¾ instead of the improper fraction 7/4. The calculator shows the mixed-number form alongside the simplified fraction so you can use whichever your work calls for.`,
      },
      {
        question: `How does the calculator simplify the result?`,
        answer: `It divides both the numerator and denominator by their greatest common divisor, found with the Euclidean algorithm. That reduces the fraction to its lowest terms — for example, 6/8 becomes 3/4.`,
      },
      {
        question: `How do I divide one fraction by another?`,
        answer: `You multiply the first fraction by the reciprocal (the flip) of the second: dividing by 2/3 is the same as multiplying by 3/2. Choose the divide operation and the calculator applies this rule and simplifies the result automatically.`,
      },
    ],
    related: [
      { slug: 'percentage-calculator', note: `Convert between fractions and the percentages they represent.` },
      { slug: 'ratio-calculator', note: `Simplify and scale ratios, a close cousin of fractions.` },
      { slug: 'average-calculator', note: `Average a set of values once you have worked them out.` },
    ],
  },

  'average-calculator': {
    intro: [
      `Finding the average of a list of numbers is one of the most common quick calculations there is — grades, expenses, scores, measurements. This calculator takes a list however you have it, separated by commas, spaces, or line breaks, and returns the mean along with the sum, count, minimum, maximum, and range.`,
      `It saves the tedious tapping of adding a long column on a phone calculator. Teachers average marks, shoppers average prices, and anyone summarizing a quick data set gets the answer plus the supporting figures in one step. Pasting straight from a spreadsheet column works because it accepts line-separated values.`,
    ],
    steps: [
      `Type or paste your numbers, separated by commas, spaces, or line breaks.`,
      `Read the average (mean) immediately.`,
      `Check the supporting figures: sum, count, minimum, maximum, and range.`,
      `Review the parsed list of values shown as badges to confirm nothing was mistyped.`,
    ],
    why: [
      `It accepts numbers separated by commas, spaces, or new lines, so you can paste a spreadsheet column straight in.`,
      `Alongside the mean it reports sum, count, min, max, and range, giving a quick all-round summary from one entry.`,
      `Non-numeric entries are filtered out automatically, so a stray label does not break the calculation.`,
      `Everything is processed in your browser; nothing is uploaded.`,
    ],
    faqs: [
      {
        question: `What is the difference between average and mean?`,
        answer: `In everyday use they are the same thing — the arithmetic mean, found by adding all values and dividing by how many there are. "Average" can loosely refer to median or mode too, but this calculator computes the mean specifically.`,
      },
      {
        question: `Can I paste numbers from a spreadsheet?`,
        answer: `Yes. The calculator splits on commas, spaces, and line breaks, so a column copied from Excel or Google Sheets pastes in directly. Any non-numeric cells are ignored rather than causing an error.`,
      },
      {
        question: `Does this give the median too?`,
        answer: `No — this tool focuses on the mean plus sum, count, and range. If you need the median, mode, and range together, a mean-median-mode-range calculator covers all of those central-tendency measures.`,
      },
      {
        question: `Does the order of the numbers matter?`,
        answer: `Not for the average — the mean, sum, and count are the same regardless of order. The calculator does report the minimum and maximum, so it identifies the extremes for you without you needing to sort the list yourself.`,
      },
    ],
    related: [
      { slug: 'mean-median-mode-range-calculator', note: `Get the median and mode in addition to the mean.` },
      { slug: 'standard-deviation-calculator', note: `Measure how spread out your numbers are around the average.` },
      { slug: 'percentage-calculator', note: `Express an average as a percentage of a total.` },
    ],
  },

  'root-calculator': {
    intro: [
      `Square roots, cube roots, and higher roots all answer the same question: what number, multiplied by itself a certain number of times, gives this value? This calculator finds any root you ask for — enter a number and a root degree, and it returns the result as a decimal and in radical notation.`,
      `Students checking algebra and geometry work use it constantly, as do people working with formulas involving areas, volumes, or growth rates. Quick buttons cover the square, cube, and fourth roots for the most common cases, while the degree field handles any nth root you need.`,
    ],
    steps: [
      `Enter the number you want the root of.`,
      `Enter the root degree (2 for square root, 3 for cube root, and so on) — or tap a quick-root button.`,
      `Read the decimal result.`,
      `Check the radical-notation form and the step-by-step breakdown.`,
    ],
    why: [
      `It computes any nth root, not just square roots, so cube and higher roots are one entry away.`,
      `Quick buttons for the square, cube, and fourth roots cover the everyday cases without typing a degree.`,
      `It displays the answer in proper radical notation alongside the decimal, reinforcing the math.`,
      `Calculations happen instantly on your device with no sign-up.`,
    ],
    faqs: [
      {
        question: `What does the root degree mean?`,
        answer: `The degree is how many times the result is multiplied by itself to get your number. A degree of 2 is a square root, 3 is a cube root, 4 is a fourth root, and so on. This calculator accepts any degree you enter.`,
      },
      {
        question: `Can I take the root of a negative number?`,
        answer: `Odd roots of negatives are real — the cube root of −8 is −2, for instance. Even roots of negative numbers, like the square root of −4, are not real numbers, so those will not return a valid decimal result here.`,
      },
      {
        question: `What is radical form?`,
        answer: `Radical form writes the operation with the root symbol, such as √64 or ³√27, rather than as a decimal. The calculator shows both so you can present the answer either way, which is handy for schoolwork.`,
      },
      {
        question: `How is a root related to an exponent?`,
        answer: `Taking the nth root is the same as raising to the power of 1/n — a square root is the power 0.5, a cube root is the power one-third. That is exactly how this calculator computes roots, which is why it handles any degree you enter.`,
      },
    ],
    related: [
      { slug: 'exponent-calculator', note: `Run the inverse — raise a number to a power instead of taking a root.` },
      { slug: 'scientific-notation-calculator', note: `Express very large or small roots compactly.` },
      { slug: 'pythagorean-theorem-calculator', note: `Square roots are central to finding triangle side lengths.` },
    ],
  },

  'ratio-calculator': {
    intro: [
      `Ratios express how quantities relate — 3:2, 16:9, 1:4 — and working with them means simplifying, scaling, or solving for a missing part. This calculator simplifies a ratio to its lowest terms, scales it by any factor, and even handles three-part ratios.`,
      `Cooks scale recipes, designers reason about aspect ratios, and students simplify ratios for homework. Builders and hobbyists use it for mixing ratios like paint or concrete. Because it accepts an optional third value and a scale factor, it goes beyond simple two-part reduction to the practical cases people actually meet.`,
    ],
    steps: [
      `Enter the ratio values in fields A and B (and C for a three-part ratio).`,
      `Read the simplified ratio, reduced to its lowest whole-number terms.`,
      `Enter a scale factor to multiply the ratio up or down.`,
      `Check the scaled ratio and, for two-part ratios, the fraction form, plus the step-by-step working.`,
    ],
    why: [
      `It supports three-part ratios (A:B:C), not just two terms, covering mixes and proportions other tools cannot.`,
      `It both simplifies and scales — reducing to lowest terms and multiplying by a factor — in one place.`,
      `It shows the greatest-common-divisor steps behind the simplification, so the reduction is transparent.`,
      `It runs entirely client-side with no account.`,
    ],
    faqs: [
      {
        question: `How do you simplify a ratio?`,
        answer: `You divide every term by their greatest common divisor, the same way you reduce a fraction. For 12:8, the GCD is 4, so it simplifies to 3:2. The calculator finds the GCD across all terms and shows the division.`,
      },
      {
        question: `How do I scale a ratio up or down?`,
        answer: `Multiply each term by the same factor. To double 3:2 you get 6:4; to triple it you get 9:6. Enter a scale factor and the calculator applies it to every part of the simplified ratio.`,
      },
      {
        question: `What is the difference between a ratio and a fraction?`,
        answer: `A ratio compares quantities (3:2 means three parts to two), while a fraction expresses a part of a whole (3/5). They are related — the calculator shows a two-part ratio as a fraction — but a ratio can have more than two terms, which a single fraction cannot.`,
      },
      {
        question: `How do I keep a ratio the same when changing one quantity?`,
        answer: `Multiply or divide every term by the same number so the proportion holds. If a 2:3 paint mix needs 6 units of the first color, scale by 3 to get 6:9. Enter your ratio and a scale factor and the calculator works out the matching amounts.`,
      },
    ],
    related: [
      { slug: 'fraction-calculator', note: `Work directly with the fraction form of a two-part ratio.` },
      { slug: 'percentage-calculator', note: `Turn a ratio into a percentage of the whole.` },
      { slug: 'gcf-lcm-calculator', note: `Find the greatest common factor used to simplify ratios.` },
    ],
  },

  'rounding-calculator': {
    intro: [
      `Rounding seems simple until you need to round to a specific number of decimal places, or to the nearest ten, hundred, or thousand. This calculator rounds any number to the precision you choose and explains the decision — which digit it looked at and whether the value went up or down.`,
      `Students learning rounding rules use it to check their work; anyone presenting figures uses it to tidy decimals to a consistent precision. Support for negative decimal places means you can round to tens or hundreds, not just to decimal positions, covering both ends of the precision scale.`,
    ],
    steps: [
      `Enter the number you want to round.`,
      `Enter the number of decimal places — use a negative value to round to tens, hundreds, and beyond.`,
      `Read the rounded result.`,
      `See which digit was examined and whether the value rounded up or down in the breakdown.`,
    ],
    why: [
      `It accepts negative decimal places, so you can round to the nearest ten, hundred, or thousand, not just decimal positions.`,
      `It shows the digit it examined and the direction it rounded, making the rounding rule explicit.`,
      `It reports the original and rounded values side by side so the change is clear.`,
      `It computes instantly in your browser, free and without sign-up.`,
    ],
    faqs: [
      {
        question: `What is the standard rounding rule?`,
        answer: `Look at the digit just past your rounding position: if it is 5 or more, round up; if it is less than 5, round down. This calculator applies that rule and shows you the exact digit it checked.`,
      },
      {
        question: `How do I round to the nearest hundred?`,
        answer: `Enter a negative number of decimal places — −2 rounds to the nearest hundred, −1 to the nearest ten, and −3 to the nearest thousand. The calculator supports these negative positions directly.`,
      },
      {
        question: `What does rounding to 2 decimal places mean?`,
        answer: `It keeps two digits after the decimal point, rounding the rest away — so 3.14159 becomes 3.14. Entering 2 as the decimal places gives that result, with the breakdown showing why the third digit did not round it up.`,
      },
      {
        question: `What is the difference between rounding and truncating?`,
        answer: `Rounding adjusts the last kept digit based on what follows it, so 3.78 rounded to one decimal becomes 3.8. Truncating simply chops off the extra digits, giving 3.7. This calculator rounds; it does not merely cut the number off.`,
      },
    ],
    related: [
      { slug: 'scientific-notation-calculator', note: `Express rounded large or small numbers compactly.` },
      { slug: 'percentage-error-calculator', note: `See how rounding affects accuracy against an exact value.` },
      { slug: 'average-calculator', note: `Round the averages and sums you compute from a list.` },
    ],
  },

  'gcf-lcm-calculator': {
    intro: [
      `The greatest common factor and least common multiple are workhorses of arithmetic — you need the GCF to simplify fractions and the LCM to add them. This calculator finds both for two or more numbers at once, and shows the prime factorizations and the Euclidean-algorithm steps behind the answers.`,
      `Students use it throughout fraction work and number theory; it also turns up in scheduling problems, where the LCM tells you when repeating events coincide. Beyond the answers, it verifies them — confirming that GCF times LCM equals the product of the numbers — and lays out Euclid's method step by step.`,
    ],
    steps: [
      `Enter two or more whole numbers, separated by commas.`,
      `Read the GCF (greatest common factor) and the LCM (least common multiple).`,
      `Review the prime factorization of each number.`,
      `Follow Euclid's algorithm steps and the verification that GCF × LCM equals the product.`,
    ],
    why: [
      `It computes both the GCF and the LCM together for any list of numbers, not just a pair.`,
      `It shows each number's prime factorization and the full Euclidean-algorithm steps, making the method visible.`,
      `It verifies the result by checking that GCF × LCM equals the product of the inputs, so you can trust the answer.`,
      `It runs locally and instantly, with no sign-up.`,
    ],
    faqs: [
      {
        question: `What is the difference between GCF and LCM?`,
        answer: `The greatest common factor is the largest number that divides all your values evenly — used to simplify fractions. The least common multiple is the smallest number all your values divide into — used to find a common denominator. This calculator gives both.`,
      },
      {
        question: `How does Euclid's algorithm find the GCF?`,
        answer: `It repeatedly replaces the larger number with the remainder of dividing it by the smaller, until the remainder is zero; the last non-zero value is the GCF. The calculator shows each division step so you can follow the process.`,
      },
      {
        question: `How are GCF and LCM related?`,
        answer: `For any two numbers, their GCF multiplied by their LCM equals the product of the numbers themselves. The calculator uses this relationship as a verification check, marking the result correct when it holds.`,
      },
      {
        question: `Where is the LCM used in real life?`,
        answer: `The least common multiple answers "when do repeating cycles line up again?" — when two buses on different schedules next depart together, or when adding fractions with unlike denominators. The GCF, by contrast, shows up whenever you reduce a fraction to simplest form.`,
      },
    ],
    related: [
      { slug: 'prime-factorization-calculator', note: `See a single number broken into its prime building blocks.` },
      { slug: 'factor-calculator', note: `List every factor of a number, not just the shared ones.` },
      { slug: 'fraction-calculator', note: `Put the GCF and LCM to work simplifying and adding fractions.` },
    ],
  },

  'factor-calculator': {
    intro: [
      `Every whole number can be broken down into the smaller numbers that divide it evenly — its factors. This calculator lists all of them, pairs them up, counts them, sums them, and tells you whether the number is prime, composite, or even a perfect number.`,
      `Students use it across number theory and fraction work; puzzle solvers and programmers use it when divisibility matters. The factor pairs are especially handy for problems like finding rectangle dimensions for a given area, and the perfect-number check adds a touch of mathematical curiosity that pure factor lists miss.`,
    ],
    steps: [
      `Enter a positive whole number.`,
      `Read the full list of its factors.`,
      `Review the factor pairs, each multiplying to your number.`,
      `Check the extras: factor count, sum of factors, prime-or-composite type, and whether it is a perfect number.`,
    ],
    why: [
      `It lists factor pairs with multiplication notation, not just a flat list, which suits problems like sizing rectangles for a given area.`,
      `It classifies the number as prime or composite and flags perfect numbers, going beyond a bare factor list.`,
      `It reports the count and sum of factors, useful shortcuts for many number-theory problems.`,
      `All computation stays in your browser with no account.`,
    ],
    faqs: [
      {
        question: `What is the difference between factors and prime factors?`,
        answer: `Factors are all the numbers that divide evenly into your number, including 1 and the number itself. Prime factors are only the prime numbers among them, which multiply together to make the number. This tool lists all factors; a prime factorization tool isolates the primes.`,
      },
      {
        question: `What makes a number prime or composite?`,
        answer: `A prime number has exactly two factors, 1 and itself. A composite number has more than two. The calculator counts the factors and labels the number accordingly — note that 1 is neither prime nor composite by definition.`,
      },
      {
        question: `What is a perfect number?`,
        answer: `A perfect number equals the sum of its proper divisors (all its factors except itself). The smallest is 6, since 1 + 2 + 3 = 6. They are rare, and the calculator flags one when you happen to enter it.`,
      },
      {
        question: `How do factor pairs help with real problems?`,
        answer: `Each pair multiplies to your number, so they map directly to questions like "what rectangle dimensions give this area?" or "how can I arrange this many items into equal rows?" The calculator lists every pair, saving you from testing divisors one by one.`,
      },
    ],
    related: [
      { slug: 'prime-factorization-calculator', note: `Break the number down specifically into its prime factors.` },
      { slug: 'gcf-lcm-calculator', note: `Find common factors and multiples across several numbers.` },
      { slug: 'root-calculator', note: `Check whether a number is a perfect square or cube.` },
    ],
  },

  'prime-factorization-calculator': {
    intro: [
      `Every whole number above one is built from prime numbers multiplied together, and finding that unique combination is prime factorization. This calculator breaks any number into its prime factors, shown in exponent form, as a plain list, and as a visual factor tree.`,
      `It is a staple of school number theory and a building block for finding greatest common factors and least common multiples. The factor tree makes the decomposition visual, which helps learners see how a number splits step by step, while the exponent form (like 2² × 3 × 7) gives the compact mathematical notation.`,
    ],
    steps: [
      `Enter a whole number of 2 or more.`,
      `Read the prime factorization in exponent form.`,
      `See the same factors listed individually.`,
      `Explore the factor tree and the trial-division steps, with a verification that the factors multiply back to your number.`,
    ],
    why: [
      `It presents the factorization three ways — exponent form, a plain list, and a visual factor tree — suiting both quick reference and learning.`,
      `It shows the trial-division steps and verifies that the primes multiply back to the original number.`,
      `The factor-tree view makes the decomposition intuitive for students seeing the concept for the first time.`,
      `Everything is computed locally with nothing uploaded.`,
    ],
    faqs: [
      {
        question: `What is prime factorization?`,
        answer: `It is expressing a number as a product of prime numbers. For example, 84 = 2 × 2 × 3 × 7, or 2² × 3 × 7 in exponent form. Every integer greater than 1 has exactly one such prime factorization.`,
      },
      {
        question: `How does the calculator find the prime factors?`,
        answer: `It uses trial division: it divides the number by the smallest prime that fits, repeats with the quotient, and works upward until only 1 remains. Each division is shown so you can follow the breakdown.`,
      },
      {
        question: `What is a factor tree?`,
        answer: `A factor tree is a diagram that splits a number into two factors, then splits those further until every branch ends in a prime. It is a common classroom method, and this calculator draws one for your number.`,
      },
      {
        question: `Why does the exponent notation only show powers above one?`,
        answer: `A prime that appears once is written plainly, while a repeated prime is condensed with an exponent — so 84 shows as 2² × 3 × 7 rather than 2² × 3¹ × 7¹. Dropping the unnecessary exponents of one keeps the notation clean and standard.`,
      },
    ],
    related: [
      { slug: 'factor-calculator', note: `List all factors of the number, not only the primes.` },
      { slug: 'gcf-lcm-calculator', note: `Use prime factorizations to find common factors and multiples.` },
      { slug: 'exponent-calculator', note: `Work with the powers that appear in the exponent form.` },
    ],
  },

  'probability-calculator': {
    intro: [
      `Probability turns uncertainty into a number between 0 and 1, and the way you combine events changes the math entirely. This calculator handles the four core cases: a single event, two events both happening, either event happening, and one event given another.`,
      `Students working through statistics problems use it to check answers; anyone reasoning about chance — dice, cards, risk — uses it to get the math right. It expresses each result as a decimal, a simplified fraction, and a percentage, and for single events it also gives the odds for and against, the format gamblers and bookmakers use.`,
    ],
    steps: [
      `Choose the calculation type: P(A), P(A and B), P(A or B), or P(A given B).`,
      `Enter the total number of possible outcomes.`,
      `Enter the favorable outcomes for event A, and for event B if your calculation needs it.`,
      `Read the probability as a decimal, fraction, and percentage — plus the odds for single events — with the steps shown.`,
    ],
    why: [
      `It covers four probability types — single, intersection, union, and conditional — rather than only the basic single-event case.`,
      `It expresses each answer three ways (decimal, simplified fraction, percentage) and adds odds for and against on single events.`,
      `It shows the intermediate steps, so combined probabilities are easy to follow and learn from.`,
      `It runs in your browser instantly, with no account.`,
    ],
    faqs: [
      {
        question: `What is the difference between P(A and B) and P(A or B)?`,
        answer: `P(A and B), the intersection, is the chance both events occur. P(A or B), the union, is the chance at least one occurs, and it subtracts the overlap to avoid double-counting. The calculator handles each with the correct formula.`,
      },
      {
        question: `What is conditional probability?`,
        answer: `Conditional probability, written P(A given B), is the chance of A occurring when B is already known to have occurred. It is found by dividing the probability of both by the probability of B, which this calculator does for you.`,
      },
      {
        question: `How are probability and odds different?`,
        answer: `Probability compares favorable outcomes to all outcomes (say 1 in 4, or 0.25). Odds compare favorable to unfavorable outcomes (1 to 3). The calculator shows both for single events so you can switch between the two conventions.`,
      },
      {
        question: `Can a probability be greater than 1?`,
        answer: `No. A probability always falls between 0 (impossible) and 1 (certain), and equivalently between 0% and 100%. If a calculation seems to exceed 1, the favorable outcomes have been set higher than the total — check those two inputs.`,
      },
    ],
    related: [
      { slug: 'permutation-combination-calculator', note: `Count the arrangements and selections that feed probability problems.` },
      { slug: 'mean-median-mode-range-calculator', note: `Summarize the data sets behind your probabilities.` },
      { slug: 'percentage-calculator', note: `Convert a probability into a percentage of a total.` },
    ],
  },

  'volume-calculator': {
    intro: [
      `Calculating volume means knowing the right formula for the shape in front of you, and there is a different one for a sphere, a cylinder, a cone, and so on. This calculator gathers six common 3D shapes into one tool and computes both their volume and surface area from the dimensions you enter.`,
      `Students check geometry homework with it; in the real world people use it to size a tank, estimate how much water a container holds, or work out material for a project. Returning surface area alongside volume is a bonus that matters whenever you also need to know how much material wraps the outside.`,
    ],
    steps: [
      `Select a shape: sphere, cube, cylinder, rectangular prism, cone, or square-based pyramid.`,
      `Enter the dimensions the shape requires — the fields change to match.`,
      `Read the volume in cubic units.`,
      `Check the surface area and the formula breakdown shown with it.`,
    ],
    why: [
      `It covers six 3D shapes with the correct volume formula for each, so you never have to look one up.`,
      `It computes surface area as well as volume, useful whenever material or coating matters, not just capacity.`,
      `It displays the formula with your values substituted and a step-by-step breakdown.`,
      `It calculates locally and instantly without sign-up.`,
    ],
    faqs: [
      {
        question: `Which shapes can this calculate?`,
        answer: `Six: sphere, cube, cylinder, rectangular prism (box), cone, and square-based pyramid. Selecting a shape reveals only the dimension fields it needs, such as radius and height for a cylinder.`,
      },
      {
        question: `What units is the volume in?`,
        answer: `It is in cubic units of whatever units you enter — input centimeters and the volume is in cubic centimeters. Keep your dimensions in one consistent unit and read the result in the matching cubic unit.`,
      },
      {
        question: `Why does it also show surface area?`,
        answer: `Volume tells you capacity, but surface area tells you how much material covers the outside — paint, packaging, or sheet metal. Many real projects need both, so the calculator provides them together for each shape.`,
      },
      {
        question: `How do I convert a volume into liters or gallons?`,
        answer: `Compute the volume in cubic centimeters and divide by 1,000 for liters (1 liter is 1,000 cm³), or work in cubic inches and divide by 231 for US gallons. Keep your input dimensions in a matching unit first, then apply the conversion to the result.`,
      },
    ],
    related: [
      { slug: 'area-calculator', note: `Calculate flat, two-dimensional area for the same kinds of shapes.` },
      { slug: 'square-footage-calculator', note: `Estimate floor or surface area for real-world projects.` },
      { slug: 'pythagorean-theorem-calculator', note: `Find slant heights and diagonals needed for some volume formulas.` },
    ],
  },

  'pythagorean-theorem-calculator': {
    intro: [
      `The Pythagorean theorem — a² + b² = c² — relates the three sides of a right triangle, and this calculator solves for whichever side you are missing. Tell it which side to find, enter the other two, and it returns the answer with the algebra and a triangle diagram.`,
      `Students lean on it throughout geometry and trigonometry; in practice, carpenters, builders, and DIYers use it to check that corners are square and to find diagonal lengths. Because it solves for any side — not just the hypotenuse — it handles the full range of right-triangle problems, and the visual diagram makes clear which side is which.`,
    ],
    steps: [
      `Choose which side to solve for: side a, side b, or the hypotenuse c.`,
      `Enter the two sides you know.`,
      `Read the calculated length of the missing side.`,
      `Review the formula derivation and the triangle diagram that highlights the side you solved for.`,
    ],
    why: [
      `It solves for any of the three sides, not just the hypotenuse, covering every right-triangle case.`,
      `It includes a triangle diagram that updates to show which side you are finding, anchoring the algebra visually.`,
      `It shows the full derivation, from squaring the known sides to the final square root.`,
      `It runs entirely in your browser, free and private.`,
    ],
    faqs: [
      {
        question: `What is the Pythagorean theorem?`,
        answer: `For a right triangle, the square of the hypotenuse (the longest side, opposite the right angle) equals the sum of the squares of the other two sides: a² + b² = c². It only applies to right triangles.`,
      },
      {
        question: `How do I find a leg instead of the hypotenuse?`,
        answer: `Rearrange the formula: a = √(c² − b²). Choose to solve for side a or b, enter the hypotenuse and the other leg, and the calculator subtracts and takes the square root for you.`,
      },
      {
        question: `How is this used to check a square corner?`,
        answer: `Builders use the 3-4-5 rule: if a corner's two sides measure 3 and 4 units, the diagonal should be exactly 5 for a true right angle. You can verify any such measurement by solving for the hypotenuse here.`,
      },
      {
        question: `Does the theorem work for any triangle?`,
        answer: `No — it applies only to right triangles, those with a 90-degree angle. For triangles without a right angle you need the law of cosines or law of sines instead. This calculator assumes a right triangle in every mode.`,
      },
    ],
    related: [
      { slug: 'area-calculator', note: `Find a triangle's area once you know its sides.` },
      { slug: 'root-calculator', note: `The theorem relies on square roots, which you can compute separately.` },
      { slug: 'quadratic-formula-calculator', note: `Solve other equations that involve squared terms.` },
    ],
  },

  'quadratic-formula-calculator': {
    intro: [
      `The quadratic formula solves any equation of the form ax² + bx + c = 0, and this calculator applies it in full — including the cases where the answers are repeated or complex. Enter the three coefficients and it returns the roots, the discriminant, the vertex, and the axis of symmetry.`,
      `It is a constant companion in algebra and precalculus, where solving quadratics and analyzing parabolas is bread-and-butter work. By computing the discriminant first, it correctly identifies whether you get two real roots, one repeated root, or a complex conjugate pair — and it shows the complex answers properly rather than just failing when the discriminant is negative.`,
    ],
    steps: [
      `Enter coefficient a (it cannot be zero, or the equation is not quadratic).`,
      `Enter coefficients b and c.`,
      `Read the roots, with complex roots shown in proper a + bi form when the discriminant is negative.`,
      `Check the discriminant, vertex, and axis of symmetry, along with the worked formula.`,
    ],
    why: [
      `It handles all three discriminant cases — two real roots, one repeated root, and complex conjugate roots — instead of breaking on a negative discriminant.`,
      `It computes the vertex and axis of symmetry too, so you can analyze the parabola, not just solve for x.`,
      `It shows the discriminant and the full formula substitution, making the method clear.`,
      `It runs locally with no account.`,
    ],
    faqs: [
      {
        question: `What is the discriminant and why does it matter?`,
        answer: `The discriminant is b² − 4ac, the part under the square root in the quadratic formula. Its sign tells you the nature of the roots: positive gives two real roots, zero gives one repeated root, and negative gives a pair of complex roots.`,
      },
      {
        question: `What happens when the discriminant is negative?`,
        answer: `The equation has no real solutions, but it has two complex conjugate roots. This calculator computes them and displays them in the form a + bi rather than simply reporting "no solution".`,
      },
      {
        question: `What are the vertex and axis of symmetry?`,
        answer: `The vertex is the turning point of the parabola the equation describes, and the axis of symmetry is the vertical line through it, at x = −b/(2a). The calculator reports both so you can sketch or analyze the curve.`,
      },
      {
        question: `Why must coefficient a be non-zero?`,
        answer: `If a is zero, the x² term disappears and the equation is linear, not quadratic — and the formula would divide by zero. The calculator requires a non-zero a; for a linear equation, solve bx + c = 0 directly instead.`,
      },
    ],
    related: [
      { slug: 'exponent-calculator', note: `Work with the squared terms at the heart of a quadratic.` },
      { slug: 'root-calculator', note: `Compute the square roots the quadratic formula requires.` },
      { slug: 'pythagorean-theorem-calculator', note: `Another classic equation built on squares.` },
    ],
  },

  'scientific-notation-calculator': {
    intro: [
      `Very large and very small numbers are unwieldy in standard form, which is why science writes them as a value times a power of ten. This calculator converts numbers to and from scientific notation, and even performs arithmetic — add, subtract, multiply, or divide — directly on numbers in that form.`,
      `Students and anyone working in science or engineering use it to move between 0.00000045 and 4.5 × 10⁻⁷ without miscounting zeros, and to combine such numbers correctly. The operate mode is the real time-saver: it handles the exponent bookkeeping and re-normalizes the result so the mantissa stays in the proper range.`,
    ],
    steps: [
      `Choose a mode: Convert (between standard and scientific form) or Operate (arithmetic on two scientific numbers).`,
      `In Convert mode, enter a standard number to see its scientific form, or a mantissa and exponent to see the standard value.`,
      `In Operate mode, pick an operation and enter the mantissa and exponent of each number.`,
      `Read the result in scientific notation and standard form, with the normalization steps shown.`,
    ],
    why: [
      `It works both directions — converting standard numbers to scientific notation and back — in one place.`,
      `Its operate mode does arithmetic on scientific-notation numbers and re-normalizes the result so the mantissa stays between 1 and 10.`,
      `It shows the standard form with thousands separators alongside the scientific form for easy reading.`,
      `Everything is computed in your browser instantly.`,
    ],
    faqs: [
      {
        question: `What is scientific notation?`,
        answer: `Scientific notation writes a number as a mantissa between 1 and 10 multiplied by a power of ten — for example, 4,500 becomes 4.5 × 10³. It makes very large or very small numbers compact and easy to compare.`,
      },
      {
        question: `How do I multiply numbers in scientific notation?`,
        answer: `Multiply the mantissas and add the exponents, then normalize so the mantissa stays between 1 and 10. The operate mode does this automatically — enter both numbers and choose multiply.`,
      },
      {
        question: `What does normalizing the mantissa mean?`,
        answer: `After an operation the mantissa can fall outside the 1-to-10 range; normalizing shifts the decimal point and adjusts the exponent to bring it back. The calculator shows this step so the final notation is in proper form.`,
      },
      {
        question: `How do I write a small number like 0.00045 in scientific notation?`,
        answer: `Small numbers use a negative exponent: 0.00045 becomes 4.5 × 10⁻⁴, because the decimal point moves four places to the right to reach 4.5. Enter the standard number in Convert mode and the calculator produces the negative-exponent form for you.`,
      },
    ],
    related: [
      { slug: 'exponent-calculator', note: `Work directly with the powers of ten behind scientific notation.` },
      { slug: 'root-calculator', note: `Take roots of very large or small values.` },
      { slug: 'rounding-calculator', note: `Round a mantissa to a sensible number of significant figures.` },
    ],
  },

  'time-calculator': {
    intro: [
      `Adding and subtracting times is fiddly because there are 60 minutes in an hour, not 100, so ordinary arithmetic gives wrong answers. This calculator handles time properly: add two durations, subtract one from another, or find the gap between two clock times, in 12-hour or 24-hour format.`,
      `People use it to add up durations — total runtime of several recordings, combined task times — or to work out how far apart two moments are. The result comes back both as hours, minutes, and seconds and as decimal totals, which is handy when you need to feed the figure into something else.`,
    ],
    steps: [
      `Choose a mode: Add, Subtract, or Difference.`,
      `Pick 12-hour or 24-hour format.`,
      `Enter the two times using the hour, minute, and second fields (and AM/PM in 12-hour mode).`,
      `Read the result in HH:MM:SS, plus decimal totals in hours, minutes, and seconds.`,
    ],
    why: [
      `It does time arithmetic correctly, respecting 60-minute hours so your totals are not thrown off by decimal math.`,
      `It offers add, subtract, and difference modes and both 12- and 24-hour input.`,
      `It returns the answer in HH:MM:SS and as decimal hours, minutes, and seconds, ready to reuse elsewhere.`,
      `It runs locally with no sign-up.`,
    ],
    faqs: [
      {
        question: `Why can't I just add times like normal numbers?`,
        answer: `Because time is base-60, not base-10. Adding 1:45 and 0:30 as decimals would suggest 2:75, but the correct answer is 2:15, since 75 minutes is an hour and 15 minutes. This calculator handles that carry-over for you.`,
      },
      {
        question: `What is the difference between the Subtract and Difference modes?`,
        answer: `Both report the gap between two times as a positive amount. They behave the same way here, returning the absolute difference, so you can use whichever label fits how you are thinking about the problem.`,
      },
      {
        question: `Can it convert a time to decimal hours?`,
        answer: `Yes. Alongside the HH:MM:SS result, it shows the total as decimal hours (and minutes and seconds), so 2:30 also appears as 2.5 hours — useful for timesheets and further calculations.`,
      },
      {
        question: `Can it add up more than two times at once?`,
        answer: `This calculator works with two times per operation. To total several durations, add the first two, then add the running total to the next one, and so on. For tracking many daily entries at once, an hours calculator is the better fit.`,
      },
    ],
    related: [
      { slug: 'hours-calculator', note: `Track work hours across days, with breaks, overtime, and pay.` },
      { slug: 'date-calculator', note: `Work with whole dates rather than times within a day.` },
      { slug: 'time-zone-calculator', note: `Convert a time between different time zones.` },
    ],
  },

  'hours-calculator': {
    intro: [
      `Working out a timesheet by hand — start time, end time, minus the lunch break, across several days — is exactly the kind of arithmetic that invites mistakes. This calculator adds it all up: enter each day's start and end times and break, and it totals your hours, splits them into regular and overtime, and can even compute your pay.`,
      `Hourly workers use it to check a paycheck, freelancers to total billable time, and managers to tally a team member's week. It handles overnight shifts where the end time is earlier than the start, deducts break minutes per day, and applies a 1.5× rate to hours over your overtime threshold when you enter an hourly rate.`,
    ],
    steps: [
      `Add a row for each day, entering its start time, end time, and break in minutes.`,
      `Set your weekly overtime threshold (40 hours by default).`,
      `Optionally enter your hourly rate to calculate pay.`,
      `Read the total, regular, and overtime hours, plus regular, overtime, and total pay if a rate was given.`,
    ],
    why: [
      `It tracks multiple days at once and sums the week, rather than making you total each day separately.`,
      `It detects overnight shifts (end time before start) and adds the wraparound automatically, and deducts each day's break.`,
      `It splits hours into regular and overtime at your threshold and applies a 1.5× overtime pay multiplier when you add a rate.`,
      `All calculations run in your browser, so your work and pay details stay private.`,
    ],
    faqs: [
      {
        question: `How does it handle an overnight shift?`,
        answer: `If the end time is earlier than the start time — say a shift from 22:00 to 06:00 — the calculator recognizes it crosses midnight and adds 24 hours so the duration comes out correctly rather than negative.`,
      },
      {
        question: `How is overtime calculated?`,
        answer: `Hours up to your weekly threshold (40 by default) count as regular; anything above counts as overtime. If you enter an hourly rate, overtime is paid at 1.5 times that rate, which is a common standard, while regular hours are paid at the base rate.`,
      },
      {
        question: `Are breaks subtracted from my hours?`,
        answer: `Yes. The break minutes you enter for each day are deducted from that day's worked time, so an 8-hour shift with a 30-minute unpaid break counts as 7.5 hours.`,
      },
      {
        question: `Does it calculate pay automatically?`,
        answer: `Only if you enter an hourly rate. Leave it blank and the calculator just totals your hours; add a rate and it works out regular pay, overtime pay at 1.5×, and the combined total.`,
      },
    ],
    related: [
      { slug: 'time-calculator', note: `Add or subtract individual times without the timesheet structure.` },
      { slug: 'salary-calculator', note: `Convert your hourly rate to weekly, monthly, or annual pay.` },
      { slug: 'time-zone-calculator', note: `Coordinate work hours across different time zones.` },
    ],
  },

  // ── Batch 7: Other calculators (12, finishes all 88 calculators) ──

  'date-calculator': {
    intro: [
      `Counting the days between two dates by hand means wrestling with month lengths and leap years, and it is easy to be off by one. This calculator takes a start and end date and tells you the span in days, weeks, months, and years — and can count only working days when weekends should not count.`,
      `People use it to find how many days until a deadline, how long ago something happened, or how many business days a project window actually contains. The working-days option is what sets it apart for anyone planning around a Monday-to-Friday schedule, and an "include end date" toggle handles whether the final day counts.`,
    ],
    steps: [
      `Pick the start date.`,
      `Pick the end date (use the swap button if you entered them in the wrong order).`,
      `Toggle "include end date" if the final day should count, and "working days only" to exclude weekends.`,
      `Read the span in days, weeks, months, and years, plus the working-day count when enabled.`,
    ],
    why: [
      `It can count working days only, excluding Saturdays and Sundays — useful for business and project timelines, not just raw calendar days.`,
      `It expresses the gap four ways at once (days, weeks, months, years), so you get the unit you need without extra math.`,
      `An "include end date" toggle and a swap button handle the off-by-one and wrong-order mistakes that trip up manual counting.`,
      `It works entirely in your browser, so your dates stay private.`,
    ],
    faqs: [
      {
        question: `Does the calculation include both the start and end dates?`,
        answer: `By default it counts the gap between the dates, not the end date itself. Turn on "include end date" to count the final day too — useful when you want the total number of days in a range rather than the difference between them.`,
      },
      {
        question: `How are working days counted?`,
        answer: `With "working days only" enabled, the calculator steps through each day in the range and counts only Mondays through Fridays, skipping weekends. Note that it does not account for public holidays, which vary by country and region.`,
      },
      {
        question: `Why might the months figure look approximate?`,
        answer: `Months vary in length, so the calculator derives months from the total day count using an average year length. For exact calendar-month differences, the day count is the most precise figure to rely on.`,
      },
      {
        question: `Can I count down to a future event?`,
        answer: `This calculator measures the span between two chosen dates. To count down to an event, set the start to today and the end to the event date; the day count tells you how long remains, and the working-days option shows the business days left.`,
      },
    ],
    related: [
      { slug: 'age-calculator', note: `Calculate an exact age in years, months, and days from a birth date.` },
      { slug: 'time-calculator', note: `Work with times within a day rather than whole dates.` },
      { slug: 'hours-calculator', note: `Total worked hours across a set of days.` },
    ],
  },

  'gpa-calculator': {
    intro: [
      `Your GPA condenses a semester of grades into a single number, but calculating it means weighting each course by its credit hours — and weighting honors or AP classes higher still. This calculator handles all of that: enter each course's grade, credits, and type, and it computes your semester GPA, with an option to roll in your previous record for a cumulative figure.`,
      `Students use it to project a semester before grades are final, to see how one class will move their average, or to confirm a registrar's number. Support for weighted course types and a 4.0 or 5.0 scale means it works for standard transcripts and weighted honors systems alike.`,
    ],
    steps: [
      `Choose the 4.0 or 5.0 GPA scale.`,
      `Add each course with its grade, credit hours, and type (regular, honors, AP, or IB).`,
      `Optionally enter your previous GPA and total credits for a cumulative result.`,
      `Read your semester GPA, cumulative GPA, total credits, and a grade breakdown.`,
    ],
    why: [
      `It weights honors, AP, and IB courses above regular ones, reflecting how weighted GPAs are actually calculated rather than treating every course equally.`,
      `It supports both the 4.0 and 5.0 scales and computes a cumulative GPA when you supply prior credits.`,
      `It shows total quality points and a per-grade breakdown, so you can see exactly how the average was built.`,
      `Calculations happen in your browser with no account.`,
    ],
    faqs: [
      {
        question: `How is GPA calculated?`,
        answer: `Each course's grade is converted to grade points, multiplied by its credit hours (and a weight for honors or AP), to give quality points. GPA is the total quality points divided by the total credits, so higher-credit courses count more toward the average.`,
      },
      {
        question: `What is the difference between weighted and unweighted GPA?`,
        answer: `An unweighted GPA treats every course on the same scale, while a weighted GPA gives extra points to harder courses like honors, AP, or IB. This calculator applies those weights when you mark a course's type, raising its contribution to the average.`,
      },
      {
        question: `How do I calculate my cumulative GPA?`,
        answer: `Enter your previous cumulative GPA and the total credits it covers, alongside this semester's courses. The calculator combines the prior quality points with the new ones to produce an updated cumulative GPA across all credits.`,
      },
      {
        question: `What GPA scale should I use?`,
        answer: `Use the scale your school reports on — 4.0 is the most common unweighted scale, while 5.0 scales are often used where weighted honors and AP grades can exceed 4.0. The toggle lets you match whichever your institution uses.`,
      },
    ],
    related: [
      { slug: 'grade-calculator', note: `Work out your grade in a single class from its assignments.` },
      { slug: 'percentage-calculator', note: `Convert raw scores into the percentages behind your grades.` },
      { slug: 'average-calculator', note: `Average a set of scores without credit weighting.` },
    ],
  },

  'grade-calculator': {
    intro: [
      `Knowing your current grade in a class — and what each assignment contributes — takes more than averaging scores, because categories like exams, homework, and projects usually carry different weights. This calculator builds that weighted picture: set up your categories and their weights, enter your assignments, and it computes your overall grade and letter.`,
      `Students use it to track where they stand mid-semester and to figure out what they need on a final to hit a target. The per-category "drop lowest" option mirrors real syllabi that forgive your worst quiz or homework, giving a grade that matches how the class is actually scored.`,
    ],
    steps: [
      `Create your grading categories (such as Homework, Exams, Projects) and set each one's weight.`,
      `Add the assignments within each category, entering the grade and weight for each.`,
      `Enable "drop lowest grade" on any category that forgives your worst score.`,
      `Read your current overall grade as a percentage and letter, with a per-category breakdown.`,
    ],
    why: [
      `It models weighted categories with nested assignments, matching syllabi where exams and homework count differently rather than averaging everything flat.`,
      `A per-category "drop lowest" option reflects classes that discard your worst score, so the result matches your real standing.`,
      `It converts the weighted percentage to a letter grade and breaks the total down by category.`,
      `Everything is computed locally, so your grades stay private.`,
    ],
    faqs: [
      {
        question: `How is a weighted grade calculated?`,
        answer: `Each category's average is multiplied by its weight, and those weighted values are summed and divided by the total weight. So if exams are 50% of your grade and you average 90 on them, exams contribute 45 points toward your overall percentage.`,
      },
      {
        question: `What does "drop the lowest grade" do?`,
        answer: `When enabled for a category, the calculator removes that category's single lowest-scoring assignment before averaging it. This mirrors syllabi that drop your weakest quiz or homework, which usually raises the category average.`,
      },
      {
        question: `How do I figure out what I need on the final exam?`,
        answer: `Enter your current grades and the final as an assignment in its category, then try different scores for it to see how each moves your overall grade. Adjust until the result reaches your target to find the score you need.`,
      },
      {
        question: `What is the difference between weighted and points-based grading?`,
        answer: `Weighted grading assigns each category a percentage of the final grade regardless of how many points it contains, while points-based grading simply totals points earned over points possible. This calculator uses the weighted approach, which most syllabi with categories like "exams 50%, homework 20%" follow.`,
      },
    ],
    related: [
      { slug: 'gpa-calculator', note: `Combine your class grades into a semester or cumulative GPA.` },
      { slug: 'percentage-calculator', note: `Turn points earned into a percentage for any single assignment.` },
      { slug: 'average-calculator', note: `Average scores quickly when no weighting is involved.` },
    ],
  },

  'fuel-cost-calculator': {
    intro: [
      `Before a road trip or a daily commute, it helps to know what the fuel will actually cost. This calculator works it out from your distance, your vehicle's efficiency, and the price of fuel, and it can compare several vehicles to show which is cheapest to drive.`,
      `Travelers budget trips with it, commuters weigh the running cost of one car against another, and anyone deciding whether to drive or take another option puts a number on the journey. It works in both imperial (miles, gallons, MPG) and metric (kilometers, liters, L/100km) units, with a round-trip toggle so you do not have to double the distance yourself.`,
    ],
    steps: [
      `Choose imperial or metric units.`,
      `Enter the distance, and tick "round trip" if you are returning.`,
      `Enter your vehicle's fuel efficiency and the price of fuel.`,
      `Read the total cost, fuel needed, and cost per mile or kilometer — and add vehicles to compare their running costs.`,
    ],
    why: [
      `It supports both imperial (MPG) and metric (L/100km) units with the correct conversions, so it works wherever you are.`,
      `A vehicle-comparison feature ranks multiple cars by running cost and shows the savings between the cheapest and priciest.`,
      `A round-trip toggle and a cost-per-distance figure give you the numbers that matter for budgeting a journey.`,
      `It runs entirely in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `How do I calculate the fuel cost of a trip?`,
        answer: `Divide the distance by your fuel efficiency to find how much fuel you need, then multiply by the price per unit. The calculator does this in either unit system — for metric it uses the L/100km method instead of dividing.`,
      },
      {
        question: `What is the difference between MPG and L/100km?`,
        answer: `MPG (miles per gallon) measures distance per unit of fuel, so higher is better. L/100km measures fuel per fixed distance, so lower is better. They run in opposite directions, which is why the calculator handles each with its own formula.`,
      },
      {
        question: `How does the vehicle comparison work?`,
        answer: `Add each vehicle with its fuel efficiency, and the calculator computes the trip cost for all of them at the same distance and fuel price, then ranks them and shows how much you save by choosing the most efficient one.`,
      },
      {
        question: `Does this include tolls, parking, or wear and tear?`,
        answer: `No — it estimates fuel cost only. The true cost of driving also includes tolls, parking, maintenance, and depreciation, so treat the result as the fuel portion of a trip rather than its total cost.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert between miles and kilometers or gallons and liters.` },
      { slug: 'time-zone-calculator', note: `Plan arrival times when your trip crosses time zones.` },
      { slug: 'percentage-calculator', note: `Work out the percentage savings between two vehicles.` },
    ],
  },

  'random-number-generator': {
    intro: [
      `Whether you are drawing a raffle winner, picking lottery numbers, or seeding a simulation, you need randomness you can trust. This generator produces random numbers within any range you set, using your browser's cryptographically secure random source rather than a basic, predictable one.`,
      `It is built for the full spread of needs: generate one number or up to a thousand, allow or forbid duplicates, sort the output, and even produce decimals to a set number of places. Teachers randomize, contest runners draw winners, and developers grab quick test data, then copy the results or download them as a CSV.`,
    ],
    steps: [
      `Set the minimum and maximum of your range.`,
      `Choose how many numbers to generate (1 to 1,000) and how many decimal places, if any.`,
      `Tick "unique numbers only" to forbid duplicates, and "sort results" to order them.`,
      `Generate, then copy the numbers or download them as a CSV; recent generations are kept in history.`,
    ],
    why: [
      `It draws from your browser's cryptographically secure random source (crypto.getRandomValues), not the weaker Math.random, so the results are genuinely unpredictable.`,
      `It can enforce unique numbers, sort the output, and produce decimals — covering draws, sampling, and simulation in one tool.`,
      `Results export as CSV or copy to the clipboard, and a history keeps your last several generations.`,
      `Everything runs locally with no account.`,
    ],
    faqs: [
      {
        question: `Are these numbers truly random?`,
        answer: `They are cryptographically secure pseudo-random numbers from your browser's crypto API, which is far less predictable than ordinary random functions. For raffles, sampling, and general use this is effectively random; it is not, however, certified for regulated gambling.`,
      },
      {
        question: `How do I draw numbers without repeats?`,
        answer: `Enable "unique numbers only". The generator then ensures no value appears twice — useful for raffles or lottery picks. Just make sure your range is at least as large as the count you request, or unique numbers cannot fill it.`,
      },
      {
        question: `Can it generate decimals, not just whole numbers?`,
        answer: `Yes. Set the number of decimal places above zero and the generator returns decimal values within your range, rounded to that precision — handy for simulations or random measurements.`,
      },
      {
        question: `Are the minimum and maximum included in the range?`,
        answer: `Yes. For whole numbers the range is inclusive of both ends, so a range of 1 to 10 can produce both 1 and 10. Set the bounds to exactly the smallest and largest values you want to allow.`,
      },
    ],
    related: [
      { slug: 'dice-roller', note: `Roll virtual dice for games using the same secure randomness.` },
      { slug: 'uuid-generator', note: `Generate unique identifiers rather than numbers in a range.` },
      { slug: 'password-generator', note: `Produce strong random passwords from a secure source.` },
    ],
  },

  'dice-roller': {
    intro: [
      `Lost your dice, or need a fistful of them for a tabletop game? This dice roller covers the standard polyhedral set — D4, D6, D8, D10, D12, and D20 — plus any custom-sided die you define, and rolls them with cryptographically secure randomness so every result is fair.`,
      `Tabletop and role-playing gamers use it to roll attack and damage dice, board gamers use it when the physical dice go missing, and teachers use it for classroom games. You can stack multiple dice of different types, roll them all at once, and see each individual result alongside the totals.`,
    ],
    steps: [
      `Tap the standard dice (D4 through D20) to add them, or define a custom die by sides and count.`,
      `Adjust the count for any die in your selection.`,
      `Click "roll dice" to roll everything at once.`,
      `Read each die's individual results and per-type sum, plus the grand total; recent rolls are kept in history.`,
    ],
    why: [
      `It uses cryptographically secure randomness (crypto.getRandomValues), so rolls are genuinely fair rather than subtly biased.`,
      `It supports the full standard polyhedral set plus custom-sided dice, and lets you roll many at once.`,
      `It shows every individual roll and the sums, with a history of recent rolls for reference.`,
      `Rolls happen instantly in your browser, with nothing to sign up for.`,
    ],
    faqs: [
      {
        question: `What do D6, D20, and similar notations mean?`,
        answer: `The D stands for "die" and the number is how many sides it has — a D6 is a standard six-sided cube, a D20 is the twenty-sided die common in role-playing games. You can add any of these or define a custom number of sides.`,
      },
      {
        question: `Can I roll several dice at the same time?`,
        answer: `Yes. Add as many dice as you need, of mixed types, set the count for each, and roll them together. The results show each die's individual values, the sum per die type, and the overall total.`,
      },
      {
        question: `Are the rolls fair?`,
        answer: `They are generated with your browser's cryptographically secure random source, giving each face an equal chance — fairer than many simple random functions and free from the slight imbalances a physical die can have.`,
      },
      {
        question: `Can I create a die with an unusual number of sides?`,
        answer: `Yes. Beyond the standard set, the custom-dice option lets you define any number of sides — a D100 for percentile rolls, or a D3, D7, or whatever a game calls for — and roll any quantity of them alongside the standard dice.`,
      },
    ],
    related: [
      { slug: 'random-number-generator', note: `Generate random numbers in any range, not just dice values.` },
      { slug: 'probability-calculator', note: `Work out the odds of a particular dice result.` },
      { slug: 'permutation-combination-calculator', note: `Count the possible outcomes across multiple dice.` },
    ],
  },

  'shoe-size-converter': {
    intro: [
      `Buying shoes from another country means decoding a different sizing system, and a US 9 is not a UK 9 or an EU 9. This converter translates a shoe size between US, UK, EU, and centimeter scales, with separate formulas for men, women, and kids.`,
      `Online shoppers use it when a store lists only one region's sizes, travelers use it abroad, and parents use the kids setting for fast-growing feet. By converting through the underlying foot length in centimeters, it keeps the cross-region results consistent rather than relying on a rough lookup.`,
    ],
    steps: [
      `Select the wearer: men, women, or kids.`,
      `Enter a size and choose which region it is in (US, EU, UK, or CM).`,
      `Read the equivalent sizes in all the other systems.`,
      `Use the centimeter figure as the most reliable cross-check when buying online.`,
    ],
    why: [
      `It uses separate conversion formulas for men, women, and kids, since the same number means different lengths across those categories.`,
      `It converts through actual foot length in centimeters, which keeps US, UK, and EU results consistent with one another.`,
      `It shows all four systems at once, so one entry answers whichever region a store uses.`,
      `It runs locally and instantly with no account.`,
    ],
    faqs: [
      {
        question: `Why isn't a US size the same as a UK size?`,
        answer: `The US and UK scales start counting from different points, so the same foot maps to different numbers — a US men's size is roughly half a size larger than the UK equivalent. EU sizing uses an entirely different scale based on length. That is why a converter is needed.`,
      },
      {
        question: `Which measurement is most reliable for ordering online?`,
        answer: `The centimeter measurement of your foot length is the most dependable, because it does not depend on a brand's interpretation of a size number. Measure your foot, convert here, and compare against a retailer's size chart in centimeters when possible.`,
      },
      {
        question: `Do men's and women's sizes really differ?`,
        answer: `Yes. For the same foot length, men's and women's size numbers differ by roughly one and a half sizes in the US system, which is why this converter asks you to select the wearer before converting.`,
      },
      {
        question: `Are converted sizes exact across every brand?`,
        answer: `No conversion is perfect, because brands cut shoes differently and some run large or small. Use the result as a strong starting point, then check the specific brand's size guide and reviews, especially when you cannot try the shoes on.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert the underlying foot length between centimeters and inches.` },
      { slug: 'time-zone-calculator', note: `Another tool for navigating differences across regions when shopping abroad.` },
    ],
  },

  'time-zone-calculator': {
    intro: [
      `Scheduling across time zones is where good plans fall apart — a call set for "3 PM" means little without knowing whose 3 PM. This calculator converts a date and time from one zone to another and shows the exact offset, and it can line up several cities at once.`,
      `Remote teams use it to find a meeting time that works across continents, travelers use it to know what time it is back home, and anyone coordinating a livestream or call uses it to avoid the classic off-by-an-hour mistake. It covers twelve major world zones and stays accurate through daylight saving changes by using your browser's built-in time-zone data.`,
    ],
    steps: [
      `Set the date and time you want to convert.`,
      `Choose the "from" time zone and the "to" time zone.`,
      `Read the converted time and the offset in hours between the two zones.`,
      `Add more cities to compare several zones against the same moment at once.`,
    ],
    why: [
      `It is daylight-saving aware, using your browser's native time-zone database rather than fixed offsets that go stale when clocks change.`,
      `It can compare multiple cities against one moment, which is what you actually need to schedule across a team.`,
      `It shows the precise hour offset between zones alongside the converted time.`,
      `It runs entirely in your browser with no network calls or account.`,
    ],
    faqs: [
      {
        question: `Does this account for daylight saving time?`,
        answer: `Yes. It uses your browser's built-in time-zone information, which knows each region's daylight-saving rules, so conversions stay correct whether or not the cities involved are currently observing summer time.`,
      },
      {
        question: `Which time zones are supported?`,
        answer: `It covers twelve major zones spanning the Americas, Europe, Asia, the Middle East, and Oceania — including New York, London, Paris, Tokyo, Shanghai, Dubai, Sydney, and Auckland — enough to coordinate most international schedules.`,
      },
      {
        question: `Why is the offset between two cities not a whole number sometimes?`,
        answer: `Some regions use half-hour or 45-minute offsets, and daylight-saving transitions can shift the gap between two cities. The calculator reports the actual offset for the date you choose, so it reflects these real-world quirks.`,
      },
      {
        question: `Why set a specific date rather than just convert "now"?`,
        answer: `Because the offset between two cities can change on different dates as each enters or leaves daylight saving at different times. Choosing the actual date of your meeting or trip ensures the conversion is correct for that day, not just for today.`,
      },
    ],
    related: [
      { slug: 'time-calculator', note: `Add or subtract times once you know the zone difference.` },
      { slug: 'date-calculator', note: `Count the days between dates across your schedule.` },
      { slug: 'hours-calculator', note: `Total work hours for teams spread across zones.` },
    ],
  },

  'square-footage-calculator': {
    intro: [
      `Whether you are buying flooring, ordering paint, or listing a property, you need the area of a space in square feet — and rooms are rarely a single simple rectangle. This calculator totals the area across multiple rooms, handles rectangular, circular, and triangular shapes, and even estimates the flooring and paint you will need.`,
      `Homeowners and renters measure rooms for renovations, real-estate agents total a floor plan, and DIYers size a project before buying materials. Adding rooms one by one and summing them means an L-shaped space or a whole apartment is handled in one calculation, with a built-in material estimate to take to the store.`,
    ],
    steps: [
      `Choose your units: feet, meters, or yards.`,
      `Add each room, pick its shape (rectangle, circle, or triangle), and enter its dimensions.`,
      `Read the total area across all rooms, plus the perimeter of rectangular rooms.`,
      `Use the flooring and paint estimates, which add waste and coats, when buying materials.`,
    ],
    why: [
      `It sums multiple rooms of different shapes in one go, so an irregular layout does not need separate calculations.`,
      `It estimates materials — flooring with a 10% waste allowance and paint for two coats — turning area into a shopping list.`,
      `It supports feet, meters, and yards and reports rectangular perimeters alongside area.`,
      `It calculates locally with no account.`,
    ],
    faqs: [
      {
        question: `How do I calculate the square footage of a room?`,
        answer: `For a rectangular room, multiply length by width. For circular or triangular spaces the formulas differ, which is why this calculator lets you pick the shape. Add each room and it totals the combined area for you.`,
      },
      {
        question: `How much extra flooring should I buy for waste?`,
        answer: `A common rule is to add about 10% for cuts, mistakes, and future repairs, which is exactly the allowance this calculator's flooring estimate uses. For complex layouts or diagonal patterns, you may want to add more.`,
      },
      {
        question: `How do I measure an L-shaped or irregular room?`,
        answer: `Divide it into simple rectangles, add each as a separate room here, and the calculator sums them. Any outline can be broken into rectangles, circles, and triangles this way to get an accurate total.`,
      },
      {
        question: `Why does the paint estimate assume two coats?`,
        answer: `One coat rarely gives even, full coverage, so painters typically apply two — which is why the paint estimate doubles the area. If you are using a primer or a one-coat paint, you can scale the figure down accordingly.`,
      },
    ],
    related: [
      { slug: 'tile-calculator', note: `Turn the area into the number of tiles you need to buy.` },
      { slug: 'concrete-calculator', note: `Estimate concrete volume and bags for slabs and footings.` },
      { slug: 'area-calculator', note: `Calculate the area of a single shape with more options.` },
    ],
  },

  'concrete-calculator': {
    intro: [
      `Order too little concrete and a pour stalls; order too much and you have paid for waste. This calculator estimates the volume your project needs and converts it into the number of bags to buy, handling slabs, footings, columns, and tubes.`,
      `Contractors and serious DIYers use it before pouring a patio, setting fence posts, or filling form tubes. It works out the volume in cubic yards, adds a waste factor, and tells you how many 40, 60, or 80-pound bags that comes to — with an optional cost estimate so you can budget the trip to the supplier.`,
    ],
    steps: [
      `Choose your measurement units and the bag size you plan to buy (40, 60, or 80 lb).`,
      `Set a waste factor (5% by default) and, optionally, the price per bag.`,
      `Add each pour, choosing its shape — slab, footing, column, or tube — and entering the dimensions.`,
      `Read the total volume, cubic yards, bags needed for each bag size, and the estimated cost.`,
    ],
    why: [
      `It handles four pour types — slabs, footings, columns, and tubes — including the hollow-tube calculation that subtracts the inner void.`,
      `It converts volume into bag counts for all three common bag weights and applies an adjustable waste factor.`,
      `It estimates total cost when you enter a price per bag, so you can budget before buying.`,
      `It computes everything in your browser with no sign-up.`,
    ],
    faqs: [
      {
        question: `How much concrete do I need?`,
        answer: `Multiply the length, width, and depth of a slab to get its volume, then convert to cubic yards (dividing cubic feet by 27). Columns and tubes use circular formulas. This calculator does the conversion and adds a waste margin automatically.`,
      },
      {
        question: `Why add a waste factor?`,
        answer: `Some concrete is always lost to spillage, uneven subgrade, and over-excavation, so ordering exactly the calculated volume risks coming up short. A 5–10% waste factor — adjustable here — gives a practical buffer.`,
      },
      {
        question: `How many bags of concrete are in a cubic yard?`,
        answer: `It depends on bag size: it takes more small bags than large ones to fill the same volume. The calculator uses standard coverage for 40, 60, and 80-pound bags and shows the count for each so you can choose.`,
      },
      {
        question: `When should I order ready-mix instead of bags?`,
        answer: `Bags suit small jobs like post holes and small slabs, but for large pours the number of bags becomes impractical and ready-mix delivery is usually cheaper and faster. The bag count here is a good gauge — if it runs into the dozens, price up ready-mix too.`,
      },
    ],
    related: [
      { slug: 'square-footage-calculator', note: `Measure the slab area before calculating its volume.` },
      { slug: 'tile-calculator', note: `Plan the tiling that goes over a finished slab.` },
      { slug: 'volume-calculator', note: `Calculate the volume of other three-dimensional shapes.` },
    ],
  },

  'tile-calculator': {
    intro: [
      `Tiling a floor or wall starts with one question: how many tiles do I buy? This calculator answers it from the area you are covering and the size of your tile, then adds a waste allowance for cuts and breakages so you do not run short mid-job.`,
      `DIYers and renovators use it before a bathroom or kitchen project, and it handles several areas at once so a room plus a backsplash can be totaled together. Enter your tile dimensions, set a waste percentage, and it returns the base tile count, the count including waste, and an optional cost estimate.`,
    ],
    steps: [
      `Choose your measurement units and enter your tile's length and width.`,
      `Set a waste factor (10% by default) and, optionally, a price per tile.`,
      `Add each area you are tiling with its length and width.`,
      `Read the total area, the base tile count, the count including waste, and the estimated cost.`,
    ],
    why: [
      `It builds in an adjustable waste allowance, so the count reflects the extra tiles real installations need for cuts and breakages.`,
      `It totals several areas at once, letting you combine a floor and a backsplash, or multiple rooms, in one estimate.`,
      `It returns both the base count and the with-waste count, plus a cost estimate when you add a price.`,
      `It works in your browser with nothing to install.`,
    ],
    faqs: [
      {
        question: `How many tiles do I need?`,
        answer: `Divide the area you are covering by the area of a single tile, then round up and add a waste margin. This calculator does that automatically — enter your area and tile size and it returns the count including extra for waste.`,
      },
      {
        question: `How much waste should I allow for tiling?`,
        answer: `Around 10% is typical for straight layouts, which is the default here. Add more — 15% or higher — for diagonal patterns, lots of cuts around fixtures, or large-format tiles where breakages are costlier.`,
      },
      {
        question: `Does the calculator account for grout spacing?`,
        answer: `It sizes the count from the tile dimensions and the area, not from grout-line spacing, so for tight estimates allow for grout joints and your specific layout. Keeping the standard waste margin generally absorbs the small difference grout lines make.`,
      },
      {
        question: `Should I buy extra tiles beyond the estimate?`,
        answer: `It is wise to keep a few spare tiles from the same batch, on top of the waste allowance, for future repairs — dye lots vary between production runs, so a matching replacement bought later may look slightly different.`,
      },
    ],
    related: [
      { slug: 'square-footage-calculator', note: `Measure the area you plan to tile.` },
      { slug: 'concrete-calculator', note: `Estimate the slab or base beneath your tiling.` },
      { slug: 'area-calculator', note: `Calculate the area of an unusually shaped surface.` },
    ],
  },

  'wind-chill-heat-index-calculator': {
    intro: [
      `The thermometer rarely tells the whole story — wind makes the cold bite harder, and humidity makes the heat more dangerous. This calculator computes the "feels like" temperature using the official NOAA wind chill formula in cold conditions and the Rothfusz heat index in hot, humid ones, and adds a safety warning for the result.`,
      `People use it to dress for a winter walk, judge whether outdoor exercise is safe on a humid afternoon, or understand a weather warning. It automatically applies the right formula based on the temperature, wind, and humidity you enter, and translates the number into a plain-language risk level from "safe" to "extreme danger".`,
    ],
    steps: [
      `Enter the temperature and choose Fahrenheit or Celsius.`,
      `Enter the wind speed (for cold conditions) and the relative humidity (for hot conditions).`,
      `Read the "feels like" temperature.`,
      `Heed the safety warning, which describes the frostbite or heat-illness risk at that level.`,
    ],
    why: [
      `It uses the official formulas — the NOAA wind chill equation and the Rothfusz heat index regression — rather than a rough approximation.`,
      `It applies the correct formula automatically: wind chill in the cold, heat index in the heat, and the actual temperature in between.`,
      `It pairs the result with tiered safety warnings, so the number translates into real-world risk and precautions.`,
      `All processing happens on your device, free to use.`,
    ],
    faqs: [
      {
        question: `What is the difference between wind chill and heat index?`,
        answer: `Wind chill is how cold it feels when wind strips heat from your skin, used in cold weather. Heat index is how hot it feels when humidity limits your body's ability to cool by sweating, used in hot weather. This tool computes whichever applies to your conditions.`,
      },
      {
        question: `When does wind chill apply?`,
        answer: `The wind chill formula is valid only when the temperature is at or below 50°F and the wind is at least 3 mph. Outside those conditions wind chill is not meaningful, so the calculator switches to the heat index or the actual temperature instead.`,
      },
      {
        question: `When does the heat index apply?`,
        answer: `The heat index is calculated when the temperature is at or above 80°F and relative humidity is at least 40%. Below those thresholds humidity has little effect on perceived temperature, so the calculator reports the actual temperature.`,
      },
      {
        question: `Why does humidity make heat more dangerous?`,
        answer: `Your body cools itself by evaporating sweat. When humidity is high, sweat evaporates poorly, so cooling is less effective and the heat feels worse and stresses the body more — which is exactly what the heat index quantifies.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert temperatures and wind speeds between unit systems.` },
      { slug: 'water-intake-calculator', note: `Plan hydration for hot or strenuous conditions.` },
      { slug: 'calories-burned-calculator', note: `Estimate the toll of exercising in challenging weather.` },
    ],
  },

  // ── Batch 8: SEO (9, finishes category) + Developer (6, finishes category) ──

  'readability-checker': {
    intro: [
      `Content that is hard to read loses readers and rankings alike. The Readability Checker scores your text against six established formulas at once — Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog, Coleman-Liau, SMOG, and the Automated Readability Index — so you can see how demanding your writing is and roughly what reading level it suits.`,
      `Writers, marketers, and editors use it to pitch content at the right audience: simplifying a help article that scores at college level, or confirming a landing page reads easily on a phone. It also reports the underlying statistics — word and sentence counts, average sentence length, reading time — and offers concrete suggestions, like trimming long sentences or cutting complex words.`,
    ],
    steps: [
      `Paste or type your text into the input box.`,
      `Click Analyze.`,
      `Read the six readability scores and the grade level each implies.`,
      `Review the statistics and suggestions, then copy a summary or download the full report.`,
    ],
    why: [
      `It runs six readability formulas together, so you get a rounded view instead of trusting a single score that can mislead.`,
      `It pairs the scores with actionable suggestions — flagging over-long sentences and a high share of complex words — rather than just grading you.`,
      `It reports supporting statistics like reading time and average sentence length, useful for shaping content to an audience.`,
      `All analysis happens in your browser, so unpublished drafts never leave your device.`,
    ],
    faqs: [
      {
        question: `What is a good Flesch Reading Ease score?`,
        answer: `Higher is easier. Scores of 60–70 are considered plain English suitable for a wide audience, 70–80 reads easily, and below 50 is fairly difficult, typically college level. Many web writers aim for 60 or above so content is accessible to most readers.`,
      },
      {
        question: `Why does it show several different scores?`,
        answer: `Each formula weighs sentence length and word complexity differently, and some target US grade levels while others estimate ease. Looking at all six together gives a more reliable picture than any single formula, which can be thrown off by unusual text.`,
      },
      {
        question: `How can I make my text more readable?`,
        answer: `Shorten long sentences, prefer common words over jargon, break content into shorter paragraphs, and use active voice. The checker's suggestions point to the specific issues in your text, and re-analyzing shows the scores improve as you edit.`,
      },
      {
        question: `Is the syllable count exact?`,
        answer: `Syllable counting uses an approximation algorithm, since English syllables are irregular and hard to count perfectly by rule. It is accurate enough for reliable readability scoring, but treat the scores as well-grounded estimates rather than precise measurements.`,
      },
    ],
    related: [
      { slug: 'keyword-density-checker', note: `Check which terms dominate your text alongside its readability.` },
      { slug: 'word-counter', note: `Get detailed word, character, and sentence counts for the same content.` },
      { slug: 'title-description-length-checker', note: `Make sure your title and meta description fit search-result limits.` },
    ],
  },

  'url-parameter-cleaner': {
    intro: [
      `Links pick up clutter — tracking tags like utm_source, fbclid, and gclid that make a URL long, ugly, and full of analytics breadcrumbs. The URL Parameter Cleaner strips those parameters out, leaving a tidy link safe to share, bookmark, or paste into a document.`,
      `Marketers clean campaign URLs before sharing them publicly, privacy-minded users remove the tracking that follows them around the web, and anyone who hates a 300-character link uses it to get back to the essentials. It recognizes the common tracking parameters automatically and lets you fine-tune with your own whitelist of params to keep and blacklist of params to remove.`,
    ],
    steps: [
      `Paste the cluttered URL into the input box.`,
      `Review the detected parameters — tracking ones are flagged — and use Select Tracking, Select All, or the individual checkboxes.`,
      `Optionally add your own whitelist (params to always keep) and blacklist (params to always remove).`,
      `Click Clean URL and copy the tidied result, with a count of what was removed.`,
    ],
    why: [
      `It auto-detects around twenty common tracking parameters (utm_*, fbclid, gclid, session IDs, and more) and flags them, so you do not have to know them by name.`,
      `Whitelist and blacklist fields let you keep functional parameters while stripping only the tracking ones, rather than blunt removal.`,
      `Per-parameter checkboxes give you precise control over exactly what stays and what goes.`,
      `Cleaning happens entirely in your browser — the URL is never sent anywhere.`,
    ],
    faqs: [
      {
        question: `What are UTM parameters and why remove them?`,
        answer: `UTM parameters (utm_source, utm_medium, utm_campaign, and others) are tags marketers append to track where traffic comes from. They are useful for analytics but clutter shared links and can leak campaign details, so removing them produces a cleaner, more private URL.`,
      },
      {
        question: `Will removing parameters break the link?`,
        answer: `Tracking parameters are safe to remove — the page loads the same without them. Functional parameters (like a product ID or page number) do matter, which is why the whitelist lets you protect those while stripping only the tracking clutter.`,
      },
      {
        question: `What is the difference between the whitelist and blacklist?`,
        answer: `The whitelist names parameters to always keep, even if they look like tracking; the blacklist names parameters to always remove. Together they give you fine control when the automatic detection does not exactly match what you want.`,
      },
      {
        question: `Does cleaning a URL affect my own analytics?`,
        answer: `Only for the cleaned link you share. If you strip UTM tags from a link before posting it, visits through that link will not carry those campaign tags into your analytics — so clean links you want to attribute, and keep the tags on links whose source you need to track.`,
      },
    ],
    related: [
      { slug: 'url-encoder-decoder', note: `Encode or decode the cleaned URL for safe use elsewhere.` },
      { slug: 'meta-tag-generator', note: `Set the canonical and social tags for the clean page URL.` },
      { slug: 'serp-snippet-preview', note: `Preview how the tidy URL appears in a search result.` },
    ],
  },

  'robots-txt-generator': {
    intro: [
      `A robots.txt file tells search engine crawlers which parts of your site they may and may not visit, and a single typo can accidentally hide your whole site or expose pages you meant to block. This generator builds a correct robots.txt visually, so you set rules without memorizing the syntax.`,
      `Site owners and developers use it when launching a site, blocking admin or staging areas, or pointing crawlers at a sitemap. Presets cover the common cases — allow everything, block everything, or a WordPress-tuned setup — while custom mode lets you define rules per user-agent, reorder them, and add crawl delays.`,
    ],
    steps: [
      `Start from a preset (Allow All, Block All, or WordPress) or build from scratch.`,
      `For each user-agent, add Allow or Disallow rules with their paths, reordering them as needed.`,
      `Add more user-agents if you need different rules for specific crawlers.`,
      `Add your sitemap URL, generate the file, and copy it into your site's root as robots.txt.`,
    ],
    why: [
      `Presets for Allow All, Block All, and WordPress cover the most common setups, while custom mode handles anything specific.`,
      `It supports multiple user-agents with reorderable rules and optional crawl-delay directives, matching the full robots.txt spec.`,
      `It appends your sitemap reference, the line crawlers look for to discover your URLs.`,
      `It generates the file locally with no account; you simply copy it to your site root.`,
    ],
    faqs: [
      {
        question: `What is a robots.txt file for?`,
        answer: `It is a plain-text file at your site's root that tells search engine crawlers which paths they may or may not request. It guides crawling, but note it is not a security measure — disallowed pages can still be accessed directly and may appear in results if linked elsewhere.`,
      },
      {
        question: `What is the difference between Allow and Disallow?`,
        answer: `Disallow tells a crawler not to request a path, while Allow explicitly permits one — useful for carving out an exception inside a disallowed directory. The generator lets you mix both per user-agent and order them so the right rule wins.`,
      },
      {
        question: `Where do I put the generated file?`,
        answer: `Save it as robots.txt in the root of your domain, so it is reachable at yoursite.com/robots.txt. Crawlers look for it there specifically; placed anywhere else, it will be ignored.`,
      },
      {
        question: `Should I block pages with robots.txt or noindex?`,
        answer: `To keep a page out of search results, a noindex meta tag is more reliable, because robots.txt only controls crawling, not indexing. Use robots.txt to manage crawler load and access; use noindex when the goal is to keep something out of the index.`,
      },
    ],
    related: [
      { slug: 'sitemap-generator', note: `Create the sitemap.xml you reference from robots.txt.` },
      { slug: 'meta-tag-generator', note: `Add noindex and other robots directives at the page level.` },
      { slug: 'url-parameter-cleaner', note: `Tidy the URLs you submit to search engines.` },
    ],
  },

  'sitemap-generator': {
    intro: [
      `An XML sitemap lists your site's important pages for search engines, along with how often each changes and how important it is. This generator builds a valid sitemap from a list of URLs you provide, letting you set the priority, change frequency, and last-modified date for each.`,
      `Site owners submit sitemaps to Google Search Console to help pages get discovered and crawled, especially on new sites or large ones with deep pages. Rather than crawling your site, this tool builds the sitemap from URLs you add one by one or paste in bulk — giving you full control over exactly which pages are included and how they are weighted.`,
    ],
    steps: [
      `Add a URL with its priority and change frequency, or paste many URLs at once into bulk import.`,
      `Adjust each entry's priority, change frequency, and last-modified date as needed.`,
      `Watch invalid or duplicate URLs get flagged so your list stays clean.`,
      `Generate the XML, then copy it or download sitemap.xml to upload to your site and submit to search engines.`,
    ],
    why: [
      `It builds from a URL list you control — typed or bulk-pasted — so you decide exactly which pages are included rather than relying on an automated crawl.`,
      `Each URL gets its own priority, change frequency, and last-modified date, following the sitemap protocol precisely.`,
      `It validates URLs and flags duplicates, and outputs a properly structured XML file you can download.`,
      `Everything is generated in your browser with no account.`,
    ],
    faqs: [
      {
        question: `What is an XML sitemap?`,
        answer: `It is a file listing the URLs you want search engines to know about, optionally with metadata like last-modified date, change frequency, and priority. Submitting one helps search engines discover and crawl your pages, particularly those not well linked internally.`,
      },
      {
        question: `Does this tool crawl my website automatically?`,
        answer: `No. It builds the sitemap from URLs you add or paste in, which gives you precise control over what is included. If you need to crawl a large site automatically, a dedicated crawler is the right tool; this generator is ideal for curated or smaller URL lists.`,
      },
      {
        question: `What do priority and change frequency mean?`,
        answer: `Priority (0.0 to 1.0) signals a page's relative importance on your site, and change frequency hints how often it updates. Search engines treat both as hints rather than commands, so set them honestly to reflect your real content.`,
      },
      {
        question: `How do I submit my sitemap?`,
        answer: `Upload the generated sitemap.xml to your site's root, then submit its URL in Google Search Console (and Bing Webmaster Tools). Referencing it in your robots.txt file also helps crawlers find it automatically.`,
      },
    ],
    related: [
      { slug: 'robots-txt-generator', note: `Reference your sitemap from robots.txt so crawlers find it.` },
      { slug: 'meta-tag-generator', note: `Set per-page SEO tags for the URLs in your sitemap.` },
      { slug: 'serp-snippet-preview', note: `Preview how those pages will look in search results.` },
    ],
  },

  'open-graph-image-generator': {
    intro: [
      `When a link is shared on social media, the preview image does much of the work of earning a click — and the standard size for it is 1200×630 pixels. This generator creates that Open Graph image right in your browser: choose a background, add a title and description, drop in a logo, and download a ready-to-use PNG or JPG.`,
      `Bloggers, marketers, and site owners use it to give every page a polished share image without opening design software. Templates for blog posts, products, and articles give you a fast starting point, and you control the fonts, colors, gradients, text alignment, and logo placement to match your brand.`,
    ],
    steps: [
      `Pick a template (Custom, Blog Post, Product, or Article) as a starting point.`,
      `Set the background — a solid color, a gradient, or an uploaded image.`,
      `Enter your title and description, adjusting font, size, color, and alignment, and optionally add a logo.`,
      `Regenerate the preview, then download the 1200×630 image as PNG or JPG.`,
    ],
    why: [
      `It renders the image entirely on an in-browser canvas at the exact 1200×630 Open Graph size — no design tool and no upload required.`,
      `Templates plus full control over background, fonts, colors, gradients, and logo position let you match your brand quickly.`,
      `It exports as PNG or JPG and can copy the image straight to your clipboard.`,
      `Because rendering is local, your images and branding never leave your device.`,
    ],
    faqs: [
      {
        question: `What size should an Open Graph image be?`,
        answer: `The recommended size is 1200×630 pixels, a roughly 1.91:1 ratio that displays well across Facebook, LinkedIn, and Twitter. This generator works at exactly that size, so your image fits without awkward cropping.`,
      },
      {
        question: `Where do I use the generated image?`,
        answer: `Upload it to your site and reference it in your page's og:image meta tag (and twitter:image). When the page is shared, platforms read that tag and display your image in the link preview.`,
      },
      {
        question: `Do I need design software for this?`,
        answer: `No. Everything is done in the browser with templates and simple controls for text, color, and layout. It is built so non-designers can produce a clean, correctly sized share image in a couple of minutes.`,
      },
      {
        question: `Should I download PNG or JPG?`,
        answer: `PNG preserves sharp text and solid colors without compression artifacts, which suits most share images, while JPG produces a smaller file that can be better for photographic backgrounds. If in doubt, choose PNG for crisp text and logos.`,
      },
    ],
    related: [
      { slug: 'open-graph-preview-generator', note: `Preview how your image and tags will look when shared.` },
      { slug: 'meta-tag-generator', note: `Generate the og:image and related meta tags to reference it.` },
      { slug: 'image-resizer', note: `Resize an existing image to the right dimensions instead.` },
    ],
  },

  'url-encoder-decoder': {
    intro: [
      `URLs can only contain certain characters, so spaces, ampersands, and accented letters must be percent-encoded to travel safely — and decoded to be read. This tool encodes and decodes URLs, and goes further with SEO-friendly slug options that turn a messy string into a clean, search-friendly path.`,
      `Developers and SEOs use it to encode query values, decode a tracking link to see what is inside, or generate a tidy URL slug from a page title. Beyond standard encoding, it can lowercase text, replace spaces with hyphens, strip special characters, and remove common stop words — and it validates the input as a real URL and lists out its query parameters.`,
    ],
    steps: [
      `Choose Encode, Decode, or Auto-detect.`,
      `Paste your URL or string into the input.`,
      `For a clean slug, tick the SEO suggestions (lowercase, hyphens, remove special characters or stop words) and apply them.`,
      `Read the encoded or decoded output, see any extracted query parameters, and copy the result.`,
    ],
    why: [
      `Beyond standard percent-encoding, it generates SEO-friendly slugs — lowercasing, hyphenating, and removing stop words and special characters.`,
      `It validates that your input is a real URL and lists its query parameters separately, which a generic encoder does not.`,
      `An auto-detect mode figures out whether to encode or decode based on the input.`,
      `All processing is local, so the URLs you work with stay private.`,
    ],
    faqs: [
      {
        question: `When does a URL need to be encoded?`,
        answer: `Whenever it contains characters that are not allowed raw in a URL — spaces, ampersands, question marks inside a value, or non-ASCII letters. Encoding replaces them with percent-codes (a space becomes %20) so the URL is transmitted and interpreted correctly.`,
      },
      {
        question: `What makes a URL slug SEO-friendly?`,
        answer: `Short, lowercase, hyphen-separated words that describe the page, without special characters or filler stop words. This tool's suggestions apply exactly those transformations, turning "The Best Guide to SEO!" into something like "best-guide-seo".`,
      },
      {
        question: `How is this different from the basic URL encoder?`,
        answer: `The basic encoder simply percent-encodes or decodes any text. This tool is URL-focused: it validates the URL, extracts its query parameters, and adds SEO slug generation, making it the better choice when you are working specifically with web addresses.`,
      },
      {
        question: `Why are query parameters listed separately?`,
        answer: `When you enter a valid URL, the tool parses out its query string and shows each parameter as a key-value pair, which makes it easy to see what data a link is carrying. It is handy for inspecting tracking or campaign links at a glance.`,
      },
    ],
    related: [
      { slug: 'url-encoder', note: `For plain percent-encoding of any text, use the simpler encoder.` },
      { slug: 'url-parameter-cleaner', note: `Strip tracking parameters from the URL you are working with.` },
      { slug: 'base64-encoder', note: `Encode data as Base64 for a different transport need.` },
    ],
  },

  'serp-snippet-preview': {
    intro: [
      `Before a page goes live, it helps to see how it will actually appear in Google's results — the blue title, the green-ish URL, the gray description. The SERP Snippet Preview renders that listing live as you type your title, description, and URL, and shows where Google is likely to truncate each one.`,
      `SEOs and content writers use it to craft titles and descriptions that display in full and read well, on both desktop and mobile. Because search results truncate around set lengths, seeing the preview — complete with favicon, site name, and date — prevents the common mistake of writing a title that gets cut off mid-phrase.`,
    ],
    steps: [
      `Toggle between Desktop and Mobile preview.`,
      `Enter your title tag and meta description, watching the character counters change color near the limits.`,
      `Add your URL, site name, and optionally a favicon, and choose whether to show a date.`,
      `Review the live snippet to confirm nothing important is truncated, then copy your text.`,
    ],
    why: [
      `It renders a realistic Google snippet — favicon, site name, URL, title, description, and date — rather than just counting characters.`,
      `A desktop/mobile toggle shows how the listing differs across devices, where truncation points vary.`,
      `Live, color-coded character counters warn you before your title or description crosses the length where Google cuts it off.`,
      `Everything renders locally, so unpublished page details stay private.`,
    ],
    faqs: [
      {
        question: `How long should my title and description be for Google?`,
        answer: `Titles are typically shown up to around 60 characters and descriptions up to around 160 before truncation. The preview marks these thresholds with color and trims the snippet so you can see exactly what will display.`,
      },
      {
        question: `Why does my title look different on mobile?`,
        answer: `Mobile results have a narrower width, so titles and descriptions can wrap or truncate differently than on desktop. The device toggle lets you check both, since a title that fits on desktop may be cut short on a phone.`,
      },
      {
        question: `Does writing a good snippet improve rankings?`,
        answer: `The snippet itself is not a direct ranking factor, but a clear, compelling title and description improve click-through rate, which reflects how useful searchers find your result. Better snippets mean more clicks from the same ranking position.`,
      },
      {
        question: `Will Google always use the title and description I set?`,
        answer: `Not necessarily. Google may rewrite a title or pull a different description from the page if it judges another version more relevant to the query. Writing a strong, accurate title and description makes it more likely your chosen text is used.`,
      },
    ],
    related: [
      { slug: 'title-description-length-checker', note: `Check titles and descriptions against character and pixel limits.` },
      { slug: 'meta-tag-generator', note: `Generate the title and description tags behind the snippet.` },
      { slug: 'readability-checker', note: `Make sure the page content lives up to its snippet.` },
    ],
  },

  'open-graph-preview-generator': {
    intro: [
      `How your link looks when shared on Facebook, LinkedIn, or Twitter comes down to your Open Graph tags — and getting them wrong means a broken or unappealing preview. This tool lets you enter your OG title, description, image, and other fields, then shows side-by-side previews of how the card will render on each platform, and generates the meta tags to copy into your page.`,
      `Marketers and developers use it to fine-tune a share card before publishing, checking that the title is not truncated and the image displays. Seeing all three platforms at once catches differences between them, and the generated meta tags drop straight into your page's head.`,
    ],
    steps: [
      `Enter your OG title and description, watching the character counters near the recommended limits.`,
      `Add an image URL or upload an image, then set the URL, site name, and OG type.`,
      `Review the live Facebook, LinkedIn, and Twitter previews side by side.`,
      `Copy the generated Open Graph meta tags into your page's head section.`,
    ],
    why: [
      `It renders three real platform previews — Facebook, LinkedIn, and Twitter — at once, so you catch how each treats your title, description, and image.`,
      `It generates clean, copyable Open Graph meta tags from your inputs, not just a preview.`,
      `Color-coded character counters flag titles and descriptions that risk truncation.`,
      `It works entirely in your browser; your inputs and uploaded images stay on your device.`,
    ],
    faqs: [
      {
        question: `What are Open Graph tags?`,
        answer: `Open Graph tags are meta tags (og:title, og:description, og:image, and others) that tell social platforms how to display your link. Without them, platforms guess from page content, often producing a poor or broken preview.`,
      },
      {
        question: `Can this fetch the Open Graph tags from an existing URL?`,
        answer: `No — this tool builds and previews tags from the fields you enter manually rather than fetching them from a live page. Enter your title, description, and image to see the previews and generate the tags to add to your site.`,
      },
      {
        question: `Why does my preview differ between platforms?`,
        answer: `Each platform lays out cards differently — Facebook shows the site name, LinkedIn and Twitter emphasize the image and title differently, and truncation lengths vary. Previewing all three helps you write a card that works everywhere.`,
      },
      {
        question: `Where do the generated tags go?`,
        answer: `Paste them inside the <head> of your HTML page. Once deployed, social platforms read them when your link is shared and render the preview accordingly; you can re-scrape with each platform's debugging tool to refresh a cached preview.`,
      },
    ],
    related: [
      { slug: 'open-graph-image-generator', note: `Create the 1200×630 share image your tags point to.` },
      { slug: 'meta-tag-generator', note: `Generate a full set of SEO and social meta tags together.` },
      { slug: 'serp-snippet-preview', note: `Preview how the same page appears in search results.` },
    ],
  },

  'title-description-length-checker': {
    intro: [
      `Search engines cut off titles and descriptions that run too long, and they measure by pixel width, not just character count — so a title full of wide letters can be truncated sooner than the character count suggests. This checker measures both: it counts characters and calculates the actual pixel width, then shows a truncated preview of how your snippet will appear.`,
      `SEOs and writers use it to make every title and description display in full. By measuring real rendered width with the same approach a browser uses, it catches cases that a simple character counter misses, and color-coded status makes it obvious when you are within range, close to the limit, or over.`,
    ],
    steps: [
      `Choose your target search engine.`,
      `Enter your title tag and watch the character count, pixel width, and status update live.`,
      `Enter your meta description and check the same metrics against its limits.`,
      `Read the truncated preview and the suggestions, then copy your finalized text.`,
    ],
    why: [
      `It measures actual pixel width using the font metrics a browser renders, catching truncation that a character count alone would miss.`,
      `It checks both title and description against character and pixel limits, with color-coded status from optimal to over.`,
      `A truncated preview shows exactly where the text would be cut, and suggestions advise when to shorten.`,
      `All measurement happens locally with no account.`,
    ],
    faqs: [
      {
        question: `Why measure pixels instead of just characters?`,
        answer: `Search engines truncate by the rendered width of the text, and characters vary in width — a "w" is far wider than an "i". Two titles with the same character count can truncate differently, so pixel width is a more accurate guide to what will actually display.`,
      },
      {
        question: `What are the recommended limits?`,
        answer: `As a guide, titles fit comfortably within about 60 characters (around 600 pixels) and descriptions within about 160 characters (around 920 pixels). The checker flags you as you approach and exceed these thresholds.`,
      },
      {
        question: `Do different search engines have different limits?`,
        answer: `In practice the major engines truncate at similar lengths, and this tool applies the same widely used limits across the engine options. Optimizing for the common thresholds keeps your snippet readable across Google, Bing, and others.`,
      },
      {
        question: `What happens if my title or description is too long?`,
        answer: `The search engine cuts it off, usually with an ellipsis, so the end of your text is hidden from searchers. Front-load the important words and keep within the limits so your full message — and any call to action — stays visible.`,
      },
    ],
    related: [
      { slug: 'serp-snippet-preview', note: `See the full search-result snippet rendered, not just the limits.` },
      { slug: 'meta-tag-generator', note: `Generate the title and description tags you are checking.` },
      { slug: 'readability-checker', note: `Ensure the page behind the snippet reads clearly.` },
    ],
  },

  'text-diff': {
    intro: [
      `Spotting what changed between two versions of text — a contract clause, a config file, a paragraph of copy — is slow and error-prone by eye. Text Diff compares two blocks line by line and highlights exactly which lines were added, removed, or left unchanged.`,
      `Writers compare draft revisions, developers eyeball changes outside of version control, and anyone reviewing edits uses it to see precisely what moved. It marks each line with a clear +, −, or space prefix and line numbers, so the differences read like a familiar code diff without needing any tooling.`,
    ],
    steps: [
      `Paste the original version into the "Original Text" box.`,
      `Paste the updated version into the "Modified Text" box.`,
      `Read the line-by-line diff: additions, removals, and unchanged lines are color-coded.`,
      `Copy the diff with its +/− markers to share or save.`,
    ],
    why: [
      `It compares line by line and color-codes additions, removals, and unchanged lines, so changes are obvious at a glance.`,
      `It numbers the lines and marks empty lines explicitly, so you can pinpoint exactly where a change sits.`,
      `It needs no setup or version control — just paste two versions and compare.`,
      `Both texts are compared in your browser and never uploaded, which matters for confidential documents.`,
    ],
    faqs: [
      {
        question: `Does this compare line by line or word by word?`,
        answer: `It works at the line level: each line in the original is compared against the corresponding line in the modified text. A line that changed shows as a removal of the old line and an addition of the new one, which makes structural changes easy to follow.`,
      },
      {
        question: `Can I compare code with it?`,
        answer: `Yes. Because it diffs plain text by line, it works well for code, configuration files, and data as well as prose. For ongoing code work, a version-control diff offers more, but this is ideal for a quick one-off comparison.`,
      },
      {
        question: `Is my text kept private?`,
        answer: `Yes. The comparison runs entirely in your browser and neither block of text is sent anywhere, so you can safely diff sensitive contracts, drafts, or configuration.`,
      },
      {
        question: `Why is a whole line shown as both removed and added when I only changed a word?`,
        answer: `Because the comparison works line by line, any change within a line is represented as the old line being removed and the new line added. This keeps the diff simple and unambiguous; reading the pair side by side shows you the word that changed.`,
      },
    ],
    related: [
      { slug: 'json-diff', note: `Compare two JSON documents by structure rather than by line.` },
      { slug: 'string-converter', note: `Transform text case and format before or after comparing.` },
      { slug: 'code-minifier', note: `Strip whitespace so formatting differences do not obscure real changes.` },
    ],
  },

  'json-filter': {
    intro: [
      `When a JSON array holds hundreds of records but you only care about some of them, scrolling to find the matches is tedious. JSON Filter narrows an array down to the items you want by a key — optionally matching a specific value — and returns the filtered result, neatly formatted.`,
      `Developers use it to pull just the active users, the orders over a threshold, or the records that have a particular field set, straight out of an API response. It is a quick, no-code way to slice a dataset: give it a key to filter on and, if you like, a value to match, and it hands back only the items that qualify.`,
    ],
    steps: [
      `Paste your JSON array (or a single object) into the input.`,
      `Enter the key to filter on.`,
      `Optionally enter a value to match against that key.`,
      `Apply the filter and read the matching items, formatted and ready to copy.`,
    ],
    why: [
      `It filters by a key and an optional value with a simple, no-syntax interface — no query language to learn.`,
      `Value matching is a case-insensitive substring search, so partial matches are caught without exact casing.`,
      `It accepts either an array or a single object and always returns cleanly formatted JSON.`,
      `Filtering runs in your browser, so API data you paste is never uploaded.`,
    ],
    faqs: [
      {
        question: `How does the filtering work?`,
        answer: `It keeps every item in the array that has the key you specify. If you also give a value, it keeps only items whose value for that key contains your text, matched case-insensitively. The rest are dropped from the output.`,
      },
      {
        question: `Can I filter on nested fields?`,
        answer: `The filter matches on a top-level key of each item. For deeply nested data, extract the relevant level first with a JSON path tool, then filter the result here.`,
      },
      {
        question: `What if no items match?`,
        answer: `You get an empty result, which simply means no item had that key or matched your value. Check the key spelling and that your value text appears in the data — remember the value match is a partial, case-insensitive one.`,
      },
      {
        question: `Can I filter on a numeric range, like price over 100?`,
        answer: `The filter does substring matching on the value rather than numeric comparison, so it cannot express "greater than". To keep items with a field present, filter by the key alone; for range conditions, post-process the filtered output in a spreadsheet or script.`,
      },
    ],
    related: [
      { slug: 'json-path-finder', note: `Drill into a specific nested value rather than filtering a list.` },
      { slug: 'json-formatter', note: `Pretty-print and validate the JSON before filtering it.` },
      { slug: 'json-to-csv', note: `Turn your filtered records into a spreadsheet-ready table.` },
    ],
  },

  'url-encoder': {
    intro: [
      `Percent-encoding is how text travels safely inside a URL — spaces become %20, ampersands become %26, and so on. This URL Encoder converts any text to its percent-encoded form and decodes it back, with an auto-detect mode that picks the right direction for you.`,
      `Developers use it constantly: encoding a value before dropping it into a query string, or decoding an encoded parameter to read what it contains. It works on any text, not just full URLs, and shows live character counts for input and output so you can see how encoding expands a string.`,
    ],
    steps: [
      `Choose Encode, Decode, or Auto-detect.`,
      `Enter the text or value you want to convert.`,
      `In Encode or Decode mode, click Process; in Auto-detect, the output updates as you type.`,
      `Copy the result, using the character counts to confirm the change.`,
    ],
    why: [
      `Auto-detect mode recognizes whether your input is already encoded and converts the right way automatically.`,
      `It uses encodeURIComponent and decodeURIComponent, so it correctly handles the full set of characters that need escaping, including non-ASCII.`,
      `Live character counters for input and output show how much encoding changes the length.`,
      `It runs entirely client-side, so the text you paste is never transmitted.`,
    ],
    faqs: [
      {
        question: `What is URL encoding?`,
        answer: `URL encoding, or percent-encoding, replaces characters that are unsafe or reserved in a URL with a percent sign followed by their hexadecimal code — a space becomes %20. This lets arbitrary text, including spaces and symbols, sit safely inside a web address.`,
      },
      {
        question: `What is the difference between encoding the whole URL and just a value?`,
        answer: `Encoding a complete URL must preserve its structure (the slashes and colons), while encoding a single value escapes everything. This tool uses component-style encoding, which is right for individual query values; encoding an entire URL this way would escape the separators too.`,
      },
      {
        question: `When should I use auto-detect?`,
        answer: `Use it when you are not sure whether a string is already encoded. The tool checks for percent-codes and decodes if it finds them, or encodes if it does not — handy for quickly flipping a value either way.`,
      },
      {
        question: `Why did my text get longer after encoding?`,
        answer: `Each special character is replaced by a percent sign and two hex digits, so a single space becomes three characters (%20). Text with many spaces or symbols expands noticeably, which the live character counters let you see at a glance.`,
      },
    ],
    related: [
      { slug: 'url-encoder-decoder', note: `For URL-specific work with SEO slug options and parameter extraction.` },
      { slug: 'base64-encoder', note: `Encode binary or text data as Base64 instead of percent-encoding.` },
      { slug: 'json-escape', note: `Escape strings for safe inclusion inside JSON.` },
    ],
  },

  'sql-formatter': {
    intro: [
      `A SQL query crammed onto one line is hard to read and harder to debug. The SQL Formatter reflows it into a clean, indented layout — each major clause on its own line, keywords aligned — so the structure of even a complex query becomes clear at a glance.`,
      `Developers and analysts paste queries copied from logs, ORMs, or a colleague to make sense of them, or to tidy a query before committing it. It puts SELECT, FROM, WHERE, JOIN, and other major clauses on their own lines, indents nested parentheses, and can uppercase keywords so they stand out from table and column names.`,
    ],
    steps: [
      `Paste your SQL query into the input box.`,
      `Set the indent size (1 to 8 spaces) and choose whether to uppercase keywords.`,
      `Click Format.`,
      `Read the reformatted query and copy it back into your editor.`,
    ],
    why: [
      `It places major clauses on their own lines and indents nested parentheses, turning a dense one-liner into a readable structure.`,
      `An uppercase-keywords option makes SQL keywords stand out clearly from your tables and columns.`,
      `Indent size is adjustable from one to eight spaces to match your team's style.`,
      `Formatting runs in your browser, so your queries — which can reveal schema details — are never uploaded.`,
    ],
    faqs: [
      {
        question: `Does formatting change what my query does?`,
        answer: `No. It only changes whitespace, line breaks, and optionally the casing of keywords — the query's logic and results are untouched. Formatting is purely about readability.`,
      },
      {
        question: `Should SQL keywords be uppercase?`,
        answer: `It is a common convention because uppercase keywords (SELECT, FROM, WHERE) stand out from lowercase table and column names, making queries easier to scan. It is a style choice, though, so the formatter lets you turn it off.`,
      },
      {
        question: `Does it work with any SQL dialect?`,
        answer: `It formats based on common SQL keywords and structure, so it handles standard queries across most databases. Highly dialect-specific syntax may not format perfectly, but the core clauses and indentation will still be applied.`,
      },
      {
        question: `Can it format a minified or single-line query?`,
        answer: `Yes — that is exactly its strength. It normalizes the spacing first, then rebuilds the query with each major clause on its own line and proper indentation, turning a dense one-liner back into something readable.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Format and validate JSON, such as data returned from your queries.` },
      { slug: 'code-minifier', note: `Strip whitespace from code once you are done reading it.` },
      { slug: 'regex-tester', note: `Build and test patterns for searching or validating query results.` },
    ],
  },

  'base64-encoder': {
    intro: [
      `Base64 encoding turns binary data or text into a plain-text string of safe characters, which is how images get embedded in CSS, how files ride inside JSON, and how data URLs work. This encoder converts text, files, and images to Base64 and back, with a URL-safe variant for use in links and tokens.`,
      `Developers use it to embed a small image as a data URI, decode a Base64 blob from an API, or encode credentials and payloads. Three tabs handle the common cases — paste text, upload a file, or drop in an image with a live preview — and the tool correctly handles UTF-8 so accented and non-Latin characters survive the round trip.`,
    ],
    steps: [
      `Pick a tab: Text, File, or Image.`,
      `For text, choose Encode, Decode, or Auto and optionally tick URL-safe; for file or image, upload your file.`,
      `Read the Base64 output (or decoded text), with a preview shown for images.`,
      `Copy the result or download it.`,
    ],
    why: [
      `Three modes — text, file, and image — cover encoding a string, a whole file, or an image with a live preview, in one tool.`,
      `A URL-safe option swaps the characters that break in URLs and tokens, so the output drops straight into a link or JWT.`,
      `It handles UTF-8 correctly, so accented and non-Latin text encodes and decodes without corruption.`,
      `Files are read with the browser's FileReader and never uploaded, keeping your data private.`,
    ],
    faqs: [
      {
        question: `What is Base64 used for?`,
        answer: `Base64 represents binary data as text, so it can travel through systems built for text — embedding images directly in HTML or CSS as data URIs, attaching files in JSON or email, and encoding tokens. It is encoding, not encryption, so it does not secure data.`,
      },
      {
        question: `What is URL-safe Base64?`,
        answer: `Standard Base64 uses + and / characters and = padding, which have special meaning in URLs. URL-safe Base64 replaces + with -, / with _, and drops the padding, so the string can be used safely in a URL or a JWT. Tick the URL-safe option to produce it.`,
      },
      {
        question: `Does Base64 make my data secure?`,
        answer: `No. Base64 is reversible by anyone — it only changes the representation, not the secrecy. Never treat Base64 as encryption; if you need to protect data, encrypt it before encoding.`,
      },
      {
        question: `Why is my decoded text garbled?`,
        answer: `Usually the input was not valid Base64, or it was URL-safe Base64 decoded without the URL-safe option (or vice versa). Make sure the mode matches how the data was encoded; this tool handles UTF-8 correctly when the input is valid.`,
      },
    ],
    related: [
      { slug: 'url-encoder', note: `Percent-encode text for URLs, a different safe-transport scheme.` },
      { slug: 'hash-generator', note: `Produce a one-way hash when you need a fingerprint rather than reversible encoding.` },
      { slug: 'jwt-decoder', note: `Decode JSON Web Tokens, whose segments are Base64URL-encoded.` },
    ],
  },

  'markdown-to-html': {
    intro: [
      `Markdown is quick to write, but the web speaks HTML. This converter turns Markdown into clean HTML markup — headings, bold and italic, links, images, code blocks, and more — ready to paste into a page, an email template, or a CMS that expects raw HTML.`,
      `Writers and developers use it to publish Markdown notes as web content, to generate HTML for a newsletter, or just to see the tags a snippet produces. It covers the everyday Markdown syntax with a lightweight converter, so common documents translate cleanly without pulling in a heavy library.`,
    ],
    steps: [
      `Paste or type your Markdown into the input box.`,
      `Click Convert.`,
      `Read the generated HTML markup.`,
      `Copy the HTML into your page, template, or CMS.`,
    ],
    why: [
      `It converts the common Markdown elements — headings, bold, italic, links, images, inline code, and code blocks — covering most everyday documents.`,
      `It is lightweight and instant, producing raw HTML you can paste anywhere that accepts markup.`,
      `It outputs the tags directly so you can see and adjust the HTML, not just a rendered result.`,
      `Conversion happens entirely in your browser with no account.`,
    ],
    faqs: [
      {
        question: `What Markdown features does it support?`,
        answer: `It handles headings (levels one through six), bold and italic (with asterisks or underscores), combined bold-italic, inline code, fenced code blocks, links, images, and line breaks — the syntax that covers most everyday Markdown.`,
      },
      {
        question: `Is the generated HTML safe to publish directly?`,
        answer: `The converter outputs your Markdown as raw HTML without sanitizing it, so if your source contains untrusted input, sanitize the output before publishing to avoid injecting unwanted markup. For your own trusted content, it is ready to use.`,
      },
      {
        question: `Does it support tables or other extended syntax?`,
        answer: `It focuses on core Markdown elements rather than extended additions like tables or task lists. For documents relying on those, a full-featured Markdown processor will convert them, but for standard content this lightweight converter is faster and simpler.`,
      },
      {
        question: `How is this different from a Markdown previewer?`,
        answer: `A previewer shows you the rendered result as it will look; this tool gives you the underlying HTML markup to copy and reuse. Use the previewer to check appearance, and this converter when you need the actual HTML.`,
      },
    ],
    related: [
      { slug: 'markdown-previewer', note: `See your Markdown rendered live instead of as raw HTML.` },
      { slug: 'html-viewer', note: `Preview the HTML this converter produces.` },
      { slug: 'code-minifier', note: `Minify the generated HTML before shipping it.` },
    ],
  },

  // ── Batch 9: Network (7) + Image (4) + Security (1) + Creative (2) ──
  // NOTE: internet-speed-test is intentionally omitted — its widget returns
  // simulated (random) values, so accurate content cannot be written until it
  // is wired to a real measurement (e.g. the installed @cloudflare/speedtest).

  'address-lookup': {
    intro: [
      `Every device on the internet has an IP address, and that address can reveal a surprising amount — the approximate city, the internet provider, the time zone. This IP Address Lookup takes an IP (or your own, at the click of a button) and returns its geolocation and network details.`,
      `Developers use it to check where a server or visitor is located, support teams use it to verify a user's region, and the curious use it to see what their own connection reveals. It reports the city, region, and country, the ISP or organization behind the address, the time zone, the approximate latitude and longitude, and the postal code.`,
      `One thing to know: the lookup is performed by the ipapi.co service, so the IP address you enter is sent to that third party to be resolved.`,
    ],
    steps: [
      `Enter an IP address (or a domain) in the input, or click "My IP" to use your own.`,
      `Click Lookup.`,
      `Read the location, ISP, time zone, coordinates, and postal code returned for that address.`,
      `Copy the full result if you need to record or share it.`,
    ],
    why: [
      `A one-click "My IP" button instantly shows your own public address and location with no input needed.`,
      `It returns a full picture in one lookup — city, region, country, ISP, time zone, coordinates, and postal code.`,
      `It accepts a domain as well as an IP, resolving the lookup for either.`,
      `It is free with no sign-up; note that lookups are resolved via the ipapi.co service, so the address you query is sent there.`,
    ],
    faqs: [
      {
        question: `How accurate is IP geolocation?`,
        answer: `It is usually accurate to the city or region level, but not to a precise street address. IP location is derived from databases mapping address ranges to areas, so results can be off, especially for mobile networks, VPNs, or corporate connections that route through distant data centers.`,
      },
      {
        question: `Can someone find my exact home address from my IP?`,
        answer: `No. An IP reveals an approximate area and your internet provider, not your street address or identity. Only your ISP can link an address to a subscriber, and that requires legal process — so the location shown here is deliberately coarse.`,
      },
      {
        question: `Is my IP address kept private?`,
        answer: `The lookup sends the IP you enter to the ipapi.co geolocation service to retrieve its data, so it is not a purely on-device operation. The tool itself does not store your queries, but the address does leave your browser to be resolved.`,
      },
      {
        question: `Why does my location look wrong?`,
        answer: `If you use a VPN or proxy, the lookup reflects that server's location, not yours. Even without one, the underlying database may place you in a nearby city or your ISP's regional hub rather than your actual town.`,
      },
    ],
    related: [
      { slug: 'whois-lookup', note: `Find the registration details behind a domain name.` },
      { slug: 'dns-lookup', note: `See the DNS records that map a domain to its addresses.` },
      { slug: 'ssl-certificate-checker', note: `Check the security certificate of a site at that address.` },
    ],
  },

  'ssl-certificate-checker': {
    intro: [
      `An expired or misconfigured SSL certificate breaks trust instantly — browsers throw warnings and visitors flee. This checker analyzes a domain's certificate and TLS setup through the respected SSL Labs service, returning an overall security grade plus the certificate's issuer, validity dates, and how many days remain before it expires.`,
      `Site owners use it to catch a certificate before it lapses, developers verify a new deployment's HTTPS, and security-minded users check that a site is properly protected. The letter grade gives an at-a-glance verdict, while the expiry countdown — color-coded as it approaches — is the detail that prevents the dreaded surprise outage.`,
      `Because the analysis is performed by the SSL Labs API, the domain you check is sent to that service, and a fresh scan can take a few moments to complete.`,
    ],
    steps: [
      `Enter the domain name you want to check.`,
      `Click Check SSL.`,
      `If the analysis is still running, wait a few seconds and try again — fresh scans take a moment.`,
      `Read the grade, issuer, validity dates, days until expiry, and protocol, then copy the summary.`,
    ],
    why: [
      `It surfaces a full SSL Labs grade, the same in-depth analysis security professionals rely on, rather than a simple valid/invalid check.`,
      `The days-until-expiry figure is color-coded (red under 30 days, amber under 90), so a looming renewal is impossible to miss.`,
      `It reports the issuer, subject, validity window, and protocol together for a complete certificate picture.`,
      `It is free and needs no sign-up; note the domain is analyzed via the SSL Labs API rather than in your browser.`,
    ],
    faqs: [
      {
        question: `What does the SSL grade mean?`,
        answer: `The grade (from A down to F) summarizes the strength of a site's certificate and TLS configuration — protocol versions, cipher strength, and known vulnerabilities. An A means a well-configured, secure setup; lower grades flag weaknesses worth fixing.`,
      },
      {
        question: `Why does the check sometimes say "analysis in progress"?`,
        answer: `A fresh, thorough scan of a server takes time. When the SSL Labs service is still analyzing, the tool reports that it is in progress; wait a few seconds and check again to get the completed results.`,
      },
      {
        question: `How early should I renew my certificate?`,
        answer: `Renew well before expiry — ideally a couple of weeks ahead — to avoid any gap. The color-coded countdown here warns you as the date nears, with red signaling under 30 days, the point at which renewal becomes urgent.`,
      },
      {
        question: `Is the domain I check kept private?`,
        answer: `The analysis is carried out by the external SSL Labs service, so the domain name is sent there to be scanned. That is necessary because a real TLS handshake cannot be performed from within your browser; the tool itself does not retain your queries.`,
      },
    ],
    related: [
      { slug: 'http-headers-checker', note: `Inspect the security headers a site returns over HTTPS.` },
      { slug: 'security-header-analyzer', note: `Grade those headers against best-practice protections.` },
      { slug: 'whois-lookup', note: `Check the domain's registration and expiry alongside its certificate.` },
    ],
  },

  'whois-lookup': {
    intro: [
      `WHOIS records hold the public registration details of a domain — who the registrar is, when it was created, and crucially, when it expires. This WHOIS Lookup retrieves that information for any domain and lays it out clearly, including a countdown to expiry.`,
      `Investors checking a domain's age and history, businesses monitoring their own renewal dates, and anyone researching who is behind a site use it for a quick, readable record. It returns the registrar, the creation, update, and expiry dates, the domain's status flags, the name servers, and any available registrant organization and country.`,
      `The data comes from a WHOIS API service, so the domain you look up is sent to that provider; note also that privacy-protection services now mask many registrant contact details.`,
    ],
    steps: [
      `Enter the domain name you want to look up.`,
      `Click Lookup WHOIS.`,
      `Read the registrar, key dates, status flags, and name servers.`,
      `Note the days-until-expiry countdown, and copy the record if you need it.`,
    ],
    why: [
      `It presents the WHOIS record in a clean, readable layout rather than the raw, cryptic text a registry returns.`,
      `A color-coded days-until-expiry figure makes it easy to track when a domain (yours or one you are watching) lapses.`,
      `It surfaces status flags and name servers, useful for spotting transfer locks or where a domain is hosted.`,
      `It is free with no sign-up; the lookup is resolved through a WHOIS API service, so the domain is sent there.`,
    ],
    faqs: [
      {
        question: `What information is in a WHOIS record?`,
        answer: `Typically the registrar, the dates a domain was created, last updated, and expires, its status codes, the name servers, and — where not hidden by privacy protection — the registrant's organization and country. It is the public registration footprint of a domain.`,
      },
      {
        question: `Why are the registrant's details hidden?`,
        answer: `Many registrars now offer WHOIS privacy (and regulations like GDPR restrict publishing personal data), so contact details are often replaced with a privacy service or omitted. You will usually still see the registrar, dates, and status even when personal details are masked.`,
      },
      {
        question: `What do the domain status codes mean?`,
        answer: `Status flags like "clientTransferProhibited" describe locks and states set on the domain — often protective measures preventing unauthorized transfers or deletions. They are normal for active, well-managed domains.`,
      },
      {
        question: `How is WHOIS different from a DNS lookup?`,
        answer: `WHOIS tells you about a domain's registration — who owns it and when it expires. A DNS lookup tells you how the domain resolves — which servers it points to. They answer different questions, which is why both tools exist.`,
      },
    ],
    related: [
      { slug: 'dns-lookup', note: `See how the domain resolves to servers and addresses.` },
      { slug: 'address-lookup', note: `Geolocate the IP a domain's records point to.` },
      { slug: 'ssl-certificate-checker', note: `Check the domain's HTTPS certificate and expiry.` },
    ],
  },

  'website-status-checker': {
    intro: [
      `Is a website actually up, or is it just you? This Website Status Checker pings a URL from your browser and reports whether it responded, how quickly, and — with auto-refresh — keeps watching over time, building a small uptime history.`,
      `People reach for it during an outage to confirm a site is down for everyone, before reporting a problem, or to keep an eye on a service while waiting for it to recover. It measures the response time and labels the site up, slow, or down, and the auto-refresh option turns it into a lightweight monitor.`,
      `A technical note: browsers cannot read the response of a cross-origin request, so the checker detects reachability and timing rather than the site's true HTTP status code.`,
    ],
    steps: [
      `Enter the website URL (a protocol is added if you leave it off).`,
      `Click Check Status.`,
      `Read whether the site is up, slow, or down, along with its response time.`,
      `Turn on auto-refresh to re-check every 30 seconds and build an uptime history.`,
    ],
    why: [
      `It runs from your own browser with no account, giving an instant "is it up for me?" answer from your vantage point.`,
      `An auto-refresh mode re-checks every 30 seconds and tracks an uptime percentage over recent checks.`,
      `It distinguishes a slow response from a healthy one using measured response time, not just up or down.`,
      `It is honest about browser limits: it confirms reachability and timing rather than claiming to read a status code it cannot access cross-origin.`,
    ],
    faqs: [
      {
        question: `Does this tell me the exact HTTP status code?`,
        answer: `Not reliably. Browser security hides the response details of cross-origin requests, so the checker infers that a site is reachable from whether the request succeeds, and measures how long it takes. It is a real availability and speed check, not a true status-code reader.`,
      },
      {
        question: `Why might a site show as down when it works in my browser?`,
        answer: `Some servers block the kind of background request this tool makes, even though they serve pages normally to a browser tab. That can register as "down" here, so treat a single result alongside actually opening the site.`,
      },
      {
        question: `What does the uptime percentage mean?`,
        answer: `With auto-refresh on, the tool records each check and shows the share that succeeded. It reflects availability during your monitoring session only — it is not a long-term uptime guarantee like a dedicated monitoring service provides.`,
      },
      {
        question: `What counts as a "slow" response?`,
        answer: `The checker labels a site slow when its response takes longer than about a second, and up when it responds faster. Response time depends on the server, your connection, and distance to the host, so occasional slow readings are normal.`,
      },
    ],
    related: [
      { slug: 'http-headers-checker', note: `Inspect the actual response headers the site returns.` },
      { slug: 'url-redirect-tracer', note: `See whether the URL redirects before it loads.` },
      { slug: 'ping-tool', note: `Measure round-trip latency to the host over several requests.` },
    ],
  },

  'http-headers-checker': {
    intro: [
      `Every web response carries HTTP headers that reveal how a site is configured — its caching rules, security protections, server software, and more. This HTTP Headers Checker fetches a URL's response headers and lays them out, grouped so you can quickly scan the security and caching directives.`,
      `Developers debugging cache behavior, SEOs checking for the right directives, and security reviewers auditing protections all use it to see what a server actually sends. It highlights the key security headers, lets you filter to just security or caching headers, and shows the response status.`,
      `To bypass the browser's cross-origin restrictions, it fetches the target URL through a public CORS proxy (allorigins.win), which means the URL you check is sent to that third-party service.`,
    ],
    steps: [
      `Enter the URL whose headers you want to inspect.`,
      `Click Check Headers.`,
      `Use the All / Security / Caching / Other filters to focus on the headers you care about.`,
      `Read each header's name and value — security headers are highlighted — and copy the set you need.`,
    ],
    why: [
      `It groups headers into security, caching, and other, and highlights the security ones, so an audit takes seconds rather than scrolling raw output.`,
      `Filter tabs let you narrow to exactly the category you are checking.`,
      `It works on any public URL from the browser by routing through a CORS proxy, with no backend of your own required.`,
      `It is transparent that the target URL is sent to the allorigins.win proxy to retrieve the headers, since the browser cannot read them cross-origin directly.`,
    ],
    faqs: [
      {
        question: `What are HTTP response headers?`,
        answer: `They are metadata a server sends with each response, describing things like content type, caching policy, security rules, and the server software. They are not visible on the page itself but govern how browsers and crawlers treat it.`,
      },
      {
        question: `Why does this need a proxy to read headers?`,
        answer: `Browser security blocks a page from reading the headers of a response from another origin. To work around that, the tool routes the request through a public CORS proxy, which fetches the URL and returns the headers — so the URL you enter is sent to that proxy service.`,
      },
      {
        question: `Which security headers should a site have?`,
        answer: `Common ones include Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, and X-Content-Type-Options. This tool highlights them so you can see at a glance which are present; a dedicated analyzer can grade how complete your coverage is.`,
      },
    ],
    related: [
      { slug: 'security-header-analyzer', note: `Grade the security headers and get specific recommendations.` },
      { slug: 'website-status-checker', note: `Check whether the site is reachable and how fast it responds.` },
      { slug: 'ssl-certificate-checker', note: `Verify the HTTPS certificate behind those headers.` },
    ],
  },

  'url-redirect-tracer': {
    intro: [
      `A single link can quietly bounce through several redirects before landing on its final page — and each hop costs time and can leak or lose information. This URL Redirect Tracer follows that chain step by step, showing every URL, its status code, and where it points next, until it reaches the destination.`,
      `SEOs use it to find redirect chains that dilute link value, marketers verify that a shortened or campaign link ends where it should, and the cautious use it to see where a suspicious link actually leads before clicking through. It numbers each hop, color-codes the status codes, and reports the total number of redirects and the time the chain took.`,
    ],
    steps: [
      `Enter the starting URL.`,
      `Click Trace Redirects.`,
      `Follow the numbered chain — each step shows its URL, status code, and the location it redirects to.`,
      `Read the final destination, the total redirect count, and the overall time, then copy the chain.`,
    ],
    why: [
      `It reveals the full hop-by-hop chain with each status code, so you can spot unnecessary redirects that slow a page and weaken SEO.`,
      `It resolves relative redirect locations correctly and caps the trace at a sensible limit to avoid infinite loops.`,
      `It reports the total number of redirects and cumulative time, quantifying the cost of the chain.`,
      `It runs from your browser following redirects manually; no third-party service is involved in the trace.`,
    ],
    faqs: [
      {
        question: `Why do redirect chains matter for SEO?`,
        answer: `Each redirect adds latency and can dilute the ranking signal passed to the final page, and long chains risk being crawled less thoroughly. Collapsing a chain so a link points directly to its destination improves speed and preserves more value.`,
      },
      {
        question: `What is the difference between a 301 and a 302 redirect?`,
        answer: `A 301 is a permanent redirect, signaling that a page has moved for good and passing most ranking value to the new URL. A 302 is temporary, telling browsers and search engines the original may return. The tracer shows each status code so you can tell which is in use.`,
      },
      {
        question: `Can it trace any link?`,
        answer: `It follows standard HTTP redirects from the browser. Some destinations restrict cross-origin requests, which can cut a trace short, and redirects performed by JavaScript after the page loads are not visible to it — it follows server-level redirects.`,
      },
    ],
    related: [
      { slug: 'website-status-checker', note: `Confirm the final destination is actually up.` },
      { slug: 'http-headers-checker', note: `Inspect the headers, including Location, at each hop.` },
      { slug: 'url-parameter-cleaner', note: `Strip tracking parameters the redirects may append.` },
    ],
  },

  'port-checker': {
    intro: [
      `Knowing whether a particular port is reachable on a host is the first step in diagnosing many connection problems — a web server on 443, a database on 3306, an SSH service on 22. This Port Checker tests whether a host responds on a given port and identifies the service that usually runs there.`,
      `Developers checking that a service is exposed, and people troubleshooting why they cannot connect, use it for a fast reachability test. Quick-select buttons cover the common ports, and the result distinguishes between an open port, a closed one, and a timeout, with the response time shown.`,
      `An important limitation: a browser cannot open raw TCP sockets, so this checks reachability by attempting an HTTP/HTTPS connection to the port rather than performing a true low-level port scan.`,
    ],
    steps: [
      `Enter the host or IP address.`,
      `Enter the port number, or tap a common-port quick-select button (80, 443, 22, 3306, and more).`,
      `Click Check Port.`,
      `Read whether the port is open, closed, or timed out, with the detected service and response time.`,
    ],
    why: [
      `Quick-select buttons for ten common ports — web, SSH, FTP, databases, mail — let you check the usual suspects in one tap.`,
      `It distinguishes a timeout from a closed port, which helps tell a firewall-dropped connection from a refused one.`,
      `It identifies the service typically associated with the port, adding context to the result.`,
      `It is honest about scope: because browsers cannot probe raw TCP, it tests reachability via an HTTP/HTTPS connection rather than a full port scan.`,
    ],
    faqs: [
      {
        question: `Is this a real port scanner?`,
        answer: `Not in the traditional sense. A true port scanner opens raw TCP connections, which browsers cannot do. This tool attempts an HTTP/HTTPS request to the host and port and infers the result, so it works best for web-style ports and is a reachability check rather than a full scan.`,
      },
      {
        question: `What is the difference between closed and timeout?`,
        answer: `A closed result means the connection was actively refused or failed quickly, while a timeout means no response came back within the wait period — often a sign of a firewall silently dropping the request. The distinction can help narrow down a connection issue.`,
      },
      {
        question: `What are the common ports used for?`,
        answer: `Port 80 and 443 serve web traffic (HTTP and HTTPS), 22 is SSH, 21 is FTP, 25 is email (SMTP), 3306 is MySQL, and 8080 is a common alternate web port. The quick-select buttons label each so you can check the right one.`,
      },
      {
        question: `Why might an open port show as closed here?`,
        answer: `If a port runs a non-web service (like a raw database or SSH), the browser's HTTP request will fail even though the port is genuinely open, so it can read as closed. This tool is most reliable for web-facing HTTP/HTTPS ports.`,
      },
    ],
    related: [
      { slug: 'ping-tool', note: `Measure round-trip latency to the host before checking ports.` },
      { slug: 'website-status-checker', note: `Confirm a web service on the host is responding.` },
      { slug: 'dns-lookup', note: `Resolve the host to an IP before testing its ports.` },
    ],
  },

  'image-converter': {
    intro: [
      `The right image format depends on where it is going — WebP for fast-loading web pages, PNG for transparency, JPG for photos. This Image Converter changes an image from one format to another right in your browser, across JPG, PNG, WebP, and GIF, with a quality control for the formats that support it.`,
      `Web developers convert photos to WebP to shrink page weight, designers move between PNG and JPG depending on transparency needs, and anyone with an image in the wrong format fixes it here. Because conversion runs on a canvas locally, there is no upload, and a batch can be downloaded as a single ZIP.`,
    ],
    steps: [
      `Upload one or more images (JPG, PNG, WebP, or GIF) by dragging or clicking.`,
      `Choose the target format from the dropdown.`,
      `For JPG or WebP, set the quality with the slider.`,
      `Download each converted image, or grab them all as a ZIP.`,
    ],
    why: [
      `It converts between four formats — JPG, PNG, WebP, and GIF — with a quality slider for the lossy ones, all on an in-browser canvas.`,
      `When converting to JPG, it fills transparency with white so the result looks correct rather than showing black edges.`,
      `Multiple images convert at once and download together as a ZIP, via in-browser zipping.`,
      `Nothing is uploaded — your images are processed entirely on your device, so private photos stay private.`,
    ],
    faqs: [
      {
        question: `Which image format should I use?`,
        answer: `WebP offers the best compression for the web and supports transparency, making it ideal for most online images. PNG is best when you need lossless quality or transparency and WebP is not an option; JPG suits photographs where small file size matters more than perfect fidelity.`,
      },
      {
        question: `Why does converting a transparent PNG to JPG change the background?`,
        answer: `JPG does not support transparency, so transparent areas must be filled with a solid color. This converter fills them with white, which keeps the image looking clean rather than producing black or distorted edges.`,
      },
      {
        question: `Are my images uploaded anywhere?`,
        answer: `No. Conversion happens on a canvas inside your browser, and the files never leave your device. That makes it safe to convert personal photos, screenshots, or confidential images.`,
      },
      {
        question: `Does converting between formats reduce quality?`,
        answer: `Converting to a lossless format like PNG preserves quality, while converting to JPG or WebP applies compression you control with the quality slider. Repeatedly re-saving a photo as JPG can gradually degrade it, so convert from the original when you can.`,
      },
    ],
    related: [
      { slug: 'image-compressor', note: `Shrink the file size further after converting.` },
      { slug: 'image-resizer', note: `Change the pixel dimensions as well as the format.` },
      { slug: 'image-cropper', note: `Trim the image to the framing you want first.` },
    ],
  },

  'image-resizer': {
    intro: [
      `An image is rarely the right size out of the camera or screenshot tool — too large for a web page, the wrong dimensions for a social profile. This Image Resizer scales images to exact pixel dimensions, a percentage of the original, or a ready-made social media size, while optionally locking the aspect ratio so nothing stretches.`,
      `Bloggers shrink photos so pages load fast, social media managers hit the exact dimensions each platform wants, and anyone preparing an avatar or banner gets it sized correctly. Presets for Instagram, Facebook, Twitter, and YouTube remove the guesswork, and resizing happens locally with no upload.`,
    ],
    steps: [
      `Upload one or more images.`,
      `Set the width and height, choose a percentage, or pick a social media preset.`,
      `Keep "maintain aspect ratio" checked to scale proportionally, or uncheck it to set exact dimensions.`,
      `Download each resized image, or all of them as a ZIP.`,
    ],
    why: [
      `It resizes by exact pixels, by percentage, or to built-in social presets (Instagram, Facebook, Twitter, YouTube), covering precise and quick needs alike.`,
      `An aspect-ratio lock prevents distortion by adjusting the other dimension automatically as you type.`,
      `It processes several images and bundles the results into a ZIP for download.`,
      `Resizing runs on a canvas in your browser, so your images are never uploaded.`,
    ],
    faqs: [
      {
        question: `What does maintaining aspect ratio do?`,
        answer: `It keeps the image's width-to-height proportion fixed, so when you change one dimension the other adjusts automatically. This prevents the stretched or squashed look that comes from setting both dimensions independently.`,
      },
      {
        question: `Will resizing reduce image quality?`,
        answer: `Scaling down generally looks fine, since you are discarding pixels. Scaling up beyond the original size cannot add real detail, so enlarged images can look soft. For best results, resize down from a high-resolution original.`,
      },
      {
        question: `What size should I use for social media?`,
        answer: `Each platform has its own ideal — square for an Instagram post, wide for a YouTube thumbnail, and so on. The built-in presets fill in the recommended dimensions for Instagram, Facebook, Twitter, and YouTube so you do not have to look them up.`,
      },
      {
        question: `Are my images uploaded when I resize them?`,
        answer: `No. Resizing is done on a canvas in your browser and the files never leave your device, so personal photos and screenshots stay private throughout.`,
      },
    ],
    related: [
      { slug: 'image-batch-resizer', note: `Resize a large batch of images to the same size at once.` },
      { slug: 'image-compressor', note: `Reduce the file size after setting the dimensions.` },
      { slug: 'image-cropper', note: `Crop to a shape before resizing to exact pixels.` },
    ],
  },

  'image-metadata-remover': {
    intro: [
      `Photos carry hidden metadata — the camera model, the date, software used, and often the exact GPS coordinates where the shot was taken. Before sharing an image publicly, stripping that data protects your privacy. This Image Metadata Remover detects the EXIF data in your images and removes it, letting you choose which categories to clear.`,
      `Anyone posting photos online uses it to avoid leaking their home location through GPS tags, journalists and sources use it to protect sensitive material, and privacy-conscious users clean images as a habit. It reads the metadata, shows which images contain it, and lets you target camera info, GPS, date/time, software, or copyright before exporting clean copies.`,
    ],
    steps: [
      `Upload one or more images (JPG, PNG, or WebP).`,
      `Review which files contain metadata — flagged as you upload — and choose the categories to remove.`,
      `Remove the selected metadata.`,
      `Download each cleaned image, or all of them as a ZIP.`,
    ],
    why: [
      `It detects and reports the EXIF metadata in each image, so you can see exactly what would otherwise be exposed — including GPS coordinates.`,
      `You choose which categories to strip — camera, GPS, date, software, or copyright — rather than an all-or-nothing wipe.`,
      `It removes metadata by redrawing the image on a canvas, producing a genuinely clean copy.`,
      `Everything happens in your browser; sensitive photos are never uploaded to a server.`,
    ],
    faqs: [
      {
        question: `What is EXIF metadata and why remove it?`,
        answer: `EXIF is data embedded in photos by cameras and phones — including the device model, timestamp, settings, and frequently the GPS location. Removing it before sharing protects your privacy, since a posted photo can otherwise reveal where and when it was taken.`,
      },
      {
        question: `Does removing metadata change how the image looks?`,
        answer: `No. The visible image is unchanged; only the hidden data attached to the file is stripped. The tool redraws the pixels onto a clean canvas, so the picture looks identical while the embedded information is gone.`,
      },
      {
        question: `Do social media sites already remove this?`,
        answer: `Many platforms strip some metadata on upload, but not all do, and not consistently — and you may share images by email, messaging, or direct download where nothing is removed. Clearing it yourself first guarantees the data is gone.`,
      },
      {
        question: `Are my photos uploaded to do this?`,
        answer: `No. The metadata is read and removed entirely within your browser, and the images never leave your device — which is exactly what you want for a privacy tool handling potentially sensitive photos.`,
      },
    ],
    related: [
      { slug: 'image-compressor', note: `Reduce file size, which also discards metadata as a side effect.` },
      { slug: 'image-converter', note: `Change the format of your cleaned image.` },
      { slug: 'image-resizer', note: `Resize the image after stripping its metadata.` },
    ],
  },

  'image-batch-resizer': {
    intro: [
      `Resizing one image is easy; resizing fifty to the same dimensions is a chore. This Image Batch Resizer applies one set of dimensions across an entire batch at once, with a "skip if smaller" option so you never accidentally upscale images that are already small, and a toggle for how the output files are named.`,
      `Photographers preparing a gallery, e-commerce sellers standardizing product shots, and anyone with a folder of images to normalize use it to process the whole set in one pass. Like the single resizer it offers presets, percentages, and an aspect-ratio lock, but it is built for volume — and downloads everything as a ZIP.`,
    ],
    steps: [
      `Upload all the images you want to resize.`,
      `Set the target dimensions, a percentage, or a social preset, and choose whether to lock the aspect ratio.`,
      `Optionally enable "skip if smaller" to avoid upscaling, and choose whether to add a "_resized" suffix.`,
      `Process the batch and download the results as a ZIP.`,
    ],
    why: [
      `It applies one target size across an entire batch in a single pass, instead of resizing images one at a time.`,
      `A "skip if smaller" option leaves already-small images untouched, preventing quality-destroying upscaling, and labels which were skipped.`,
      `A filename-suffix toggle lets you keep original names or mark the resized copies, useful for organized exports.`,
      `All processing is local on a canvas, with the batch delivered as a single ZIP — nothing is uploaded.`,
    ],
    faqs: [
      {
        question: `How is this different from the standard image resizer?`,
        answer: `Both resize to dimensions, percentages, or presets, but the batch resizer is geared for processing many images to the same size at once and adds bulk-focused options: skipping images already smaller than the target, and controlling the output filename suffix.`,
      },
      {
        question: `What does "skip if smaller" do?`,
        answer: `When enabled, any image whose dimensions are already at or below your target is left at its original size rather than being enlarged. This avoids the blurry result of upscaling and is useful when standardizing a mixed set where some images are already small.`,
      },
      {
        question: `Can the images be different sizes to start with?`,
        answer: `Yes. You can upload images of any sizes, and they will all be resized toward the same target dimensions (subject to the aspect-ratio and skip-smaller settings). The results download together as a ZIP.`,
      },
    ],
    related: [
      { slug: 'image-resizer', note: `Resize a single image with the same presets and controls.` },
      { slug: 'image-compressor', note: `Compress the batch to reduce file sizes after resizing.` },
      { slug: 'image-converter', note: `Convert the resized images to another format.` },
    ],
  },

  'hash-generator': {
    intro: [
      `A hash is a fixed-length fingerprint of data — the same input always produces the same hash, but you cannot reverse it back to the original. This Hash Generator computes MD5, SHA-1, SHA-256, and SHA-512 hashes of any text, so you can verify integrity, compare values, or generate checksums.`,
      `Developers use it to verify that text or a value matches an expected checksum, to generate digests for caching keys, or to learn how the algorithms differ. You can compute several algorithms at once, have them update automatically as you type, and copy any result with a click.`,
    ],
    steps: [
      `Type or paste your text into the input box.`,
      `Select the hash algorithms you want — MD5, SHA-1, SHA-256, or SHA-512.`,
      `Read the generated hashes, which update automatically as you type unless you turn that off.`,
      `Toggle uppercase if you need it, and copy any hash to the clipboard.`,
    ],
    why: [
      `It generates four algorithms — MD5, SHA-1, SHA-256, and SHA-512 — side by side, so you can produce or compare several at once.`,
      `The SHA family is computed with the browser's built-in Web Crypto API, giving correct, standard results.`,
      `It auto-generates as you type and offers uppercase output, with one-click copy for each hash.`,
      `Hashing happens entirely in your browser, so the text you hash is never transmitted.`,
    ],
    faqs: [
      {
        question: `What is a hash used for?`,
        answer: `Hashing turns data into a fixed-length fingerprint used to verify integrity (confirming a file or message has not changed), to compare values without storing the original, and as a building block in checksums and caching. It is one-way: you cannot recover the input from the hash.`,
      },
      {
        question: `Which hash algorithm should I use?`,
        answer: `For integrity and general use, SHA-256 is the modern default. SHA-512 is stronger still. MD5 and SHA-1 are fast and fine for non-security checksums, but both are considered broken for security purposes and should not be used to protect passwords or signatures.`,
      },
      {
        question: `Is hashing the same as encryption?`,
        answer: `No. Encryption is reversible with a key, so the original data can be recovered; hashing is one-way and cannot be reversed. Hashing verifies and fingerprints data, while encryption protects and later restores it.`,
      },
      {
        question: `Can I hash a file with this?`,
        answer: `This tool hashes text you type or paste, not uploaded files. For checksums of text, configuration, or any string it works directly; to hash a file's contents, you would need a file-hashing tool instead.`,
      },
    ],
    related: [
      { slug: 'password-generator', note: `Create strong random passwords to protect, then hash separately.` },
      { slug: 'base64-encoder', note: `Encode data reversibly when you need to recover it, unlike a hash.` },
      { slug: 'uuid-generator', note: `Generate unique identifiers rather than content fingerprints.` },
    ],
  },

  'ascii-art-generator': {
    intro: [
      `ASCII art turns a picture into text — an image rebuilt entirely from characters, the kind of thing that looks great in a code comment, a terminal banner, or a retro README. This generator converts an uploaded image into ASCII by mapping the brightness of each part of the picture to a character, from dense symbols for dark areas to spaces for light ones.`,
      `Developers drop ASCII versions of a logo into project files, hobbyists make text art for forums and chat, and the nostalgic recreate a classic internet aesthetic. You control the output width and pick from several character sets — including solid block characters for a bolder look — and can invert the mapping for light-on-dark backgrounds.`,
    ],
    steps: [
      `Upload an image (JPG, PNG, or GIF).`,
      `Choose a character set — Standard, Simple, Complex, or Blocks — and set the output width.`,
      `Tick "invert colors" if your background is dark.`,
      `Generate the art, then copy it or download it as a text file.`,
    ],
    why: [
      `It offers four character ramps, from a simple set to a dense complex one and solid block characters, for different levels of detail and style.`,
      `An adjustable output width lets you balance detail against how wide the art needs to fit, and it corrects for the tall shape of text characters so the image is not stretched.`,
      `An invert option flips the brightness mapping for dark-background displays like terminals.`,
      `Conversion runs on a canvas in your browser, so your image is never uploaded.`,
    ],
    faqs: [
      {
        question: `How does an image become ASCII art?`,
        answer: `The image is sampled into a grid, and the brightness of each cell is measured. Darker areas map to dense characters and lighter areas to sparse ones or spaces, so the arrangement of characters recreates the light and shadow of the original picture.`,
      },
      {
        question: `What does the character set choice change?`,
        answer: `Each set is a different ramp from dark to light. The complex set uses many characters for fine gradation and detail, the simple set is cleaner, and the blocks set uses solid shading characters for a bold, high-contrast look. Pick the one that suits your image and where it will be displayed.`,
      },
      {
        question: `Why does my ASCII art look best in a monospace font?`,
        answer: `ASCII art relies on every character occupying the same width so the grid lines up. In a proportional font the columns shift and the picture distorts, so display it in a monospace font — as code editors and terminals use — to keep it aligned.`,
      },
    ],
    related: [
      { slug: 'meme-generator', note: `Add text captions over an image instead of converting it to text.` },
      { slug: 'image-converter', note: `Convert your source image's format before generating art.` },
      { slug: 'filter-effect-studio', note: `Boost contrast first for a clearer ASCII result.` },
    ],
  },

  'filter-effect-studio': {
    intro: [
      `Good photo editing is often just the right adjustments — a brightness nudge, more contrast, a vintage tint. The Filter Effect Studio applies a wide range of effects to an image in real time: core adjustments like brightness, contrast, and saturation, color treatments like grayscale and sepia, plus creative touches like blur, vignette, film grain, pixelation, and edge detection.`,
      `Casual editors fix and stylize a photo before posting, designers prototype a look, and the curious experiment with effects without installing software. Every change previews live, you can flip back to the original to compare, and the finished image downloads as a PNG or JPG — all processed locally.`,
    ],
    steps: [
      `Upload an image (JPG, PNG, or WebP).`,
      `Adjust the sliders — brightness, contrast, saturation, exposure, hue, blur, vignette, grain, pixelate, edge detection — and toggle grayscale, sepia, or invert.`,
      `Use "show original" to compare before and after, and "reset all" to start over.`,
      `Download the result as PNG or JPG.`,
    ],
    why: [
      `It combines standard adjustments with creative effects — vignette, film grain, pixelation, and edge detection — that simple filter tools usually lack.`,
      `Every adjustment previews in real time on a canvas, with a one-tap toggle to compare against the original.`,
      `It exports to PNG or JPG, and resets cleanly when you want to start fresh.`,
      `All editing happens in your browser, so your photos are never uploaded.`,
    ],
    faqs: [
      {
        question: `What is the difference between brightness, exposure, and contrast?`,
        answer: `Brightness and exposure both lighten or darken the whole image, while contrast changes the gap between the lightest and darkest areas — raising it makes shadows deeper and highlights brighter. Adjusting them together gives you control over both overall lightness and the punchiness of the image.`,
      },
      {
        question: `What does the vignette effect do?`,
        answer: `A vignette darkens the edges and corners of the image, drawing the eye toward the center. It is a classic photographic and cinematic touch that adds focus and a slightly vintage feel, and the slider lets you control how strong it is.`,
      },
      {
        question: `Will applying many effects reduce quality?`,
        answer: `Effects are applied to the image as displayed, and exporting as PNG keeps the result lossless. Heavy effects like strong blur or pixelation deliberately alter detail, but the tool does not degrade the image beyond the effects you choose to apply.`,
      },
      {
        question: `Are my photos uploaded to apply filters?`,
        answer: `No. All filtering is done on a canvas within your browser, and the image never leaves your device, so you can edit personal photos privately.`,
      },
    ],
    related: [
      { slug: 'image-cropper', note: `Crop and straighten the image before styling it.` },
      { slug: 'meme-generator', note: `Add captions to your filtered image.` },
      { slug: 'image-converter', note: `Convert the finished image to another format.` },
    ],
  },

  // ── Batch 10: Final creative tools (2) — completes all functional tools ──

  'meme-sticker-studio': {
    intro: [
      `Where a basic meme maker gives you top and bottom text, this Sticker Studio is a layered canvas: stack an image, text, and emoji stickers, drag each one exactly where you want it, reorder them, and composite the whole thing into a single shareable picture. A library of dozens of emoji stickers means you can react, decorate, and annotate without leaving the page.`,
      `Social media creators build reaction images and announcements, community moderators make custom stickers for chats, and anyone jazzing up a photo uses it to drop hearts, fire, or laughing faces wherever they like. Because it works in layers with full undo and redo, you can experiment freely — nudging a sticker, restyling text, or removing a layer — without starting over.`,
    ],
    steps: [
      `Upload a base image, or start on the blank canvas.`,
      `Add text layers and click emoji stickers from the library to drop them onto the canvas.`,
      `Drag each layer to position it, then reorder, hide, or delete layers in the panel; use undo and redo freely.`,
      `Download the finished composition as PNG, JPG, or WebP.`,
    ],
    why: [
      `It is a true layer-based compositor — image, text, and sticker layers you can drag, reorder, hide, and delete — rather than a fixed two-caption template.`,
      `A library of dozens of emoji stickers plus styled text (with outline) lets you decorate and annotate in one place.`,
      `Full undo and redo make editing non-destructive, so you can experiment without fear of ruining your work.`,
      `Everything composites on an in-browser canvas and exports to PNG, JPG, or WebP — your image is never uploaded.`,
    ],
    faqs: [
      {
        question: `How is this different from the basic meme generator?`,
        answer: `The meme generator focuses on adding caption text to an image. The Sticker Studio is a fuller editor: it works in layers, includes an emoji sticker library, lets you drag and reorder every element, and supports undo and redo for non-destructive editing.`,
      },
      {
        question: `Can I make a transparent sticker to use elsewhere?`,
        answer: `Export as PNG, which supports transparency, to keep areas without a background see-through. Starting from the blank canvas and adding only the elements you want lets you build a sticker you can drop onto other images or chats.`,
      },
      {
        question: `Will there be a watermark on my creation?`,
        answer: `No. The canvas is composited and downloaded directly in your browser, so the file you save is clean — no watermark or branding is added.`,
      },
      {
        question: `Are my uploaded images private?`,
        answer: `Yes. Images are loaded and composited entirely within your browser and never sent to a server, so any personal photo you use as a base stays on your device.`,
      },
    ],
    related: [
      { slug: 'meme-generator', note: `For quick top-and-bottom caption memes, the simpler maker is faster.` },
      { slug: 'image-cropper', note: `Crop your base image to the right framing before decorating it.` },
      { slug: 'filter-effect-studio', note: `Apply filters and effects to the image before adding stickers.` },
    ],
  },

  'optical-illusion-lab': {
    intro: [
      `Optical illusions are math made visible — spirals, interference patterns, and motion effects that trick the eye into seeing movement or depth that is not there. This lab renders five algorithmic illusions live and lets you bend their parameters in real time, then animate them so the effect comes alive.`,
      `Teachers demonstrate perception and pattern in class, designers generate hypnotic backgrounds and visuals, and the curious simply play with mesmerizing geometry. You choose from an Archimedean or logarithmic spiral, a moiré pattern, a geometric illusion, or a motion illusion, then tune the density, size, rotation, and animation speed, and recolor it in grayscale, rainbow, or your own custom palette.`,
    ],
    steps: [
      `Pick an illusion type: Archimedean spiral, logarithmic spiral, moiré pattern, geometric, or motion.`,
      `Adjust the density, size, and rotation sliders to shape the pattern.`,
      `Choose a color scheme — grayscale, rainbow, or two custom colors — and press play to animate, setting the speed.`,
      `Download your creation as a PNG or JPG.`,
    ],
    why: [
      `It generates five mathematically distinct illusions algorithmically, so you explore real parametric patterns rather than a handful of fixed presets.`,
      `Real-time sliders for density, size, rotation, and speed let you reshape and animate the pattern and watch it respond instantly.`,
      `Color schemes — grayscale, rainbow, or a custom two-color palette — change the whole mood of the illusion.`,
      `Everything renders on an in-browser canvas and exports to an image, with no account.`,
    ],
    faqs: [
      {
        question: `What kinds of optical illusions can I make?`,
        answer: `Five: an Archimedean spiral (evenly spaced coils), a logarithmic spiral (coils that grow exponentially), a moiré pattern (interference from overlapping line sets), a geometric illusion built from arranged circles, and a motion illusion of concentric circles with a wave offset.`,
      },
      {
        question: `How does the animation create a sense of motion?`,
        answer: `Pressing play continuously rotates or shifts the pattern frame by frame, and at the right speed your visual system perceives flowing or pulsing movement. The speed slider controls how fast the rotation advances, changing the intensity of the effect.`,
      },
      {
        question: `What do the density and size sliders change?`,
        answer: `Density controls how many elements make up the pattern — the number of spiral turns, the line spacing in a moiré, or the count of shapes and circles — while size scales the geometric and motion illusions. Together they let you go from sparse and bold to dense and intricate.`,
      },
      {
        question: `Can I use these illusions in my own projects?`,
        answer: `Yes — download your creation as a PNG or JPG and use it as a background, graphic, or teaching aid. Since you generate it yourself from the parameters you choose, you can make as many unique variations as you like.`,
      },
    ],
    related: [
      { slug: 'ascii-art-generator', note: `Turn an image into character-based art for a different visual style.` },
      { slug: 'filter-effect-studio', note: `Apply effects and color treatments to images you create.` },
      { slug: 'meme-sticker-studio', note: `Composite your illusion with text and stickers.` },
    ],
  },

  // ── Follow-up: internet-speed-test (widget rewired to real measurement) ──

  'internet-speed-test': {
    intro: [
      `How fast is your connection, really? The Internet Speed Test measures your actual download and upload speeds along with latency and jitter, by transferring real data to and from Cloudflare's global measurement network — the same backend behind speed.cloudflare.com.`,
      `People run it to check whether they are getting the speeds their plan promises, to diagnose buffering and lag, or to compare Wi-Fi against a wired connection. Download and upload speeds tell you how much bandwidth you have, while latency (ping) and jitter reveal how responsive and stable the link is — the figures that matter most for video calls and gaming. Your last several results are kept so you can compare runs across the day or different rooms.`,
      `Because measuring throughput means actually moving data, the test exchanges traffic with Cloudflare's servers; only that measurement traffic leaves your browser, with optional analytics logging turned off.`,
    ],
    steps: [
      `Click Start Speed Test — for the most accurate result, close other downloads and streaming first.`,
      `Watch the progress as it measures latency, then download, then upload speed.`,
      `Read your download and upload speeds in Mbps, plus latency and jitter in milliseconds.`,
      `Use Stop to cancel a run, and check the history to compare it against earlier tests; Copy saves the result.`,
    ],
    why: [
      `It performs a genuine measurement against Cloudflare's worldwide network, so the download and upload figures reflect your real throughput — not an estimate or simulation.`,
      `It reports latency and jitter alongside bandwidth, the responsiveness metrics that determine call and game quality, which simple speed tests often omit.`,
      `It keeps a short history of recent runs so you can compare connections, rooms, or times of day.`,
      `Analytics logging is disabled, so beyond the unavoidable measurement traffic to Cloudflare, nothing about your test is recorded, and there is no sign-up.`,
    ],
    faqs: [
      {
        question: `Why are my speeds lower than the plan I pay for?`,
        answer: `Many factors sit between your plan's headline rate and a real-world result: Wi-Fi signal strength, other devices using the connection, your hardware, and network congestion. For the closest comparison to your plan, test on a wired connection with other activity paused.`,
      },
      {
        question: `What do latency and jitter mean?`,
        answer: `Latency, or ping, is the round-trip time for data in milliseconds — lower is better, and it governs how responsive browsing, calls, and games feel. Jitter is the variation in that latency; low, steady jitter means a stable connection, while high jitter causes stutter in real-time apps.`,
      },
      {
        question: `What is a good internet speed?`,
        answer: `It depends on use: roughly 25 Mbps download handles HD streaming for a household, while 4K, large downloads, and many simultaneous users benefit from 100 Mbps or more. Upload speed matters for video calls and uploading files; latency under about 50 ms is good for gaming.`,
      },
      {
        question: `Does the test use my data, and is it private?`,
        answer: `Yes, it transfers real data to measure throughput, so it consumes some of your data allowance — worth noting on a metered or mobile connection. The test runs against Cloudflare's network with extra analytics logging disabled, so only the measurement traffic itself leaves your browser.`,
      },
    ],
    related: [
      { slug: 'ping-tool', note: `Measure round-trip latency to a specific host over several requests.` },
      { slug: 'website-status-checker', note: `Check whether a particular site is up and how fast it responds.` },
      { slug: 'address-lookup', note: `See the IP address and ISP your connection is using.` },
    ],
  },

  // ── Converter Tools ───────────────────────────────────────────────────────────

  'color-converter': {
    intro: [
      `Every screen, printer, and design application speaks a slightly different color dialect. HEX codes power the web, RGB drives monitors and digital displays, HSL gives designers an intuitive way to adjust hue and lightness, and CMYK governs the inks used in offset printing. Jumping between them manually means running through formulas that are easy to get wrong — this converter keeps all four formats in sync simultaneously, updating every field the moment you change any one of them.`,
      `Front-end developers reach for it when a designer hands them a CMYK swatch from a brand guide and they need the HEX code for a stylesheet. Print designers need it when a client approves a web color and they must verify the CMYK build before sending to press. Illustrators and UI designers use the HSL view to tweak lightness without losing the hue. The live preview swatch lets you see the actual color immediately, so you know the conversion is correct before you copy anything.`,
      `All math runs entirely in your browser — no image files, no sign-up, no external service. Conversions use direct mathematical formulas: RGB to HSL via the max/min channel algorithm, RGB to CMYK via the standard ink-key calculation, and back again. The result is exact, not an approximation.`,
    ],
    steps: [
      `Choose the format you are starting from and type or paste the value into that row — HEX as a six-digit code, RGB as three numbers 0–255, HSL as hue 0–360 and saturation/lightness 0–100%, or CMYK as four percentages 0–100%.`,
      `All other format fields update instantly as you type.`,
      `Watch the color swatch at the top to confirm the color looks correct.`,
      `Click any Copy button to copy that format to your clipboard.`,
    ],
    why: [
      `True two-way conversion across all four formats in one step — changing any field syncs HEX, RGB, HSL, and CMYK simultaneously rather than requiring separate roundtrips.`,
      `All conversion math runs in-browser with no external calls, so private brand colors and client work never leave your machine.`,
      `The live color preview swatch gives instant visual confirmation that the color is correct before you copy it into a design file or stylesheet.`,
      `No libraries required — the pure JavaScript formulas guarantee accuracy without dependency version drift.`,
    ],
    faqs: [
      {
        question: `Why does my CMYK not match what I expected?`,
        answer: `CMYK values calculated mathematically from RGB are "device-independent" — the real ink output depends on the print profile and paper. This tool gives you the mathematical CMYK equivalent, which is the right starting point, but always proof-print or use an ICC-profiled workflow for exact press results.`,
      },
      {
        question: `What is the difference between HSL and HSB/HSV?`,
        answer: `HSL (Hue, Saturation, Lightness) and HSB/HSV (Hue, Saturation, Brightness/Value) are related but different. In HSL, 50% lightness is a pure color while 100% is white; in HSB, 100% brightness is a pure saturated color. This tool converts to HSL, which CSS and most design tools understand directly.`,
      },
      {
        question: `Is my color data private?`,
        answer: `Yes. All conversion happens locally in your browser — no color values are sent to any server. The tool works offline once the page has loaded.`,
      },
      {
        question: `Why are HEX codes six digits?`,
        answer: `Each pair of hex digits represents one channel: the first pair is Red, the second Green, the third Blue. Hexadecimal (base 16) fits each channel's 0–255 range into exactly two characters (00 to FF), making HEX codes compact and universally understood in web and design contexts.`,
      },
    ],
    related: [
      { slug: 'color-palette', note: `Extract the dominant color palette from any uploaded image.` },
      { slug: 'unit-converter', note: `Convert other measurement types including length, weight, and temperature.` },
    ],
  },

  'temperature-converter': {
    intro: [
      `Celsius and Fahrenheit coexist in daily life in a way almost no other unit pair does — weather apps switch between them depending on where you are, recipes cross the Atlantic, and scientific contexts demand Kelvin. Converting between them by memory (multiply by 9/5, add 32, subtract 32, multiply by 5/9) is doable but error-prone, especially for Kelvin where the offset is 273.15.`,
      `Cooks converting a European recipe to a US oven temperature, travelers checking the forecast in an unfamiliar country, students working through a chemistry problem in Kelvin, and lab technicians standardizing readings across instruments all run into the same friction. The preset buttons for Absolute Zero, Freezing, Room Temperature, Body Temperature, and Boiling Point are shortcuts for the reference values people look up most often — type a Celsius value and instantly see Fahrenheit and Kelvin, or tap a preset to verify you remember the equivalent correctly.`,
      `The companion table shows a dozen common reference temperatures in all three scales side by side. It is the kind of quick-glance chart that used to hang on a refrigerator door — now searchable and always current.`,
    ],
    steps: [
      `Type a value in the Celsius, Fahrenheit, or Kelvin field — any of the three updates the other two immediately.`,
      `Or click a quick-preset button (Absolute Zero, Freezing, Room Temp, Body Temp, Boiling) to jump to a standard reference point.`,
      `Use the Copy button next to any field to copy that value to your clipboard.`,
      `Refer to the reference table below for a quick overview of common temperatures in all three scales.`,
    ],
    why: [
      `Instant three-way sync means editing any one field automatically updates both others — no clicking Convert.`,
      `Preset buttons for the five most-referenced temperatures (Absolute Zero through Boiling) save typing when you need a quick sanity check.`,
      `The reference table presents twelve real-world temperature landmarks in all three scales for at-a-glance comparison.`,
      `All conversions use exact formulas (F = C × 9/5 + 32; K = C + 273.15) with no rounding until display, so results are accurate to multiple decimal places.`,
    ],
    faqs: [
      {
        question: `What is the formula to convert Celsius to Fahrenheit?`,
        answer: `F = C × 9/5 + 32. For example, 100°C (boiling water) is 100 × 9/5 + 32 = 212°F. To convert Fahrenheit back to Celsius: C = (F − 32) × 5/9.`,
      },
      {
        question: `What is Absolute Zero and why does it matter?`,
        answer: `Absolute Zero is the lowest theoretically possible temperature: −273.15°C, −459.67°F, or 0 K. It is the point where particles have minimum thermal energy. Kelvin is measured from this point, which is why 0 K equals −273.15°C, and scientific calculations in thermodynamics and chemistry often use Kelvin.`,
      },
      {
        question: `What is normal body temperature in Fahrenheit?`,
        answer: `The classic figure is 98.6°F (37°C / 310.15 K), derived from a 19th-century German study. Modern research shows average body temperature is closer to 97.9°F (36.6°C), and it varies by individual, time of day, and measurement method.`,
      },
      {
        question: `Why does Kelvin not use a degree symbol?`,
        answer: `Kelvin is an absolute thermodynamic scale, not a relative "degree" scale. The SI system officially dropped the degree symbol for Kelvin in 1967 to reflect this — you write 373.15 K, not 373.15°K.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert length, weight, speed, volume, and other measurement categories.` },
      { slug: 'wind-chill-heat-index-calculator', note: `Calculate how temperature actually feels with wind chill or humidity factored in.` },
    ],
  },

  'number-base-converter': {
    intro: [
      `Binary, octal, decimal, and hexadecimal are not four separate number systems — they are four different ways of writing the same integer. Computers work in binary (base 2) internally, memory addresses and color codes appear in hexadecimal (base 16), Unix file permissions are conventionally written in octal (base 8), and decimal (base 10) is what most humans think in. Moving fluidly between them is a fundamental skill for programmers, network engineers, and computer science students.`,
      `A front-end developer might start with the hex color code #1A73E8, want to see its decimal RGB channels, and then check the binary representation of each channel to understand bit-masking. A student debugging a microcontroller might need to convert a decimal sensor reading to binary to verify individual bit flags. An admin reading octal chmod permissions like 0755 needs to understand which read/write/execute bits are set. This converter shows all four representations at once and updates live as you type in any one of them.`,
      `Real-time validation highlights illegal characters for the selected base — you cannot type the digit 2 in binary mode, and letters beyond F are flagged red in hex — so you know immediately if your input is valid.`,
    ],
    steps: [
      `Type your number into the Binary, Octal, Decimal, or Hexadecimal input field.`,
      `All other bases update instantly. Invalid characters are highlighted in red with a message explaining what is allowed.`,
      `Hexadecimal values are displayed in uppercase (A–F).`,
      `Click Copy on any field to copy that representation to your clipboard.`,
    ],
    why: [
      `All four bases display simultaneously — you see the number in every representation at once without toggling between modes.`,
      `Per-field character validation prevents illegal input for each base (e.g., 2–9 are flagged red in binary) so you catch errors while typing.`,
      `Uses JavaScript's built-in parseInt(n, base).toString(base) for reliable, spec-compliant conversion across all supported bases.`,
      `No libraries, no upload, no account — works offline once the page loads.`,
    ],
    faqs: [
      {
        question: `What does "base" mean in number systems?`,
        answer: `The base (or radix) tells you how many unique digits the system uses before cycling to the next position. Binary (base 2) uses only 0 and 1; decimal (base 10) uses 0–9; hexadecimal (base 16) uses 0–9 plus A–F for values ten through fifteen.`,
      },
      {
        question: `Why do programmers use hexadecimal so often?`,
        answer: `One hex digit represents exactly 4 binary bits (a "nibble"), and two hex digits represent a full byte (8 bits). That tight mapping makes hex far more compact than binary while still being directly convertible — which is why memory addresses, color codes, and cryptographic hashes are expressed in hex.`,
      },
      {
        question: `What is the largest number this converter handles?`,
        answer: `The converter works up to JavaScript's Number.MAX_SAFE_INTEGER (2^53 − 1 = 9,007,199,254,740,991 in decimal). Beyond that, floating-point precision limits make integer results unreliable. For very large integers, use BigInt-based tools instead.`,
      },
      {
        question: `Why does my hex input need to be uppercase?`,
        answer: `It does not — the converter accepts both uppercase (A–F) and lowercase (a–f) hex input. Output is normalized to uppercase, which is the most common convention in technical documentation, memory dumps, and color codes.`,
      },
    ],
    related: [
      { slug: 'base64-encoder', note: `Encode binary data to Base64 text for safe transport in URLs and JSON.` },
      { slug: 'unit-converter', note: `Convert measurement units across length, weight, temperature, and more.` },
    ],
  },

  'data-storage-converter': {
    intro: [
      `File size units are one of those things that trip people up constantly: is a gigabyte 1,000 megabytes or 1,024? For this tool — and for operating systems, RAM specifications, and most technical contexts — the answer is 1,024, the base-2 (binary) standard. So 1 KB = 1,024 bytes, 1 MB = 1,048,576 bytes, and so on up to petabytes. Paste in any value in any unit and every other unit appears immediately.`,
      `Cloud storage shoppers comparing plans in terabytes with file sizes in megabytes use it to figure out how many photos actually fit. Sysadmins converting server disk quotas between gigabytes and terabytes, developers sizing database limits expressed in bytes, and students answering "how many gigabytes in a terabyte?" on a homework problem all hit the same need: see the value in every unit without doing the math by hand.`,
      `The converter shows the full ladder from bytes to petabytes in a single view — type 1.5 GB and instantly see it rendered as 1,610,612,736 bytes, 1,572,864 KB, 1,536 MB, 0.00146 TB, and 0.00000143 PB, formatted to a sensible number of significant digits.`,
    ],
    steps: [
      `Type your file size value in the input field and choose its unit from the dropdown (B, KB, MB, GB, TB, or PB).`,
      `All other units appear immediately in the result grid below.`,
      `Click Copy next to any row to copy that value to your clipboard.`,
    ],
    why: [
      `Shows all six units simultaneously — bytes through petabytes — in one grid so you can compare without switching back and forth.`,
      `Uses strict base-2 (1024) multipliers, the standard for OS file sizes, RAM, and most technical specifications.`,
      `Smart formatting applies appropriate precision: very small values show more decimal places, very large ones trim to significant figures so results stay readable.`,
      `Runs entirely in your browser with no network calls.`,
    ],
    faqs: [
      {
        question: `Is 1 KB 1,000 bytes or 1,024 bytes?`,
        answer: `In the binary (base-2) standard used by operating systems, RAM, and most hardware specs, 1 KB = 1,024 bytes. Hard drive manufacturers often use decimal (1 KB = 1,000 bytes) to make capacities appear larger, which is why a "500 GB" drive shows up as about 465 GB in Windows. This converter uses the binary 1,024 standard.`,
      },
      {
        question: `How many gigabytes are in a terabyte?`,
        answer: `1 TB = 1,024 GB in the binary standard. So 1 terabyte holds 1,024 gigabytes, or 1,048,576 megabytes. In the decimal system used by drive manufacturers, 1 TB = 1,000 GB.`,
      },
      {
        question: `What is a petabyte?`,
        answer: `A petabyte is 1,024 terabytes (about 1.1 quadrillion bytes). Hyperscale data centers and major cloud providers measure storage in petabytes. One petabyte could hold roughly 250,000 hours of HD video.`,
      },
      {
        question: `Why does my operating system show a different size than the label on a drive?`,
        answer: `Drive manufacturers label capacity using decimal (1 GB = 10^9 bytes) while operating systems like Windows and Linux report using binary (1 GiB = 2^30 bytes). A drive sold as 1 TB therefore shows about 931 GiB in Windows. This converter uses the binary standard.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert other measurement categories including length, weight, and speed.` },
      { slug: 'number-base-converter', note: `Convert between binary, octal, decimal, and hexadecimal representations.` },
    ],
  },

  'timezone-converter': {
    intro: [
      `Scheduling across time zones without getting it wrong requires knowing both the current offset and whether each city is observing daylight saving time right now. A fixed UTC offset is not enough — New York shifts from UTC−5 to UTC−4 in March, and Sydney does the opposite in April. This converter uses your browser's built-in time-zone database (via the Intl.DateTimeFormat API), so the offsets it shows are always correct for the specific date you pick.`,
      `Remote engineering teams use it to find a stand-up time that works from San Francisco to Berlin to Singapore. Event organizers post a livestream time and then verify it in half a dozen attendee cities. Travelers confirm what time their connecting flight boards in local time. Freelancers working with international clients know at a glance whether their counterpart is reachable or asleep. You can add up to eight comparison time zones simultaneously and switch between 12-hour and 24-hour display to match what the other person expects to see.`,
    ],
    steps: [
      `Set the base date and time using the date/time picker — it defaults to right now.`,
      `Choose the base time zone (the one your time is already in) from the dropdown.`,
      `The preset comparison zones appear below. Click Add Zone to add more, or the × button on any card to remove one.`,
      `Toggle 12hr / 24hr to match your preference. Each card shows the local time, date, and UTC offset for that zone.`,
    ],
    why: [
      `Uses the browser's native Intl.DateTimeFormat time-zone database — daylight saving transitions are handled automatically, with no manual offset table to maintain.`,
      `Supports up to eight comparison zones simultaneously, so a single view covers an entire distributed team.`,
      `A curated list of nineteen commonly needed IANA zones (from UTC to Pacific/Auckland) covers the major world cities without overwhelming you with hundreds of choices.`,
      `Works entirely client-side — no API call is needed, so it works offline once the page has loaded.`,
    ],
    faqs: [
      {
        question: `Does this handle daylight saving time correctly?`,
        answer: `Yes. It uses the Intl.DateTimeFormat API backed by your browser's IANA time-zone database, which encodes every region's daylight-saving rules. If you pick a date in January for New York, you get EST (UTC−5); pick a date in July and you get EDT (UTC−4) automatically.`,
      },
      {
        question: `What is the difference between EST and EDT?`,
        answer: `EST (Eastern Standard Time) is UTC−5 and applies during winter. EDT (Eastern Daylight Time) is UTC−4 and applies during summer when daylight saving is in effect. The same applies to other time zones — PST/PDT for the US West Coast, BST/GMT for the UK, and so on.`,
      },
      {
        question: `Why use IANA timezone names instead of offsets like UTC+5:30?`,
        answer: `Fixed offsets become wrong when daylight saving kicks in. IANA names like "Asia/Kolkata" encode the full history of rules for a region, including exactly when clocks change. A named zone is always correct; a fixed offset is only correct for part of the year in many regions.`,
      },
      {
        question: `Can I convert a specific meeting time rather than the current time?`,
        answer: `Yes — change the date and time in the base picker to any date and time you like. The comparison cards update immediately, giving you the correct local time for that specific moment in each zone.`,
      },
    ],
    related: [
      { slug: 'time-zone-calculator', note: `A simpler zone converter for quick current-time lookups across twelve major zones.` },
      { slug: 'unit-converter', note: `Convert measurement units across length, weight, temperature, and other categories.` },
    ],
  },

  'roman-numeral-converter': {
    intro: [
      `Roman numerals appear in places decimal numbers do not: movie copyright years (MMXXIV), clock faces, Super Bowl titles (Super Bowl LVIII), chapter headings in formal documents, and the regnal numbers of monarchs. Converting them manually means memorizing M=1000, D=500, C=100, L=50, X=10, V=5, I=1 and applying the subtractive rule — IV is 4 because I before V means subtract. This converter handles both directions in real time.`,
      `Trivia players verifying the year on an old film title, students writing a term paper in formal numbering, designers adding chapter numbers in a book layout, and anyone who wants to know what year MCMLXXXIV is all use a Roman numeral converter. The two-way interface accepts an integer in the left box and shows the Roman form instantly, or accepts a Roman string in the right box and shows the decimal integer — useful when reading an inscription or a tattooed year and wanting the decimal equivalent.`,
      `The tool handles the full classical range of 1 to 3999 (I to MMMCMXCIX). Inputs outside this range or containing invalid Roman characters are flagged with clear error messages rather than silently producing a wrong result.`,
    ],
    steps: [
      `To convert a number to Roman: type an integer (1–3999) in the left input box. The Roman numeral appears on the right instantly.`,
      `To convert Roman to integer: type the Roman numeral string (e.g., MMXXIV) in the right input box. The decimal integer appears on the left.`,
      `Invalid input (out-of-range numbers or unrecognized Roman characters) shows a red error message under the relevant field.`,
      `Use Copy to send the result to your clipboard.`,
    ],
    why: [
      `Real-time two-way conversion means you can work in either direction without toggling a mode or clicking Convert.`,
      `Input validation catches both out-of-range integers and invalid Roman character sequences, so you get an error rather than a silently wrong result.`,
      `Pure JavaScript lookup-table logic — no external libraries — keeps the tool fast and entirely private, running with no network calls.`,
      `Covers the full canonical range 1–3999, which is the standard limit for classical Roman numerals before the system breaks down.`,
    ],
    faqs: [
      {
        question: `Why do Roman numerals stop at 3999?`,
        answer: `The classical system uses M as the largest single symbol (1000), and conventionally repeats symbols no more than three times (MMM = 3000). The next step would require a symbol for 5000 that the standard system does not include. Extended systems exist for larger numbers (e.g., a bar over a letter multiplies by 1000) but are rarely used.`,
      },
      {
        question: `What is the subtractive rule in Roman numerals?`,
        answer: `When a smaller value symbol appears before a larger one, it is subtracted rather than added. IV = 4 (5 − 1), IX = 9 (10 − 1), XL = 40, XC = 90, CD = 400, CM = 900. Only specific pairs are valid — IL (49) is not standard Roman, for example, which is why the converter validates the input.`,
      },
      {
        question: `Is MMXXIV correct for the year 2024?`,
        answer: `Yes. MM = 2000, XX = 20, IV = 4, total 2024. You will see this on film copyright notices and formal publications. The tool confirms it: enter 2024 and the result is MMXXIV.`,
      },
      {
        question: `Are Roman numerals case-sensitive?`,
        answer: `Conventionally Roman numerals are written in uppercase (MCMLXXXIV), but this converter accepts lowercase input (mcmlxxxiv) and normalizes it to uppercase for output.`,
      },
    ],
    related: [
      { slug: 'number-base-converter', note: `Convert numbers between binary, octal, decimal, and hexadecimal.` },
      { slug: 'number-to-words', note: `Spell out any integer as English words, including cheque-writing format.` },
    ],
  },

  'currency-converter': {
    intro: [
      `Exchange rates change every day, and published static charts are outdated the moment they are printed. This converter fetches live rates directly from the Frankfurter open-source API, so the rate you see is what the market set today — not last week. Rates are sourced from the European Central Bank reference rates, which cover the major global currencies.`,
      `Travelers estimating how much local cash to carry, online shoppers comparing prices in foreign storefronts, freelancers invoicing international clients, and anyone receiving a wire transfer in a foreign currency all need a current rate rather than a memorized approximation. The searchable currency menus let you find any currency quickly by code (USD, EUR, LKR) or name, and the swap button reverses the direction in one click. If the network is unavailable, the converter shows a clear error rather than silently displaying a stale rate.`,
      `Because live rates are retrieved from Frankfurter's servers, your selected currency code leaves your browser in the API request. No personal data is transmitted — only the currency code you choose. The converter discloses this openly so you know exactly what data is and is not sent.`,
    ],
    steps: [
      `Enter the amount you want to convert in the input field.`,
      `Choose the source currency (the one you have) from the first dropdown — type to search by code or name.`,
      `Choose the target currency (the one you want) from the second dropdown.`,
      `The converted amount and current rate appear instantly. Use the swap button (⇄) to reverse the direction.`,
    ],
    why: [
      `Live rates from the Frankfurter API (European Central Bank reference rates) mean you see today's market rate, not a cached or static figure.`,
      `Searchable dropdowns let you find currencies by typing a code (LKR, JPY) or a partial name, covering 30+ major global currencies.`,
      `The swap button reverses source and target in one click, making it easy to check the rate in both directions.`,
      `Honest disclosure: the converter clearly states that your currency code is sent to api.frankfurter.app to retrieve rates, so there are no surprises about what leaves your browser.`,
    ],
    faqs: [
      {
        question: `How current are the exchange rates?`,
        answer: `Rates come from the Frankfurter API, which publishes European Central Bank reference rates. ECB rates are updated on business days, typically around 16:00 CET. Weekend and holiday rates remain at the last published value. For forex trading where seconds matter, use a brokerage platform; for everyday conversions, these rates are accurate and current.`,
      },
      {
        question: `Does the converter send my data anywhere?`,
        answer: `It sends only the base currency code (e.g., "USD") to api.frankfurter.app to retrieve the latest rates. No amount you type, no personal information, and no history is transmitted. The Frankfurter API is open-source and does not require an account or API key.`,
      },
      {
        question: `What do I see if I am offline or the API is unavailable?`,
        answer: `The converter shows a clear error message: "Unable to fetch exchange rates. Please check your connection." It does not display stale data as if it were current. Reload the page once you have connectivity to fetch fresh rates.`,
      },
      {
        question: `Why might the rate differ from my bank or card rate?`,
        answer: `Banks and card networks apply a spread (markup) on top of the mid-market rate and may add foreign transaction fees. This converter shows the mid-market ECB reference rate, which is roughly the rate you see on financial news sites — the "true" rate before any fees are applied.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert measurement units including length, weight, and temperature.` },
      { slug: 'tip-calculator', note: `Calculate tips and split bills, useful when dining abroad.` },
    ],
  },

  'cooking-measurement-converter': {
    intro: [
      `Baking is unforgiving about measurements: add 20% too much flour and a cake is dense, too little butter and cookies spread too thin. The challenge is that European recipes measure in grams while American ones use cups and tablespoons, and the conversion is not the same for every ingredient — a cup of flour weighs about 120 g, but a cup of butter weighs about 227 g because they have different densities. This converter handles that correctly by letting you choose the ingredient first, then converts between cups, tablespoons, teaspoons, milliliters, grams, and fluid ounces using the right density for each.`,
      `Home bakers adapting a European pastry recipe, cooks scaling a dish from a metric cookbook to US measures, and meal preppers computing per-serving quantities in a unit their scale can read all face this problem. The ingredient selector covers the most common baking staples — flour, sugar, butter, water, milk, honey, salt, rice, and oats. Volume-to-volume conversions (cups to tablespoons, for example) are ingredient-independent and always exact; mass-to-volume conversions use the ingredient-specific density.`,
    ],
    steps: [
      `Select the ingredient from the dropdown (All-Purpose Flour, White Sugar, Butter, Water, Milk, Honey, Salt, Rice, or Rolled Oats).`,
      `Enter your value in the input field and choose its unit from the unit selector.`,
      `All equivalent quantities appear in the result grid — cups, tablespoons, teaspoons, milliliters, grams, and fluid ounces — simultaneously.`,
      `Copy any row to your clipboard with the Copy button.`,
    ],
    why: [
      `Ingredient-aware density lookup means the gram/cup conversion is correct for each ingredient rather than using a generic water-density figure that would be wrong for flour, butter, and most other foods.`,
      `Covers six units (cups, tablespoons, teaspoons, ml, grams, fl oz) and nine common baking staples in a single tool.`,
      `All conversions are pure JavaScript math — no network calls, no account, works offline.`,
      `The full result grid shows every unit simultaneously, so you can choose whichever your scale or measuring cup accommodates.`,
    ],
    faqs: [
      {
        question: `Why do cups of flour and cups of sugar weigh different amounts?`,
        answer: `Density. Flour is light and airy; sugar is denser. One cup of all-purpose flour weighs about 120 g, while one cup of white sugar weighs about 200 g. That is why a fixed cups-to-grams ratio only works for one specific ingredient — this tool stores each ingredient's density separately.`,
      },
      {
        question: `How many tablespoons are in a cup?`,
        answer: `Exactly 16 tablespoons = 1 cup, which is also 48 teaspoons or about 236.6 ml. This volume relationship is the same regardless of the ingredient, so tablespoon-to-cup and teaspoon-to-ml conversions are ingredient-independent.`,
      },
      {
        question: `Is the flour density in this tool for sifted or unsifted flour?`,
        answer: `The 120 g/cup figure used here is for unsifted all-purpose flour spooned into the cup and leveled off — the most common home-baking method. Sifted flour can weigh as little as 100 g/cup because sifting aerates it. If a recipe specifies sifted flour, the converted gram weight will be slightly less than what this tool shows.`,
      },
      {
        question: `Can I convert honey or sticky liquids the same way?`,
        answer: `Yes. Honey has a density of about 340 g/cup, which is much heavier than water (237 g/cup) because it is significantly denser. The converter uses the honey-specific density for accurate mass↔volume conversion.`,
      },
    ],
    related: [
      { slug: 'unit-converter', note: `Convert general measurement units including volume and weight for non-cooking contexts.` },
      { slug: 'number-to-words', note: `Spell out recipe quantities as words for publishing or accessibility purposes.` },
    ],
  },

  'number-to-words': {
    intro: [
      `Writing a cheque correctly requires spelling out the amount in words on the second line — "One Thousand Two Hundred Thirty-Four Dollars and 56/100 Cents" — while the figures go on the first line. Get it wrong and the bank honors the written words over the numbers, or refuses the cheque entirely. This converter handles that specific formatting automatically, along with standard English word conversion for any integer up to the quadrillions.`,
      `Accounts-payable staff who write checks by hand, small business owners printing payment slips, legal document drafters writing out contract values, teachers generating word-form exercises, and anyone double-checking a large number they are about to write on a cheque all reach for this tool. The standard mode converts a number to plain English (1,234,567 → "One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven"). Cheque mode adds the currency formatting, handling both the integer dollar amount and the cents as a fraction.`,
      `Conversion uses a pure recursive JavaScript algorithm — no libraries. It handles scale words (thousand, million, billion, trillion, quadrillion), the correct hyphenation of compound tens (Twenty-One through Ninety-Nine), and the "and" connector before hundreds that bank style guides require.`,
    ],
    steps: [
      `Type your number in the input field. For cheque mode with cents, use a decimal point (e.g., 1234.56).`,
      `Select Standard or Cheque mode using the toggle at the top.`,
      `The English word output appears instantly in the text area below.`,
      `Click Copy to send the result to your clipboard, ready to paste into a document or payment form.`,
    ],
    why: [
      `Cheque mode formats the output exactly as banks expect — integer words followed by "and XX/100 Cents" — so you can paste directly without reformatting.`,
      `Handles numbers up to 999 quadrillion, covering any practical financial or scientific figure.`,
      `Pure recursive JavaScript logic processes everything in your browser, so sensitive financial figures never leave your device.`,
      `Standard mode output is fully hyphenated (Twenty-One, not Twenty One) per standard English style, suitable for legal documents and formal writing.`,
    ],
    faqs: [
      {
        question: `How do I write a cheque amount correctly?`,
        answer: `Write the dollar amount in words on the "Pay to the order of" line, then add "and XX/100" for the cents — for example, "One Hundred Fifty Dollars and 75/100". Draw a line through any remaining space to prevent alteration. The written words are legally authoritative if they differ from the numeral box.`,
      },
      {
        question: `What is the largest number this tool converts?`,
        answer: `The converter handles integers up to 999,999,999,999,999 (999 quadrillion) — well beyond any everyday financial or scientific figure. Beyond that, JavaScript integer precision limits apply.`,
      },
      {
        question: `Why are the tens hyphenated (Twenty-One vs Twenty One)?`,
        answer: `The Chicago Manual of Style, AP Style Guide, and most grammar authorities require a hyphen in compound numbers from twenty-one to ninety-nine. "Twenty-One" is the correct written form; "Twenty One" is non-standard. The cheque format especially requires this, as handwriting ambiguity could otherwise alter the meaning.`,
      },
      {
        question: `Does this work for currencies other than USD?`,
        answer: `The cheque mode outputs "Dollars and XX/100 Cents" by default, which is the US banking convention. For other currencies, use Standard mode to get the plain words and then add your own currency label — the word conversion itself (e.g., "One Thousand Two Hundred") is currency-neutral.`,
      },
    ],
    related: [
      { slug: 'roman-numeral-converter', note: `Convert integers to Roman numerals for formal headings or year annotations.` },
      { slug: 'number-base-converter', note: `Convert numbers between binary, octal, decimal, and hexadecimal representations.` },
    ],
  },

  // ── Generator tools ──────────────────────────────────────────────────

  'favicon-generator': {
    intro: [
      `A favicon is the tiny logo that sits in the browser tab, the bookmarks bar, and the home screen when someone saves your site — and getting one out of a single logo file usually means wrestling with an image editor. This generator skips all of that: drop in one PNG, JPG, or WebP and it produces every size a modern site needs in one pass.`,
      `Behind the scenes it draws your image onto an HTML5 canvas and rescales it to 16×16, 32×32, 48×48, 180×180, 192×192, and 512×512 — the set that covers browser tabs, the Apple touch icon iOS uses for home-screen shortcuts, and the larger icons Android and progressive web apps reference in a manifest. Non-square images are centre-cropped to a square rather than squashed, so a wide logo still looks right.`,
      `Designers handing off a brand mark, indie developers shipping a side project, and anyone replacing the default Next.js or WordPress icon will find it faster than exporting sizes by hand. The "Download All" button bundles every PNG plus a ready-to-paste block of link tags into a single ZIP.`,
    ],
    steps: [
      `Drag an image onto the upload zone, or click to browse — PNG, JPG, and WebP are accepted.`,
      `Wait a moment while each size is rendered; the preview grid fills in automatically.`,
      `Toggle the light/dark background button to check how the icon reads against both browser themes.`,
      `Click "Download All (.zip)" for the full set, or grab a single size with its individual PNG link.`,
      `Open the included favicon-snippet.html and paste the link tags into your page's head.`,
    ],
    why: [
      `Everything runs locally on a canvas in your browser — your logo is never uploaded to a server, so unreleased branding stays private.`,
      `One upload yields the complete modern set, including the 180×180 Apple touch icon and the 192/512 sizes PWAs need, not just a lone 16×16.`,
      `The light/dark preview catches the common mistake of a dark icon that vanishes against a dark tab strip before you ship it.`,
      `The ZIP ships with the exact HTML link tags, so wiring the favicon into your site is copy-and-paste rather than guesswork.`,
    ],
    faqs: [
      {
        question: `What favicon sizes do I actually need in 2025?`,
        answer: `For broad coverage you want 16×16 and 32×32 for browser tabs, 180×180 for the Apple touch icon used by iOS home screens, and 192×192 plus 512×512 referenced by your web app manifest for Android and PWAs. This tool generates all of them at once.`,
      },
      {
        question: `Does this create a real .ico file?`,
        answer: `No — it outputs PNG icons, which every current browser supports via link tags, plus a conventional favicon.png. The legacy multi-resolution .ico format is not produced here; if you specifically need favicon.ico, point your 32×32 PNG through a dedicated ICO converter.`,
      },
      {
        question: `Is my uploaded image sent anywhere?`,
        answer: `It is not. The file is read with the browser FileReader API and drawn to a canvas entirely on your device. Nothing is transmitted, which makes the tool safe for logos that have not been announced yet.`,
      },
      {
        question: `My logo is rectangular — will it be distorted?`,
        answer: `No. A non-square source is scaled to cover the square and centred, so it is cropped rather than stretched. For the cleanest result, start from a square image or one with even padding around the mark.`,
      },
    ],
    related: [
      { slug: 'image-resizer', note: `Resize or pad your source logo to a clean square before generating icons.` },
      { slug: 'image-converter', note: `Convert an existing icon between PNG, JPG, and WebP if your source is the wrong format.` },
      { slug: 'image-compressor', note: `Shrink the original artwork first if it is a heavy multi-megabyte export.` },
    ],
  },

  'barcode-generator': {
    intro: [
      `Need a scannable barcode for a product label, a library book, a warehouse bin, or an asset tag? This generator turns a line of text or digits into a crisp 1D barcode you can download and print, supporting the symbologies that actually show up in retail and logistics.`,
      `It renders with JsBarcode directly in the page and covers CODE128 and CODE39 for general alphanumeric data, EAN-13 and EAN-8 for international retail, UPC-A for North American products, ITF-14 for shipping cartons, plus MSI, Pharmacode, and Codabar. Each format has strict rules — EAN-13 expects 12 or 13 digits and computes a check digit — and the tool tells you immediately when your data does not fit the chosen format instead of producing an unscannable image.`,
      `Small businesses printing their own price stickers, makers labelling inventory, and developers mocking up packaging all use it the same way: type the data, pick the format, tune the look, and export a PNG.`,
    ],
    steps: [
      `Type or paste your data into the Data field — a valid sample loads for whichever format you pick.`,
      `Choose a symbology from the Format dropdown (CODE128 is the safe default for mixed text).`,
      `Adjust the bar width, height, and margin sliders until the barcode suits your label size.`,
      `Set the bar and background colors, and toggle whether the human-readable text prints beneath the bars.`,
      `Click "Download PNG" to save the barcode rendered at 3× resolution for sharp printing.`,
    ],
    why: [
      `Generation happens in your browser through JsBarcode, so the data you encode — SKUs, asset IDs, tracking numbers — never leaves your machine.`,
      `Live validation flags input that is wrong for the chosen symbology (for example, letters in an EAN-13) before you waste a print run.`,
      `The PNG is rasterized at triple resolution from the vector render, so scanners read it cleanly even at small label sizes.`,
      `Ten formats sit behind one dropdown, covering both the fixed-length retail GTINs and the flexible alphanumeric codes used internally.`,
    ],
    faqs: [
      {
        question: `What is the difference between CODE128 and UPC/EAN?`,
        answer: `CODE128 is a variable-length symbology that encodes letters, digits, and symbols, which makes it ideal for internal use like asset tags and shipping references. UPC and EAN are fixed-length, digits-only retail standards that identify a product globally (a GTIN) and include a mandatory check digit — you use them when a barcode must scan at a store checkout.`,
      },
      {
        question: `Why does it say my barcode value is invalid?`,
        answer: `Each format enforces its own rules. EAN-13 needs 12–13 digits, EAN-8 needs 7–8, and UPC-A needs 11–12, all numeric. CODE39 and Codabar restrict the allowed characters. Switch to CODE128 if you just need to encode arbitrary text, or correct the length and character set for your chosen retail format.`,
      },
      {
        question: `Can I print these barcodes for real products?`,
        answer: `Yes for internal codes. For retail UPC or EAN barcodes that scan at checkout, the underlying number must be a legitimate GTIN you have been assigned by GS1 — this tool renders the barcode correctly, but it cannot issue you a registered product number.`,
      },
      {
        question: `Is the barcode image free to use?`,
        answer: `Completely. The generated PNG has no watermark and is free for personal and commercial use.`,
      },
    ],
    related: [
      { slug: 'qr-generator', note: `When you need a 2D code that stores URLs or WiFi details instead of a product number.` },
      { slug: 'uuid-generator', note: `Generate unique identifiers to encode as internal asset or inventory barcodes.` },
    ],
  },

  'css-gradient-generator': {
    intro: [
      `Hand-writing a CSS gradient means remembering the exact syntax for stops, angles, and the three gradient functions — easy to fumble when you just want a good-looking background. This generator gives you the controls and writes the CSS for you, updating a full-bleed preview the instant you change anything.`,
      `It builds linear, radial, and conic gradients from a list of color stops you can add, recolor, and reposition with a per-stop slider. Linear and conic gradients expose an angle dial from 0 to 360 degrees; radial gradients let you choose a circle or ellipse shape. The result is plain CSS with no library or framework attached.`,
      `Front-end developers prototyping a hero section, designers testing a brand color blend, and anyone theming a dashboard reach for it to land a gradient quickly. When it looks right, one click copies the complete background declaration in a JetBrains Mono code block, ready to drop into a stylesheet.`,
    ],
    steps: [
      `Pick a gradient type — Linear, Radial, or Conic — with the type buttons.`,
      `Set the angle with the slider for linear and conic gradients, or pick circle vs ellipse for radial.`,
      `Edit each color stop's color and drag its position slider; use "Add stop" for more colors or the trash icon to remove one (a minimum of two is kept).`,
      `Watch the large preview panel update live as you tweak.`,
      `Click "Copy CSS" to grab the full background declaration for your stylesheet.`,
    ],
    why: [
      `It is pure React state with no dependencies — nothing is sent anywhere, and the CSS it emits is standard, framework-agnostic, and works in any project.`,
      `All three gradient types share one interface, so you can flip a linear blend into a conic one without rebuilding your color stops.`,
      `Unlimited color stops with individual position control let you craft multi-color blends, not just the two-color presets many tools cap you at.`,
      `The output is the literal CSS the preview renders, so what you copy is exactly what you saw — no surprise differences in production.`,
    ],
    faqs: [
      {
        question: `What is the difference between linear, radial, and conic gradients?`,
        answer: `A linear gradient blends colors along a straight line at a set angle. A radial gradient radiates outward from a center point as a circle or ellipse. A conic gradient sweeps colors around a center point like a color wheel, which is handy for pie-chart and angular effects.`,
      },
      {
        question: `How do color stop positions work?`,
        answer: `Each stop has a position from 0% to 100% along the gradient. Two stops at 0% and 100% blend smoothly edge to edge; placing two stops at the same position creates a hard line instead of a fade. The slider next to each color sets that percentage.`,
      },
      {
        question: `Will the copied CSS work in every browser?`,
        answer: `Linear and radial gradients are supported everywhere. Conic gradients are supported in all current browsers but not in very old ones, so add a solid background-color fallback if you must support legacy versions.`,
      },
    ],
    related: [
      { slug: 'box-shadow-generator', note: `Pair your gradient background with a matching CSS shadow for depth.` },
      { slug: 'color-palette-generator', note: `Generate a harmonious set of colors to use as your gradient stops.` },
      { slug: 'color-converter', note: `Convert any stop color between HEX, RGB, and HSL.` },
    ],
  },

  'box-shadow-generator': {
    intro: [
      `The CSS box-shadow property packs five values plus a color into one line, and small changes to any of them completely change the feel of a shadow. This generator turns those numbers into sliders with a live preview, so you can dial in exactly the depth you want and read off the CSS.`,
      `You control horizontal and vertical offset, blur radius, spread radius, and a separate opacity slider that the tool folds into an rgba() shadow color — so you adjust transparency without editing hex codes by hand. An inset toggle flips the shadow inward for pressed or recessed effects, and a background color picker lets you preview the shadow against the surface it will actually sit on.`,
      `It is the go-to for building a subtle card elevation, a glowing focus ring, or the soft double-shadow look of neumorphic UI. Designers and developers use the preview to judge contrast before copying the box-shadow declaration straight into their stylesheet.`,
    ],
    steps: [
      `Drag the horizontal and vertical offset sliders to push the shadow left/right and up/down.`,
      `Set the blur radius for softness and the spread radius to grow or shrink the shadow.`,
      `Lower the opacity slider for a subtle shadow or raise it for a bold one.`,
      `Pick the shadow color and a preview background color to check real-world contrast.`,
      `Toggle "Inset shadow" if you want the shadow inside the box, then click "Copy CSS".`,
    ],
    why: [
      `Pure client-side React: no upload, no account, and the emitted box-shadow is standard CSS that works in any project.`,
      `The dedicated opacity slider is merged into an rgba() color for you, so you tune transparency without hand-editing alpha values.`,
      `A configurable background behind the preview box reveals whether a pale shadow actually shows up on your real surface color.`,
      `Inset support and spread control mean you can build pressed states and neumorphic shadows, not just simple drop shadows.`,
    ],
    faqs: [
      {
        question: `What does spread radius do in a box-shadow?`,
        answer: `Spread grows or shrinks the shadow before the blur is applied. A positive spread makes the shadow larger than the element, useful for glows; a negative spread pulls it in, which helps create shadows that only peek out from one side.`,
      },
      {
        question: `How do I make a soft, subtle shadow?`,
        answer: `Use a small vertical offset, a generous blur radius, zero or slightly negative spread, and a low opacity around 10–20%. Large blur with low opacity reads as a gentle elevation rather than a hard outline.`,
      },
      {
        question: `What is an inset shadow used for?`,
        answer: `An inset shadow renders inside the element instead of behind it, making the box look recessed or pressed in. It is common for input fields, toggled buttons, and the inner shadow half of a neumorphic design.`,
      },
      {
        question: `Can I stack multiple shadows?`,
        answer: `CSS supports comma-separated multiple shadows, and full neumorphism uses a light and a dark one together. This tool builds one shadow at a time; copy two results and join them with a comma in your stylesheet to layer them.`,
      },
    ],
    related: [
      { slug: 'css-gradient-generator', note: `Build a gradient background to sit behind your shadowed cards.` },
      { slug: 'css-grid-generator', note: `Lay out the cards you are adding shadows to with a CSS grid.` },
      { slug: 'color-palette-generator', note: `Choose a coherent shadow and surface color from one base hue.` },
    ],
  },

  'color-palette-generator': {
    intro: [
      `Picking one color you like is easy; finding three or four that work together is the hard part. This palette generator applies established color-theory relationships to a single base color and returns a matching scheme, so you start from harmony instead of trial and error.`,
      `Choose a base color with the picker or by typing a hex value, then switch between five harmony rules: complementary (the opposite hue), analogous (neighbors on the wheel), triadic (three evenly spaced hues), split-complementary, and monochromatic (one hue at varied lightness). The math runs in HSL space, rotating the hue by the right number of degrees for each rule, which keeps saturation and lightness consistent across the swatches.`,
      `Web designers building a brand system, developers who need accent colors that do not clash, and anyone designing a chart or slide deck use it to assemble a usable palette in seconds. Every swatch shows its HEX, RGB, and HSL values, each copyable with a single click.`,
    ],
    steps: [
      `Set your base color with the color picker or by entering a hex code.`,
      `Pick a harmony rule — Complementary, Analogous, Triadic, Split-Complementary, or Monochromatic.`,
      `Review the generated swatches, which update instantly as you change the base or the rule.`,
      `Click the HEX, RGB, or HSL line on any swatch to copy that value to your clipboard.`,
    ],
    why: [
      `The schemes come from real color-theory hue rotations computed in HSL, not random colors, so the results are genuinely coordinated.`,
      `Each swatch exposes HEX, RGB, and HSL and copies the exact format you click, saving a separate conversion step.`,
      `Five harmony rules cover the common design needs — from a single high-contrast accent (complementary) to a calm, related set (analogous).`,
      `It runs entirely in your browser with no library, so it is instant and nothing about your brand colors is shared.`,
    ],
    faqs: [
      {
        question: `What is a triadic color scheme?`,
        answer: `A triadic scheme uses three hues spaced evenly around the color wheel, 120 degrees apart. It is vibrant and balanced — one color usually leads while the other two accent — which makes it popular for playful, energetic designs.`,
      },
      {
        question: `When should I use complementary versus analogous colors?`,
        answer: `Complementary pairs (opposite hues) create strong contrast and draw attention, great for calls to action. Analogous colors (neighbors on the wheel) are low-contrast and soothing, better for backgrounds and cohesive, understated layouts.`,
      },
      {
        question: `Why do my monochromatic swatches share the same hue?`,
        answer: `That is the definition of monochromatic — a single hue varied only in lightness (and here, kept at the same saturation). It gives you tints and shades of one color, ideal for minimal interfaces and depth without introducing new colors.`,
      },
      {
        question: `Are these colors accessible for text?`,
        answer: `Harmony rules address aesthetics, not contrast ratios. Always check a foreground/background pair against WCAG contrast guidelines before using it for text — a beautiful palette can still fail readability if two similar-lightness colors are layered.`,
      },
    ],
    related: [
      { slug: 'color-converter', note: `Convert any generated swatch into other formats or fine-tune a value.` },
      { slug: 'color-palette', note: `Pull a starting color out of an existing image, then build a scheme around it here.` },
      { slug: 'css-gradient-generator', note: `Feed your new palette straight into a multi-stop CSS gradient.` },
    ],
  },

  'avatar-generator': {
    intro: [
      `When a user has not uploaded a photo, an initials avatar is the clean fallback you see across Gmail, Slack, and most dashboards. This generator makes one from any name — extracting the initials and drawing them on a colored shape — and exports it as a PNG or SVG.`,
      `Type a name and it pulls the initials automatically: the first letter of the first and last words, or the first two letters of a single name. You choose a circle, square, or squircle (a rounded square with an adjustable corner radius), set the font size, and pick background and text colors, with a row of preset colors for quick starts. It draws everything on an HTML5 canvas, and rebuilds an equivalent vector when you export SVG.`,
      `Developers seeding placeholder user accounts, teams making consistent profile images, and designers mocking up a contact list use it to produce sharp, on-brand avatars without opening a graphics app. Export PNG for immediate use or SVG when you need it to scale crisply at any size.`,
    ],
    steps: [
      `Enter a name — the initials are extracted and shown below the field as you type.`,
      `Choose a shape: Circle, Square, or Squircle (the squircle adds a corner-radius slider).`,
      `Adjust the font size, and for squircles the corner radius, with the sliders.`,
      `Set the background and text colors, or click a preset color swatch.`,
      `Click "PNG" or "SVG" to download the avatar in your preferred format.`,
    ],
    why: [
      `The avatar is rendered on a canvas in your browser and exported locally — no names or images are sent to a server.`,
      `You get both raster (PNG) and true vector (SVG) output, so the same avatar works as a small thumbnail or scales losslessly for large displays.`,
      `Initials are derived automatically from one or two words, so a full name, a single handle, or a company name all produce sensible letters.`,
      `Circle, square, and adjustable squircle shapes match the avatar styles used across common apps, including iOS-style rounded squares.`,
    ],
    faqs: [
      {
        question: `How are the initials chosen from a name?`,
        answer: `For two or more words it takes the first letter of the first word and the first letter of the last word — so "Ada Lovelace" becomes AL. For a single word it uses the first two letters, like "Figma" becoming FI. All letters are uppercased.`,
      },
      {
        question: `Should I download PNG or SVG?`,
        answer: `Use PNG when you need a ready-to-display image at the current size, such as a 256-pixel avatar. Use SVG when the avatar must scale to different sizes without blurring, or when you want to edit colors and text later in a vector editor.`,
      },
      {
        question: `Is the background transparent outside the shape?`,
        answer: `Yes. The PNG is exported with an alpha channel, so the area around a circle or squircle is transparent and the avatar sits cleanly on any background. The SVG likewise contains only the shape and text.`,
      },
    ],
    related: [
      { slug: 'color-palette-generator', note: `Pick coordinated background and text colors for a set of avatars.` },
      { slug: 'favicon-generator', note: `Turn a finished avatar or logo into full favicon sizes.` },
      { slug: 'meme-generator', note: `Another canvas-based image tool when you need quick captioned graphics.` },
    ],
  },

  'signature-generator': {
    intro: [
      `Signing a PDF or adding your name to an email footer usually means printing, signing, and scanning — or hunting for the right tool. This signature generator lets you produce a clean, transparent-background signature image in the browser, either by drawing it or by typing it in a handwriting font.`,
      `Draw mode uses a pressure-friendly canvas that tracks mouse and touch input, with rounded line joins for smooth strokes; you set the pen color and thickness and can clear the board to start over. Type mode renders your name in one of four cursive web fonts — Dancing Script, Caveat, Pacifico, or Satisfy — at an adjustable size and color. Either way, the export is a PNG with a transparent background, so it drops onto documents and forms without a white box around it.`,
      `Freelancers signing contracts, anyone filling in a form field, and people building an email signature use it to get a usable mark in seconds. The signing happens on your device; only the display fonts are fetched from Google Fonts.`,
    ],
    steps: [
      `Choose Draw or Type at the top.`,
      `In Draw mode, set your pen color and thickness, then sign on the checkered pad with your mouse or finger; use "Clear board" to retry.`,
      `In Type mode, enter your name, pick a cursive font, and set the size and color.`,
      `Click "Download transparent PNG" to save your signature.`,
      `Drop the PNG onto your PDF, form, or email signature — the transparent background blends in.`,
    ],
    why: [
      `Your signature is drawn and exported entirely on your device; the image is never uploaded, which matters for something as personal as a signature.`,
      `The PNG export preserves transparency, so your signature layers onto documents without an opaque rectangle behind it.`,
      `Two modes in one tool: freehand drawing for an authentic mark, or typed cursive when you want a tidy, legible version.`,
      `Drawing works with touch as well as a mouse, so you can sign naturally on a phone or tablet.`,
    ],
    faqs: [
      {
        question: `Is the signature background really transparent?`,
        answer: `Yes. The canvas is exported as a PNG with an alpha channel and no fill behind your strokes or text, so when you place it on a document only the ink shows — there is no white box to hide.`,
      },
      {
        question: `Does my signature get uploaded anywhere?`,
        answer: `No. Both drawing and export happen locally in your browser. The only network request is loading the cursive display fonts from Google Fonts for Type mode; your actual signature image stays on your device.`,
      },
      {
        question: `Is a typed or drawn signature legally valid?`,
        answer: `In many places an electronic signature is legally recognized, but requirements vary by country, document type, and platform. For binding agreements, confirm what your jurisdiction or e-signature service requires — this tool produces the image, not a certified e-signature audit trail.`,
      },
      {
        question: `Can I use this on my phone?`,
        answer: `Yes. The drawing pad listens for touch input, so you can sign with your finger or a stylus, and the download works the same as on desktop.`,
      },
    ],
    related: [
      { slug: 'image-metadata-remover', note: `Strip any metadata from images before attaching them to signed documents.` },
      { slug: 'favicon-generator', note: `Another browser-based canvas tool for turning artwork into ready-to-use images.` },
      { slug: 'image-converter', note: `Convert your signature PNG to another format if a service requires it.` },
    ],
  },

  'random-picker-wheel': {
    intro: [
      `When you need to pick someone or something at random and want it to feel fair and fun, a spinning wheel beats a coin flip. Paste your list, hit spin, and watch the wheel decelerate to a winner — complete with a confetti burst when it stops.`,
      `Each line you enter becomes a slice, automatically assigned a distinct color so the wheel stays readable even with a dozen entries. The spin uses real animation physics: an initial velocity that decays through friction frame by frame via requestAnimationFrame, so it slows down naturally rather than snapping to a result. The winner is read from the slice under the pointer when the wheel stops, so what you see is what you get.`,
      `Teachers calling on students, streamers running giveaways, and groups deciding where to eat all use it the same way. An optional setting removes each winner after the spin, which is exactly what you want for drawing multiple raffle winners without repeats.`,
    ],
    steps: [
      `Type or paste your entries into the text box, one per line.`,
      `Optionally tick "Remove the winner after each spin" for draws without repeats.`,
      `Press the big SPIN button.`,
      `Watch the wheel slow to a stop and read the highlighted winner, celebrated with confetti.`,
      `Spin again for the next pick; if removal is on, the winner is already taken off the list.`,
    ],
    why: [
      `Everything runs in your browser — your list of names or prizes is never uploaded anywhere.`,
      `The spin uses genuine friction-based animation, so the result is unpredictable and the deceleration looks natural rather than scripted.`,
      `The announced winner is derived from the wheel's final angle under the fixed pointer, so the visual outcome and the named winner always match.`,
      `Built-in winner removal makes multi-draw giveaways effortless, and the confetti adds a celebratory moment with no extra setup.`,
    ],
    faqs: [
      {
        question: `Is the wheel actually random?`,
        answer: `Yes. Each spin starts with a randomized velocity, so where it lands is not predetermined. The winning slice is calculated from the wheel's final resting angle relative to the pointer, meaning the displayed winner is exactly the slice that stopped at the top.`,
      },
      {
        question: `How many entries can I add?`,
        answer: `Add as many lines as you like — each becomes a slice with its own color. Very long lists make individual slices thin and labels are trimmed to fit, but the wheel still spins and picks correctly.`,
      },
      {
        question: `How do I draw several winners without repeats?`,
        answer: `Turn on "Remove the winner after each spin." After each result, that entry is deleted from the list automatically, so the next spin chooses only from the remaining names — perfect for awarding first, second, and third place.`,
      },
    ],
    related: [
      { slug: 'password-generator', note: `When you need cryptographically random strings rather than a random list pick.` },
      { slug: 'uuid-generator', note: `Generate unique IDs for raffle tickets or entries.` },
      { slug: 'fake-data-generator', note: `Need a list of sample names to spin with? Generate some instantly.` },
    ],
  },

  'fake-data-generator': {
    intro: [
      `Building a UI, seeding a database, or testing a CSV importer all need realistic-looking data — and typing it by hand is tedious. This generator fabricates mock user records on demand, so you can populate a table or an API fixture in one click.`,
      `Tick the fields you want — full name, email, phone, address, UUID, and job title — and set how many rows to create, from 1 to 100. Names are assembled from built-in first/last name lists, emails are derived from those names against dummy domains, addresses combine real-sounding street and city components, and UUIDs come from the browser's Web Crypto randomUUID for proper v4 format. The results land in a clean table you can export to JSON or CSV, or copy as JSON.`,
      `Front-end developers filling out a prototype, QA engineers stress-testing a form, and anyone who needs sample rows for a demo use it to skip the busywork. Because every value is invented locally, there is no risk of leaking real personal data into a test environment.`,
    ],
    steps: [
      `Check the fields you need; at least one must stay selected.`,
      `Enter how many rows to generate, from 1 to 100.`,
      `Click "Generate" to build the table — click again any time to reroll a fresh set.`,
      `Review the data in the table.`,
      `Export with "Export JSON" or "Export CSV", or use "Copy JSON" to grab it for code.`,
    ],
    why: [
      `All data is fabricated in your browser from built-in lists and the Web Crypto API — nothing is fetched and nothing is uploaded, so test data never touches a server.`,
      `UUIDs use crypto.randomUUID, producing standards-compliant version-4 identifiers rather than weak pseudo-random strings.`,
      `One click gives you both JSON (an array of objects) and CSV (with properly quoted values), matching how you would seed an app or a spreadsheet.`,
      `Field selection and a 1–100 row count let you generate exactly the shape you need, from a single example to a full table.`,
    ],
    faqs: [
      {
        question: `Is this data safe to use in tests?`,
        answer: `Yes — every value is randomly assembled from generic placeholder lists and dummy domains, so it represents no real person. Using fabricated data like this is the recommended way to avoid exposing real personal information in development and test environments.`,
      },
      {
        question: `Are the email addresses real?`,
        answer: `No. Emails are built from the generated names against placeholder domains such as example.com, which are reserved for documentation and testing. They are syntactically valid but will not deliver mail, which is exactly what you want for fixtures.`,
      },
      {
        question: `What is the difference between the JSON and CSV exports?`,
        answer: `JSON exports an array of objects keyed by field name, ideal for seeding an API, a database, or a JavaScript fixture. CSV exports a header row plus comma-separated, quoted rows, ready to open in a spreadsheet or feed an import routine.`,
      },
      {
        question: `Why cap the output at 100 rows?`,
        answer: `The tool is built for quick fixtures and demos rather than bulk dataset generation, so the row count is clamped between 1 and 100 to keep the table responsive. Generate repeatedly and concatenate the exports if you need more.`,
      },
    ],
    related: [
      { slug: 'uuid-generator', note: `Generate standalone UUIDs when you only need identifiers, not full records.` },
      { slug: 'json-formatter', note: `Pretty-print or validate the JSON you export here.` },
      { slug: 'json-to-csv', note: `Convert between the JSON and CSV shapes of your test data.` },
    ],
  },

  // ── Text tools ───────────────────────────────────────────────────────

  'case-converter': {
    intro: [
      `Retyping a heading because it came in all caps, or fixing a title that someone wrote in lowercase, is the kind of tiny task that interrupts real work. The Case Converter takes whatever is in the box and rewrites it into the case you need with a single button — no retyping, no find-and-replace gymnastics.`,
      `It offers eight transformations: UPPERCASE and lowercase for the obvious flips, Title Case and Sentence case for prose, and camelCase, PascalCase, snake_case, and kebab-case for code and identifiers. A writer pasting a messy headline, a student normalizing notes, and a developer turning "User Profile Settings" into userProfileSettings all reach for the same box. A live counter under the text keeps a running tally of words and characters as you edit.`,
      `Because the transformation replaces the text in place, you can chain edits — uppercase it, decide that is too loud, and switch to Title Case — then copy the final version to your clipboard in one click.`,
    ],
    steps: [
      `Type or paste your text into the box.`,
      `Click the case you want: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, or kebab-case.`,
      `Glance at the word and character counts below to confirm the length.`,
      `Click "Copy to Clipboard" to grab the result, or "Clear" to start fresh.`,
    ],
    why: [
      `The whole transformation runs locally in your browser, so nothing you paste is sent anywhere — fine for confidential drafts and internal copy.`,
      `Eight cases live behind one textarea, covering both everyday writing (Title and Sentence case) and the programming conventions developers need.`,
      `Edits apply in place and stack, so you can experiment between cases without losing your text or re-pasting.`,
      `The live word and character count doubles as a quick length check for headlines, meta descriptions, or tweet-length copy.`,
    ],
    faqs: [
      {
        question: `What is the difference between Title Case and Sentence case?`,
        answer: `Title Case capitalizes the first letter of every word, the way many headlines are styled. Sentence case capitalizes only the first letter of each sentence and leaves the rest lowercase, which reads more naturally in body text. This tool offers both as separate buttons.`,
      },
      {
        question: `When should I use snake_case, kebab-case, or camelCase?`,
        answer: `snake_case (words joined by underscores) is common for Python variables and database columns. kebab-case (joined by hyphens) suits URLs, CSS classes, and file names. camelCase and PascalCase join words without separators and are typical for JavaScript variables and class names respectively.`,
      },
      {
        question: `Does converting to camelCase work on a whole sentence?`,
        answer: `Yes — it splits your text on spaces and common separators, then joins the words with the first letter of each (after the first) capitalized. It works best on short phrases meant to become a single identifier rather than long paragraphs.`,
      },
      {
        question: `Is my text uploaded to a server?`,
        answer: `No. All case conversion happens in your browser with plain JavaScript, so the text never leaves your device.`,
      },
    ],
    related: [
      { slug: 'word-counter', note: `When you need a deeper breakdown — sentences and paragraphs, not just words and characters.` },
      { slug: 'string-converter', note: `For converting between two specific naming formats with a chosen From and To.` },
      { slug: 'find-and-replace', note: `Fix recurring words or phrases across the same block of text.` },
    ],
  },

  'text-to-speech': {
    intro: [
      `Sometimes it is easier to hear text than to read it — proofreading a paragraph out loud catches clumsy phrasing, and listening to an article while doing something else is just more comfortable. This Text to Speech reader speaks any text you type using the voices already built into your device.`,
      `It taps the browser's native speech synthesis, so you can pick from the system voices your operating system provides, then fine-tune how they sound: pitch from low to high and speed from a slow, deliberate pace to a brisk one. Students reviewing notes, writers checking the flow of a draft, and anyone who simply prefers listening can paste text and press play. Play, Pause, Resume, and Stop give you full control over playback.`,
      `Because it uses the platform's own engine, there is no audio file to download — the text is spoken live through your speakers. That also keeps it instant and free, with no character quota to watch.`,
    ],
    steps: [
      `Type or paste the text you want read aloud into the box.`,
      `Choose a voice from the dropdown — the list comes from your operating system.`,
      `Adjust the Pitch and Speed sliders to taste.`,
      `Press Play to start; use Pause and Resume to hold and continue, or Stop to end.`,
    ],
    why: [
      `It uses your device's built-in speech engine, so it is free, instant, and has no length limit imposed by a paid API.`,
      `Separate pitch and speed controls let you slow a voice down for clarity or speed it up to skim, and shape its tone.`,
      `Full transport controls — play, pause, resume, stop — mean you can follow along and stop exactly where you need to.`,
      `Nothing is sent to ToolForge; the text is handed to the speech engine already present in your browser and operating system.`,
    ],
    faqs: [
      {
        question: `Why are there different voices on different devices?`,
        answer: `The voice list comes from your operating system and browser, not from this tool. Windows, macOS, iOS, Android, and Chrome each ship their own set of voices, so the options — and their quality — vary from one device to the next.`,
      },
      {
        question: `Why is the voice dropdown empty at first?`,
        answer: `Some browsers load voices asynchronously, so the list can be momentarily empty when the page opens and then populate a second later. If it stays empty, your browser may not expose any speech voices; try a Chromium-based browser or a different device.`,
      },
      {
        question: `Can I download the speech as an audio file?`,
        answer: `No. The browser's speech synthesis API plays audio live but does not give web pages access to the underlying audio stream, so there is no MP3 or WAV to save. For a downloadable file you would need a dedicated TTS service.`,
      },
      {
        question: `Does my text get sent anywhere?`,
        answer: `The text is passed to your browser and operating system's speech engine, not to ToolForge. Depending on the voice you pick, your platform may render it on-device or via its own online voices — that part is controlled by your OS.`,
      },
    ],
    related: [
      { slug: 'speech-to-text', note: `The reverse — dictate with your voice and get text back.` },
      { slug: 'word-counter', note: `Check how long a passage is before you have it read aloud.` },
      { slug: 'case-converter', note: `Tidy up the capitalization of your text before listening to it.` },
    ],
  },

  'speech-to-text': {
    intro: [
      `Typing slows you down when ideas are flowing, and some thoughts are just easier to say than to type. This Speech to Text tool turns your spoken words into written text in real time, so you can capture a note, draft an email, or dictate a paragraph hands-free.`,
      `It uses your browser's built-in speech recognition. Press the microphone button and the transcript fills in as you talk, with words appearing live before they are finalized. You can pick the recognition language — US or UK English, Spanish, French, German, Hindi, and more — so it understands your accent and vocabulary. Journalers, people with repetitive-strain concerns, and anyone brainstorming out loud use it to get words down fast, then copy the transcript or clear it and start again.`,
      `It is worth knowing how this works under the hood: browser speech recognition typically sends your audio to an online service for transcription, so this is best for everyday notes rather than confidential material.`,
    ],
    steps: [
      `Pick your spoken language from the dropdown.`,
      `Click the large microphone button and allow microphone access when prompted.`,
      `Speak naturally — your words appear in the transcript as you talk, with the pulsing button showing it is listening.`,
      `Click the button again to stop, then use "Copy Transcript" or "Clear".`,
    ],
    why: [
      `Live interim results show your words as you speak, so you can see it is working and catch mistakes immediately.`,
      `Multiple recognition languages mean it adapts to your accent and the language you are actually speaking.`,
      `Clear error handling tells you when the microphone is blocked, missing, or unsupported, instead of failing silently.`,
      `It runs in the browser with no app to install and no account to create.`,
    ],
    faqs: [
      {
        question: `Which browsers support voice typing?`,
        answer: `Speech recognition works in Chrome, Edge, and other Chromium-based browsers, and in Safari. Firefox does not currently implement the Web Speech Recognition API, so the tool shows an unsupported message there.`,
      },
      {
        question: `Is my voice processed privately on my device?`,
        answer: `Usually not. Most browsers, including Chrome, send your audio to an online service (Google's, in Chrome's case) to perform the transcription, so the audio leaves your device. Because of that, avoid dictating passwords or sensitive personal information.`,
      },
      {
        question: `Why does it stop listening on its own?`,
        answer: `Browsers may end a recognition session after a pause in speech or after a period of silence. Just click the microphone again to resume — your existing transcript is kept, and new speech is appended to it.`,
      },
      {
        question: `Why is nothing being transcribed?`,
        answer: `Check that you granted microphone permission, that the correct input device is selected in your system settings, and that you chose the language you are actually speaking. The tool will surface a message for denied access or a missing microphone.`,
      },
    ],
    related: [
      { slug: 'text-to-speech', note: `The opposite direction — have typed text read back to you aloud.` },
      { slug: 'word-counter', note: `Count the words in your finished transcript.` },
      { slug: 'case-converter', note: `Fix the capitalization of a dictated draft in one click.` },
    ],
  },

  'duplicate-line-remover': {
    intro: [
      `Lists pulled from logs, exports, or copy-pasted spreadsheets are full of repeats, and scrolling through to delete them by hand is error-prone. This Duplicate Line Remover strips out repeated lines instantly and tells you exactly how many it removed.`,
      `It splits your text on line breaks and keeps only the first occurrence of each line, using a fast set-based comparison. Three toggles tune what "duplicate" means: turn off case sensitivity so "Apple" and "apple" count as the same, trim surrounding whitespace so a stray trailing space does not hide a match, and choose whether blank lines are preserved or dropped. Marketers cleaning an email list, developers deduping config entries, and anyone tidying a CSV column paste into the input and read the cleaned result from the output.`,
      `A badge reports the number of duplicates removed, so you get instant confirmation that the cleanup did something — useful when checking whether a list had repeats at all.`,
    ],
    steps: [
      `Paste your list into the Input box, one item per line.`,
      `Set the toggles: case-sensitive comparison, trim whitespace before comparing, and keep empty lines.`,
      `Click "Remove Duplicates".`,
      `Read the deduplicated list in the Output box and check the badge for how many were removed, then copy the result.`,
    ],
    why: [
      `It runs entirely in your browser, so even a long list of emails or internal records never leaves your machine.`,
      `The three comparison options handle the real-world messiness — mixed case and stray whitespace — that trips up naive deduplication.`,
      `It preserves the first occurrence in its original form, so your kept lines look exactly as you pasted them.`,
      `The removed-count badge confirms the result and quickly tells you how duplicate-heavy a list was.`,
    ],
    faqs: [
      {
        question: `Does it keep the original order of my list?`,
        answer: `Yes. The tool walks your list top to bottom and keeps the first time each line appears, so the surviving lines stay in their original order rather than being sorted.`,
      },
      {
        question: `How does "trim whitespace before comparing" help?`,
        answer: `Lines that look identical can differ by a trailing space or a leading tab, which makes them count as unique. Trimming compares the lines without that surrounding whitespace, so visually identical entries are correctly treated as duplicates.`,
      },
      {
        question: `What happens to blank lines?`,
        answer: `With "Keep empty lines" on, blank lines are preserved exactly where they are and are not deduplicated. With it off, blank lines are removed entirely, which is handy for compacting a sparse list.`,
      },
    ],
    related: [
      { slug: 'text-sorter', note: `Alphabetize or shuffle your list once the duplicates are gone.` },
      { slug: 'find-and-replace', note: `Normalize entries first so near-duplicates collapse into exact matches.` },
      { slug: 'word-frequency-counter', note: `See which entries repeated most before you removed them.` },
    ],
  },

  'find-and-replace': {
    intro: [
      `Swapping one word for another across a wall of text — renaming a variable in a snippet, updating a product name in a draft, or fixing a typo that appears a dozen times — is exactly the job for find and replace. This tool does it in the browser with a live preview and a running count of how many replacements it made.`,
      `Type what to find and what to replace it with, and the result updates as you go. A "Match case" checkbox controls whether the search is case-sensitive, and a "Use regular expressions" checkbox unlocks pattern matching for the trickier jobs: collapsing whitespace, reformatting dates, or capturing part of a match and reusing it. Editors cleaning up imported copy, developers tweaking code blocks, and anyone reformatting data lean on it instead of editing by hand.`,
      `When regex mode is on, an invalid pattern shows a clear error rather than failing silently, and capture-group references like $1 work as they do in JavaScript, so you can rearrange text, not just substitute it.`,
    ],
    steps: [
      `Paste your text into the main box.`,
      `Enter the term or pattern to find, and what to replace it with.`,
      `Tick "Match case" for an exact-case search, or "Use regular expressions" for pattern matching.`,
      `Watch the replacement counter, then copy the result from the output box.`,
    ],
    why: [
      `Replacements happen live in your browser as you type, with a count so you know immediately how many matches were affected.`,
      `Full regular-expression support — including capture-group backreferences — handles reformatting jobs a plain text swap cannot.`,
      `In literal mode the search term is escaped for you, so special characters like dots and parentheses are matched as themselves, not as regex syntax.`,
      `An invalid regular expression surfaces a readable error instead of breaking, so you can fix the pattern and carry on.`,
    ],
    faqs: [
      {
        question: `How do I use regular expressions here?`,
        answer: `Tick "Use regular expressions" and type a pattern in the Find box — for example \\d{4} to match any four digits. The pattern runs globally, and turning off "Match case" adds the case-insensitive flag. You can reference captured groups in the Replace box with $1, $2, and so on.`,
      },
      {
        question: `Why is my search not finding a match?`,
        answer: `Check the "Match case" setting — with it on, the search is case-sensitive, so "Cat" will not match "cat". In literal (non-regex) mode the text must appear exactly; switch to regex mode if you need flexible matching like optional characters or word boundaries.`,
      },
      {
        question: `Does it replace every occurrence or just the first?`,
        answer: `Every occurrence. The replacement is applied globally across the whole text, and the counter tells you how many matches were changed.`,
      },
      {
        question: `Is my text kept private?`,
        answer: `Yes — the find-and-replace runs locally in your browser using JavaScript's own string and RegExp engine, so nothing is uploaded.`,
      },
    ],
    related: [
      { slug: 'regex-tester', note: `Build and debug a complex pattern before using it to replace text.` },
      { slug: 'duplicate-line-remover', note: `Clean up a list after normalizing its entries with a replace.` },
      { slug: 'case-converter', note: `Adjust the capitalization of the whole block in one step.` },
    ],
  },

  'text-sorter': {
    intro: [
      `Getting a list into order — alphabetizing names, grouping lines by length, or randomizing draw entries — is one of those jobs that is tedious manually and trivial for a computer. This Text Sorter reorders the lines of whatever you paste with a single click per action.`,
      `It treats each line as an item and offers six operations: sort A–Z or Z–A, sort by length (shortest or longest first), reverse the current order without sorting, and shuffle randomly using the Fisher–Yates algorithm for an unbiased mix. Two options refine the result — a case-insensitive sort so capitalization does not scatter related words, and a remove-blank-lines toggle to drop empty rows first. Teachers randomizing a roster, writers alphabetizing a glossary, and anyone ordering a bibliography use it the same way.`,
      `Each action rewrites the same box, so you can stack them: remove blanks, sort A–Z, then reverse — and a line counter keeps track of how many entries you are working with.`,
    ],
    steps: [
      `Paste your list into the box, one item per line.`,
      `Set the options — case-insensitive sort and remove blank lines — to taste.`,
      `Click an action: A → Z, Z → A, Length ↑, Length ↓, Reverse, or Shuffle.`,
      `Copy the reordered list with the Copy button.`,
    ],
    why: [
      `Six ordering operations in one place cover alphabetical, length-based, reversed, and randomized needs without a spreadsheet.`,
      `Shuffle uses a proper Fisher–Yates algorithm, so every arrangement is equally likely — important for fair random draws.`,
      `Alphabetical sorting is locale-aware via localeCompare, so accented and international characters order sensibly.`,
      `Everything happens in your browser, so your list stays private and the result is instant.`,
    ],
    faqs: [
      {
        question: `What is the difference between Reverse and Z → A?`,
        answer: `Z → A sorts the lines into reverse alphabetical order. Reverse simply flips the current order of the lines as they are, without sorting — so if your list is already in a custom order, Reverse mirrors it while Z → A would alphabetize it backwards.`,
      },
      {
        question: `Is the shuffle truly random?`,
        answer: `Yes. It uses the Fisher–Yates shuffle, which produces an unbiased permutation where every possible ordering is equally likely — unlike naive sort-by-random tricks that can skew the results.`,
      },
      {
        question: `How does case-insensitive sorting change the result?`,
        answer: `With it on, "apple" and "Apple" sort next to each other instead of all capitalized words being grouped before lowercase ones. Turn it off if you specifically want uppercase entries ordered separately from lowercase ones.`,
      },
    ],
    related: [
      { slug: 'duplicate-line-remover', note: `Remove repeats before or after sorting the list.` },
      { slug: 'word-frequency-counter', note: `Analyze which words dominate a list once it is organized.` },
      { slug: 'find-and-replace', note: `Reformat entries before sorting so they line up the way you expect.` },
    ],
  },

  'word-frequency-counter': {
    intro: [
      `Which words are you leaning on too heavily? Word frequency analysis answers that — and it is the backbone of everything from editing prose to studying a text. This counter reads whatever you paste and builds a ranked table of every word and how often it appears.`,
      `It extracts words with a Unicode-aware pattern, lowercases them so "The" and "the" are counted together, and tallies the totals into a sortable table showing each word, its count, and its share of the text as a percentage. A "Ignore common stop words" toggle filters out high-frequency filler like the, and, to, and of, so the words that actually characterize your writing rise to the top. Editors hunting for repetition, students analyzing a passage, and writers checking keyword balance all use it to see their text at a glance.`,
      `Click the column headers to re-sort by count or alphabetically, and a summary line reports the total and unique word counts so you can gauge vocabulary variety.`,
    ],
    steps: [
      `Paste the text you want to analyze into the box.`,
      `Optionally tick "Ignore common stop words" to hide filler words.`,
      `Read the table of words, counts, and percentages.`,
      `Click the "Word" or "Count" header to change the sort order.`,
    ],
    why: [
      `It reports each word's percentage share and the unique-versus-total word counts, giving you a sense of repetition and vocabulary range, not just raw tallies.`,
      `The stop-word filter strips out grammatical filler so the meaningful, content-carrying words stand out.`,
      `Sortable columns let you flip between "most frequent" and "alphabetical" views of the same data instantly.`,
      `All analysis is done in your browser, so even unpublished drafts stay on your device.`,
    ],
    faqs: [
      {
        question: `What counts as a "word" here?`,
        answer: `Words are matched as runs of letters, digits, and apostrophes, so contractions like "don't" stay intact. Punctuation and spaces are treated as separators, and everything is lowercased so the same word in different cases is grouped together.`,
      },
      {
        question: `What are stop words and why ignore them?`,
        answer: `Stop words are extremely common words — the, and, a, to, of, in — that appear in almost any text and usually carry little meaning on their own. Filtering them out reveals the distinctive words that actually describe your content, which is useful for editing and keyword analysis.`,
      },
      {
        question: `How is the percentage calculated?`,
        answer: `Each word's percentage is its count divided by the total number of words in the text (before stop-word filtering), so the figures reflect how much of the whole document that word represents.`,
      },
      {
        question: `How is this different from a keyword density checker?`,
        answer: `This is a general text-analysis table for writers and students, with stop-word filtering and sortable columns. A keyword density checker is framed specifically around on-page SEO and target phrases; use that one when you are optimizing a web page for search.`,
      },
    ],
    related: [
      { slug: 'word-counter', note: `Get overall totals — words, characters, sentences — rather than per-word frequencies.` },
      { slug: 'keyword-density-checker', note: `Analyze the same idea through an SEO lens for a web page.` },
      { slug: 'text-sorter', note: `Sort or dedupe the word list you are studying.` },
    ],
  },

  'morse-binary-converter': {
    intro: [
      `Whether you are decoding a puzzle, teaching a class about how computers store letters, or just having fun with secret messages, translating between plain text and Morse code or binary is oddly satisfying. This converter does both, in both directions, updating the moment you type.`,
      `Switch between two modes — Text ↔ Morse and Text ↔ Binary — and edit either side: type a sentence and watch the dots-and-dashes or the 1s-and-0s appear, or paste a coded string and read the decoded text back. Morse uses the international standard, with letters separated by spaces and words by a forward slash; binary encodes each character as its eight-bit code. Hobbyists, students, escape-room designers, and curious tinkerers all use it to encode and decode without memorizing a chart.`,
      `If you paste something the mode cannot parse — a stray character in a Morse string or a digit other than 0 or 1 in binary — the field turns red and explains the rule, so you can spot the problem instead of getting silent garbage.`,
    ],
    steps: [
      `Choose a mode: "Text ↔ Morse" or "Text ↔ Binary".`,
      `Type or paste plain text in the left box to encode it.`,
      `Or type or paste Morse/binary in the right box to decode it back to text.`,
      `Use the Copy link above either box to grab the result; watch for a red error state if the code is malformed.`,
    ],
    why: [
      `Conversion is bi-directional and live — editing either side instantly updates the other, so encoding and decoding use one interface.`,
      `It follows the conventional Morse formatting (space between letters, slash between words) and standard eight-bit binary, so the output is interoperable with other tools and charts.`,
      `Clear, mode-specific error states flag invalid Morse symbols or non-binary digits and tell you the formatting rule to fix them.`,
      `It runs entirely in your browser from built-in lookup tables, so it is instant, free, and private.`,
    ],
    faqs: [
      {
        question: `How should I format Morse code so it decodes correctly?`,
        answer: `Separate the dots and dashes of each letter with a single space, and separate whole words with a forward slash surrounded by spaces — for example "... --- ..." is SOS, and ".... ..  / -- .--. " spaces words apart. Decoding is case-insensitive and the output is shown in uppercase.`,
      },
      {
        question: `Why does my binary show an error?`,
        answer: `Binary mode expects only 0s and 1s, with each character as an eight-bit group separated by spaces. A different digit, a letter, or missing spaces between bytes will trigger the error state. Re-space the input into clean eight-bit chunks and it will decode.`,
      },
      {
        question: `Can it handle punctuation and numbers?`,
        answer: `Morse mode supports digits and common punctuation in addition to letters. Binary mode encodes any character from its character code, so numbers and symbols convert as readily as letters — though very high-range Unicode characters may exceed a single eight-bit byte.`,
      },
      {
        question: `Is this useful for real communication?`,
        answer: `It is mainly an educational and hobby tool — for puzzles, learning Morse, escape rooms, and understanding how text maps to binary. It is not an encryption tool; Morse and binary are encodings anyone can reverse, not secure ciphers.`,
      },
    ],
    related: [
      { slug: 'base64-encoder', note: `Another text encoding, used to safely represent binary data as text.` },
      { slug: 'url-encoder', note: `Encode text for safe use in URLs and query strings.` },
      { slug: 'case-converter', note: `Normalize your text's case before encoding it.` },
    ],
  },

  // ── New image batch ──────────────────────────────────────────────────

  'social-media-image-resizer': {
    intro: [
      `Every social platform publishes exact pixel dimensions for posts, stories, covers and headers — and if your image doesn't match, the platform crops, stretches or compresses it in ways you didn't intend. The Social Media Image Resizer takes any JPG, PNG or WebP and outputs a new file at the precise dimensions a specific platform slot demands, so what you see in preview is what followers actually see.`,
      `Content creators, social media managers and small-business owners use it most: swapping a landscape product shot into Instagram's 4:5 portrait post frame before a campaign launches, squeezing a team photo into a LinkedIn banner without it looking squashed, or preparing a Twitter/X header that won't be auto-cropped on mobile. The tool covers Instagram (Square 1080×1080, Portrait 1080×1350, Story/Reel 1080×1920), Facebook (Cover 820×312, Feed Post 1200×630), Twitter/X (Header 1500×500, Post 1600×900) and LinkedIn (Profile Banner 1584×396, Feed Post 1200×627).`,
      `Two fit modes give you creative control once a preset is chosen. Cover scales the image until it fills the frame and crops the overflow from the center — ideal when you want an edge-to-edge look and don't mind losing a sliver of the sides. Contain fits the whole image inside the frame and pads the empty space with a background color you pick — useful for logos or infographics where nothing should be cut off. The preview updates in real time on a canvas, and the download produces a clean PNG or JPG at the exact target resolution. Nothing is uploaded; all processing happens in your browser.`,
    ],
    steps: [
      `Upload your image by clicking the upload zone or dragging a JPG, PNG or WebP file onto it.`,
      `Click the platform tab — Instagram, Facebook, Twitter/X or LinkedIn — to load its preset sizes.`,
      `Choose the specific size you need from the dropdown (post, story, cover, header or banner).`,
      `Select Cover to fill the frame (cropping overflow) or Contain to fit the whole image with a background color.`,
      `If using Contain, click the color swatch to choose a background that matches your brand.`,
      `Click Download PNG or Download JPG — the file is generated at the exact preset pixel dimensions.`,
    ],
    why: [
      `Exact platform dimensions on every export — no guessing, no post-upload re-cropping by the platform algorithm.`,
      `Cover and Contain modes let you decide whether to fill the frame or preserve the full image, instead of having the platform decide for you.`,
      `Real-time canvas preview shows exactly how the crop or padding will look before you download.`,
      `Entirely browser-based — your photos are never sent to a server, which matters when working with unreleased products or private portraits.`,
    ],
    faqs: [
      {
        question: `Why does my image look zoomed in on Instagram even after resizing?`,
        answer: `Instagram applies its own viewport crop on some placements. For a square post set to 1080×1080, the safe zone for faces and important content is roughly the central 80%. Use Cover mode and keep key elements away from the edges, or switch to Contain to see the whole image.`,
      },
      {
        question: `What is the difference between Cover and Contain?`,
        answer: `Cover scales the image until every pixel of the frame is filled, then crops whatever overflows the edges from the center outward — the whole frame is image, but some of the original may be hidden. Contain scales the image until it fits entirely inside the frame and fills the remaining space with your chosen background color — nothing is cropped, but there may be padding bars.`,
      },
      {
        question: `Are the platform dimensions up to date?`,
        answer: `The presets reflect the recommended upload dimensions as of mid-2025: Instagram Square 1080×1080, Portrait 1080×1350, Story 1080×1920; Facebook Cover 820×312, Post 1200×630; Twitter/X Header 1500×500, Post 1600×900; LinkedIn Banner 1584×396, Post 1200×627. Platform guidelines do change — check the official help center if a campaign has strict requirements.`,
      },
      {
        question: `Can I download as both PNG and JPG?`,
        answer: `Yes — both buttons are shown once an image is loaded and a preset is selected. PNG is lossless and best for graphics or images with transparency areas (when using Contain with a white background). JPG at 92% quality is smaller and best for photographs.`,
      },
      {
        question: `Is my image uploaded to a server?`,
        answer: `No. The entire resize happens on an HTML5 canvas in your browser. Your file stays on your device at all times, which is particularly useful for unreleased product images, client work under NDA, or any photo you'd prefer not to pass through a third-party server.`,
      },
    ],
    related: [
      { slug: 'image-resizer', note: `Resize to any custom pixel dimensions, not just platform presets.` },
      { slug: 'image-cropper', note: `Manually crop to a specific region or aspect ratio before resizing.` },
      { slug: 'image-splitter', note: `Split one wide image into a numbered grid for an Instagram carousel post.` },
    ],
  },

  'heic-to-jpg': {
    intro: [
      `iPhones and iPads shoot in HEIC (High Efficiency Image Container), a format that packs excellent quality into roughly half the storage of an equivalent JPEG. The problem arises the moment you try to share that photo with someone on Windows, upload it to a website, or attach it to an email — most software outside the Apple ecosystem simply cannot open a HEIC file. The HEIC to JPG Converter decodes your photos to standard JPEG or PNG entirely in your browser, with no server involved.`,
      `The most common scenario is the iPhone owner who plugs in to a Windows PC and finds a folder full of files that Windows Photos refuses to display, or who tries to attach a HEIC to a web form that only accepts JPG. Designers and editors also reach for it when clients send unprocessed iPhone shots that their editing software won't ingest. The tool handles batch conversion: add as many HEIC files as you like, choose JPG or PNG, set a quality level for JPEG, and click Convert — a progress indicator tracks each file as the HEIC decoder runs. When everything is done, download files individually or grab them all in a single ZIP.`,
      `Conversion uses the open-source heic2any library, which runs the full HEIC decode in your browser's JavaScript engine. Because there is no server upload step, even private or sensitive photos — medical images, legal documents photographed on an iPhone — stay entirely on your device. The output JPEG at 90% quality is visually indistinguishable from the original while producing a universally compatible file.`,
    ],
    steps: [
      `Drop your HEIC or HEIF files onto the large upload zone, or click to browse and select one or more .heic files.`,
      `Choose the output format — JPG (smaller, universally supported) or PNG (lossless, larger).`,
      `For JPG, move the quality slider to balance file size against image sharpness (90% is a good default).`,
      `Click Convert and watch the progress counter as each file is decoded.`,
      `Download converted images individually with the Download button, or click Download All (.zip) to get everything in one archive.`,
    ],
    why: [
      `Batch conversion with per-file progress — you can queue a full camera roll and walk away while it runs rather than converting one file at a time.`,
      `100% private: files never leave your browser, which matters when the HEIC photos contain sensitive content.`,
      `Graceful error handling — a single corrupt file does not abort the batch; it shows an error for that file and continues with the rest.`,
      `No app installation or sign-up required; works in any modern desktop or mobile browser.`,
    ],
    faqs: [
      {
        question: `Why can't Windows open HEIC files directly?`,
        answer: `HEIC uses the HEVC codec for compression, which requires a licensed decoder. Windows 10 and 11 can open HEIC files only if you install the HEIF Image Extensions from the Microsoft Store (free) or the HEVC Video Extensions (paid). If you'd rather not install anything, converting to JPG solves the problem permanently.`,
      },
      {
        question: `Will I lose quality converting HEIC to JPG?`,
        answer: `At 90% quality the visual difference from the HEIC original is imperceptible in almost all photos. JPEG is a lossy format, so technically some data is discarded, but the perceptual quality is very high. If you need a truly lossless output, choose PNG — the file will be larger but identical in quality to the source.`,
      },
      {
        question: `How long does conversion take?`,
        answer: `HEIC decoding is computationally heavier than reading a JPEG because it runs a full video codec in JavaScript. A single 12-megapixel iPhone photo typically takes 1–4 seconds on a modern laptop. A batch of 20 photos may take 30–60 seconds depending on your device's CPU speed. The progress bar tracks each file so you know where things stand.`,
      },
      {
        question: `Are my photos uploaded anywhere?`,
        answer: `No. The heic2any library decodes entirely in your browser's JavaScript engine. Your photos never leave your device, which is important when converting personal or confidential images.`,
      },
    ],
    related: [
      { slug: 'image-converter', note: `Convert between JPG, PNG, WebP and GIF formats.` },
      { slug: 'image-compressor', note: `Reduce the file size of the converted JPGs without visible quality loss.` },
      { slug: 'image-resizer', note: `Resize the converted photos to specific dimensions after conversion.` },
    ],
  },

  'passport-photo-maker': {
    intro: [
      `Official passport and visa photos have strict requirements: exact physical dimensions, a plain background, and the subject's head filling a specific portion of the frame. Getting these right at a print shop costs money and requires a trip out. The Passport Photo Maker lets you crop your own portrait to the correct size in your browser, with a head-position guide that helps you frame the shot the way government photo standards specify.`,
      `The tool supports the most common international standards — US Passport and Visa at 2×2 inches (51×51 mm), UK, EU and Schengen at 35×45 mm, Canada at 50×70 mm, India at 35×45 mm, and Australia at 35×45 mm — all rendered at 300 DPI so the output is print-quality. Once you have cropped the single photo, you can generate a 4×6 inch print sheet that tiles as many copies as fit with small guides between them, formatted for standard photo lab printing — the same sheet format a photo-booth machine produces, printable at any pharmacy or online lab.`,
      `The cropper works by dragging to pan and using a zoom slider to scale the photo within a fixed frame matching the chosen standard's exact aspect ratio. A blue oval guide marks where the head should sit, and two horizontal lines show the crown and chin limits described in most passport photo regulations. A background color option lets you switch to the white, light grey, or light blue backgrounds required by different countries. Everything happens on a canvas in your browser; your portrait is never uploaded.`,
    ],
    steps: [
      `Upload a clear, front-facing portrait photo (JPG, PNG or WebP).`,
      `Choose the country standard from the dropdown — US 2×2 in, UK/EU 35×45 mm, Canada 50×70 mm, India or Australia.`,
      `Pick a print resolution (300 DPI for standard quality, 600 DPI for high-resolution labs) and a background color.`,
      `Drag inside the preview to pan your face within the frame, and use the zoom slider to scale until your head fills the guide oval.`,
      `Click Download Photo to save the cropped image at the correct pixel dimensions for your chosen standard.`,
      `Optionally click Generate 4×6 Print Sheet to create a tiled sheet you can print at any photo lab and cut into individual photos.`,
    ],
    why: [
      `Prints at true 300 DPI — the output pixel dimensions match the physical size exactly, so a 2×2 inch photo at 300 DPI outputs at 600×600 pixels, the correct resolution for print quality.`,
      `Head-position guide overlay takes the guesswork out of framing — the oval and crown/chin lines reflect the proportions described in US, UK and EU photo regulations.`,
      `The 4×6 print sheet means you can produce a full set of photos for a fraction of what a photo booth charges, using any photo-printing service.`,
      `Nothing is uploaded — your portrait stays on your device throughout, which matters when the photo contains a face or identity document.`,
    ],
    faqs: [
      {
        question: `Will this produce a photo that meets official requirements?`,
        answer: `The tool outputs the correct pixel dimensions and aspect ratio for each standard at 300 DPI, and the guide overlay helps you position your head within the proportions most governments specify. However, requirements also cover lighting, expression, glasses, and background uniformity. Always check the exact rules for the issuing country before submitting — the tool handles sizing, not lighting or composition.`,
      },
      {
        question: `What background color do I need for a passport photo?`,
        answer: `Most countries require a plain white or off-white background. The US requires a white background. UK and EU Schengen countries require a light grey or plain white background. Australia allows white or light grey. The tool provides white, light grey and light blue options — use white for US and a light grey for EU applications if in doubt.`,
      },
      {
        question: `How does the 4×6 print sheet work?`,
        answer: `After cropping your photo, click Generate 4×6 Print Sheet. The tool tiles as many copies of the cropped photo as fit on a 4×6 inch canvas at 300 DPI (1200×1800 pixels) with small gaps between each copy. Download the sheet and print it at actual size (4×6, no scaling) at any photo lab or on a home printer with photo paper, then cut along the guides.`,
      },
      {
        question: `Can I use a photo taken with my phone?`,
        answer: `Yes, as long as it is a recent front-facing portrait with a reasonably plain background. A busy or dark background may not meet official requirements even if the dimensions are correct, so try to photograph against a white or light-coloured wall in good natural light.`,
      },
    ],
    related: [
      { slug: 'image-cropper', note: `Crop to a custom aspect ratio when you need something other than a passport-standard frame.` },
      { slug: 'image-resizer', note: `Resize the finished photo to a different pixel size if a specific upload portal demands it.` },
      { slug: 'image-compressor', note: `Reduce the file size of the exported photo if an online form has a file-size limit.` },
    ],
  },

  'image-collage-maker': {
    intro: [
      `Combining several photos into one image is a staple of social media, real-estate listings, event recaps, and product showcases — but most collage apps either slap a watermark across the finished piece or require a paid subscription to remove it. The Image Collage Maker composites photos into a grid on a canvas in your browser, exports a clean PNG or JPG with no watermark, and sends nothing to a server.`,
      `Choose from seven layouts: 2×1 side by side, 1×2 stacked, 2×2 four-cell grid, 3×1 row, 1×3 column, 3×3 nine-cell grid, or an uneven split with one large cell and two smaller cells alongside it. Each cell accepts a photo by clicking to upload or dragging an image directly onto it. Photos are scaled with cover-fit — the cell is always filled edge to edge, cropping overflow from the center — so the collage looks intentional rather than letterboxed. A border thickness slider (0–60 px) and a border color picker let you add a frame between cells, whether a thin white gap or a thick colored boundary.`,
      `Three canvas shapes are available: Square (1080×1080), Landscape (1350×1080) and Portrait (1080×1350), matching the most common Instagram output sizes. The live preview redraws as you swap layouts, add images or adjust the border, so you can see the final result before downloading. This makes it equally useful for quick social posts and for polished print-ready composites.`,
    ],
    steps: [
      `Pick a layout from the buttons — 2×2, 3×3, uneven split, or any of the other grid options.`,
      `Choose a canvas shape: Square, Landscape or Portrait.`,
      `Click an empty cell in the preview (or drag a photo onto it) to add an image to that slot.`,
      `Hover over a filled cell and click the ✕ to swap it out or clear it.`,
      `Move the border thickness slider and click the border color swatch to frame the cells.`,
      `Click Download PNG or Download JPG to export the finished collage at the full canvas resolution.`,
    ],
    why: [
      `No watermark on the export — ever. Other free collage tools add branding to the image or require account creation to remove it.`,
      `Cover-fit per cell means every photo fills its slot edge to edge with no awkward letterbox bars.`,
      `Live canvas preview updates in real time as you change layout, photos, or borders — what you see is what you download.`,
      `Entirely browser-based with no file upload, so private photos — family events, client work — stay on your device.`,
    ],
    faqs: [
      {
        question: `Can I use photos of different sizes and orientations?`,
        answer: `Yes. Each cell applies cover-fit scaling independently, so a landscape photo and a portrait photo placed side by side both fill their cells fully. If important content (faces, text) is near the edges of a photo, it may be cropped — center it in the original image first, or use a layout where the cell's aspect ratio already matches your photo.`,
      },
      {
        question: `What is the output resolution?`,
        answer: `Square exports at 1080×1080 px, Landscape at 1350×1080 px, and Portrait at 1080×1350 px — the same dimensions recommended by Instagram for posts. These are suitable for social media publishing or printing at small sizes. If you need a higher-resolution export for large-format print, the canvas size options can be extended in a future version.`,
      },
      {
        question: `Can I swap a photo in an existing slot?`,
        answer: `Click any filled cell — it opens the file picker so you can choose a replacement. The previous image is discarded and the new photo is drawn into the same cell immediately. Alternatively, hover the cell and click the ✕ to clear it to empty, then click to add a fresh photo.`,
      },
      {
        question: `Is there a watermark on the downloaded image?`,
        answer: `No — the download is a clean PNG or JPG with no ToolForge branding. The canvas is exported directly to a file with no overlay added.`,
      },
    ],
    related: [
      { slug: 'image-splitter', note: `Do the reverse — slice one image into a numbered grid for an Instagram carousel.` },
      { slug: 'social-media-image-resizer', note: `Resize the finished collage to an exact platform dimension like a Facebook cover.` },
      { slug: 'image-resizer', note: `Scale individual photos to a consistent size before placing them in the collage.` },
    ],
  },

  'image-to-pdf': {
    intro: [
      `Emailing a set of scanned pages, receipts, or product photos as a bunch of loose image files is awkward for the recipient. A single PDF is far easier to open, read and archive — and creating one does not require Word, Acrobat, or any installed software. The Image to PDF Converter assembles JPG, PNG and WebP files into a multi-page PDF entirely in your browser, with no files ever sent to a server.`,
      `The tool handles the common document-assembly scenarios: a freelancer scanning multiple receipts to submit in one PDF expense report, a designer compiling mockup screenshots into a presentation, or an individual photographing ID documents to email to a landlord. Upload as many images as you need, then drag them up or down in the list to set the page order before generating. A4 and US Letter page sizes are both available, and a Fit to Image option creates a page sized precisely to each image — handy when the images vary in size and you want no white borders. Margin options (None, Small, Large) let you add breathing room around each image, and the tool automatically picks portrait or landscape orientation based on whether the image is taller or wider than it is.`,
      `PDF generation uses the jsPDF library running entirely client-side. Images are encoded as base64 data URLs and embedded directly into the PDF — no server round-trip, no account, no file size cap imposed by an upload limit. The download appears instantly as a single .pdf file.`,
    ],
    steps: [
      `Upload your images by dropping them onto the zone or clicking to browse — JPG, PNG and WebP are accepted, multiple at a time.`,
      `Use the ▲ ▼ arrows next to each image to reorder the pages, and ✕ to remove any you don't need.`,
      `Choose a page size: A4, US Letter, or Fit to Image (page sized to match each individual image).`,
      `Set a margin — None for edge-to-edge, Small for a comfortable border, or Large for a document-style look.`,
      `Click Generate PDF to build and immediately download the multi-page document.`,
    ],
    why: [
      `No file size cap from an upload limit — because no upload happens, you can include as many large images as your browser can handle.`,
      `Reorderable page list before generation — unlike drag-to-upload tools that lock in the order images are selected, you can rearrange freely before committing.`,
      `Automatic portrait/landscape orientation per page — the tool picks the orientation that wastes the least white space for each image, rather than forcing all pages to the same orientation.`,
      `Free with no sign-up or watermark on the generated PDF.`,
    ],
    faqs: [
      {
        question: `What is the difference between A4, Letter, and Fit to Image?`,
        answer: `A4 (210×297 mm) and US Letter (216×279 mm) create uniformly sized pages regardless of image dimensions — the image is centered inside the page with your chosen margin. Fit to Image creates a page exactly as large as each image (in points, 1 px = 1 pt), so there are no white borders and every page may have a different size. Use Fit to Image for photo books or when the images vary widely in size.`,
      },
      {
        question: `Can I combine PNG, JPG and WebP images in the same PDF?`,
        answer: `Yes. The tool accepts all three formats and can mix them within the same document — each image is converted to a base64 data URL and embedded on its own page regardless of format.`,
      },
      {
        question: `Is there a limit on how many images or how large they can be?`,
        answer: `There is no hard cap built into the tool — the limit is your browser's available memory. Very large images (20+ megapixels each) or very many images (50+) may slow down generation on low-memory devices. If the browser tab becomes unresponsive, try splitting the job into two smaller PDFs.`,
      },
      {
        question: `Does this tool send my photos to a remote server?`,
        answer: `No. jsPDF runs entirely in your browser and the images are read from local memory using FileReader. Nothing is transmitted; the finished PDF is generated in memory and offered as a local download.`,
      },
    ],
    related: [
      { slug: 'pdf-to-image', note: `Go the other direction — extract PDF pages as individual JPG or PNG images.` },
      { slug: 'image-compressor', note: `Reduce image file sizes before including them in the PDF to keep the document small.` },
      { slug: 'image-resizer', note: `Resize images to a consistent resolution before assembling them into a document.` },
    ],
  },

  'pdf-to-image': {
    intro: [
      `Sometimes what you need from a PDF is not the text but the visual — a chart on page 3, a diagram buried on page 12, or a slide you want to post as an image rather than share as a link. The PDF to Image Converter renders every page of a PDF to a high-resolution JPG or PNG using Mozilla's PDF.js library, directly in your browser, with no server upload involved.`,
      `After selecting a PDF, the tool renders a thumbnail grid of all pages — useful for visually navigating long documents. You can tick individual pages or use Select All, choose JPG or PNG output, set a render scale (1×, 2× or 3× — higher scale means sharper images and larger files), and download one page or a ZIP of all selected pages. A 2× scale on a typical A4 document produces an image around 1654×2339 pixels, which is sharp enough for screen display and light print use. At 3×, output reaches 2480×3508 pixels, suitable for most print applications.`,
      `Because pdf.js runs in the browser and the worker is bundled locally (no external CDN is used), the PDF never leaves your device. This is particularly relevant for confidential business documents, legal contracts, or medical reports that you need to extract an image from without exposing the file to a remote server.`,
    ],
    steps: [
      `Drop a PDF onto the upload zone or click to browse for the file.`,
      `Choose the output format — JPG for smaller files, PNG for lossless quality — and a render scale (2× is a good all-round choice).`,
      `Wait while the pages render into the thumbnail grid; a counter shows progress.`,
      `Tick the pages you want (or use Select All) and click Download Selected (.zip) to get them all, or hover a thumbnail and click the download icon for a single page.`,
    ],
    why: [
      `Renders at up to 3× scale — the highest resolution option produces images at roughly A4 @300 DPI equivalent, sharp enough for most print needs.`,
      `Per-page selection with a visual thumbnail grid — you can pick exactly the pages you need rather than downloading the whole document.`,
      `No server upload: pdf.js runs locally with a bundled worker, so confidential documents stay on your device.`,
      `Handles multi-page PDFs of any length — all pages are available for selection even in long documents.`,
    ],
    faqs: [
      {
        question: `What scale should I choose?`,
        answer: `1× renders each page at screen resolution (72 DPI equivalent) — small files, fine for digital sharing. 2× doubles the pixel dimensions and gives roughly 144 DPI, suitable for most on-screen and light print uses. 3× gives roughly 216 DPI and is the best choice when you need to zoom into fine detail or print at moderate size. Higher scales take longer and produce larger files.`,
      },
      {
        question: `Why does my PDF show a blank page or fail to render?`,
        answer: `Password-protected and encrypted PDFs cannot be rendered — the file must be unlocked first. Very old PDFs using Type 1 fonts or obscure encoding may also fail. Some PDFs that are actually scanned images render correctly but any text in them will be embedded in the image as a bitmap, not searchable text.`,
      },
      {
        question: `Is my PDF uploaded to a server?`,
        answer: `No. The PDF is read from your local file system using the browser File API and decoded entirely by a locally bundled pdf.js worker. Nothing is transmitted to any server. This is verified by the absence of any network requests during rendering — your browser's network inspector will show none.`,
      },
      {
        question: `Can I extract just one specific page from a 100-page document?`,
        answer: `Yes. After rendering, all pages appear in the thumbnail grid. Untick every page except the one you want, then click Download Selected (.zip) — you will get a zip with a single image inside. Alternatively, hover the thumbnail and click the download icon to save just that page without using the zip.`,
      },
    ],
    related: [
      { slug: 'image-to-pdf', note: `Go the other direction — combine a set of images into a single PDF document.` },
      { slug: 'image-compressor', note: `Reduce the file size of the exported page images before sharing them.` },
      { slug: 'image-converter', note: `Convert the exported images between formats if you need WebP or GIF.` },
    ],
  },

  'image-splitter': {
    intro: [
      `The seamless Instagram carousel — where a single panoramic image scrolls across multiple posts, each one ending exactly where the next begins — and the 3×3 grid takeover that reveals itself as a mosaic when you visit someone's profile page both rely on one technique: splitting a single image into a precise grid of numbered tiles. The Image Splitter does exactly that, slicing any JPG, PNG or WebP into columns and rows and packaging the pieces as a numbered ZIP.`,
      `Content creators use the 3×1 preset for carousel posts — a wide image split into three equal vertical strips that a viewer swipes through in order, creating a seamless horizontal pan effect. The 3×3 preset is for a grid takeover: nine tiles that, when posted as three sets of three in reverse order, form a 3×3 mosaic on a profile page. Custom column and row counts support any other split — a 2×2 for a simple four-panel layout or a 4×1 for a longer carousel. A live grid overlay on the preview shows exactly where the cuts will fall before you download.`,
      `Pieces are named part_1, part_2, … sequentially left-to-right, top-to-bottom, which is the correct posting order for a seamless carousel. The ZIP is generated on a canvas in your browser and no image data is uploaded.`,
    ],
    steps: [
      `Upload the image you want to split — JPG, PNG or WebP.`,
      `Pick a preset (3×1 carousel, 3×3 grid takeover, 2×2, 1×3) or enter your own column and row numbers.`,
      `Check the grid overlay on the preview to confirm the cuts land where you expect.`,
      `Choose JPG or PNG output format.`,
      `Click Download pieces (.zip) to get all tiles in a single archive named part_1, part_2, … in posting order.`,
    ],
    why: [
      `Grid overlay preview shows exactly where each cut will fall before you commit to the download, preventing surprises.`,
      `Numbered naming in left-to-right, top-to-bottom posting order means you can upload the ZIP pieces to a scheduler in order without manual renaming.`,
      `Custom columns and rows support any grid size from 1×2 up to 10×10 — not just the four presets.`,
      `Entirely client-side canvas slicing — no upload, no watermark on the pieces.`,
    ],
    faqs: [
      {
        question: `What order should I post the tiles for a seamless Instagram carousel?`,
        answer: `Post part_1 first (the leftmost column for a 3×1), then part_2, then part_3. Viewers swipe left through the posts in the order they appear in the carousel, so the file numbered 1 is what appears first when someone lands on the post.`,
      },
      {
        question: `Why don't the pieces line up perfectly when I upload them?`,
        answer: `The tile width and height are calculated as floor(imageWidth / columns) and floor(imageHeight / rows). If the image dimensions are not exactly divisible by the number of columns or rows, a small strip of pixels at the right or bottom edge is discarded. Start with an image whose dimensions are evenly divisible by your column and row counts for a perfect seamless result.`,
      },
      {
        question: `Can I use this for a 3×3 Instagram profile grid takeover?`,
        answer: `Yes — choose the 3×3 preset. However, note that Instagram fills a profile grid from right to left, bottom to top. That means to display the mosaic correctly you need to post the tiles starting from the bottom-right (part_9) and work backward to part_1 last. The final post (part_1, top-left) is what most followers will see first in their feed.`,
      },
      {
        question: `What image format should I use for the output?`,
        answer: `JPG is smaller and suited to photographs. PNG is lossless and better for graphics, illustrations or images with text where you need sharp edges. Instagram recompresses both formats on upload regardless.`,
      },
    ],
    related: [
      { slug: 'social-media-image-resizer', note: `Resize the source image to the correct aspect ratio for your target platform before splitting.` },
      { slug: 'image-collage-maker', note: `Do the reverse — combine multiple photos into a single grid image.` },
      { slug: 'image-cropper', note: `Crop to the exact area you want before slicing into tiles.` },
    ],
  },

  'sprite-sheet-generator': {
    intro: [
      `Every time a web page or game loads a separate image file for each icon, button state or animation frame, the browser or engine sends a separate HTTP request. For a set of thirty sprites, that is thirty requests — thirty round-trips of latency before anything renders. Combining them all into a single sprite sheet (also called a texture atlas) cuts that to one request, and the JSON frame map tells the engine exactly where each sprite lives in the combined image so it can draw only that region when needed.`,
      `Web developers use sprite sheets to deliver icon sets or UI elements in one optimized PNG, referencing each icon with a CSS background-position offset. Game developers pack animation frames and tile sets into atlases that the GPU can load as a single texture, dramatically reducing draw calls. The Sprite Sheet Generator packs your individual PNG, JPG or WebP images into rows under a maximum sheet width, with configurable padding between sprites and an optional scale factor. It exports two files at once: the packed PNG atlas, and a JSON frame map that gives each sprite's name, x, y, width and height.`,
      `Packing happens with a shelf algorithm: sprites are placed left to right; when the next sprite would exceed the max width, a new row begins below the tallest sprite in the current row. This is not the globally optimal packing algorithm (that would be a bin-packing NP-hard problem), but it is fast, predictable, and works well for sprites of similar heights — the most common real-world case. All processing happens on a canvas in your browser with no upload.`,
    ],
    steps: [
      `Drop your sprite images onto the upload zone — PNG is recommended to preserve transparency, but JPG and WebP are accepted.`,
      `Set the max sheet width in pixels (e.g. 512 for a 512×N sheet). Sprites wider than this value will still be placed but will extend the sheet beyond the limit.`,
      `Adjust the padding between sprites (a few pixels prevents sprites from bleeding into each other when using linear texture filtering in a game engine).`,
      `Choose a scale factor to uniformly upscale or downscale all sprites — useful for generating @2x or @0.5x variants.`,
      `Click Download PNG to save the packed atlas, and Download JSON to save the frame map with x, y, width, height for every sprite.`,
    ],
    why: [
      `Exports both the PNG atlas and the JSON frame map simultaneously — other simple packers give you the image but make you hand-write the coordinates.`,
      `Scale factor lets you generate multiple resolution tiers (@1x, @2x) from the same set of source images without resizing each file manually.`,
      `Checkerboard background in the preview makes transparency visible so you can confirm alpha channels are preserved before downloading.`,
      `No upload: sprites remain on your device, which matters when the assets are unreleased game content or proprietary UI.`,
    ],
    faqs: [
      {
        question: `What format should I use for the JSON in my project?`,
        answer: `The exported JSON has a frames object keyed by sprite name (filename without extension), each with x, y, w, h properties, plus a meta object with the full sheet width and height. This structure is similar to what TexturePacker and Phaser expect. For CSS usage, divide x and y by the sheet width and height to get background-position percentages, or use the pixel values directly with background-position in px.`,
      },
      {
        question: `Why is there a gap at the right edge of some rows?`,
        answer: `The shelf packer places sprites left to right and wraps to a new row when the next sprite would overflow the max width. If the sprites in a row don't add up to exactly the max width, there is empty space at the right of that row. This is normal and expected — the frame map positions are accurate regardless of the empty space.`,
      },
      {
        question: `Does it support transparency (alpha channel)?`,
        answer: `Yes — the sheet canvas uses a transparent background by default, and PNG export preserves the alpha channel. Each sprite's transparency is maintained in the atlas. If you export sprites that have transparent areas as JPG they will be composited on a white background, so always use PNG for transparency-dependent sprites.`,
      },
      {
        question: `Is there a limit on how many sprites I can pack?`,
        answer: `There is no hard limit built into the tool. Very large numbers of sprites (hundreds of high-resolution images) may produce a very tall sheet or run slowly due to canvas memory limits. For large atlases, consider reducing the scale or splitting into multiple sheets.`,
      },
    ],
    related: [
      { slug: 'image-collage-maker', note: `Compose images into a simple grid layout for social media or presentations.` },
      { slug: 'image-resizer', note: `Resize individual sprite images to a consistent size before packing.` },
      { slug: 'image-compressor', note: `Reduce the file size of the exported PNG atlas for faster loading.` },
    ],
  },

  'image-watermark': {
    intro: [
      `Sharing images on the web without any attribution is an invitation for them to be reused without credit. A watermark — whether a copyright line of text or a small logo in the corner — ties the image back to its creator even after it has been downloaded, screenshotted, or reposted. The Image Watermark Tool applies text or image watermarks to photos directly in your browser, with controls for position, opacity, scale and rotation, and outputs the result as a clean download with no extra branding added.`,
      `Photographers use it to protect portfolio shots before sending them to clients for approval, adding a semi-transparent name in the bottom-right corner so the image is viewable but not print-ready. Small businesses use it to stamp a logo on product photos before publishing them to an online store or social media, deterring unauthorized use. The tool processes multiple images in one run and bundles the results in a ZIP — so a batch of 20 product photos can all be watermarked with the same settings and downloaded together.`,
      `Switch between Text Watermark and Image Watermark with a single click. For text, configure the font family, size, color, bold, italic, opacity, rotation (0–360°) and a nine-point anchor grid (top-left through bottom-right) with fine-grained X and Y offsets. For an image watermark, upload a logo PNG, set its scale relative to the base image width, and place it anywhere on the same nine-point grid. All watermarking happens on a canvas in your browser; your photos are never uploaded.`,
    ],
    steps: [
      `Upload one or more photos to watermark by dropping them onto the zone or clicking to browse.`,
      `Click Text to type a watermark (copyright line, name, URL) or Image to upload a logo file.`,
      `For text: set font family, size, color, bold, italic, and opacity. For image: upload your logo and adjust the scale percentage.`,
      `Choose a position from the nine-point grid (e.g. Bottom Right) and set X/Y offset to fine-tune the placement.`,
      `Adjust the rotation slider if you want a diagonal or tilted watermark.`,
      `Click Add Watermark to process all uploaded images, then download individually or use Download All as ZIP.`,
    ],
    why: [
      `Nine-point anchor grid with pixel-level offset control gives precise placement without needing to calculate coordinates manually.`,
      `Supports both text and logo (image) watermarks in the same session with a single toggle.`,
      `Batch processing — watermark an entire folder of photos with identical settings and download them all as one ZIP.`,
      `Browser-only processing with no upload: original high-resolution photos stay on your device even while being watermarked.`,
    ],
    faqs: [
      {
        question: `What opacity setting makes a watermark visible but not distracting?`,
        answer: `A value between 30% and 50% is the most common range for protecting images while keeping the subject clearly visible. At 50% the watermark is obvious but not harsh. Below 20% it may be too easy to clone-stamp out in an image editor. For preview watermarks you want to be clearly unremovable, 70–80% opacity is more appropriate.`,
      },
      {
        question: `Can I watermark a transparent PNG with a logo?`,
        answer: `Yes — upload the PNG and choose Image watermark mode, then upload your logo. The output preserves the original file type (PNG for PNG sources), keeping any existing transparency intact.`,
      },
      {
        question: `What font families are available for text watermarks?`,
        answer: `The tool provides seven system fonts: Arial, Helvetica, Times New Roman, Georgia, Verdana, Courier New and Impact. These are standard fonts guaranteed to render consistently across browsers without needing a font download.`,
      },
      {
        question: `Is my image uploaded to a server when I watermark it?`,
        answer: `No. All watermarking is done on an HTML5 canvas in your browser. Your photos are read from local memory and the watermarked result is saved back to your device as a local download. No data is transmitted to any server.`,
      },
    ],
    related: [
      { slug: 'image-compressor', note: `Reduce the watermarked image's file size before publishing online.` },
      { slug: 'image-resizer', note: `Resize your photos to the right dimensions before adding a watermark.` },
      { slug: 'image-converter', note: `Convert the watermarked image to a different format such as WebP.` },
    ],
  },

  'unix-timestamp-converter': {
    intro: [
      `Every time a record is created in a database, a log line is written, or an API response is returned, the timestamp is almost always stored as a Unix epoch — a plain integer counting seconds (or milliseconds) since 1 January 1970 at 00:00:00 UTC. Reading those numbers directly is hopeless. The Unix Timestamp Converter turns them into the exact local time, UTC time, and relative description you need — and reverses the process when you need to go the other direction.`,
      `Backend engineers reach for this when scanning server logs where events are stamped 1719475200 and they need to know whether that was before or after the outage window. Mobile developers use it while debugging push notification scheduling — a timestamp of 1735689600 needs to resolve to a date that can be compared against the user's local timezone. Security analysts use it to correlate authentication tokens that encode expiry as a Unix epoch in their JWT payloads. The live "Current Unix Time" banner at the top of the page shows the current second ticking in real time, making it easy to copy the current epoch at any moment.`,
      `The converter automatically detects whether a timestamp is in seconds (10 digits) or milliseconds (13 digits), so you never need to pre-convert. In the date-to-timestamp block you can either fill individual Year, Month, Day, Hour, Minute, Second selectors or paste an ISO 8601 string directly — both update the epoch output instantly. All calculations use the JavaScript Date object running locally in your browser; nothing is transmitted.`,
    ],
    steps: [
      `Copy the current Unix time from the live banner, or paste your own timestamp into the "Timestamp → Human Date" input field.`,
      `The tool automatically detects seconds (10 digits) vs. milliseconds (13 digits) and immediately shows local time, UTC time, and a relative description like "3 minutes ago".`,
      `Click Copy next to any output line to send it to your clipboard.`,
      `To go the other direction, fill in Year, Month, Day, Hour, Minute, Second in the "Date → Timestamp" block, or paste an ISO 8601 string into the override field.`,
      `Read the resulting epoch in both seconds and milliseconds, and copy either value.`,
    ],
    why: [
      `The live clock shows the current Unix epoch ticking second by second — useful for capturing a precise "now" timestamp without needing a terminal or a language REPL.`,
      `Auto-detects seconds vs. milliseconds so you do not need to know or convert the format before pasting.`,
      `Relative time output ("42 minutes ago", "2 days from now") adds immediate human context without any extra calculation.`,
      `Runs entirely in your browser via the JavaScript Date API — no server, no telemetry, no data leaves your machine.`,
    ],
    faqs: [
      {
        question: `What is the Unix timestamp 2038 problem?`,
        answer: `Many older systems store Unix timestamps as a 32-bit signed integer, which can hold a maximum value of 2,147,483,647. That number represents 19 January 2038 at 03:14:07 UTC. After that moment, a 32-bit system's timestamp counter overflows to a large negative number, causing dates to jump back to 1901. Modern systems use 64-bit integers, which push the overflow date billions of years into the future — but embedded systems and legacy software are still vulnerable.`,
      },
      {
        question: `How do I tell whether my timestamp is in seconds or milliseconds?`,
        answer: `Count the digits. A 10-digit number like 1719475200 is seconds. A 13-digit number like 1719475200000 is milliseconds. If the number is larger than about 2 billion (10 digits that start with 1 or 2), it is seconds. The converter detects this automatically based on digit count, so you can paste either format freely.`,
      },
      {
        question: `Why does the tool show a different time than I expected?`,
        answer: `The "Local Time" output uses your browser's local timezone, which is set by your operating system. If you are working with a timestamp that represents a time in another timezone, the UTC output is the unambiguous reference. To compare, check the UTC output against the expected UTC time of the event.`,
      },
      {
        question: `Is my timestamp data sent to a server?`,
        answer: `No. All conversions run inside your browser using the built-in JavaScript Date object. No data is transmitted to any server, making the tool safe to use with sensitive timestamps from logs or authentication systems.`,
      },
    ],
    related: [
      { slug: 'string-converter', note: `Reformat timestamp-related identifiers like field names between camelCase and snake_case.` },
      { slug: 'json-formatter', note: `Format and inspect JSON payloads that contain embedded Unix timestamps.` },
      { slug: 'hash-generator', note: `Generate SHA-256 or MD5 hashes for timestamp-based nonces or cache keys.` },
    ],
  },

  'csv-to-json': {
    intro: [
      `CSV is the format data comes in. JSON is the format modern applications expect. The gap between them costs real development time — especially when you need to inspect a database export, feed a spreadsheet row into an API, or prototype a frontend component with realistic data. The CSV to JSON Converter handles that conversion entirely in your browser, turning tabular text into a clean, ready-to-use JSON array in under a second.`,
      `Data engineers paste in a query result from DBeaver or pgAdmin to verify the shape before writing an ETL transform. Front-end developers drop in a product CSV from a client to mock up a catalog component without waiting for an API. QA engineers convert test fixtures from spreadsheets into the JSON arrays their testing framework expects. The converter uses the PapaParse library for robust parsing — it handles quoted fields with commas inside, escaped quotes, mixed line endings, and other edge cases that naive regex-based parsers choke on.`,
      `Three options govern the output. "Has Header Row" tells the parser to use the first row as property names — turning each subsequent row into a named object. "Skip Empty Lines" prevents blank rows from creating empty array entries. "Parse Numbers and Booleans" automatically coerces cells that look like numbers or true/false values into their native JavaScript types, so you get {"age": 30} instead of {"age": "30"}. Toggle any combination depending on your source data.`,
    ],
    steps: [
      `Paste your CSV text into the input area, or click "Upload File" to drop in a .csv or .txt file from disk.`,
      `Enable "Has Header Row" if the first line contains column names (most exports do). Disable it for raw data arrays.`,
      `Toggle "Skip Empty Lines" to ignore blank rows, and "Parse Numbers & Booleans" to auto-convert numeric and boolean cells.`,
      `The JSON array appears immediately in the output panel below, with a row count shown in the label.`,
      `Click "Copy JSON" to send the output to your clipboard, or drag it directly into your editor.`,
    ],
    why: [
      `Uses the battle-tested PapaParse library for parsing — it handles quoted commas, escaped quotes, BOM markers, and mixed line endings that trip up simpler converters.`,
      `Three output-shaping options (header row, empty lines, type coercion) let you control the exact JSON structure without post-processing.`,
      `File drop support means you can convert a local CSV without first opening it in a text editor to copy its contents.`,
      `Runs fully offline in your browser — no upload, no API key, no size limit imposed by a server. Large CSV files process as fast as your device can parse them.`,
    ],
    faqs: [
      {
        question: `What happens if my CSV has commas inside a field value?`,
        answer: `PapaParse handles quoted fields correctly. If a cell value contains a comma, it should be wrapped in double quotes in the CSV — for example: "Smith, John". The parser recognizes the quotes and treats the comma as part of the value, not a column delimiter.`,
      },
      {
        question: `When should I turn off "Has Header Row"?`,
        answer: `Turn it off when your CSV has no column names in the first row — for example, a raw export that starts immediately with data values. In that case, the output will be an array of arrays rather than an array of objects, which is sometimes exactly what you need for positional data processing.`,
      },
      {
        question: `Is my CSV data uploaded anywhere?`,
        answer: `No. The CSV is parsed entirely in your browser using JavaScript. The file or pasted text never leaves your device. This makes the tool safe for internal data, client exports, and anything you would not want passing through a third-party server.`,
      },
      {
        question: `Why are some numbers coming out as strings even with "Parse Numbers" enabled?`,
        answer: `PapaParse's type detection parses cells that look like pure numbers. If a cell has leading zeros (like a postal code "02134"), a currency symbol, or mixed content ("30px"), it stays as a string to avoid corrupting the value. That behavior is intentional — converting "02134" to the number 2134 would destroy the leading zero.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Once you have the JSON array, format and validate it with proper indentation.` },
      { slug: 'json-to-csv', note: `The reverse path — convert a JSON array back into a CSV file.` },
      { slug: 'text-diff', note: `Compare two versions of a CSV before and after a transformation to confirm the changes.` },
    ],
  },

  'xml-to-json': {
    intro: [
      `XML still powers a huge portion of enterprise data exchange — SOAP web services, RSS and Atom feeds, Android resource files, Maven configurations, SVG graphics, and almost every legacy system integration you will encounter. But modern JavaScript applications expect JSON. Bridging that gap usually means writing a recursive DOM traversal or installing a parsing library. The XML to JSON Converter does that work instantly, in your browser, with no dependencies to install.`,
      `API integrators paste a raw SOAP response to understand its structure before writing a parser. WordPress and CMS developers convert RSS feed XML into JSON arrays to feed a custom frontend component. Android developers look up the shape of a parsed layout XML to understand what their code will receive at runtime. The split-pane layout shows your input XML on the left and the resulting JSON on the right simultaneously, updating as you type — so you can see exactly how each XML node maps to a JSON key.`,
      `The conversion follows a consistent set of rules. Element attributes become properties prefixed with "@" (so a tag attribute like id="42" becomes "@id": "42"). When an element has only text content, it converts to a plain string value. When multiple sibling elements share the same tag name, they convert to a JSON array. The "Beautify Output" toggle formats the JSON with two-space indentation for readability, or compact format for copy-pasting into minified contexts. If the XML is malformed, a descriptive error badge appears immediately — no silent failures.`,
    ],
    steps: [
      `Paste your XML into the left "XML Input" panel. The converter begins processing as you type.`,
      `If the XML contains a syntax error — an unclosed tag, mismatched element, or illegal character — an error badge appears below the input with a description.`,
      `Once valid XML is entered, the JSON output appears in the right panel automatically.`,
      `Toggle "Beautify" to switch between indented (readable) and compact (minified) JSON output.`,
      `Click "Copy JSON" to send the formatted result to your clipboard.`,
    ],
    why: [
      `Uses the browser's native DOMParser API — no external library download, no npm dependency, and the same XML engine your browser already uses to render web pages.`,
      `Real-time validation with descriptive error messages catches malformed XML immediately rather than returning an empty or corrupted output silently.`,
      `Consistent attribute mapping (@prefix) and array detection (repeated sibling tags) produce predictable JSON that does not require post-processing to navigate.`,
      `Client-side only — XML documents, which often contain sensitive business data or internal schema details, never leave your browser.`,
    ],
    faqs: [
      {
        question: `How are XML attributes handled in the JSON output?`,
        answer: `Each attribute becomes a property prefixed with "@". For example, the tag <user id="42" role="admin"> becomes {"@id": "42", "@role": "admin"} in the JSON object for that node. This prefix distinguishes attribute properties from child element properties and is a widely used convention in XML-to-JSON mappings.`,
      },
      {
        question: `When does the converter produce a JSON array?`,
        answer: `When multiple sibling XML elements share the same tag name, the converter groups them into a JSON array under that tag's key. For example, three <item> elements inside a <list> produce "item": ["first", "second", "third"]. A single <item> produces a plain string or object, not an array.`,
      },
      {
        question: `My XML has a namespace prefix like ns2:element — how does that appear in JSON?`,
        answer: `The tag name including the prefix becomes the JSON key. So <ns2:element>value</ns2:element> converts to "ns2:element": "value". Namespace declaration attributes like xmlns:ns2 are preserved as "@xmlns:ns2" properties on their element.`,
      },
      {
        question: `Is my XML data sent to any server?`,
        answer: `No. The DOMParser API is a browser built-in — parsing happens entirely in your browser's JavaScript engine. Your XML never leaves your device, which is important for SOAP payloads, configuration files, and internal API responses that contain sensitive data.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Format and validate the JSON output once converted from XML.` },
      { slug: 'csv-to-json', note: `If your data source is tabular rather than hierarchical, convert CSV to JSON instead.` },
      { slug: 'html-entity-encoder', note: `Decode HTML entities in XML text content before or after conversion.` },
    ],
  },

  'yaml-json-converter': {
    intro: [
      `YAML is everywhere in the DevOps world — Kubernetes manifests, GitHub Actions workflows, Docker Compose files, Ansible playbooks, Helm charts, and CI/CD pipeline configs all default to it. JSON is what APIs, debuggers, and most programming language runtimes speak natively. The YAML ↔ JSON Converter lets you translate between the two in real time, in either direction, without switching tools or running a script in your terminal.`,
      `Platform engineers paste a Kubernetes deployment manifest to understand its JSON equivalent before writing a validation rule against the Kubernetes API. Node.js developers convert a GitHub Actions workflow YAML into JSON so they can feed it into a JSON schema validator or diff tool. Configuration authors paste a complex nested YAML to verify the parsed structure matches what they intended — catching accidental indentation errors that change the hierarchy without triggering a parser error.`,
      `Two tabs handle each direction: "YAML → JSON" and "JSON → YAML". Both sides update in real time as you type. Errors surface with the specific line and column information that js-yaml provides — so "mapping values are not allowed here at line 3, column 5" tells you exactly where to look. The YAML output uses a clean two-space indented format; the JSON output is formatted with two-space indentation as well, ready to read or paste.`,
    ],
    steps: [
      `Select the "YAML → JSON" tab to convert YAML to JSON, or "JSON → YAML" to go the other direction.`,
      `Click "Load example" to pre-fill a sample input if you want to explore the output format before pasting your own data.`,
      `Paste or type your YAML (or JSON) into the left input panel. Conversion happens in real time.`,
      `If there is a syntax error — wrong indentation, a missing colon, or invalid JSON — an error message appears below the input showing the line and description.`,
      `Click "Copy" to send the output to your clipboard.`,
    ],
    why: [
      `Uses js-yaml, a battle-tested library that supports the full YAML 1.2 spec including multi-line strings, anchors, and aliases — features that simpler parsers miss.`,
      `Real-time conversion means you see the result change as you fix a YAML indentation error, eliminating the slow edit-run-check cycle in a terminal.`,
      `Line-number error reporting pinpoints exactly where a parse failure occurs rather than returning a generic "invalid YAML" message.`,
      `Client-side only — Kubernetes secrets, CI tokens, and database connection strings in config files never leave your browser.`,
    ],
    faqs: [
      {
        question: `Why does my YAML parse without error but the JSON output looks wrong?`,
        answer: `YAML is sensitive to indentation — a key indented one space too few or too many becomes a child of a different parent node, changing the structure without triggering a parse error. Compare your indentation carefully: each level should be consistently two (or four) spaces, with no mix of tabs and spaces.`,
      },
      {
        question: `Does the converter handle YAML anchors and aliases?`,
        answer: `Yes. js-yaml resolves YAML anchors (&anchor) and aliases (*anchor) during parsing, so the JSON output contains the fully expanded, dereferenced values — the same structure your application would receive at runtime.`,
      },
      {
        question: `Is this tool useful for Kubernetes config files?`,
        answer: `Yes, this is a common use case. Paste a Kubernetes YAML manifest to inspect its JSON equivalent — which is what the Kubernetes API Server actually processes. This helps when writing validation webhooks, JSON patch operations, or kubectl --patch arguments that require JSON format.`,
      },
      {
        question: `Is my config file data sent to any server?`,
        answer: `No. Conversion runs entirely in your browser using the js-yaml library. Your YAML or JSON — including any secrets, tokens, or connection strings — never leaves your device.`,
      },
    ],
    related: [
      { slug: 'json-formatter', note: `Validate and format the converted JSON output with proper indentation.` },
      { slug: 'csv-to-json', note: `If your configuration data starts in a spreadsheet, convert it to JSON first.` },
      { slug: 'json-diff', note: `Compare two YAML-derived JSON objects to find what changed between versions.` },
    ],
  },

  'html-entity-encoder': {
    intro: [
      `Certain characters carry structural meaning in HTML — the angle bracket that opens a tag, the ampersand that starts an entity reference, the double quote that delimits an attribute value. When those characters appear in content rather than markup, they must be escaped into entity form to prevent browsers from misinterpreting them. The HTML Entity Encoder converts raw text to safe entities in one click, and reverses the operation just as easily.`,
      `Web developers use it when building dynamic HTML templates: a product description containing a trademark symbol or an apostrophe needs encoding before it is injected into an attribute value. Content editors use it when a CMS is stripping or mangling characters — pasting the problematic text here shows exactly what entity sequence is needed. Security testers encode angle brackets to demonstrate what a safe-rendered version of a suspected XSS payload looks like versus the raw string.`,
      `The tool uses the browser's own DOM for encoding and decoding, which guarantees correct results for named HTML5 entities, decimal numeric references (&#60;), and hexadecimal references (&#x3C;) alike. A quick-reference table beneath the tool lists the ten most commonly needed entity mappings — the kind you look up so often that having them one scroll away is worth the space.`,
    ],
    steps: [
      `Choose "Encode" to convert raw text into HTML entity sequences, or "Decode" to turn entity strings back into their original characters.`,
      `Paste or type your content into the left panel. The output updates instantly in the right panel.`,
      `Click "Copy" above either panel to send its contents to your clipboard.`,
      `Refer to the entity reference table at the bottom for the ten most common special characters and their named, decimal, and hex entity forms.`,
    ],
    why: [
      `Uses the browser's own DOM element internally — the same engine rendering the page — which means the encoding and decoding results match exactly what a browser would produce or expect.`,
      `Handles both encode and decode directions in a single tool, so you do not need to switch between an encoder and a separate decoder site.`,
      `The quick-reference table keeps the most commonly needed entities — angle brackets, ampersand, quotes, copyright, trademark, euro — immediately visible without a separate search.`,
      `Runs client-side with no upload — safe to use with HTML fragments from private internal tools, CMS templates, or email systems.`,
    ],
    faqs: [
      {
        question: `What is the difference between named entities and numeric entities?`,
        answer: `Named entities use a human-readable name: &lt; for less-than, &amp; for ampersand. Numeric entities use a decimal (&# followed by a number) or hexadecimal (&#x followed by hex digits) code point. All three represent the same character — named entities are easier to read, while numeric entities work for any Unicode code point, including characters that have no named entity form.`,
      },
      {
        question: `Why do I need to encode HTML entities?`,
        answer: `If you inject text containing < or & directly into HTML, the browser parses them as the start of a tag or entity reference rather than as literal characters. This can break your layout or, worse, open an XSS vulnerability if the text comes from user input. Encoding converts those characters to their safe entity equivalents so the browser renders them as visible text rather than treating them as markup.`,
      },
      {
        question: `Does the encoder handle the full Unicode character set?`,
        answer: `The encoder outputs the most specific named entity where one exists (like &copy; for ©). For characters without a named entity, it falls back to the raw character because modern HTML5 documents with a UTF-8 charset can include most Unicode characters directly without encoding them.`,
      },
      {
        question: `Is my text data sent to a server?`,
        answer: `No. Encoding and decoding use a hidden browser DOM element, which is entirely local to your browser tab. No text is transmitted anywhere.`,
      },
    ],
    related: [
      { slug: 'url-encoder-decoder', note: `Encode special characters for safe inclusion in URLs rather than HTML.` },
      { slug: 'base64-encoder', note: `Encode binary data or text as Base64 for use in data URIs or HTTP headers.` },
      { slug: 'xml-to-json', note: `Parse XML that may contain encoded entities as part of converting it to JSON.` },
    ],
  },

  'csv-diff-viewer': {
    intro: [
      `Data changes silently. A CSV export from last week and one from today look identical at a glance but differ in a dozen cells buried in row 847. Spotting those differences manually — scrolling two spreadsheets side by side, comparing cell by cell — is tedious and error-prone. The CSV Diff Viewer does the comparison automatically, rendering a color-coded table that shows exactly which rows were added, which were removed, and which cells changed value.`,
      `Data analysts run it before and after a data pipeline job to verify that only the expected records changed. Engineers compare the before-and-after of a database migration export to confirm referential integrity was preserved. Product managers diff two versions of a pricing CSV to audit what a vendor changed between submission rounds. The visual grid format — green for added, red for removed, yellow for modified cells — makes the change surface immediately scannable without reading line by line.`,
      `The tool uses PapaParse to parse both CSVs, then aligns rows by index and compares column by column. When the first row looks like a header (non-numeric values), it is used to label the table columns. The summary line at the top of the result shows the count of added, removed, and modified rows so you know the scope of changes at a glance before inspecting individual cells.`,
    ],
    steps: [
      `Paste the original CSV into the left "Original CSV" textarea and the modified CSV into the right "Modified CSV" textarea.`,
      `Click "Compare" to run the diff.`,
      `Read the summary line: how many rows were added, removed, or modified.`,
      `Scroll the result table to inspect individual rows. Green rows are new, red rows were deleted, and yellow-highlighted cells within a row changed value — the old value is shown in strikethrough red, the new value in green.`,
    ],
    why: [
      `Visual color coding — green for added, red for removed, yellow for modified cells — lets you scan a diff result in seconds rather than reading it line by line.`,
      `Shows old and new cell values side by side within a modified row (strikethrough old → new), so you see both values without needing separate original and modified views.`,
      `Uses PapaParse for robust CSV parsing — handles quoted commas, escaped quotes, and varying line endings that simple split-on-comma approaches miss.`,
      `Completely browser-side — production database exports, financial CSVs, and client data stay on your machine.`,
    ],
    faqs: [
      {
        question: `How does the tool match rows between the two CSVs?`,
        answer: `Rows are matched by their position (index) in the file. Row 1 in the original is compared to row 1 in the modified file. This means if a row was inserted at the top, all subsequent rows will appear as "modified" even if their content did not change. For key-based diffing (matching rows by an ID column), a post-comparison manual review may still be needed for insertions at arbitrary positions.`,
      },
      {
        question: `Does the tool require my CSVs to have the same columns?`,
        answer: `No, but the column count in the result table is determined by the widest row. If the two CSVs have different numbers of columns, the extra cells in the narrower CSV appear as empty. The header row (if present) is taken from the first CSV.`,
      },
      {
        question: `Can I compare CSV files with thousands of rows?`,
        answer: `Yes — PapaParse processes the CSV locally in your browser, and JavaScript can handle large files quickly. The result table renders all rows, so very large diffs will scroll. There is no server-side size limit because no data is uploaded.`,
      },
      {
        question: `Is my CSV data sent to a server?`,
        answer: `No. Both CSVs are parsed locally using PapaParse running in your browser. Nothing is transmitted to any server, making the tool safe for financial records, client data, and any other sensitive spreadsheet content.`,
      },
    ],
    related: [
      { slug: 'text-diff', note: `Compare plain text files line by line when the data is not in CSV format.` },
      { slug: 'json-diff', note: `Diff two JSON objects field by field when your data has already been converted.` },
      { slug: 'csv-to-json', note: `Convert a CSV to JSON first if you need to work with the data in a structured format.` },
    ],
  },

  'rot13-caesar-cipher': {
    intro: [
      `The Caesar cipher is one of the oldest substitution ciphers on record — Julius Caesar reportedly used it to protect military correspondence by shifting each letter in the alphabet by three positions. ROT13, the most widely known modern variant, shifts by 13 and is used everywhere from forum spoiler tags to developer in-jokes to basic obfuscation of text in plain-text files. The ROT13 / Caesar Cipher tool applies any shift from 1 to 25 in real time, covering both classic ROT13 and every other Caesar variant.`,
      `Developers use ROT13 to obfuscate spoilers or surprise reveals in README files and code comments — the text is readable to anyone who knows to apply ROT13, but not immediately visible. CTF (Capture the Flag) competitors reach for it constantly, since ROT13 and Caesar shifts are among the most common encoding challenges in beginner and intermediate puzzles. Educators use it to teach the basics of substitution ciphers and why frequency analysis breaks them. The shift slider makes it easy to try all 25 possible shifts when brute-forcing an unknown Caesar cipher.`,
      `The tool shifts only alphabetic characters — A through Z and a through z — leaving numbers, spaces, punctuation, and Unicode symbols exactly as they are. ROT13 is its own inverse: applying it twice returns the original text, so the same tool encodes and decodes. For other shifts, the "Swap" button moves the output back to the input field, letting you apply the inverse shift (26 minus the original shift) to decode.`,
    ],
    steps: [
      `Type or paste your text into the "Input Text" area.`,
      `Drag the slider or type a number in the manual input to set the shift value. The default is 13 (standard ROT13).`,
      `Click "ROT13 (13)" to snap the slider back to 13 at any time.`,
      `Read the encoded result in the "Output" area — it updates instantly as you adjust the shift.`,
      `Click "Copy Output" to copy the result, or "Swap" to move the output into the input field (useful for decoding by applying the inverse shift).`,
    ],
    why: [
      `Real-time output as you adjust the shift slider means you can brute-force an unknown Caesar cipher interactively — drag through all 25 positions and read for the shift that produces readable English.`,
      `The Swap button enables decoding without needing a separate "decode" mode — paste the cipher text, swap, and apply the inverse shift (26 minus original).`,
      `Numbers, punctuation, and non-ASCII characters pass through unchanged, so URLs, code snippets, and formatted text do not get corrupted by the cipher.`,
      `Pure client-side JavaScript with no dependencies — runs instantly and never transmits the plaintext or ciphertext to any server.`,
    ],
    faqs: [
      {
        question: `What is the difference between ROT13 and a Caesar cipher?`,
        answer: `ROT13 is a specific Caesar cipher where the shift is exactly 13. Because the English alphabet has 26 letters, shifting by 13 twice returns to the start — making ROT13 its own inverse. A Caesar cipher is the general term for any alphabetic shift substitution, with shifts from 1 to 25. ROT13 is the most common because its self-inverse property makes it convenient for lightweight obfuscation.`,
      },
      {
        question: `How do I decode a Caesar cipher if I don't know the shift?`,
        answer: `Drag the slider through all 25 positions and read the output at each stop. Readable English text will appear at the correct shift — this is called a brute-force attack. For longer texts, look for common short words: if "Gur" appears, it is likely "The" (shift 13). For very short messages, frequency analysis of letter distribution can also hint at the shift.`,
      },
      {
        question: `Does the cipher affect numbers or special characters?`,
        answer: `No. Only the 26 uppercase and 26 lowercase English letters (A–Z, a–z) are shifted. Digits, spaces, punctuation, and non-ASCII characters pass through to the output unchanged. This keeps URLs, code snippets, and structured text intact.`,
      },
      {
        question: `Is ROT13 a secure encryption method?`,
        answer: `No. ROT13 and Caesar ciphers provide no meaningful security — they are trivially broken by anyone who tries 25 possible shifts or notices letter frequencies. They are appropriate only for very lightweight obfuscation like spoiler tags, not for protecting sensitive data. Use a modern encryption standard like AES-256 for anything that needs real security.`,
      },
    ],
    related: [
      { slug: 'base64-encoder', note: `Encode text or binary data with Base64 for more widely used obfuscation in web contexts.` },
      { slug: 'hash-generator', note: `Generate cryptographic hashes for one-way data fingerprinting rather than reversible encoding.` },
      { slug: 'string-converter', note: `Convert cased text between naming conventions when the goal is formatting rather than encoding.` },
    ],
  },
};

export function getToolContent(slug: string): ToolLongContent | undefined {
  return TOOL_CONTENT[slug];
}
