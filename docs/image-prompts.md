# AI image prompts

Generated from the live catalog — every prompt already knows the record it is for:
the real appearance off the data sheet, the real pack size, the category and the code.

**Regenerate any time:**

```bash
node scripts/image-prompts.mjs          # only records still missing an image
node scripts/image-prompts.mjs --all --md > docs/image-prompts.md
```

The dashboard shows the same prompt in place — open any record, find the image
field, and click **“Need an image? Get an AI prompt.”**

## Before you generate

1. **Attach the LK Chemicals logo** to the chat. Every prompt tells the model to use it
   exactly as supplied — never let a model draw its own version of a brand mark.
2. **Do the 12 category covers first.** A product with no photo falls back to its
   category image, so twelve pictures dress the whole catalog.
3. **Never generate a certificate, an award or a team portrait.** Those must be scans or
   photographs of the real thing — a generated certificate is a fabricated credential.
4. Upload the result straight into the image field; it goes to Cloudinary and is served
   optimised (AVIF/WebP, width-capped) automatically.

---

## Product categories (12)

### Category cover — AHU Cleaning Compounds

`categories/8-ahu-cleaning-compounds` · field `image` · **3:2**

```text
Category cover image representing AHU Cleaning Compounds for an industrial water-treatment chemical manufacturer. The range is about: Coil cleaners and foaming degreasers for air-handling units. Scene: an air handling unit with its access panel open, showing a finned cooling coil mid-clean — one half grimy, one half bright aluminium. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — AHU Cleaning Compounds

`categories/8-ahu-cleaning-compounds` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing AHU Cleaning Compounds for an industrial water-treatment chemical manufacturer. The range is about: Coil cleaners and foaming degreasers for air-handling units. Scene: an air handling unit with its access panel open, showing a finned cooling coil mid-clean — one half grimy, one half bright aluminium. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Boiler Chemicals

`categories/2-boiler-chemicals` · field `image` · **3:2**

```text
Category cover image representing Boiler Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Oxygen scavengers, alkalinity builders and sludge conditioners for clean, efficient steam. Scene: an industrial steam boiler house — insulated pipework, a feed-water deaerator, pressure gauges and valve wheels, warm haze catching the light. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Boiler Chemicals

`categories/2-boiler-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Boiler Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Oxygen scavengers, alkalinity builders and sludge conditioners for clean, efficient steam. Scene: an industrial steam boiler house — insulated pipework, a feed-water deaerator, pressure gauges and valve wheels, warm haze catching the light. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Cooling Tower Chemicals

`categories/3-cooling-tower-chemicals` · field `image` · **3:2**

```text
Category cover image representing Cooling Tower Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Corrosion inhibitors, scale control and biocides that keep the loop alive. Scene: the top of an induced-draught cooling tower — fan cowl, water distribution nozzles spraying over PVC fill packs, fine mist backlit against a dusk sky. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Cooling Tower Chemicals

`categories/3-cooling-tower-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Cooling Tower Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Corrosion inhibitors, scale control and biocides that keep the loop alive. Scene: the top of an induced-draught cooling tower — fan cowl, water distribution nozzles spraying over PVC fill packs, fine mist backlit against a dusk sky. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Cooling Tower FRP Fills

`categories/12-cooling-tower-frp-fills` · field `image` · **3:2**

```text
Category cover image representing Cooling Tower FRP Fills for an industrial water-treatment chemical manufacturer. The range is about: Film and splash fill media that rebuilds cooling-tower efficiency. Scene: the top of an induced-draught cooling tower — fan cowl, water distribution nozzles spraying over PVC fill packs, fine mist backlit against a dusk sky. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Cooling Tower FRP Fills

`categories/12-cooling-tower-frp-fills` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Cooling Tower FRP Fills for an industrial water-treatment chemical manufacturer. The range is about: Film and splash fill media that rebuilds cooling-tower efficiency. Scene: the top of an induced-draught cooling tower — fan cowl, water distribution nozzles spraying over PVC fill packs, fine mist backlit against a dusk sky. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Descaling Compounds

`categories/6-descaling-compounds` · field `image` · **3:2**

```text
Category cover image representing Descaling Compounds for an industrial water-treatment chemical manufacturer. The range is about: Inhibited acid descalers that strip scale without eating metal. Scene: a shell-and-tube heat exchanger opened for cleaning — one half of the tube sheet heavily scaled and chalky, the other half cleaned back to bright metal, split down the middle of the frame. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Descaling Compounds

`categories/6-descaling-compounds` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Descaling Compounds for an industrial water-treatment chemical manufacturer. The range is about: Inhibited acid descalers that strip scale without eating metal. Scene: a shell-and-tube heat exchanger opened for cleaning — one half of the tube sheet heavily scaled and chalky, the other half cleaned back to bright metal, split down the middle of the frame. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — DM Plants

`categories/10-dm-plants` · field `image` · **3:2**

```text
Category cover image representing DM Plants for an industrial water-treatment chemical manufacturer. The range is about: Two-bed and mixed-bed demineralisation to ultrapure spec. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — DM Plants

