use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::path::PathBuf;
use std::time::Duration;

pub struct DatabaseManager {
    pub app_db: SqlitePool,
    pub dict_db: SqlitePool,
}

impl DatabaseManager {
    pub async fn new() -> anyhow::Result<Self> {
        let data_dir = Self::get_data_dir()?;

        let app_db_path = data_dir.join("app_database.db");
        let dict_db_path = data_dir.join("zh.db");

        let app_db = SqlitePoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(5))
            .connect(app_db_path.to_str().unwrap())
            .await?;

        let dict_db = SqlitePoolOptions::new()
            .max_connections(10)
            .acquire_timeout(Duration::from_secs(5))
            .connect(dict_db_path.to_str().unwrap())
            .await?;

        Self::init_app_tables(&app_db).await?;
        Self::init_dict_tables(&dict_db).await?;

        log::info!("Database connections established");
        Ok(Self { app_db, dict_db })
    }

    async fn init_app_tables(pool: &SqlitePool) -> anyhow::Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS flashcards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hanzi VARCHAR(100) NOT NULL,
                pinyin VARCHAR(200),
                meaning VARCHAR(500),
                date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
                level INTEGER DEFAULT 0,
                next_review DATETIME,
                deleted_at DATETIME,
                auto_delete_at DATETIME
            )
            "#,
        )
        .execute(pool)
        .await?;

        let _ = sqlx::query("ALTER TABLE flashcards ADD COLUMN deleted_at DATETIME")
            .execute(pool)
            .await;

        let _ = sqlx::query("ALTER TABLE flashcards ADD COLUMN auto_delete_at DATETIME")
            .execute(pool)
            .await;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS trash (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flashcard_id INTEGER NOT NULL,
                hanzi VARCHAR(100) NOT NULL,
                pinyin VARCHAR(200),
                meaning VARCHAR(500),
                level INTEGER DEFAULT 0,
                deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                auto_delete_at DATETIME
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS grammar_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_type VARCHAR(50),
                title VARCHAR(200),
                level INTEGER,
                formula VARCHAR(500),
                explanation TEXT,
                examples TEXT,
                grammar_point_id INTEGER
            )
            "#,
        )
        .execute(pool)
        .await?;

        let _ = sqlx::query("ALTER TABLE grammar_notes ADD COLUMN grammar_point_id INTEGER")
            .execute(pool)
            .await;

        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(level);
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS learned_grammar_points (
                grammar_point_id INTEGER PRIMARY KEY,
                learned_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(pool)
        .await?;

        log::info!("App database tables initialized");
        Ok(())
    }

    async fn init_dict_tables(pool: &SqlitePool) -> anyhow::Result<()> {
        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
            "#,
        )
        .execute(pool)
        .await?;

        log::info!("Dictionary database indexes initialized");
        Ok(())
    }

    fn get_data_dir() -> anyhow::Result<PathBuf> {
        let data_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap()
            .join("data");

        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir)?;
        }

        Ok(data_dir)
    }
}
