# Spec — Random Picker Wheel

- **Slug:** `random-picker-wheel`
- **Component:** `src/components/tools/RandomPickerWheel/index.tsx`
- **Category:** `generator`
- **Icon:** `Disc3`

## What it does
Draws a wheel of pie slices on a native HTML5 `<canvas>` from a list of entries
(one per line). Spins with `requestAnimationFrame` physics (initial angular
velocity + friction decay) and lands on a winner. Lightweight inline canvas
confetti on stop (self-written particle loop — no extra dependency).

## Inputs / controls
- Textarea: items, one per line (blank lines ignored).
- Big **SPIN** button.
- Toggle: remove winner after spin (for draws without replacement).

## Outputs
- Animated wheel with distinct auto-assigned slice colors (HSL spread) and a
  fixed pointer.
- Winner announcement banner + confetti burst.

## Determinism note
`Math.random()` is allowed in the browser component (it is NOT a workflow
script). The landing slice is derived from final rotation angle, so the visual
result and the announced winner always match.

## Privacy / network
Fully client-side; nothing uploaded.

## SEO
- Keywords: "random name picker wheel", "spin the wheel online", "giveaway
  winner picker", "wheel of names", "random decision wheel".

## Related tools
`password-generator`, `uuid-generator`, `fake-data-generator`.
