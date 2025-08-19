import fs from 'fs';

function findMissingKeys(obj1, obj2, path = '') {
  let missingKeys = [];

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
        if (obj2 && typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
          missingKeys = missingKeys.concat(findMissingKeys(obj1[key], obj2[key], newPath));
        } else if (!obj2 || !Object.prototype.hasOwnProperty.call(obj2, key)) {
          missingKeys.push(newPath);
        }
      } else if (!obj2 || !Object.prototype.hasOwnProperty.call(obj2, key)) {
        missingKeys.push(newPath);
      }
    }
  }

  return missingKeys;
}

const pt = JSON.parse(fs.readFileSync('src/locales/pt.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

const missingInEn = findMissingKeys(pt, en);

if (missingInEn.length > 0) {
  console.log('Missing keys in en.json:');
  console.log(missingInEn.join('\n'));
} else {
  console.log('No missing keys found in en.json.');
}

const missingInPt = findMissingKeys(en, pt);

if (missingInPt.length > 0) {
    console.log('\nMissing keys in pt.json (extra keys in en.json):');
    console.log(missingInPt.join('\n'));
} else {
    console.log('No extra keys found in en.json.');
}
