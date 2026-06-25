# SPEC: Currency Converter Tool
**File:** `docs/specs/tools/converter/CURRENCY_CONVERTER.md`
**Status:** Completed
**Slug:** `currency-converter`
**Category:** converter

---

## SEO

- **Title:** `Currency Converter — Live Exchange Rates Online Free | ToolForge`
- **Description:** `Convert between 160+ currencies using live exchange rates from the Frankfurter API. Searchable dropdowns, graceful offline fallback. Free currency converter online.`
- **Primary Keyword:** currency converter online free
- **Secondary Keywords:** live exchange rate calculator, foreign exchange calculator, USD to EUR converter

---

## Functional Requirements

- [ ] Amount input + source currency selector + target currency selector
- [ ] Swap button to reverse direction
- [ ] Fetch live rates from Frankfurter API (`https://api.frankfurter.app/latest?from=USD`) — free, no API key
- [ ] Searchable currency select menus (filter by code or name)
- [ ] Graceful fallback: if fetch fails, show clear error with "rates unavailable" message
- [ ] Disclosure: "Exchange rates provided by Frankfurter API. Data leaves your browser to retrieve rates."
- [ ] Supported currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, LKR, SGD, HKD, MXN, BRL, KRW, ZAR, SEK, NOK, DKK, NZD (and all others from Frankfurter)

---

## API

- Endpoint: `https://api.frankfurter.app/latest?from={BASE}`
- Response: `{ "rates": { "EUR": 0.92, ... } }`
- Data leaves the browser — disclose clearly

---

## Privacy Note

Unlike other tools in ToolForge that run 100% client-side, this tool sends the base currency code to the Frankfurter API to retrieve current exchange rates. No personal data is transmitted.
