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
};

export function getToolContent(slug: string): ToolLongContent | undefined {
  return TOOL_CONTENT[slug];
}
