# Frontend Design System & UI Guidelines (Anti-Slop & Premium UI)

This document establishes the UI/UX standards for the **Hoan Học Tiếng Trung** application (Tauri v2 + React + Tailwind CSS). All frontend modifications, component creation, and layout changes must adhere strictly to these principles to maintain a premium, cohesive, and non-generic user interface.

---

## 1. Core Visual Direction & Dials

* **Theme Concept:** **Elegant Modernism with East Asian Jade & Cobalt Accents.**
* **Visual Density (Dial: 4/10 - Airy):** Maintain ample whitespace. Do not crowd the viewport with excessive controls or compact margins. Give elements room to breathe.
* **Motion Intensity (Dial: 5/10 - Smooth Physics):** Interactive elements must use natural easing (`cubic-bezier(0.16, 1, 0.3, 1)`) or spring-based transitions. Motion should feel tactile and fluid, not linear or jarring.

---

## 2. Typography Standards (Hanzi & Vietnamese)

Chinese characters (Hanzi) are visually complex. Standard Latin font sizes and spacing often lead to poor readability.

* **Hanzi Font Stack:** Ensure characters render with clear, calligraphic, or high-quality stroke definition:
  ```css
  font-family: 'FandolKai', 'Noto Sans SC', 'SimSun', STKaiti, KaiTi, serif;
  ```
* **Dynamic Sizing:**
  * Single or double vocabulary words: Size between `text-5xl` (48px) and `text-7xl` (72px) on cards to allow net-stroke inspection.
  * Sentences / Examples: Use `text-xl` to `text-2xl` with a relaxed line height (`leading-relaxed` or `leading-loose`) to prevent stroke collisions.
* **Tracking & Kerning:** Apply extra spacing (`tracking-wide`) between Hanzi characters to make complex strokes distinguishable.

---

## 3. Sophisticated Color System

Avoid standard Tailwind primary colors (e.g., pure `bg-blue-500` or `bg-red-500`). Use muted, desaturated tones for backgrounds, slate for structure, and elegant jade/cobalt for accents.

### Backgrounds & Text
* **Light Mode:**
  * App Background: `bg-slate-50` or a very warm off-white (reminiscent of premium book paper).
  * Main Text: `text-slate-800` (avoid pure `#000000` for readability and softness).
* **Dark Mode:**
  * App Background: Deep charcoal/slate `bg-[#0f172a]` (Slate 900) or `bg-[#0b0f19]`. Avoid absolute black (`#000000`).
  * Main Text: `text-slate-200`.

### Accents & Progress Indicators
* **Primary Accents:**
  * Jade Green: `text-emerald-600` / `dark:text-emerald-400`
  * Elegant Cobalt: `text-indigo-600` / `dark:text-indigo-400`
* **SRS Mastery Progression (Levels 0-8):** Use a gradient sequence of a single color tone (e.g., shades of emerald/teal/indigo) representing learning progress, rather than mapping each level to a separate, high-saturation color.

---

## 4. Anti-Slop Interface Rules (UX Details)

### A. Cards & Container Structures
* **Banish Cheap Shadows:** Never use harsh, dark, high-opacity shadows. Instead, use ultra-soft borders (`border-slate-100 dark:border-slate-800/80`) combined with faint, wide-radius shadows: `shadow-[0_8px_30px_rgb(0,0,0,0.02)]`.
* **Glassmorphic Overlays:** For floating panels (like Dictionary Popovers or Tooltips), use subtle background blurring:
  ```tailwind
  backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/50
  ```
* **Modern Corner Radii:** Use `rounded-xl` or `rounded-2xl` (12px to 16px) for containers to create a friendly, premium desktop app feeling. Avoid fully rounded corners (`rounded-full`) on large boxes.

### B. Tactile Controls & Buttons
* **Transitions:** Always add `transition-all duration-200 ease-out` to interactive states.
* **Hover State:** Translate elements slightly upward (`hover:-translate-y-0.5`) and shift opacity/background color gently.
* **Active State (Press):** Shrink slightly (`active:scale-95`) to emulate physical button feedback.

### C. Popovers & Lookup Tooltips
* Hover lookup tooltips must fade and slide up from below (a delta of `4px` with a `150ms` duration).
* Highlight the primary dictionary match using a soft tinted background (e.g., slate-50/indigo-50 in light mode, slate-800/80 in dark mode) with a clean border radius.

---

## 5. Implementation Quality Gates

* **Zero Placeholders:** Do not write boilerplate like `"Loading..."` or `"TODO: implement UI"`. Ensure all empty states are clean, instructive, and complete with subtle inline SVGs or placeholder micro-copy.
* **Synchronized Dark Mode:** Every single visual component must have custom styles for both light and dark themes (using `dark:` prefixed classes).
* **Tactile Shortcuts:** Since this is a desktop app, UI controls should seamlessly match hotkeys (e.g., Spacebar, arrow keys) and display small, elegant keycap indicators (e.g., `⌘ + Option`) next to their labels.
