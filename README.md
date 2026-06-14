# 🇨🇳 Hoan Chinese (Hoan Học Tiếng Trung)

[![Tauri Version](https://img.shields.io/badge/Tauri-v2.1.1-blue?logo=tauri&logoColor=white&style=flat-square)](https://tauri.app/)
[![React Version](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Rust Backend](https://img.shields.io/badge/Rust-2021-dea584?logo=rust&logoColor=white&style=flat-square)](https://www.rust-lang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#installation)

**Hoan Chinese** is a premium, high-performance desktop application designed for modern Chinese language learners. Combining a robust **Rust** backend powered by **Tauri v2** with a fluid, editorial **React & TypeScript** frontend, it delivers an lightning-fast (<50ms latency), offline-first workspace for mastering vocabulary and grammar.

Featuring a smart Spaced Repetition System (SRS), hover dictionary lookup, neural Text-to-Speech (TTS) voice rotation, and interactive grammar notebooks, Hoan Chinese is your ultimate companion to conquer HSK 1-6.

---

## 🌟 Key Features

### 🧠 Smart Spaced Repetition System (SRS)
* **Exponential Backoff Engine**: Automated scheduling algorithm (Levels 0–8) that calculates optimal review intervals.
* **Three-Step Active Recall**: Fluid card flip flow (Meaning → Pinyin → Hanzi) designed to stimulate memory recall.
* **Flexible Learning Modes**: Switch between **Smart Review** (due cards) and **Cram Session** (randomized vocabulary pool).
* **Keyboard-Driven Workflow**: High-speed, touchless review sessions using shortcuts (`Space` or `ArrowDown` to reveal, `ArrowLeft` for forgot, `ArrowRight` for remembered).

### 🔍 Instant Hover Dictionary
* **Contextual Lookups**: Hover over any Hanzi character in the app to instantly display its Pinyin, HSK level, part of speech, Vietnamese definition, and English translation.
* **Longest-Match Algorithm**: Rapid O(1) in-memory lookup parsing 4 → 3 → 2 → 1 characters to resolve multi-word terms.
* **Rich Lexicon**: Comes pre-packaged with a dictionary of **10,989 words** covering HSK 1-6.
* **Debounced Interaction**: Smooth 80ms hover debounce prevents performance lag and accidental tooltips.

### 🎙️ Neural AI Text-to-Speech (TTS)
* **Natural Speech Patterns**: Features 4 distinct Microsoft Edge Neural Chinese voices (Xiaoxiao, Xiaoyi, Yunxi, Yunjian).
* **Smart Voice Rotation**: Randomly alternates voices on each playback to train your ears to different accents and pitches.
* **Local Audio Caching**: Automatically saves generated MP3 audio files locally (using MD5 hashing) to reduce API consumption and support offline learning.
* **Batch Generator**: Generate audio files for your entire vocabulary library in a single click with real-time progress indicators.

### 📚 Vocabulary & Grammar Management
* **Rich Flashcard Editor**: Create, read, update, and delete cards. Features auto-pinyin generation via `pinyin-pro` integration.
* **Safe-Delete Trash Bin**: Soft-delete items with a 10-day automatic permanent deletion counter, letting you restore accidental removals easily.
* **Grammar Notebook**: Editorial Master-Detail interface displaying HSK-categorized grammar formulas, clear explanations, and highlighted sentence examples.
* **Global Search & Filter**: Search vocabulary and grammar by Hanzi, Pinyin, or meaning with pagination and level sorting.

### 📊 Analytics Dashboard
* **Key Metrics**: Real-time counters showing total cards, cards due today, mastered items, and review accuracy rates.
* **Level Progression**: Dynamic progress bars tracking vocabulary mastery across 5 distinct phases (New → Mastered).
* **7-Day Review Forecast**: Visual bar chart projecting upcoming review workloads to help you plan your studies.

---

## 🎨 Premium Aesthetics & UX

Hoan Chinese is built following modern, editorial user interface standards to create a calm, focused, and immersive learning environment:
* **Glassmorphism & Fluid Motion**: Sleek glass panels, smooth hover states, and physics-based flip animations.
* **Tailored Color Palette**: Rich Slate bases accented with energetic Jade, Cobalt, and Crimson highlights.
* **Adaptive Typography**: Large Chinese characters automatically scale their font sizes dynamically based on word length.
* **Frameless Title Bar**: Minimalist, custom-built window title bar supporting drag-to-move, maximize, minimize, and close controls.
* **Persistent Dark Mode**: Toggle between light and dark themes with system persistence using local storage.

---

## 🛠️ Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Framework** | **Tauri v2** (Desktop Shell) |
| **Frontend Core** | **React 18**, **TypeScript**, **Vite 6** |
| **Styling & Assets** | **Tailwind CSS 3**, **Lucide React** (Icons) |
| **State Management** | **Zustand 5** (Local & Session UI), **TanStack Query 5** (Server RPC) |
| **Backend Core** | **Rust** (Async-Tokio runtime, highly concurrent & memory-safe) |
| **Database** | **SQLx 0.8** (Async SQLite connection pooling) |
| **Audio & TTS** | **edge-tts** (Microsoft Neural voices), **ffplay / paplay** (Audio engines) |
| **Pinyin Engine** | **pinyin** crate (Rust backend), **pinyin-pro** (Vite frontend) |

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed on your machine:
* **Rust**: Rust toolchain (1.75+) -> [Install Rust](https://www.rust-lang.org/tools/install)
* **Node.js**: Node.js (v18+) -> [Install Node.js](https://nodejs.org/)
* **Python**: Python 3.x with `pip`
* **FFmpeg**: Required for audio playback (`ffplay`)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/HoanHocTiengTrung.git
   cd HoanHocTiengTrung
   ```

2. **Install Python Dependencies**
   ```bash
   pip install edge-tts pypinyin
   ```

3. **Install System Audio Player (FFmpeg)**
   * **Ubuntu/Debian**: `sudo apt install ffmpeg`
   * **macOS**: `brew install ffmpeg`
   * **Windows**: `choco install ffmpeg` or download from official sources.

4. **Install Node.js Packages**
   ```bash
   npm install
   ```

5. **Run the Development Server**
   ```bash
   npm run tauri dev
   ```

6. **Build for Production**
   ```bash
   npm run tauri build
   ```
   The compiled desktop installation package (`.deb`/`.AppImage` on Linux, `.dmg` on macOS, `.msi` on Windows) will be located in `src-tauri/target/release/bundle/`.

---

## 📂 Project Architecture

For a deep dive into the code structure, backend Tauri command mappings, SQLite database schemas, in-memory caching strategies, and development guidelines, please refer to:

👉 **[DEVELOPER.md](file:///home/naoh/Documents/HoanHocTiengTrung/DEVELOPER.md)** (Technical Architecture & Development Guide)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