`categories/10-dm-plants` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing DM Plants for an industrial water-treatment chemical manufacturer. The range is about: Two-bed and mixed-bed demineralisation to ultrapure spec. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — ETP & STP Chemicals

`categories/5-etp-stp-chemicals` · field `image` · **3:2**

```text
Category cover image representing ETP & STP Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Coagulants, defoamers and bio-cultures that meet the discharge norm. Scene: an effluent treatment plant aeration basin at golden hour, surface aerators churning, clarifier bridge behind, clean water weir in the foreground. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — ETP & STP Chemicals

`categories/5-etp-stp-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing ETP & STP Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Coagulants, defoamers and bio-cultures that meet the discharge norm. Scene: an effluent treatment plant aeration basin at golden hour, surface aerators churning, clarifier bridge behind, clean water weir in the foreground. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Resin Cleaning Chemicals

`categories/7-resin-cleaning-chemicals` · field `image` · **3:2**

```text
Category cover image representing Resin Cleaning Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Restore capacity to fouled cation and anion resin. Scene: a macro of amber ion-exchange resin beads spilling through clear water inside a glass column, each bead catching the light. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Resin Cleaning Chemicals

`categories/7-resin-cleaning-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Resin Cleaning Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Restore capacity to fouled cation and anion resin. Scene: a macro of amber ion-exchange resin beads spilling through clear water inside a glass column, each bead catching the light. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — RO Chemicals

`categories/ro-chemicals` · field `image` · **3:2**

```text
Category cover image representing RO Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Advanced Reverse Osmosis Water Treatment Chemicals Scene: a bank of white FRP reverse-osmosis pressure vessels with a spiral-wound membrane element partly withdrawn, showing its layered mesh; polished stainless manifolds and pressure gauges. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — RO Chemicals

`categories/ro-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing RO Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Advanced Reverse Osmosis Water Treatment Chemicals Scene: a bank of white FRP reverse-osmosis pressure vessels with a spiral-wound membrane element partly withdrawn, showing its layered mesh; polished stainless manifolds and pressure gauges. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — RO Plants

`categories/9-ro-plants` · field `image` · **3:2**

```text
Category cover image representing RO Plants for an industrial water-treatment chemical manufacturer. The range is about: Skid-mounted reverse-osmosis systems, built to your water. Scene: a bank of white FRP reverse-osmosis pressure vessels with a spiral-wound membrane element partly withdrawn, showing its layered mesh; polished stainless manifolds and pressure gauges. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — RO Plants

`categories/9-ro-plants` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing RO Plants for an industrial water-treatment chemical manufacturer. The range is about: Skid-mounted reverse-osmosis systems, built to your water. Scene: a bank of white FRP reverse-osmosis pressure vessels with a spiral-wound membrane element partly withdrawn, showing its layered mesh; polished stainless manifolds and pressure gauges. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Softener Plants

`categories/11-softener-plants` · field `image` · **3:2**

```text
Category cover image representing Softener Plants for an industrial water-treatment chemical manufacturer. The range is about: Automatic water softeners that kill hardness for good. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Softener Plants

`categories/11-softener-plants` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Softener Plants for an industrial water-treatment chemical manufacturer. The range is about: Automatic water softeners that kill hardness for good. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Water Treatment Chemicals

`categories/4-water-treatment-chemicals` · field `image` · **3:2**

```text
Category cover image representing Water Treatment Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Coagulants, flocculants and pH chemistry for every stage of the train. Scene: a clarifier and dosing skid — coagulant dosing pumps, a flash mixer stirring a floc-forming tank, clear treated water overflowing a weir. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Water Treatment Chemicals

`categories/4-water-treatment-chemicals` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Water Treatment Chemicals for an industrial water-treatment chemical manufacturer. The range is about: Coagulants, flocculants and pH chemistry for every stage of the train. Scene: a clarifier and dosing skid — coagulant dosing pumps, a flash mixer stirring a floc-forming tank, clear treated water overflowing a weir. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.


## Service categories (5)

### Category cover — AMC & Technical Support

`serviceCategories/amc-technical-support` · field `image` · **3:2**

```text
Category cover image representing AMC & Technical Support for an industrial water-treatment chemical manufacturer. The range is about: Annual maintenance contracts and expert support that pick up the phone. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — AMC & Technical Support

