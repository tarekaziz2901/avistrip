const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const FOLDERS = ['cover', 'feed', 'group', 'funny', 'romantic', 'food', 'moments', 'official', 'personal'];

function scanFolder(folder) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return [];

  const pattern = new RegExp('^' + folder + '(\\d+)$', 'i');
  const photos = [];

  for (const file of fs.readdirSync(folderPath)) {
    const ext = path.extname(file).slice(1).toLowerCase();
    if (!EXTENSIONS.includes(ext)) continue;

    const name = path.basename(file, path.extname(file));
    const match = name.match(pattern);
    if (!match) continue;

    photos.push({
      src: folder + '/' + file,
      index: parseInt(match[1], 10),
      folder,
      prefix: folder
    });
  }

  return photos.sort((a, b) => a.index - b.index);
}

const result = { source: 'json', folders: {} };
for (const folder of FOLDERS) {
  result.folders[folder] = scanFolder(folder);
}

const out = path.join(__dirname, 'photos.json');
fs.writeFileSync(out, JSON.stringify(result));
console.log('photos.json generated —', Object.entries(result.folders).map(([k, v]) => k + ':' + v.length).join(', '));
