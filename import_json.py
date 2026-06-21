import json
import sqlite3

def main():
    db_path = "data/zh.db"
    json_path = "data/new_version_dictionary.json"

    print(f"Loading data from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Dropping old table and index...")
    cursor.execute("DROP TABLE IF EXISTS vocabulary")
    cursor.execute("DROP INDEX IF EXISTS idx_vocabulary_word")

    print("Recreating table...")
    cursor.execute("""
    CREATE TABLE vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hsk_level TEXT,
        word TEXT,
        pinyin TEXT,
        pos TEXT,
        meaning_vi TEXT,
        meaning_en TEXT
    )
    """)

    print(f"Inserting {len(data)} rows...")
    insert_sql = """
    INSERT INTO vocabulary (id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    
    # We map the keys explicitly
    values = []
    for item in data:
        values.append((
            item.get('id'),
            item.get('hsk_level'),
            item.get('word'),
            item.get('pinyin'),
            item.get('pos'),
            item.get('meaning_vi'),
            item.get('meaning_en')
        ))

    # executemany is highly optimized for bulk inserts
    cursor.executemany(insert_sql, values)
    conn.commit()

    print("Recreating index...")
    # Recreating the index AFTER bulk insert is significantly faster than doing it before
    cursor.execute("CREATE INDEX idx_vocabulary_word ON vocabulary(word)")
    conn.commit()

    # VACUUM to reclaim space and optimize the DB layout
    print("Running VACUUM to optimize database size...")
    cursor.execute("VACUUM")
    conn.commit()

    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()
