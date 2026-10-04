// Erzeugt assets/textures/grain.png: kachelbares Papierkorn (AP-D, A-D-2).
// Ersatz für das SVG-feTurbulence-Korn der Website (index.html .grain), weil
// SVG-Filter in react-native-svg nicht verlässlich sind. Deterministisch (Seed).
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZE = 128;
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// RGBA-Zeilen mit Filterbyte 0; dunkle (ink) und helle Körner mit geringer Deckung
const rows = [];
for (let y = 0; y < SIZE; y += 1) {
  const row = Buffer.alloc(1 + SIZE * 4);
  for (let x = 0; x < SIZE; x += 1) {
    const r = rand();
    const dark = r < 0.5;
    const alpha = Math.floor(Math.pow(rand(), 2.2) * 60);
    const o = 1 + x * 4;
    row[o] = dark ? 29 : 255;
    row[o + 1] = dark ? 38 : 252;
    row[o + 2] = dark ? 32 : 240;
    row[o + 3] = alpha;
  }
  rows.push(row);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // Bit-Tiefe
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../assets/textures/grain.png', import.meta.url), png);
console.log(`grain.png: ${png.length} Bytes`);