`serviceCategories/amc-technical-support` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing AMC & Technical Support for an industrial water-treatment chemical manufacturer. The range is about: Annual maintenance contracts and expert support that pick up the phone. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Cleaning Services

`serviceCategories/cleaning-services` · field `image` · **3:2**

```text
Category cover image representing Cleaning Services for an industrial water-treatment chemical manufacturer. The range is about: Membrane CIP, resin cleaning and coil cleaning that restore performance. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Cleaning Services

`serviceCategories/cleaning-services` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Cleaning Services for an industrial water-treatment chemical manufacturer. The range is about: Membrane CIP, resin cleaning and coil cleaning that restore performance. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Descaling Services

`serviceCategories/descaling-services` · field `image` · **3:2**

```text
Category cover image representing Descaling Services for an industrial water-treatment chemical manufacturer. The range is about: On-site chemical descaling that brings heat transfer back. Scene: a shell-and-tube heat exchanger opened for cleaning — one half of the tube sheet heavily scaled and chalky, the other half cleaned back to bright metal, split down the middle of the frame. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Descaling Services

`serviceCategories/descaling-services` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Descaling Services for an industrial water-treatment chemical manufacturer. The range is about: On-site chemical descaling that brings heat transfer back. Scene: a shell-and-tube heat exchanger opened for cleaning — one half of the tube sheet heavily scaled and chalky, the other half cleaned back to bright metal, split down the middle of the frame. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Installation & Upgradation Services

`serviceCategories/installation-upgradation-services` · field `image` · **3:2**

```text
Category cover image representing Installation & Upgradation Services for an industrial water-treatment chemical manufacturer. The range is about: New plant installation, commissioning, retrofits and capacity upgrades. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Installation & Upgradation Services

`serviceCategories/installation-upgradation-services` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Installation & Upgradation Services for an industrial water-treatment chemical manufacturer. The range is about: New plant installation, commissioning, retrofits and capacity upgrades. Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.

### Category cover — Plant Services

`serviceCategories/plant-services` · field `image` · **3:2**

```text
Category cover image representing Plant Services for an industrial water-treatment chemical manufacturer. The range is about: Servicing, repair and O&M for RO, DM, softener and ETP/STP plants. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: centred subject with breathing room, works cropped square or 3:2. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 1600px wide.

### Category banner — Plant Services

`serviceCategories/plant-services` · field `banner` · **21:9**

```text
Ultra-wide hero banner representing Plant Services for an industrial water-treatment chemical manufacturer. The range is about: Servicing, repair and O&M for RO, DM, softener and ETP/STP plants. Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room. Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 21:9
```

- This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.
- Export at least 2400px wide.


## Products (17)

### Product photo — LK 1001 High Silica & High TDS RO Antiscalant (Food Grade)

`products/lk-1001-ro-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 5 kg white HDPE jerry can containing clear amber to pale-yellow liquid, the packaging for LK 1001 High Silica & High TDS RO Antiscalant (Food Grade) (LK 1001), a ro chemicals product. It is used for: Highly effective antiscalant & antifoulant across a broad spectrum of water used in membrane separation systems. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear amber to pale-yellow liquid" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK 1001 High Silica & High TDS RO Antiscalant (Food Grade) (copy)

`products/lk-1001-ro-antiscalant-copy` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 5 kg white HDPE jerry can containing clear amber to pale-yellow liquid, the packaging for LK 1001 High Silica & High TDS RO Antiscalant (Food Grade) (copy), a ro chemicals product. It is used for: LK 1001 is a concentrated, food-grade reverse-osmosis antiscalant engineered for the toughest feed waters — high silica, high TDS and high hardness. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear amber to pale-yellow liquid" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK 1044 Ro PH Booster

`products/lk-1044-ro-ph-booster` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 5 litre white HDPE drum containing clear, colorless liquid, the packaging for LK 1044 Ro PH Booster (LK 1044), a ro chemicals product. It is used for: LK 1044 is custom made pH booster to maintain the right level of pH and Alkalinity in product water. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear, colorless liquid" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK 2044 Boiler Catalyzed oxygen scavenger

`products/lk-2044-boiler-catalyzed-oxygen-scavenger` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 55 litre white HDPE drum containing liquid, the packaging for LK 2044 Boiler Catalyzed oxygen scavenger (LK 2044), a boiler chemicals product. It is used for: LK 2044 is a custom made Oxygen scavenger for low/medium pressure boilers, using bulk of returned condensate/demineralized water as feed water. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "liquid" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 1001 Antiscalant

`products/lk-chem-1001-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless/pink solution, the packaging for LK CHEM 1001 Antiscalant (LK CHEM 1001), a ro chemicals product. It is used for: RO feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless/pink solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 1010 Antiscalant

