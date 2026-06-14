const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/zh.db');

const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    }).on('error', () => resolve(false)).end();
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const main = async () => {
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
  const charsToCheck = new Set();

  const addChars = (str) => {
    if (!str) return;
    for (const char of str) {
      if (char.charCodeAt(0) > 127) {
        charsToCheck.add(char);
      }
    }
  };

  const queries = [
    new Promise((resolve) => db.each("SELECT character, decomposition FROM decomposition_details", (err, row) => {
      if (!err) {
        addChars(row.character);
        addChars(row.decomposition);
      }
    }, resolve)),
    new Promise((resolve) => db.each("SELECT character FROM decomposition_radicals", (err, row) => {
      if (!err) addChars(row.character);
    }, resolve)),
    new Promise((resolve) => db.each("SELECT character, decomposition FROM decomposition_specials", (err, row) => {
      if (!err) {
        addChars(row.character);
        addChars(row.decomposition);
      }
    }, resolve)),
  ];

  await Promise.all(queries);
  db.close();

  const characters = Array.from(charsToCheck);
  console.log(`Checking ${characters.length} unique characters against CDN...`);

  let missing = [];
  
  // Process in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < characters.length; i += BATCH_SIZE) {
    const batch = characters.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(batch.map(async (char) => {
      const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;
      const exists = await checkUrl(url);
      return { char, exists };
    }));

    for (const res of results) {
      if (!res.exists) {
        missing.push(res.char);
      }
    }

    process.stdout.write(`\rChecked ${Math.min(i + BATCH_SIZE, characters.length)} / ${characters.length} (Missing: ${missing.length})`);
    await delay(100); // polite delay
  }

  console.log(`\n\nTotal missing animations: ${missing.length}`);
  console.log(`List of missing characters: ${missing.join(', ')}`);
};

main().catch(console.error);
