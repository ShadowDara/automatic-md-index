// create-markdown-files.js
const fs = require('fs');
const path = require('path');

const numFiles = 10; // Anzahl der Markdown-Dateien
const headingsPerFile = 100; // Anzahl der Überschriften pro Datei
const outputDir = path.join(__dirname, 'markdown_output');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

let i = 1;
let filename

let content = '';

content += `<!--$$MD_INDEX$$-->\n\n`;

for (let j = 1; j <= headingsPerFile; j++) {
  const level = (j % 6) + 1; // Wechsle durch # bis ######
  content += `${'#'.repeat(level)} Überschrift ${j} in Datei ${i}\n\n`;
}

filename = path.join(outputDir, `datei${i}.md`);
fs.writeFileSync(filename, content, 'utf8');
console.log(`Erstellt: ${filename}`);


i++
content = `
# Hallo

<!--$$MD_INDEX$$-->

## 1
## 2
### 2.1
### 2.2
### 2.3
## 3
## 4
`

filename = path.join(outputDir, `datei${i}.md`);
fs.writeFileSync(filename, content, 'utf8');
console.log(`Erstellt: ${filename}`);


i++
contest = `

# hallo

<!--$$MD_INDEX$$-->

## dsdsds

## sdvsdsd

### rrsfrw

## sdwegr

## weffew

### sgsr

#### stsreres


### ahreahjre

#### dsdds

##### dsdsjds

###### dsjdsj
`

filename = path.join(outputDir, `datei${i}.md`);
fs.writeFileSync(filename, content, 'utf8');
console.log(`Erstellt: ${filename}`);
