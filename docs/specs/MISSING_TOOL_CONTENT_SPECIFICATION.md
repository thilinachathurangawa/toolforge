# Missing Tool Content Specification

> **Status: COMPLETED (July 2026).** Every tool in the registry now has a
> `TOOL_CONTENT` entry and `npm run validate:content` passes. This document is
> kept as the specification the content was written against.

## Overview

This specification documented the tools that were missing long-form editorial content in `src/lib/content/tool-content.ts`. These tools had only basic metadata (name, description, tags) but lacked the comprehensive content sections required for AdSense compliance and SEO best practices.

**Total Tools (at time of writing):** 217  
**Tools with Content (at time of writing):** 195  
**Tools Missing Content:** 22 — all since written

## Content Structure Requirements

Each tool must have the following sections in `src/lib/content/tool-content.ts`:

```typescript
'tool-slug': {
  intro: [
    // 2-3 unique paragraphs (150-250 words total)
    // - What the tool does
    // - Who needs it (target audience)
    // - Concrete real-world use cases
    // - Must be tool-specific, not generic
  ],
  steps: [
    // 4-6 numbered steps
    // - Must match the actual UI/inputs
    // - Tool-specific, not generic
    // - Clear and actionable
  ],
  why: [
    // 3-4 genuine differentiators
    // - Grounded in actual implementation
    // - No false claims
    // - Focus on ToolForge advantages
  ],
  faqs: [
    // 3-5 Q&A pairs
    // - Based on real search intent
    // - Tool-specific questions
    // - Substantive answers (not one-liners)
  ],
  related: [
    // 2-3 related tools
    // - Each with a contextual reason
    // - Why someone using this tool might also need that one
  ],
},
```

## Missing Tools by Category

### Image Tools (1)

#### 1. image-compressor
- **Name:** Image Compressor
- **Category:** image
- **Current Metadata:** Has `aboutContent`, `faqs`, `howToUse` in tools.ts
- **Required Content:** Need to migrate and expand existing content into tool-content.ts format
- **Key Features:** JPG, PNG, WebP compression, quality slider, batch processing
- **Target Audience:** Web developers, content creators, anyone optimizing images
- **Related Tools:** image-resizer, image-converter, image-cropper

### Generator Tools (1)

#### 2. qr-generator
- **Name:** QR Code Generator
- **Category:** generator
- **Current Metadata:** Has `aboutContent`, `faqs`, `howToUse` in tools.ts
- **Required Content:** Need to migrate and expand existing content into tool-content.ts format
- **Key Features:** URLs, text, email, phone, WiFi, PNG/SVG download, customization
- **Target Audience:** Marketers, business owners, anyone needing scannable codes
- **Related Tools:** barcode-generator, password-generator

### Security Tools (1)

#### 3. password-generator
- **Name:** Password Generator
- **Category:** security
- **Current Metadata:** Has `aboutContent`, `faqs`, `howToUse` in tools.ts
- **Required Content:** Need to migrate and expand existing content into tool-content.ts format
- **Key Features:** Cryptographically secure, customizable length, character types
- **Target Audience:** Security-conscious users, developers, anyone creating accounts
- **Related Tools:** hash-generator, uuid-generator

### Developer Tools (1)

#### 4. json-formatter
- **Name:** JSON Formatter
- **Category:** developer
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Format, validate, beautify, minify, tree view, error reporting
- **Target Audience:** Web developers, API integrators, anyone working with JSON
- **Related Tools:** json-parser, json-path-finder, json-diff

### Text Tools (2)

#### 5. word-counter
- **Name:** Word Counter
- **Category:** text
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Real-time counting, words, characters, sentences, reading time
- **Target Audience:** Writers, students, bloggers, anyone with text length requirements
- **Related Tools:** readability-checker, text-diff, lorem-ipsum

#### 6. lorem-ipsum
- **Name:** Lorem Ipsum Generator
- **Category:** text
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Generate paragraphs, sentences, words, customizable length
- **Target Audience:** Designers, developers, anyone creating mockups
- **Related Tools:** word-counter, markdown-previewer

#### 7. markdown-previewer
- **Name:** Markdown Previewer
- **Category:** text
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Live preview, GitHub Flavored Markdown, syntax highlighting
- **Target Audience:** Writers, developers, documentation creators
- **Related Tools:** word-counter, text-diff, markdown-to-html

### Converter Tools (1)

