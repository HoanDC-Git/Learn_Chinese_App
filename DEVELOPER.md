# Hoan Học Tiếng Trung

Ứng dụng desktop học tiếng Trung Quốc hiện đại, hiệu năng cao, được xây dựng với **Tauri v2** (Rust backend + React/TypeScript/Vite frontend). Ứng dụng hỗ trợ ôn tập từ vựng bằng phương pháp lặp lại ngắt quãng (SRS), tra từ điển tức thì, phát âm thanh Text-to-Speech và quản lý sổ tay ngữ pháp.

![version](https://img.shields.io/badge/version-1.0.0-blue)
![tauri](https://img.shields.io/badge/Tauri-v2-FFC131)
![react](https://img.shields.io/badge/React-18-61DAFB)
![rust](https://img.shields.io/badge/Rust-2021-dea584)

---

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Mô tả chi tiết từng thành phần](#mô-tả-chi-tiết-từng-thành-phần)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Cài đặt môi trường](#cài-đặt-môi-trường)
- [Phát triển & Build](#phát-triển--build)
- [Thuật toán & Kỹ thuật](#thuật-toán--kỹ-thuật)
- [Tech Stack](#tech-stack)
- [Migration từ phiên bản cũ](#migration-từ-phiên-bản-cũ)

---

## Tính năng chính

### Ôn tập thông minh (SRS)
- **Lặp lại ngắt quãng (Spaced Repetition System)**: Thuật toán exponential backoff tự động tính toán thời gian ôn tập tối ưu
- **3 bước lật thẻ**: Nghĩa → Pinyin → Chữ Hán, giúp ghi nhớ chủ động
- **2 chế độ ôn**: Ôn thông minh (theo SRS) và Ôn cấp tốc (ngẫu nhiên toàn bộ thẻ)
- **8 cấp độ thành thạo**: Từ "Làm quen" → "Tinh thông", theo dõi tiến độ chi tiết
- **Phím tắt**: Space/ArrowDown (tiếp tục), ArrowLeft (quên), ArrowRight (nhớ)

### Tra từ điển tức thì
- **Hover tra từ**: Di chuột qua bất kỳ chữ Hán nào để xem Pinyin, HSK, loại từ, nghĩa Việt/Anh
- **Thuật toán longest-match**: Thử khớp 4 ký tự → 3 → 2 → 1, tìm từ dài nhất phù hợp
- **Từ điển 10,989 từ**: Bao gồm HSK 1-6, loại từ, nghĩa tiếng Việt và tiếng Anh
- **Debounce 80ms**: Tránh query thừa khi di chuột nhanh

### Text-to-Speech (TTS)
- **4 giọng đọc Trung Quốc**: Xiaoxiao, Xiaoyi, Yunxi, Yunjian (Microsoft Edge Neural)
- **Tự động xoay giọng**: Mỗi lần phát sử dụng giọng ngẫu nhiên, tạo sự đa dạng
- **Cache âm thanh**: File MP3 lưu cục bộ, không tạo lại nếu đã tồn tại
- **Tạo âm thanh hàng loạt**: Batch generate cho toàn bộ từ vựng

### Quản lý thẻ từ vựng
- **CRUD đầy đủ**: Thêm, sửa, xóa flashcard
- **Auto Pinyin**: Tự động chuyển chữ Hán → Pinyin (dùng `pypinyin`)
- **Tìm kiếm & lọc**: Theo chữ Hán, Pinyin, nghĩa, cấp độ
- **Sắp xếp & phân trang**: Sort theo level/ngày thêm, 15 thẻ/trang
- **Thùng rác**: Xóa mềm, tự động xóa vĩnh viễn sau 10 ngày, có thể khôi phục

### Sổ tay ngữ pháp
- **Master-detail UI**: Click mở rộng để xem công thức, giải thích, ví dụ
- **CRUD ghi chú**: Thêm, xem, sửa, xóa ngữ pháp
- **Phân loại theo HSK**: Gán cấp độ cho từng mẫu ngữ pháp

### Bảng thống kê (Dashboard)
- **4 chỉ số chính**: Tổng thẻ, cần ôn hôm nay, đã thuộc, tỷ lệ chính xác
- **Biểu đồ cấp độ**: Thanh tiến độ theo 5 nhóm (Làm quen → Tinh thông)
- **Kế hoạch 7 ngày**: Biểu đồ cột hiển thị số thẻ cần ôn mỗi ngày

### Giao diện
- **Theme sáng/tối**: Chuyển đổi linh hoạt, lưu localStorage
- **Custom title bar**: Minimize/Maximize/Close, drag region
- **Responsive font**: Chữ Hán tự động co giãn theo độ dài từ
- **Animation**: Flip-in, fade-in, slide-up mượt mà

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Desktop Application (Tauri v2)                    │
├──────────────────────────────┬──────────────────────────────────────────┤
│      Frontend (React)        │         Backend (Rust/Tauri)              │
│                              │                                           │
│  ┌────────────────────────┐  │  ┌──────────────────────────────────────┐ │
│  │      UI Components     │  │  │          Tauri Commands (30)         │ │
│  │  ┌──────────────────┐  │  │  │  ┌────────────────────────────────┐  │ │
│  │  │ Flashcard        │◄─┼──┼──┼─►│ flashcard: 10 commands         │  │ │
│  │  │ Dictionary       │  │  │  │  │ dictionary: 3 commands         │  │ │
│  │  │ Layout/Sidebar   │  │  │  │  │ tts: 8 commands                │  │ │
│  │  │ Dashboard        │  │  │  │  │ grammar: 4 commands            │  │ │
│  │  │ Grammar Notes    │  │  │  │  │ srs: 2 commands                │  │ │
│  │  │ Trash            │  │  │  │  └────────────────────────────────┘  │ │
│  │  └──────────────────┘  │  │                                          │ │
│  └───────────┬────────────┘  │  ┌──────────────────────────────────────┐ │
│              │               │  │          Domain Layer (Pure Rust)    │ │
│  ┌───────────▼────────────┐  │  │  ┌────────────────────────────────┐  │ │
│  │    State Management    │  │  │  │ SRS Engine                     │  │ │
│  │  Zustand (local)       │  │  │  │ - Exponential backoff          │  │ │
│  │  - appStore (tab)      │  │  │  │ - Level 0→8, mastery status    │  │ │
│  │  - flashcardStore      │  │  │  └────────────────────────────────┘  │ │
│  │    (session, reveal)   │  │  │  ┌────────────────────────────────┐  │ │
│  │  - ttsStore (voice)    │  │  │  │ TTS Handler                    │  │ │
│  │  - uiStore (theme)     │  │  │  │ - 4 voices rotation            │  │ │
│  │                        │  │  │  │ - edge-tts CLI integration     │  │ │
│  │  TanStack Query (RPC)  │  │  │  └────────────────────────────────┘  │ │
│  │  - useFlashcards       │  │  │  ┌────────────────────────────────┐  │ │
│  │  - useDictionary       │  │  │  │ Pinyin Converter               │  │ │
│  │  - useTts              │  │  │  │ - Rust pinyin crate            │  │ │
│  │  - useGrammar          │  │  │  │ - Multi-pinyin support         │  │ │
│  │  - useSrs              │  │  │  └────────────────────────────────┘  │ │
│  └───────────┬────────────┘  │  └──────────────────┬───────────────────┘ │
│              │               │                     │                     │
│              │ invoke()      │  ┌──────────────────▼───────────────────┐ │
│              └───────────────┼─►│       Infrastructure Layer           │ │
│                              │  │  ┌────────────────────────────────┐  │ │
│                              │  │  │ Database (sqlx async SQLite)   │  │ │
│                              │  │  │ - app_database.db (5 conn)     │  │ │
│                              │  │  │   flashcards, trash, grammar   │  │ │
│                              │  │  │ - zh.db (10 conn)              │  │ │
│                              │  │  │   vocabulary (10,989 entries)  │  │ │
│                              │  │  └────────────────────────────────┘  │ │
│                              │  │  ┌────────────────────────────────┐  │ │
│                              │  │  │ Audio Playback                 │  │ │
│                              │  │  │ - ffplay (primary)             │  │ │
│                              │  │  │ - paplay (fallback)            │  │ │
│                              │  │  │ - data/audio/*.mp3 (cache)     │  │ │
│                              │  │  └────────────────────────────────┘  │ │
│                              │  └──────────────────────────────────────┘ │
└──────────────────────────────┴───────────────────────────────────────────┘
```

---

## Cấu trúc dự án

```
HoanHocTiengTrung/
│
├── src-tauri/                              # ═══════════════════════════════
│   │                                       #   RUST BACKEND (Tauri v2)
│   │                                       # ═══════════════════════════════
│   ├── src/
│   │   ├── main.rs                         # Entry point chính
│   │   │                                   # - Khởi tạo DatabaseManager, AppState
│   │   │                                   # - Load cache flashcards & dictionary
│   │   │                                   # - Dọn trash hết hạn trên startup
│   │   │                                   # - Đăng ký 30 Tauri commands
│   │   │                                   # - Build Tauri app với plugin shell
│   │   │
│   │   ├── app/                            # Lớp ứng dụng (Application Layer)
│   │   │   ├── mod.rs                      # Export module state
│   │   │   └── state.rs                    # Shared application state
│   │   │                                   # - Arc<DatabaseManager>: 2 pool SQLite
│   │   │                                   # - Arc<RwLock<Vec<Flashcard>>>: cache flashcards
│   │   │                                   # - Arc<RwLock<HashMap<String, DictEntry>>>: cache dictionary
│   │   │                                   # - refresh_flashcards_cache(): load toàn bộ từ DB
│   │   │                                   # - refresh_dict_cache(): load vocabulary → HashMap
│   │   │
│   │   ├── domain/                         # ═══ BUSINESS LOGIC (Pure Rust) ═══
│   │   │   ├── mod.rs                      # Export srs, tts, pinyin
│   │   │   │
│   │   │   ├── srs/mod.rs                  # Spaced Repetition System Engine
│   │   │   │                               # - calculate_next_review(level, remembered)
│   │   │   │                               # - Exponential backoff: days = 2^(level-2) cho level >= 3
│   │   │   │                               # - Level 0→1→2: 1 ngày, level 3: 2 ngày, level 4: 4 ngày...
│   │   │   │                               # - MAX_LEVEL = 8, reset về 0 khi quên
│   │   │   │                               # - get_mastery_status(): new/learning/familiar/proficient/mastered
│   │   │   │                               # - Unit tests: test_srs_remembered_progression, test_srs_forgotten_reset
│   │   │   │
│   │   │   ├── tts/mod.rs                  # Text-to-Speech Handler
│   │   │   │                               # - 4 giọng: Xiaoxiao, Xiaoyi, Yunxi, Yunjian
│   │   │   │                               # - select_random_voice(): chọn ngẫu nhiên
│   │   │   │                               # - select_voice(preferred): ưu tiên giọng chỉ định
│   │   │   │                               # - generate_tts_audio(): gọi edge-tts CLI
│   │   │   │                               # - get_available_voices(): trả về danh sách 4 giọng
│   │   │   │                               # - Unit tests: voice selection, available voices count
│   │   │   │
│   │   │   └── theme_config.rs             # Theme Persistence
│   │   │                                   # - get_saved_theme(): đọc theme từ file config
│   │   │                                   # - save_theme(theme): lưu theme vào file config
│   │   │
│   │   └── infra/                          # ═══ INFRASTRUCTURE LAYER ═══
│   │       ├── mod.rs                      # Export database, models, commands
│   │       │
│   │       ├── database/mod.rs             # Database Manager
│   │       │                               # - SqlitePool app_db: 5 connections (write-heavy)
│   │       │                               # - SqlitePool dict_db: 10 connections (read-only)
│   │       │                               # - acquire_timeout: 5s cho cả 2 pool
│   │       │                               # - init_app_tables(): tạo flashcards, trash, grammar_notes
│   │       │                               # - init_dict_tables(): tạo index vocabulary.word
│   │       │                               # - auto-create tables nếu chưa tồn tại
│   │       │
│   │       ├── models/mod.rs               # Data Models & DTOs
│   │       │                               # - Flashcard: id, hanzi, pinyin, meaning, level, next_review, deleted_at
│   │       │                               # - TrashItem: id, flashcard_id, hanzi, pinyin, meaning, level, auto_delete_at
│   │       │                               # - CreateFlashcard / UpdateFlashcard / ReviewResult
│   │       │                               # - DictionaryEntry: id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en
│   │       │                               # - HoverResult: word, pinyin, hsk_level, pos, meaning_vi, meaning_en
│   │       │                               # - GrammarNote: id, note_type, title, level, formula, explanation, examples
│   │       │                               # - CreateGrammarNote / UpdateGrammarNote
│   │       │                               # - SrsStatistics: total/new/learning/familiar/proficient/mastered, due_today, accuracy
│   │       │
│   │       └── commands/                   # ═══ TAURI COMMANDS (32 handlers) ═══
│   │           ├── mod.rs                  # Export flashcard, dictionary, tts, grammar, srs, theme
│   │           │
│   │           ├── flashcard.rs            # Flashcard CRUD + Review + Trash + Search (11 commands)
│   │           │                           # - get_due_flashcards(): lấy thẻ đến hạn, xáo trộn ngẫu nhiên
│   │           │                           # - get_random_flashcards(limit): lấy ngẫu nhiên N thẻ
│   │           │                           # - get_all_flashcards(): lấy tất cả, sort theo date_added DESC
│   │           │                           # - search_flashcards(req): tìm kiếm + lọc + sort + phân trang trên RAM cache
│   │           │                           # - create_flashcard(): thêm thẻ mới, level=0, next_review = yesterday
│   │           │                           # - update_flashcard(): cập nhật với COALESCE
│   │           │                           # - delete_flashcard(): xóa mềm → trash, auto_delete sau 10 ngày
│   │           │                           # - record_review_result(): áp dụng SRS, update level + next_review
│   │           │                           # - get_trash_items(): danh sách thẻ trong thùng rác
│   │           │                           # - restore_from_trash(): khôi phục từ thùng rác
│   │           │                           # - permanent_delete(): xóa vĩnh viễn flashcard + trash record
│   │           │                           # - cleanup_expired_trash(): dọn trash quá hạn auto_delete_at
│   │           │
│   │           ├── dictionary.rs           # Dictionary Lookup (3 commands)
│   │           │                           # - search_dictionary(req): tìm kiếm với phân trang, sort (default/hsk)
│   │           │                           #   + Score: exact match = 0, contains = word.len (ngắn ưu tiên)
│   │           │                           #   + Sort by HSK: parse level, default 99 cho không có
│   │           │                           # - lookup_word(word): tra từ chính xác, fallback query DB nếu cache rỗng
│   │           │                           # - lookup_hover(text, cursor_index): longest-match 1→4 ký tự
│   │           │
│   │           ├── tts.rs                  # Text-to-Speech + Audio (6 commands)
│   │           │                           # - generate_audio(text, voice): tạo MP3, cache nếu đã tồn tại (tên file MD5 hash)
│   │           │                           # - get_available_voices(): trả về 4 giọng neural
│   │           │                           # - play_audio_file(path): ffplay (chính) → paplay (dự phòng)
│   │           │                           # - check_audio_exists(text): kiểm tra MP3/WAV đã tồn tại
│   │           │                           # - clear_audio_cache(): xóa file audio orphan (so sánh MD5 hash với flashcards)
│   │           │                           # - delete_single_audio(text): xóa file audio của 1 từ cụ thể
│   │           │
│   │           ├── grammar.rs              # Grammar Notes CRUD (4 commands)
│   │           │                           # - get_all_grammar_notes(): sort theo level ASC, title ASC
│   │           │                           # - create_grammar_note(data): thêm ghi chú mới
│   │           │                           # - update_grammar_note(data): cập nhật với COALESCE
│   │           │                           # - delete_grammar_note(id): xóa ghi chú
│   │           │
│   │           └── srs.rs                  # SRS Statistics (2 commands)
│   │                                       # - get_statistics(): COUNT theo level group, AVG accuracy
│   │                                       # - get_review_plan(): COUNT thẻ cần ôn 7 ngày tới
│   │                                       #   + Label: "Hôm nay", "Ngày mai", "dd/mm"
│   │           │
│   │           └── theme.rs                # Theme Persistence (2 commands)
│   │                                       # - get_theme(): đọc theme từ file config (light/dark)
│   │                                       # - set_theme(theme): lưu theme vào file config
│   │
│   ├── Cargo.toml                          # Rust dependencies
│   │                                       # - tauri v2, tauri-plugin-shell
│   │                                       # - sqlx 0.8 (runtime-tokio, sqlite, chrono, uuid)
│   │                                       # - tokio (full), chrono, rand, md-5, hex
│   │                                       # - serde, serde_json, anyhow, thiserror
│   │                                       # - log, env_logger, dirs, once_cell, uuid
│   │
│   ├── tauri.conf.json                     # Tauri configuration
│   │                                       # - Window: 1200x800, resizable, center, no decorations, maximized, backgroundColor
│   │                                       # - CSP: default-src 'self', media-src file:, font-src Google
│   │                                       # - Bundle: icons 32x32, 128x128, icns, ico
│   │
│   ├── build.rs                            # Tauri build script (tauri_build::build())
│   │
│   ├── capabilities/                       # Tauri v2 capability files
│   ├── gen/                                # Generated code (auto)
│   ├── icons/                              # App icons
│   └── target/                             # Rust build output
│
├── src/                                    # ═══════════════════════════════
│   │                                       #   REACT FRONTEND
│   │                                       # ═══════════════════════════════
│   ├── main.tsx                            # React entry point
│   │                                       # - ReactDOM.createRoot → render <App />
│   │                                       # - React.StrictMode wrapper
│   │
│   ├── App.tsx                             # Root component
│   │                                       # - QueryClientProvider (retry: 1, no refetch on focus)
│   │                                       # - Switch activeTab → render Page tương ứng
│   │                                       # - 6 tabs: review, manage, dashboard, grammar, dictionary, trash
│   │                                       # - Layout wrapper (Sidebar + TitleBar + main content)
│   │
│   ├── index.css                           # Global styles
│   │                                       # - @tailwind base/components/utilities
│   │                                       # - body: bg-gray-50, Noto Sans font
│   │                                       # - .hanzi-text: FandolKai, Noto Sans SC, SimSun
│   │
│   ├── vite-env.d.ts                       # Vite environment type declarations
│   │
│   ├── types/                              # ═══ TypeScript Types ═══
│   │   └── index.ts                        # Tất cả interfaces
│   │                                       # - Flashcard, TrashItem, CreateFlashcard, UpdateFlashcard, ReviewResult
│   │                                       # - DictionaryEntry, HoverResult
│   │                                       # - GrammarNote, CreateGrammarNote, UpdateGrammarNote
│   │                                       # - TtsResponse, SrsStatistics
│   │                                       # - FlashcardRevealStep: "meaning" | "pinyin" | "hanzi"
│   │                                       # - TabId: "review" | "manage" | "dashboard" | "grammar" | "dictionary" | "trash"
│   │
│   ├── stores/                             # ═══ Zustand State Management ═══
│   │   ├── index.ts                        # Export tất cả stores
│   │   │
│   │   ├── app.ts                          # useAppStore
│   │   │                                   # - activeTab: TabId (default: "review")
│   │   │                                   # - setActiveTab(tab): chuyển tab
│   │   │
│   │   ├── flashcard.ts                    # useFlashcardStore
│   │   │                                   # - sessionCards: Flashcard[]
│   │   │                                   # - initialTotal, currentIndex, revealStep
│   │   │                                   # - sessionActive, cramMode
│   │   │                                   # - rememberedCount, forgottenCount, completedIds
│   │   │                                   # - startSession(cards, cramMode): bắt đầu phiên ôn
│   │   │                                   # - endSession(): kết thúc, reset state
│   │   │                                   # - nextStep(): meaning → pinyin → hanzi
│   │   │                                   # - recordResult(remembered): cập nhật đếm + completedIds
│   │   │                                   # - advanceAfterReview(): chuyển card tiếp hoặc kết thúc
│   │   │
│   │   ├── tts.ts                          # useTtsStore
│   │   │                                   # - currentVoice: string (default: XiaoxiaoNeural)
│   │   │                                   # - isPlaying: boolean
│   │   │                                   # - audioCache: Map<string, string>
│   │   │                                   # - setVoice(), rotateVoice(), setPlaying()
│   │   │                                   # - cacheAudio(key, path), getCachedAudio(key)
│   │   │
│   │   └── ui.ts                           # useUiStore
│   │                                       # - theme: "light" | "dark" (load từ localStorage)
│   │   │                                   # - setTheme(), toggleTheme()
│   │   │                                   # - hoverEnabled: boolean (default: true)
│   │   │                                   # - toggleHover()
│   │   │                                   # - hoverWords: HoverResult[], hoverPosition: {x, y} | null
│   │   │                                   # - setHoverWords(words, position)
│   │
│   ├── hooks/                              # ═══ TanStack Query + Tauri RPC ═══
│   │   ├── index.ts                        # Export tất cả hooks
│   │   │
│   │   ├── useFlashcards.ts                # Flashcard data fetching
│   │   │                                   # - useQuery: dueCards (stale 1min), allCards (stale 0)
│   │   │                                   # - fetchRandomCards(limit): manual invoke
│   │   │                                   # - useMutation: create, update, delete, review
│   │   │                                   # - invalidate ["flashcards"] + ["srs/statistics"] sau mutation
│   │   │
│   │   ├── useDictionary.ts                # Dictionary data fetching
│   │   │                                   # - lookupWord(word): manual invoke
│   │   │                                   # - lookupHover(text, cursorIndex): manual invoke
│   │   │                                   # - wordEntry query (disabled by default)
│   │   │
│   │   ├── useTts.ts                       # TTS data fetching
│   │   │                                   # - generateAudio(text): mutate generate_audio
│   │   │                                   # - playAudio(audioPath): invoke play_audio_file
│   │   │
│   │   ├── useGrammar.ts                   # Grammar data fetching
│   │   │                                   # - useQuery: notes (stale 1min)
│   │   │                                   # - useMutation: create, update, delete
│   │   │                                   # - invalidate ["grammar/notes"] sau mutation
│   │   │
│   │   └── useSrs.ts                       # SRS statistics
│   │                                       # - useQuery: statistics (stale 1min, refetch on focus)
│   │                                       # - useQuery: reviewPlan (stale 5min)
│   │                                       # - Default statistics: all zeros
│   │
│   ├── components/                         # ═══ React Components ═══
│   │   ├── index.ts                        # Export tất cả components
│   │   │
│   │   ├── ui/                             # ── UI Primitives (Reusable) ──
│   │   │   ├── Button.tsx                  # Button: variant (primary/secondary/ghost/danger), size (sm/md/lg)
│   │   │   │                               # - Theme-aware, focus ring, transition
│   │   │   │
│   │   │   ├── Card.tsx                    # Card wrapper: bg, border, shadow, rounded-xl, p-6
│   │   │   │
│   │   │   ├── Badge.tsx                   # Badge: variant (default/success/warning/error/info)
│   │   │   │                               # - Inline-flex, px-2.5 py-0.5, rounded-full, text-xs
│   │   │   │
│   │   │   ├── Input.tsx                   # Input: w-full, px-4 py-2, border, focus ring blue
│   │   │   │
│   │   │   └── Tabs.tsx                    # Tabs: Tabs, TabsList, TabsTrigger, TabsContent
│   │   │                                   # - DOM-based state (data-value attribute + CustomEvent)
│   │   │
│   │   ├── layout/                         # ── Layout Components ──
│   │   │   ├── Layout.tsx                  # Main layout: flex-col h-screen
│   │   │   │                               # - TitleBar (top) + Sidebar (left) + main content (right)
│   │   │   │
│   │   │   ├── Sidebar.tsx                 # Navigation sidebar (w-64)
│   │   │   │                               # - Header: "Hoan Hoc Tieng Trung"
│   │   │   │                               # - 6 nav buttons: Ôn tập, Quản lý, Thống kê, Ngữ pháp, Từ điển, Thùng rác
│   │   │   │                               # - Active state: bg + text color khác
│   │   │   │                               # - Footer: Theme toggle (Sun/Moon), Hover toggle (Eye/EyeOff + ON/OFF badge)
│   │   │   │                               # - Version label: v1.0.0
│   │   │   │
│   │   │   └── TitleBar.tsx                # Custom window title bar (h-10, bg-gray-900)
│   │   │                                   # - Drag region (data-tauri-drag-region)
│   │   │                                   # - Minimize, Maximize/Unmaximize, Close buttons
│   │   │                                   # - isMaximized state sync
│   │   │
│   │   ├── flashcard/                      # ── Flashcard Components ──
│   │   │   ├── Flashcard.tsx               # Single flashcard component
│   │   │   │                               # - 3 reveal steps: meaning → pinyin → hanzi
│   │   │   │                               # - Mastery badge (top-right)
│   │   │   │                               # - Hanzi step: auto font-size (36px-120px) theo độ dài từ
│   │   │   │                               # - Keyboard: Space/↓ (next), ← (forget), → (remember)
│   │   │   │                               # - Buttons: Quên, Phát âm thanh, Xóa audio, Nhớ
│   │   │   │                               # - HanziHover component cho tra từ khi hover
│   │   │   │
│   │   │   └── FlashcardList.tsx           # Session controller
│   │   │                                   # - Lấy card hiện tại từ flashcardStore
│   │   │                                   # - handleRemember/Forget: recordResult + recordReview (nếu không cram)
│   │   │                                   # - handlePlayAudio: generate + play
│   │   │
│   │   ├── dictionary/                     # ── Dictionary Components ──
│   │   │   ├── HanziHover.tsx              # Hover handler cho chữ Hán
│   │   │   │                               # - Split text thành từng ký tự, wrap <span>
│   │   │   │                               # - onMouseEnter: debounce 80ms → lookupHover → setHoverWords
│   │   │   │                               # - onMouseLeave: clear debounce + setHoverWords(null)
│   │   │   │                               # - Render DictionaryPopover khi có kết quả
│   │   │   │
│   │   │   └── DictionaryPopover.tsx       # Hover tooltip (fixed, z-50, w-80)
│   │   │                                   # - Hiển thị: word (font-hanzi), HSK badge, pinyin, pos
│   │   │                                   # - Nghĩa VI/EN với label
│   │   │                                   # - Multiple results (longest-match), scrollable max-h-80
│   │   │                                   # - First result highlighted (bg-blue-50/50)
│   │   │
│   │   └── (index.ts exports all)          #
│   │
│   ├── pages/                              # ═══ Page Components (6 tabs) ═══
│   │   ├── index.ts                        # Export 5 pages (không có TrashPage)
│   │   │
│   │   ├── ReviewPage.tsx                  # Tab: Ôn tập thẻ từ vựng
│   │   │                                   # - Khi chưa session: hiển thị số thẻ cần ôn + tổng thẻ
│   │   │                                   # - 2 nút: "Ôn tập thông minh" (due cards) + "Ôn cấp tốc" (random all)
│   │   │                                   # - Khi session active: progress bar + FlashcardList
│   │   │                                   # - Stats: X / total, Nhớ, Quên
│   │   │
│   │   ├── ManagePage.tsx                  # Tab: Quản lý thẻ từ vựng
│   │   │                                   # - Form thêm thẻ: Hanzi + Pinyin + Nghĩa, nút Auto Pinyin (frontend pinyin-pro)
│   │   │                                   # - Search/Filter/Sort/Pagination: xử lý bởi backend (search_flashcards)
│   │   │                                   # - Bảng 8 cột: Hanzi, Pinyin, Nghĩa, Cấp độ, Ngày thêm, Âm thanh, Xóa audio, Thao tác
│   │   │                                   # - Inline edit: click Pencil → input fields → Save/Cancel
│   │   │                                   # - Audio: phát (Volume2), trạng thái (CheckCircle2/VolumeX), tạo batch
│   │   │                                   # - Batch audio: progress bar, cancel button
│   │   │                                   # - Clear cache: xóa file audio orphan
│   │   │                                   # - Delete audio: xóa file MP3 của 1 từ
│   │   │
│   │   ├── DashboardPage.tsx               # Tab: Bảng thống kê
│   │   │                                   # - 4 stat cards: Tổng thẻ, Cần ôn hôm nay, Đã thuộc, Chính xác %
│   │   │                                   # - Progress bars theo 5 cấp độ: Làm quen/Sơ cấp/Trung cấp/Cao cấp/Tinh thông
│   │   │                                   # - Bar chart: kế hoạch ôn tập 7 ngày tới
│   │   │
│   │   ├── GrammarPage.tsx                 # Tab: Sổ tay ngữ pháp
│   │   │                                   # - Form thêm: Title, Formula, Explanation, Examples
│   │   │                                   # - Danh sách Card: click expand/collapse
│   │   │                                   # - Hiển thị: Công thức (font-hanzi, màu xanh), Giải thích, Ví dụ (mỗi dòng 1 câu)
│   │   │                                   # - HSK badge cho từng ghi chú
│   │   │
│   │   ├── DictionaryPage.tsx              # Tab: Từ điển Trung - Việt
│   │   │                                   # - Search input: debounce 400ms, font-hanzi text-lg
│   │   │                                   # - Sort toggle: Mặc định / HSK ↑
│   │   │                                   # - Kết quả: word (text-2xl), pinyin, pos, meaning_vi, meaning_en, HSK badge
│   │   │                                   # - Pagination: 12 kết quả/trang
│   │   │                                   # - Total count hiển thị
│   │   │
│   │   └── TrashPage.tsx                   # Tab: Thùng rác
│   │                                       # - Badge: "Tự động xóa sau 10 ngày"
│   │                                       # - Bảng: Hanzi, Pinyin, Nghĩa, Cấp độ, Ngày xóa, Còn lại (countdown)
│   │                                       # - Actions: Khôi phục (RotateCcw), Xóa vĩnh viễn (Trash2)
│   │                                       # - Alert icon cho countdown
│   │
│   └── lib/                                # ═══ Utilities ═══
│       ├── utils.ts                        # - cn(): clsx + tailwind-merge
│       │                                   # - getMasteryLabel(level): 0→"Làm quen", 8→"Tinh thông"
│       │                                   # - getMasteryColor(level): (deprecated - dùng theme badge0-8 thay thế)
│       │                                   # - getHskBadgeColor(hskLevel): green (1-2), yellow (3-4), red (5+)
│       │
│       ├── pinyin.ts                       # - convertPinyin(text): dùng pinyin-pro để chuyển Hán tự sang Pinyin
│       │
│       └── theme.ts                        # Hệ thống theme sáng/tối (450 dòng)
│                                           # - ThemeColors interface: 100+ màu Tailwind class
│                                           # - lightTheme: bg-gray-50, text-gray-900, ...
│                                           # - darkTheme: bg-gray-900, text-gray-200, ...
│                                           # - Phân loại: common, sidebar, review, manage, dashboard,
│                                           #   grammar, dictionary, trash, popover, badge
│
├── data/                                   # ═══ SQLite Databases ═══
│   ├── app_database.db                     # - flashcards: id, hanzi, pinyin, meaning, level, next_review, deleted_at, auto_delete_at
│   │                                       # - trash: id, flashcard_id, hanzi, pinyin, meaning, level, deleted_at, auto_delete_at
│   │                                       # - grammar_notes: id, note_type, title, level, formula, explanation, examples
│   │                                       # - Indexes: idx_flashcards_next_review, idx_flashcards_level
│   │
│   └── zh.db                               # - vocabulary: id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en
│                                           # - 10,989 entries (HSK 1-6)
│                                           # - Index: idx_vocabulary_word
│
├── Oldversion/                             # ═══ Legacy Python App (reference only) ═══
│   ├── main.py                             # Entry point (CustomTkinter)
│   ├── audio_generator.py                  # Batch audio generation
│   ├── database/                           # SQLAlchemy models + CRUD
│   ├── ui/                                 # CustomTkinter UI tabs
│   ├── utils/                              # TTS player (Sherpa-ONNX)
│   ├── scripts/                            # Data migration scripts
│   └── sherpa-onnx-tts/                    # Offline TTS model
│
├── package.json                            # Node.js dependencies & scripts
├── vite.config.ts                          # Vite config (React plugin, port 1420)
├── tailwind.config.js                      # Tailwind config (font hanzi, animations)
├── tsconfig.json                           # TypeScript configuration
├── postcss.config.js                       # PostCSS config
└── index.html                              # HTML entry point
```

---

## Mô tả chi tiết từng thành phần

### Backend Rust

#### `main.rs` - Entry Point
File khởi chạy ứng dụng, thực hiện tuần tự:
1. Khởi tạo `env_logger` để ghi log
2. Tạo `DatabaseManager` với 2 SQLite connection pools
3. Tạo `AppState` chứa database manager + 2 cache (flashcards & dictionary)
4. Load toàn bộ flashcards và dictionary vào RAM cache
5. Dọn các trash item đã quá hạn `auto_delete_at`
6. Build Tauri app với plugin shell và đăng ký 30 commands

#### Domain Layer (Business Logic thuần Rust)
- **SRS Engine**: Tính toán thời gian ôn tiếp theo dựa trên level hiện tại và kết quả nhớ/quên. Không phụ thuộc vào database hay I/O.
- **TTS Handler**: Quản lý 4 giọng đọc, chọn ngẫu nhiên hoặc theo preference, gọi `edge-tts` CLI để sinh âm thanh.
- **Pinyin Converter**: Dùng crate `pinyin` để chuyển Hán tự → Pinyin, hỗ trợ ký tự đa âm (heteronym).

#### Infrastructure Layer
- **Database**: 2 pool SQLite độc lập. `app_db` cho dữ liệu người dùng (flashcards, grammar, trash), `dict_db` cho từ典 (read-only).
- **Models**: Structs derive `FromRow` (sqlx), `Serialize`/`Deserialize` (serde) để mapping DB ↔ JSON ↔ TypeScript.
- **Commands**: 30 hàm `#[tauri::command]` async, nhận `State<'_, AppState>`, trả về `Result<T, String>`.

### Frontend React

#### State Management
- **Zustand**: Quản lý state cục bộ (tab active, session flashcard, theme, hover). Nhẹ, không cần Provider.
- **TanStack Query**: Quản lý state remote (data từ Rust backend). Tự động cache, stale time, invalidate sau mutation.

#### Luồng dữ liệu
```
User action → React Component → Hook (TanStack Query) → invoke() → Tauri Command → Rust Backend → SQLite
                                                                    ↓
User action ← React re-render ← Query cache update ← Result ← SQL query ← Domain logic
```

#### Theme System
Hệ thống theme định nghĩa 100+ Tailwind class trong `theme.ts`, chia theo khu vực (sidebar, review, manage...). Mỗi component đọc `useUiStore().theme` → chọn `lightTheme` hoặc `darkTheme` → áp dụng class.

---

## Cơ sở dữ liệu

### `app_database.db` - Dữ liệu người dùng

**Bảng `flashcards`**:
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | Tự tăng |
| hanzi | VARCHAR(100) | Chữ Hán |
| pinyin | VARCHAR(200) | Phiên âm |
| meaning | VARCHAR(500) | Nghĩa tiếng Việt |
| date_added | DATETIME | Ngày thêm (mặc định CURRENT_TIMESTAMP) |
| level | INTEGER | Cấp độ SRS (0-8), mặc định 0 |
| next_review | DATETIME | Lần ôn tiếp theo |
| deleted_at | DATETIME | NULL = còn hoạt động |
| auto_delete_at | DATETIME | Tự động xóa sau 10 ngày |

**Bảng `trash`**:
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | Tự tăng |
| flashcard_id | INTEGER | ID flashcard gốc |
| hanzi, pinyin, meaning, level | | Dữ liệu snapshot |
| deleted_at | DATETIME | Ngày xóa |
| auto_delete_at | DATETIME | +10 ngày từ deleted_at |

**Bảng `grammar_notes`**:
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | Tự tăng |
| note_type | VARCHAR(50) | Loại (grammar) |
| title | VARCHAR(200) | Tiêu đề |
| level | INTEGER | Cấp HSK |
| formula | VARCHAR(500) | Công thức |
| explanation | TEXT | Giải thích |
| examples | TEXT | Ví dụ (mỗi dòng 1 câu) |

### `zh.db` - Từ điển

**Bảng `vocabulary`** (10,989 entries):
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | Tự tăng |
| hsk_level | VARCHAR | Cấp HSK (1-6) |
| word | VARCHAR | Từ vựng |
| pinyin | VARCHAR | Phiên âm |
| pos | VARCHAR | Loại từ (part of speech) |
| meaning_vi | VARCHAR | Nghĩa tiếng Việt |
| meaning_en | VARCHAR | Nghĩa tiếng Anh |

---

## Cài đặt môi trường

### Yêu cầu hệ thống

| Công cụ | Phiên bản | Cài đặt |
|---------|-----------|---------|
| Rust | 1.75+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Node.js | 18+ | `nvm install 18` hoặc tải từ nodejs.org |
| Python | 3.x | Cần cho `pypinyin` (auto pinyin) và `edge-tts` |
| edge-tts | latest | `pip install edge-tts` |
| pypinyin | latest | `pip install pypinyin` |
| ffmpeg | latest | Cần `ffplay` để phát âm thanh |

### Bước 1: Cài Rust Toolchain

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Cài Tauri CLI
cargo install tauri-cli --version "^2.0.0"
```

### Bước 2: Cài Node.js Dependencies

```bash
cd HoanHocTiengTrung
npm install
```

### Bước 3: Cài Python Dependencies

```bash
pip install edge-tts pypinyin
```

Kiểm tra:
```bash
edge-tts --version
python3 -c "from pypinyin import pinyin; print('OK')"
```

### Bước 4: Cài ffmpeg (phát âm thanh)

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows (chocolatey)
choco install ffmpeg
```

### Bước 5: Cơ sở dữ liệu

2 file SQLite có sẵn trong `data/`:
- `app_database.db` - Flashcards + grammar notes (tự tạo nếu chưa có)
- `zh.db` - Từ điển 10,989 từ

Không cần setup thêm.

---

## Phát triển & Build

### Chạy Development Server

```bash
npm run tauri dev
```

Lần lượt:
1. `npm run dev` → Vite dev server port 1420
2. Tauri mở window desktop load từ `http://localhost:1420`
3. Hot reload cho cả frontend (React) và backend (Rust)

### Build Production

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/`

| Platform | Lệnh | Output |
|----------|------|--------|
| Linux | `npm run tauri build` | `.deb`, `.AppImage` |
| macOS | `npm run tauri build -- --target aarch64-apple-darwin` | `.app`, `.dmg` |
| Windows | `npm run tauri build -- --target x86_64-pc-windows-msvc` | `.msi`, `.exe` |

### Tối ưu binary size

Thêm vào `src-tauri/Cargo.toml`:

```toml
[profile.release]
strip = true
lto = true
codegen-units = 1
opt-level = "z"
```

### Scripts có sẵn

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy Vite dev server (port 1420) |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview bản build |
| `npm run tauri` | Tauri CLI (dev, build, icon...) |

---

## Thuật toán & Kỹ thuật

### SRS Algorithm

```
Level progression (remembered):
  0 → 1: 1 ngày
  1 → 2: 1 ngày
  2 → 3: 2 ngày   (2^1)
  3 → 4: 4 ngày   (2^2)
  4 → 5: 8 ngày   (2^3)
  5 → 6: 16 ngày  (2^4)
  6 → 7: 32 ngày  (2^5)
  7 → 8: 64 ngày  (2^6)  ← MAX_LEVEL

Forgotten: level → 0, review ngay lập tức

Mastery labels:
  0: Làm quen
  1-2: Sơ cấp / Cơ bản
  3-4: Trung cấp / Tiến bộ
  5-6: Cao cấp / Thành thạo
  7-8: Điêu luyện / Tinh thông
```

### Dictionary Lookup (Longest-Match)

Khi hover vào vị trí `cursor_index` trong text:
1. Thử substring 4 ký tự: `text[cursor_index..cursor_index+4]`
2. Nếu không có trong cache → thử 3 ký tự
3. Nếu không có → thử 2 ký tự
4. Nếu không có → thử 1 ký tự
5. Trả về tất cả kết quả tìm được (có thể nhiều hơn 1)

### TTS Voice Rotation

4 giọng đọc Microsoft Edge Neural:
- `zh-CN-XiaoxiaoNeural` (nữ)
- `zh-CN-XiaoyiNeural` (nữ)
- `zh-CN-YunxiNeural` (nam)
- `zh-CN-YunjianNeural` (nam)

Giọng Yunxi/Yunjian giảm tốc độ 10% (`--rate=-10%`) để dễ nghe hơn.

### Database Concurrency

| Database | Max connections | Mục đích |
|----------|----------------|----------|
| `app_database.db` | 5 | Write-heavy (SRS updates, CRUD) |
| `zh.db` | 10 | Read-only (dictionary lookups) |

Cả 2 dùng `sqlx` async pool với `acquire_timeout: 5s`.

### Cache Strategy

- **Flashcards cache**: Load toàn bộ vào `Vec<Flashcard>` trên startup, refresh sau mỗi mutation
- **Dictionary cache**: Load toàn bộ vocabulary vào `HashMap<String, DictionaryEntry>`, lookup O(1)
- **Audio cache**: File MP3 trong `data/audio/`, đặt tên theo hanzi, kiểm tra tồn tại trước khi generate

---

## Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| **Framework** | Tauri v2 |
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **Styling** | TailwindCSS 3 + lucide-react icons |
| **State (local)** | Zustand 5 |
| **State (remote)** | TanStack Query 5 |
| **Backend** | Rust (async/await, Tokio runtime) |
| **Database** | sqlx 0.8 (async SQLite) |
| **TTS** | edge-tts (CLI, Microsoft Neural) |
| **Pinyin** | pinyin crate 0.10 + pypinyin (Python CLI) |
| **Serialization** | serde 1 + serde_json |
| **Audio playback** | ffplay (chính) / paplay (dự phòng) |

---

## Migration từ phiên bản cũ

Ứng dụng này là bản rewrite hoàn toàn từ phiên bản Python/CustomTkinter legacy (`Oldversion/`). Các điểm thay đổi chính:

1. **Tương thích database**: Schema SQLite giữ nguyên, dữ liệu cũ dùng được ngay
2. **Sửa lỗi bảng từ điển**: Legacy query bảng `hsk_words` nhưng thực tế là `vocabulary` → đã sửa
3. **Thuật toán SRS**: Giữ nguyên logic exponential backoff, port từ Python sang Rust
4. **Pinyin**: Thay `pypinyin` (Python) bằng `pinyin` crate (Rust), hỗ trợ ký tự đa âm
5. **TTS**: Thay Sherpa-ONNX + gTTS bằng edge-tts (chất lượng giọng tốt hơn)
6. **Hiệu năng**: Rust + async SQLite + in-memory cache → phản hồi < 50ms
7. **UI/UX**: CustomTkinter → React + Tailwind, theme sáng/tối, animation mượt mà

---

## License

MIT
