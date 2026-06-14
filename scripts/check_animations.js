import fs from 'fs';
import https from 'https';

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
  const content = fs.readFileSync('chars.txt', 'utf-8');
  const charsToCheck = new Set();
  
  for (const char of content) {
    if (char.trim() && char.charCodeAt(0) > 127) {
      charsToCheck.add(char);
    }
  }

  const characters = Array.from(charsToCheck);
  console.log(`Checking ${characters.length} unique characters against CDN...`);

  let missing = [];
  
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
    await delay(100);
  }

  console.log(`\n\nTotal missing animations: ${missing.length}`);
  console.log(`List of missing characters: ${missing.join('')}`);
  
  fs.writeFileSync('missing_animations.txt', missing.join(''));
};

main().catch(console.error);