#### 8. unit-converter
- **Name:** Unit Converter
- **Category:** converter
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Length, weight, temperature, area, volume, speed, time conversions
- **Target Audience:** Students, engineers, scientists, everyday conversions
- **Related Tools:** temperature-converter, currency-converter, number-base-converter

### Creative Tools (1)

#### 9. color-palette
- **Name:** Color Palette Extractor
- **Category:** creative
- **Current Metadata:** No `aboutContent` in tools.ts
- **Required Content:** Need to create new content from scratch
- **Key Features:** Extract dominant colors from images, color schemes, hex codes
- **Target Audience:** Designers, artists, anyone working with colors
- **Related Tools:** color-converter, color-palette-generator

### Science Calculators (9)

#### 10. velocity-calculator
- **Name:** Velocity Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate velocity using v = d/t, solve for any variable
- **Target Audience:** Students, physics learners, solving motion problems
- **Related Tools:** force-calculator, kinetic-energy-calculator, projectile-motion-calculator

#### 11. force-calculator
- **Name:** Force Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate force using F = ma, Newton's Second Law
- **Target Audience:** Students, physics learners, mechanics problems
- **Related Tools:** velocity-calculator, kinetic-energy-calculator

#### 12. kinetic-energy-calculator
- **Name:** Kinetic Energy Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate kinetic energy using KE = ½mv²
- **Target Audience:** Students, physics learners, energy problems
- **Related Tools:** velocity-calculator, force-calculator

#### 13. ohms-law-calculator
- **Name:** Ohm's Law Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate voltage, current, resistance using V = IR
- **Target Audience:** Students, electronics learners, circuit analysis
- **Related Tools:** resistor-color-code-calculator, power-calculator

#### 14. ph-calculator
- **Name:** pH Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate pH from hydrogen ion concentration, strong/weak acids/bases
- **Target Audience:** Students, chemistry learners, acid-base problems
- **Related Tools:** molarity-calculator, ideal-gas-law-calculator

#### 15. molarity-calculator
- **Name:** Molarity Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate molarity using M = n/V, solution concentration
- **Target Audience:** Students, chemistry learners, solution preparation
- **Related Tools:** ph-calculator, ideal-gas-law-calculator

#### 16. ideal-gas-law-calculator
- **Name:** Ideal Gas Law Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate pressure, volume, moles, temperature using PV = nRT
- **Target Audience:** Students, chemistry learners, gas law problems
- **Related Tools:** molarity-calculator, ph-calculator

#### 17. projectile-motion-calculator
- **Name:** Projectile Motion Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate trajectory, range, time of flight, max height
- **Target Audience:** Students, physics learners, projectile problems
- **Related Tools:** velocity-calculator, kinetic-energy-calculator

#### 18. resistor-color-code-calculator
- **Name:** Resistor Color Code Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Decode resistor color codes, calculate resistance
- **Target Audience:** Students, electronics learners, circuit design
- **Related Tools:** ohms-law-calculator, voltage-divider-calculator

### Other Calculators (1)

#### 19. density-calculator
- **Name:** Density Calculator
- **Category:** calculator (science)
- **Current Metadata:** Has `aboutContent` in tools.ts
- **Required Content:** Need to migrate and expand into tool-content.ts format
- **Key Features:** Calculate density using ρ = m/V, mass/volume conversions
- **Target Audience:** Students, physics/chemistry learners, material properties
- **Related Tools:** volume-calculator, mass-calculator

## Implementation Priority

### Phase 1: High-Traffic Tools (Immediate)
These are popular tools that likely receive the most traffic and should be prioritized:

1. **image-compressor** - Popular image tool
2. **qr-generator** - Popular generator
3. **password-generator** - Popular security tool
4. **json-formatter** - Essential developer tool
5. **word-counter** - Common text tool
6. **unit-converter** - Widely used converter

### Phase 2: Content Migration (Week 1)
Tools that already have `aboutContent` in tools.ts and need migration:

7. **lorem-ipsum**
8. **markdown-previewer**
9. **color-palette** (needs new content)
10. **velocity-calculator**
11. **force-calculator**
12. **kinetic-energy-calculator**
13. **ohms-law-calculator**
14. **ph-calculator**
15. **molarity-calculator**
16. **ideal-gas-law-calculator**
17. **projectile-motion-calculator**
18. **resistor-color-code-calculator**
19. **density-calculator**

## Content Quality Guidelines

### General Principles

1. **Uniqueness:** Each tool's content must be unique, not templated
2. **Accuracy:** All technical claims must match the actual implementation
3. **Depth:** Minimum 500 words per tool (intro + steps + why + FAQs)
4. **User Focus:** Address real search intent and use cases
5. **No False Claims:** Only claim features that actually exist

