# Spec — Speech to Text (Dictation)

- **Slug:** `speech-to-text`
- **Component:** `src/components/tools/SpeechToText/index.tsx`
- **Category:** `text`
- **Icon:** `Mic`

## What it does
Transcribes spoken words into text using the native `SpeechRecognition` /
`webkitSpeechRecognition` API.

## Controls
- Large Start/Stop recording toggle with a pulsating indicator when active.
- Read-only live transcript area (interim + final results appended).
- Language select (e.g. en-US, en-GB) since recognition is language-specific.
- "Copy Transcript" and "Clear" buttons.

## Error handling
- If the API is missing (e.g. Firefox), show a clear unsupported-browser fallback
  and disable the controls.
- Handle `onerror` (no-mic, not-allowed/permission denied, no-speech) with a
  friendly message.

## Privacy / network
Important honesty note: most browsers (Chrome) implement Web Speech recognition
by sending audio to a **cloud service (Google)** for transcription. So audio
leaves the device. State this plainly — do NOT claim it is fully on-device.

## SEO
- Keywords: "speech to text online", "free voice typing tool", "audio dictation
  software", "voice to text converter".

## Related
`text-to-speech`, `word-counter`, `case-converter`.
