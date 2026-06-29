# Learn Chinese App

A cross-platform desktop application for learning Chinese, built on a modern architecture combining the high performance of Rust (Backend) and a modern UI with React (Frontend) via Tauri.

## 🏗 System Architecture

The project utilizes a hybrid architecture combining **React (Frontend)** and **Rust (Backend)**, communicating through the **Tauri IPC Bridge**.

### API Communication & IPC Bridge Flow
- **Tauri Invoke:** The frontend communicates with the backend via asynchronous calls using Tauri's `invoke` API (e.g., `invoke("get_due_flashcards")`).
- **Data Flow:** 
  1. The user interacts with the React UI (Sends a request).
  2. The Rust backend receives the request via `#[tauri::command]` functions, then processes the business logic.
  3. Rust interacts with the SQLite database using the `sqlx` library.
  4. The backend returns the result to the frontend (serializing data to JSON via `serde`).
- **State Management:** The backend utilizes an `AppState` to manage the Database connection pool and In-memory Caching. Caching ensures extremely fast retrieval of flashcards and heavy datasets.

## 🌟 Key Features

1. **Vocabulary Learning & Spaced Repetition System (SRS):** Flashcard management with an algorithm that automatically calculates optimal review schedules based on the user's retention level.
2. **Dictionary & Character Decomposition:** Vocabulary lookup with a feature that breaks down Chinese characters (Decomposition) from the local database.
3. **Text-to-Speech (TTS):** Pronunciation support through an automated TTS system with local audio cache management.
4. **Grammar:** A system to store and manage learned grammar points.
5. **Soft Delete & Auto Cleanup:** A Trash feature that allows restoring or permanently auto-deleting trashed data after a certain period to optimize the database size.

## 📁 Project Directory Structure

The directory structure follows the standard of a Tauri project, implementing Clean Architecture on the backend:

```text
├── src/                # React Frontend code (TypeScript, Vite, TailwindCSS)
│   ├── components/     # Reusable UI Components
│   ├── lib/            # Utilities and helpers
│   └── ...             # Other frontend directories (stores, hooks, etc.)
│
├── src-tauri/          # Rust Backend code
│   ├── Cargo.toml      # Rust dependencies configuration
│   ├── tauri.conf.json # Tauri app configuration
│   └── src/
│       ├── app/        # AppState, startup configuration (Init, State management)
│       ├── domain/     # Core business logic (SRS algorithm, TTS logic...)
│       ├── infra/      # External communication: Database (SQLite), Tauri commands (IPC)
│       └── main.rs     # Application entry point, IPC Handlers registration
```

## 🛡 Error Handling & Edge Cases

- **Backend (Rust):** IPC functions (Tauri commands) return a `Result<T, String>` type. Any errors (SQLite database errors, memory errors, file system errors when saving audio) are safely mapped into string error messages (`map_err`) and returned to the client, preventing the application from panicking or crashing.
- **Frontend (React):** Catches errors returned from Rust using `try/catch` blocks or Promise `.catch()`, and displays appropriate Toast notifications or error states to the user.
- **Edge Cases:** 
  - **Memory & Concurrency:** The application manages shared state via `Mutex`/`RwLock` within the Rust `AppState`. This guarantees thread-safety when handling multiple concurrent requests from the frontend.
  - **Input Validation:** Filtered and blocked directly at the UI level, followed by a validation layer on the backend before writing to the database.
  - **Resource Cleanup:** Temporary audio files and expired trashed flashcards are automatically cleaned up when the app starts (`cleanup_temp_files`), freeing up disk space.
