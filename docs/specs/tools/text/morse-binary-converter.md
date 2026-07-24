# Spec — Text to Morse & Binary Converter

- **Slug:** `morse-binary-converter`
- **Component:** `src/components/tools/MorseBinaryConverter/index.tsx`
- **Category:** `text`
- **Icon:** `Binary`

## What it does
Bi-directional conversion between plain text and either Morse code or binary.
Pure JS: a hardcoded English↔Morse map, and `charCodeAt`/`toString(2)` +
`parseInt(x, 2)` for binary.

## Controls
- Mode tabs: Text ↔ Morse, Text ↔ Binary.
- Two textareas: left = text, right = encoded (Morse or binary).
- Real-time bi-directional: editing either side updates the other.
- Visual error state if the encoded side contains invalid characters for the
  mode (e.g. a digit other than 0/1 in binary, or an unknown Morse symbol).

## Encoding rules
- Morse: letters separated by a space, words separated by ` / `. Unknown
  characters are dropped (or flagged). Decoding is case-insensitive output upper.
- Binary: each character as 8-bit byte separated by spaces; decoding splits on
  whitespace and parses base 2. Non-ASCII handled via char code.

## Privacy / network
Fully client-side.

## SEO
- Keywords: "text to morse code converter", "binary to text translator", "decode
  morse code online", "ASCII to binary tool".

## Related
`base64-encoder`, `url-encoder-decoder`, `case-converter`.
