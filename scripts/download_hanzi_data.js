const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const DB_PATH = path.join(__dirname, '../data/zh.db');
const HANZI_DATA_DIR = path.join(__dirname, '../public/hanzi_data');

// Ensure directory exists
if (!fs.existsSync(HANZI_DATA_DIR)) {
  fs.mkdirSync(HANZI_DATA_DIR, { recursive: true });
}

// Helper to download a file
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        response.resume(); // Consume response data to free up memory
        reject(new Error(`Request Failed With a Status Code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

  const charsToDownload = new Set();

  const addChars = (str) => {
    if (!str) return;
    for (const char of str) {
      // Basic check to see if it's a CJK character (or component)
      const code = char.charCodeAt(0);
      if (code > 127) {
        charsToDownload.add(char);
      }
    }
  };

  console.log("Reading database...");

  const queries = [
    new Promise((resolve, reject) => {
      db.each("SELECT character, decomposition FROM decomposition_details", (err, row) => {
        if (err) return reject(err);
        addChars(row.character);
        addChars(row.decomposition);
      }, resolve);
    }),
    new Promise((resolve, reject) => {
      db.each("SELECT character FROM decomposition_radicals", (err, row) => {
        if (err) return reject(err);
        addChars(row.character);
      }, resolve);
    }),
    new Promise((resolve, reject) => {
      db.each("SELECT word FROM vocabulary", (err, row) => {
        if (err) return reject(err);
        addChars(row.word);
      }, resolve);
    })
  ];

  await Promise.all(queries);
  db.close();

  const characters = Array.from(charsToDownload);
  console.log(`Found ${characters.length} unique characters/components.`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const dest = path.join(HANZI_DATA_DIR, `${char}.json`);
    
    if (fs.existsSync(dest)) {
      skipCount++;
      continue;
    }

    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;
    
    try {
      await downloadFile(url, dest);
      successCount++;
      process.stdout.write(`\rDownloaded ${successCount} files...`);
      // Small delay to prevent rate limiting
      await delay(50);
    } catch (err) {
      failCount++;
      // It's normal for some special components (PUA) or rare chars to not exist
      // console.log(`\nFailed to download ${char} (${char.charCodeAt(0).toString(16)}): ${err.message}`);
    }
  }

  console.log(`\nDone! Skipped (already exist): ${skipCount}, Downloaded: ${successCount}, Failed (not found on CDN): ${failCount}`);
};

main().catch(console.error);
