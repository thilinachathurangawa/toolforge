# SPEC: Cooking Measurement Converter Tool
**File:** `docs/specs/tools/converter/COOKING_MEASUREMENT_CONVERTER.md`
**Status:** Completed
**Slug:** `cooking-measurement-converter`
**Category:** converter

---

## SEO

- **Title:** `Cooking Measurement Converter — Cups to Grams, ml Online Free | ToolForge`
- **Description:** `Convert cooking measurements between Cups, Grams, Tablespoons, Teaspoons, Milliliters, and Ounces. Ingredient-aware density lookup for Flour, Sugar, Butter, Water. Free baking converter.`
- **Primary Keyword:** cups to grams baking converter
- **Secondary Keywords:** tablespoons to ml calculator, cooking measurement converter chart, grams to cups

---

## Functional Requirements

- [ ] Ingredient selector: All-Purpose Flour, Sugar (White), Butter, Water, Milk, Honey, Salt, Rice, Oats
- [ ] Units: Cups, Tablespoons (tbsp), Teaspoons (tsp), Milliliters (ml), Grams (g), Ounces (oz)
- [ ] Single input + unit selector → all other units shown in grid
- [ ] Density lookup table per ingredient for mass↔volume conversions
- [ ] Volume↔volume conversions are ingredient-independent
- [ ] Pure JS lookup — no libraries

---

## Density Table (g per cup)

| Ingredient          | g/cup |
|--------------------|-------|
| All-Purpose Flour  | 120   |
| White Sugar        | 200   |
| Butter             | 227   |
| Water              | 237   |
| Milk               | 245   |
| Honey              | 340   |
| Salt               | 292   |
| Rice               | 185   |
| Oats               | 90    |

---

## Volume Relationships

1 cup = 16 tbsp = 48 tsp = 236.588 ml = 8 fl oz
