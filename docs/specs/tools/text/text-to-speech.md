# Spec — Text to Speech

- **Slug:** `text-to-speech`
- **Component:** `src/components/tools/TextToSpeech/index.tsx`
- **Category:** `text`
- **Icon:** `Volume2`

## What it does
Reads typed text aloud using the browser's native `window.speechSynthesis` API.

## Controls
- Text input area.
- Voice dropdown populated from `speechSynthesis.getVoices()` (listens to the
  `voiceschanged` event, which fires asynchronously in some browsers).
- Pitch slider 0–2, Rate/Speed slider 0.1–10.
- Buttons: Play, Pause, Resume, Stop.

## Outputs
Audio playback through the system's speech engine. No file export (the Web Speech
API does not expose the audio stream).

## Privacy / network
Uses the browser/OS speech engine. The text is handed to the platform's TTS
engine; some operating systems use on-device voices, others may use cloud voices
depending on the selected voice. Be honest: nothing is sent to ToolForge servers,
but voice rendering is handled by the OS/browser.

## Support note
Available voices depend entirely on the user's operating system and browser; the
list varies and may be empty until the user interacts with the page. Show a
fallback message if `speechSynthesis` is unavailable.

## SEO
- Keywords: "text to speech online", "free TTS reader", "read text aloud",
  "browser voice synthesizer".

## Related
`speech-to-text`, `word-counter`, `case-converter`.
