# Project Guide & AI Coding Rules (CLAUDE.md)

This file coordinates the core operational commands and developer behavior guidelines for the **Hoan Học Tiếng Trung** application.

---

## 1. Project Commands

* **Development (Tauri Desktop App):** `npm run tauri dev` (Launches both the desktop window and frontend dev server)
* **Build Application:** `npm run tauri build`
* **Frontend Dev Server (Web Only):** `npm run dev`
* **Build Frontend Bundle (Web Only):** `npm run build`

---

## 2. Core Engineering Principles (Andrej Karpathy Rules)

* **Think Before Coding:** Never make assumptions. When encountering architectural ambiguity or complex implementation choices, stop, outline the design options, and consult the user before editing files.
* **Surgical Changes:** Modify only the exact lines necessary to solve the request. Avoid refactoring neighboring code or altering file formatting unless explicitly instructed.
* **Simplicity First:** Write the minimum amount of clean code to solve the task. Avoid speculative abstractions, unnecessary configurations, or preemptive optimizations.
* **Goal-Driven Execution:** Define clear verification criteria (or tests) before writing code, and run tests/builds to verify visual and logical correctness on completion.

---

## 3. Modular UI/UX Design Skills

Before implementing any frontend changes, the AI agent **must read and apply** the corresponding design guidelines and rules located below:

* **General Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (Standard typography for Hanzi, slate background colors, jade/cobalt accents, hover popovers, and tactile button controls).
* **Anti-Slop UI v2 Framework:** [design-taste-frontend.md](./skills/design-taste-frontend.md) (Guides design reading and configures variance, motion, and density dials).
* **Minimalist/Editorial Layouts:** [minimalist-ui.md](./skills/minimalist-ui.md) (Use for highly focused panels like the SRS Review screen and Grammar Notebook).
* **High-End Agency Visuals:** [high-end-visual-design.md](./skills/high-end-visual-design.md) (Use for quantitative panels, statistical summaries, progress bars, and Dashboard charts).
* **Code Refactoring & Redesigns:** [redesign-existing-projects.md](./skills/redesign-existing-projects.md) (Use when auditing and upgrading table UI or dictionary list layouts).
* **Complete Code Enforcement:** [full-output-enforcement.md](./skills/full-output-enforcement.md) (Strictly forbids shorthand output, skipped sections, or placeholder comments).
