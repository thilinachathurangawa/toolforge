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
};

export function getToolContent(slug: string): ToolLongContent | undefined {
  return TOOL_CONTENT[slug];
}