### Intro Section (2-3 paragraphs)

- **Paragraph 1:** What the tool does and its primary function
- **Paragraph 2:** Who needs it and typical use cases
- **Paragraph 3:** Specific implementation details or unique aspects

**Example Pattern:**
```
"[Tool] handles [specific function]. It works by [technical detail]."

"[Target audience] use this for [use case 1], [use case 2], and [use case 3]."

"Unlike alternatives, this tool [unique aspect] because [implementation detail]."
```

### Steps Section (4-6 steps)

- Must match the actual UI elements and workflow
- Use action verbs (Upload, Select, Click, Download)
- Include specific field names from the interface
- Number each step sequentially

**Example Pattern:**
```
"Upload your [file type] by [specific action]."
"Select the [parameter] from the [dropdown/slider]."
"Click [button name] to [action]."
"Download your [output] in [format]."
```

### Why Section (3-4 points)

- Focus on ToolForge-specific advantages
- Mention privacy (client-side processing)
- Highlight unique features
- Compare to alternatives honestly

**Example Pattern:**
```
"Runs entirely in your browser using [technology], so your data never leaves your device."
"Supports [unique feature] that many alternatives don't offer."
"Provides [benefit] without requiring [constraint]."
```

### FAQ Section (3-5 Q&A pairs)

- Base questions on real search intent (look at Google suggestions)
- Provide substantive answers (not one-liners)
- Include technical details where relevant
- Address common concerns (privacy, compatibility, limits)

**Example Pattern:**
```
Q: "How does [feature] work?"
A: "[Technical explanation in plain language]."

Q: "Is my data safe?"
A: "Yes, because [privacy implementation detail]."

Q: "What formats are supported?"
A: "[List formats with use cases for each]."
```

### Related Tools Section (2-3 tools)

- Each tool must have a contextual reason
- Explain the workflow connection
- Focus on complementary functionality

**Example Pattern:**
```
{ slug: 'related-tool', note: "Use this after [current tool] to [next step in workflow]." }
```

## Migration Strategy

### Tools with Existing aboutContent

For tools that already have `aboutContent` in tools.ts:

1. **Extract** the existing `aboutContent` as a base
2. **Expand** into 2-3 distinct paragraphs for the intro
3. **Extract** existing `faqs` and expand answers if needed
4. **Extract** existing `howToUse` and refine into numbered steps
5. **Create** new "why" section with 3-4 differentiators
6. **Add** related tools with contextual reasons
7. **Remove** the old content from tools.ts after migration

### Tools without Existing aboutContent

For tools without existing content (currently only color-palette):

1. **Research** the tool's implementation in the component file
2. **Identify** target audience and use cases
3. **Research** common search queries for this tool type
4. **Create** all sections from scratch following the guidelines above

## Verification Checklist

After adding content for each tool, verify:

- [ ] Content exists in tool-content.ts with correct slug key
- [ ] Intro has 2-3 substantial paragraphs (150-250 words)
- [ ] Steps have 4-6 numbered, actionable items
- [ ] Why section has 3-4 genuine differentiators
- [ ] FAQ section has 3-5 substantive Q&A pairs
- [ ] Related tools section has 2-3 tools with reasons
- [ ] All content is tool-specific (not generic/template)
- [ ] All technical claims match actual implementation
- [ ] No false claims or exaggerated features
- [ ] Content is grammatically correct and well-written
- [ ] Related tool slugs actually exist in TOOLS array

## Success Criteria

- All 22 tools have complete content in tool-content.ts
- Total content per tool: minimum 500 words
- Content quality matches or exceeds existing 195 tools
- No generic or templated content
- All content is factually accurate
- AdSense review passes after implementation

## Files to Modify

1. **src/lib/content/tool-content.ts** - Add 22 new tool content entries
2. **src/lib/constants/tools.ts** - Remove `aboutContent`, `faqs`, `howToUse` from tools that have been migrated (optional cleanup)

## Timeline Estimate

- **Phase 1 (High-Traffic):** 2-3 days (6 tools)
- **Phase 2 (Migration):** 5-7 days (13 tools)
- **Total:** 7-10 days for all 22 tools

## References

- Existing content examples in `src/lib/content/tool-content.ts`
- Tool implementations in `src/components/tools/`
- Google AdSense content quality guidelines
- Google Webmaster guidelines for thin content