`products/lk-chem-1010-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless/pink solution, the packaging for LK CHEM 1010 Antiscalant (LK CHEM 1010), a ro chemicals product. It is used for: RO feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless/pink solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 1055 Low PH RO Cleaning chemicals

`products/lk-chem-1055-low-ph-ro-cleaning-chemicals` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 1055 Low PH RO Cleaning chemicals (LK CHEM 1055), a ro chemicals product. It is used for: LK CHEM 1055 Low PH RO Cleaning chemicals is a cleaning. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 1066 High PH RO Cleaning chemicals

`products/lk-chem-1066-high-ph-ro-cleaning-chemicals` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 1066 High PH RO Cleaning chemicals (LK CHEM 1066), a ro chemicals product. It is used for: LK CHEM 1066 High PH RO Cleaning chemicals is a cleaning. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 2001 MULTI FUNCTIONAL CHEMICAL

`products/lk-chem-2001-multi-functional-chemical` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 2001 MULTI FUNCTIONAL CHEMICAL (LK CHEM 2001), a boiler chemicals product. It is used for: boiler feed water treatment. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 2011 Boiler PH Booster

`products/lk-chem-2011-boiler-ph-booster` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 2011 Boiler PH Booster (LK CHEM 2011), a boiler chemicals product. It is used for: LK CHEM 2011 Boiler PH Booster is a boiler ph booster. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 2022 Antiscalant

`products/lk-chem-2022-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 2022 Antiscalant (LK CHEM 2022), a boiler chemicals product. It is used for: Boiler feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 3001 Antiscalant

`products/lk-chem-3001-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 3001 Antiscalant (LK CHEM 3001), a cooling tower chemicals product. It is used for: Cooling tower feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 3033 Antiscalant

`products/lk-chem-3033-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing clear colorless solution, the packaging for LK CHEM 3033 Antiscalant (LK CHEM 3033), a cooling tower chemicals product. It is used for: Cooling tower feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "clear colorless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 555 PH Booster

`products/lk-chem-555-ph-booster` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing brown, the packaging for LK CHEM 555 PH Booster (LK CHEM 555), a ro chemicals product. It is used for: LK CHEM 555 PH Booster is a ro ph booster. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "brown" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — LK CHEM 99 De-scaling compound

`products/lk-chem-99-de-scaling-compound` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing reddish solution, the packaging for LK CHEM 99 De-scaling compound (LK CHEM 99), a descaling compounds product. It is used for: LK CHEM 99 De-scaling compound is a de scaling compound. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "reddish solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — Scale Master LK 5010 Antiscalant

`products/scale-master-lk-5010-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing viscous, brown liquid, the packaging for Scale Master LK 5010 Antiscalant (Scale Master LK 5010), a ro chemicals product. It is used for: Scale Master LK 5010 is custom made Antiscalant & pH booster to maintain the right level of pH and Alkalinity in product water and it protects RO inte…. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "viscous, brown liquid" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.

### Product photo — Scale Master LK 5020 Antiscalant

`products/scale-master-lk-5020-antiscalant` · field `image` · **4:3 or 1:1**

```text
Studio product photograph of a 25 litre white HDPE drum containing vicous colourless solution, the packaging for Scale Master LK 5020 Antiscalant (Scale Master LK 5020), a ro chemicals product. It is used for: RO feed water treatment for scale control. Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Use the attached LK Chemicals logo exactly as supplied — do not redraw, restyle, recolour or letter it. Place it small and cleanly on the label. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 4:3 or 1:1
```

- Colour matters: the data sheet says "vicous colourless solution" — reject any result that changes it.
- Attach the LK logo file; never let the model invent a mark.
- One container only. Rows of identical drums read as stock photography.


## Services (1)

### Service image — Boiler Descaling

`services/boiler-descaling` · field `image` · **3:2**

```text
Documentary-style photograph of an industrial service crew performing Boiler Descaling. The job: Scale on boiler tubes is a silent fuel tax — even a thin film forces the burner to work harder and creeps toward tube failure. Two technicians in navy coveralls, safety helmets, gloves and goggles working on plant equipment; tools and a service trolley in frame; one technician reading a gauge. Real working environment, not a studio. Faces turned away from camera or out of focus. Photorealistic industrial product photography, deep navy-to-black background (#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from above, subtle water-surface reflections, shallow depth of field, 50mm lens, crisp focus, no clutter, generous negative space for text overlay. Do not render any other text, product names, numbers or specifications — leave label areas blank so real artwork can be applied later. Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or invented lettering, human hands, cluttered backgrounds, oversaturated colours.

Aspect ratio: 3:2
```

- Faces away from camera keeps it honest — it isn't a photo of your actual team.
- Swap in a real site photo when you have one; visitors can tell.


---

52 prompt(s).
