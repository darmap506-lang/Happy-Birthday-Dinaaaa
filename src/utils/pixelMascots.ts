/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface PixelConfettiParticle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  tx: number;
  ty: number;
  rotDeg: number;
  delaySec: number;
  durationSec: number;
}

export interface PixelMascotConfig {
  id: 'panda' | 'orange-cat';
  label: string;
  palette: Record<string, string>;
  frames: [readonly string[], readonly string[]];
}

/**
 * Converts ASCII pixel-art rows into run-length-encoded SVG rectangle descriptors.
 * Adjacent horizontal pixels with the same color are merged into a single rect.
 */
export function parsePixelRowsToRects(
  rows: readonly string[],
  palette: Record<string, string>
): PixelRect[] {
  const rects: PixelRect[] = [];

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    let x = 0;

    while (x < row.length) {
      const symbol = row[x];
      const fill = palette[symbol];

      if (!fill || symbol === '.') {
        x++;
        continue;
      }

      let runLength = 1;
      while (x + runLength < row.length && row[x + runLength] === symbol) {
        runLength++;
      }

      rects.push({
        x,
        y,
        width: runLength,
        height: 1,
        fill,
      });

      x += runLength;
    }
  }

  return rects;
}

export const PANDA_PALETTE: Record<string, string> = {
  K: '#1e1b24', // Outline, ears, eye patches, arms & legs
  W: '#ffffff', // Crisp white fur
  S: '#e2e8f0', // Soft belly/chin shading
  E: '#ffffff', // Eye sparkle
  P: '#f472b6', // Rosy cheeks
  N: '#475569', // Nose / mouth accent
  C: '#facc15', // Clap sparkle / excitement accent
  H: '#ec4899', // Birthday party hat cone (pink)
  Y: '#fde047', // Birthday party hat pom-pom, dot & gold brim
};

// 18 cols x 25 rows (rows 0..6 feature birthday party hat between ears)
export const PANDA_FRAMES: [readonly string[], readonly string[]] = [
  // Frame A: birthday hat, right paw raised, left foot forward
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KKK.KYYYYK.KKK..',
    '.KKKKKKYYYYKKKKKK.',
    '.KKKKKKKKKKKKKKKK.',
    '.KKKWWWWWWWWWWKKK.',
    '..KWWWWWWWWWWWWK..',
    '.KWWWWWWWWWWWWWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWWKEKWWWWKEKWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWPWWWWKKWWWWPWK.',
    '.KWWWWWWNNWWWWWWK.',
    '..KSSWWWWWWWWSSK..',
    '...KKKKKKKKKKKK...',
    '..KKKKWWWWWWKKKK..',
    '.KKK.KWWWWWWK.KKK.',
    '.KK..KWWWWWWK.....',
    '.....KKKKKKKK.....',
    '....KKK....KKK....',
    '...KKK......KKK...',
    '...SSS......SSS...',
  ],
  // Frame B: birthday hat, mid-stride / gentle idle shift
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KKK.KYYYYK.KKK..',
    '.KKKKKKYYYYKKKKKK.',
    '.KKKKKKKKKKKKKKKK.',
    '.KKKWWWWWWWWWWKKK.',
    '..KWWWWWWWWWWWWK..',
    '.KWWWWWWWWWWWWWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWWKEKWWWWKEKWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWPWWWWKKWWWWPWK.',
    '.KWWWWWWNNWWWWWWK.',
    '..KSSWWWWWWWWSSK..',
    '...KKKKKKKKKKKK...',
    '..KKKKWWWWWWKKKK..',
    '.KKK.KWWWWWWK.KKK.',
    '.KK..KWWWWWWK.....',
    '.....KKKKKKKK.....',
    '.....KKK..KKK.....',
    '.....KKK..KKK.....',
    '.....SSS..SSS.....',
  ],
];

export const PANDA_CLAP_FRAMES: [readonly string[], readonly string[]] = [
  // Clap Frame A: birthday hat + both paws raised open
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KKK.KYYYYK.KKK..',
    '.KKKKKKYYYYKKKKKK.',
    '.KKKKKKKKKKKKKKKK.',
    '.KKKWWWWWWWWWWKKK.',
    '..KWWWWWWWWWWWWK..',
    '.KWWWWWWWWWWWWWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWWKEKWWWWKEKWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWPWWWWKKWWWWPWK.',
    '.KWWWWWWNNWWWWWWK.',
    '..KSSWWWWWWWWSSK..',
    '.KKKKKKKKKKKKKKKK.',
    'KKK..KWWWWWWK..KKK',
    '.K...KWWWWWWK...K.',
    '.....KWWWWWWK.....',
    '.....KKKKKKKK.....',
    '....KKK....KKK....',
    '...KKK......KKK...',
    '...SSS......SSS...',
  ],
  // Clap Frame B: birthday hat + paws clapped together in front with sparks
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KKK.KYYYYK.KKK..',
    '.KKKKKKYYYYKKKKKK.',
    '.KKKKKKKKKKKKKKKK.',
    '.KKKWWWWWWWWWWKKK.',
    '..KWWWWWWWWWWWWK..',
    '.KWWWWWWWWWWWWWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWWKEKWWWWKEKWWK.',
    '.KWWKKKWWWWKKKWWK.',
    '.KWPWWWWKKWWWWPWK.',
    '.KWWWWWWNNWWWWWWK.',
    '..KSSWWWWWWWWSSK..',
    '...KKKKKKKKKKKK...',
    '...KKKWWCCWWKKK...',
    '....KKKKCCKKKK....',
    '.....KWWWWWWK.....',
    '.....KKKKKKKK.....',
    '.....KKK..KKK.....',
    '.....KKK..KKK.....',
    '.....SSS..SSS.....',
  ],
];

export const CAT_PALETTE: Record<string, string> = {
  K: '#431407', // Warm dark brown pixel outline
  O: '#fb923c', // Bright orange fur
  D: '#ea580c', // Ginger tabby stripes
  C: '#fff7ed', // Cream muzzle, tummy & paws
  I: '#f472b6', // Pink inner ears & nose
  P: '#fda4af', // Rosy cheeks
  E: '#1e1b24', // Dark eyes
  W: '#ffffff', // Eye sparkle
  H: '#38bdf8', // Birthday party hat cone (sky blue)
  Y: '#fde047', // Birthday party hat pom-pom, dot & gold brim
};

// 18 cols x 25 rows (rows 0..7 feature birthday party hat between pointy cat ears)
export const CAT_FRAMES: [readonly string[], readonly string[]] = [
  // Frame A: birthday hat, tail curved, right paw extended, walking stride
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KK..KYYYYK..KK..',
    '.KOIK.KYYYYK.KIOK.',
    '.KOOIKKKKKKKKIOOK.',
    '.KOOOOOKKKKOOOOOK.',
    '.KOOOOODDDDDOOOOK.',
    '.KOOOOOODDOOOOOOK.',
    '.KDOOOOOOOOOOOODK.',
    '.KOOWEOOOOOOWEOOK.',
    '.KOOEEOOOOOOEEOOK.',
    '.KPOOOCCIIICCOOPK.',
    '..KOOOCCKKCCOOOK..',
    '...KKKKKKKKKKKK...',
    '.KKKOOCCCCCCOOOK..',
    'KODKOOCCCCCCOOOKKK',
    '.KKKOOCCCCCCOOOK..',
    '...KDOCCCCCCODK...',
    '...KOOCCCCCCOOOK..',
    '...KKK.KKKK.KKK...',
    '...CCC......CCC...',
    '...KKK......KKK...',
  ],
  // Frame B: birthday hat, tail wags up, mid-stride paws
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KK..KYYYYK..KK..',
    '.KOIK.KYYYYK.KIOK.',
    '.KOOIKKKKKKKKIOOK.',
    '.KOOOOOKKKKOOOOOK.',
    '.KOOOOODDDDDOOOOK.',
    '.KOOOOOODDOOOOOOK.',
    '.KDOOOOOOOOOOOODK.',
    '.KOOWEOOOOOOWEOOK.',
    '.KOOEEOOOOOOEEOOK.',
    '.KPOOOCCIIICCOOPK.',
    'KKKOOOCCKKCCOOOK..',
    'KODKKKKKKKKKKKK...',
    '.KKKOOCCCCCCOOOK..',
    '...KOOCCCCCCOOOKKK',
    '...KOOCCCCCCOOOK..',
    '...KDOCCCCCCODK...',
    '...KOOCCCCCCOOOK..',
    '....KKK....KKK....',
    '....CCC....CCC....',
    '....KKK....KKK....',
  ],
];

// Surprised wind-blown orange cat frame with birthday hat
export const CAT_BLOWN_FRAME: readonly string[] = [
  '.......KYYK.......',
  '.......KHHK.......',
  '......KHHHHK......',
  '......KHYHHK......',
  '.....KHHHHHHK.....',
  '..KK..KYYYYK..KK..',
  '.KOIK.KYYYYK.KIOK.',
  '.KOOIKKKKKKKKIOOK.',
  '.KOOOOOKKKKOOOOOK.',
  '.KOOOOODDDDDOOOOK.',
  '.KOOOOOODDOOOOOOK.',
  '.KDOWWOOOOOOWWODK.',
  '.KOOWEOOOOOOWEOOK.',
  '.KOOWWOOOOOOWWOOK.',
  '.KPOOOCCIIICCOOPK.',
  'KKKOOOCCKKCCOOOK..',
  'KODKKKKKKKKKKKK...',
  '.KKKOOCCCCCCOOOKKK',
  '...KOOCCCCCCOOOK..',
  '.KKKDOCCCCCCODK...',
  '...KOOCCCCCCOOOK..',
  '...KKK.KKKK.KKK...',
  '..CCC........CCC..',
  '..KKK........KKK..',
  '..................',
];

export const CAT_CLAP_FRAMES: [readonly string[], readonly string[]] = [
  // Clap Frame A: birthday hat + both paws raised open
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KK..KYYYYK..KK..',
    '.KOIK.KYYYYK.KIOK.',
    '.KOOIKKKKKKKKIOOK.',
    '.KOOOOOKKKKOOOOOK.',
    '.KOOOOODDDDDOOOOK.',
    '.KOOOOOODDOOOOOOK.',
    '.KDOOOOOOOOOOOODK.',
    '.KOOWEOOOOOOWEOOK.',
    '.KOOEEOOOOOOEEOOK.',
    '.KPOOOCCIIICCOOPK.',
    '..KOOOCCKKCCOOOK..',
    '...KKKKKKKKKKKK...',
    '.KKKKKKKKKKKKKKKK.',
    'KKK.OOCCCCCCOO.KKK',
    'KODKOOCCCCCCOOOK.K',
    '.KKKDOCCCCCCODK...',
    '...KOOCCCCCCOOOK..',
    '...KKK.KKKK.KKK...',
    '...CCC......CCC...',
    '...KKK......KKK...',
  ],
  // Clap Frame B: birthday hat + paws clapped together in front with gold sparks (Y)
  [
    '.......KYYK.......',
    '.......KHHK.......',
    '......KHHHHK......',
    '......KHYHHK......',
    '.....KHHHHHHK.....',
    '..KK..KYYYYK..KK..',
    '.KOIK.KYYYYK.KIOK.',
    '.KOOIKKKKKKKKIOOK.',
    '.KOOOOOKKKKOOOOOK.',
    '.KOOOOODDDDDOOOOK.',
    '.KOOOOOODDOOOOOOK.',
    '.KDOOOOOOOOOOOODK.',
    '.KOOWEOOOOOOWEOOK.',
    '.KOOEEOOOOOOEEOOK.',
    '.KPOOOCCIIICCOOPK.',
    'KKKOOOCCKKCCOOOK..',
    'KODKKKKKKKKKKKK...',
    '.KK.KKKKKKKKKKK...',
    '...KOOCCYYCCOOOK..',
    '....KKKKYYKKKK....',
    '...KDOCCCCCCODK...',
    '...KOOCCCCCCOOOK..',
    '....KKK....KKK....',
    '....CCC....CCC....',
    '....KKK....KKK....',
  ],
];

// 9 cols x 9 rows: cute pixel strawberry birthday cake slice on a small plate
export const CAKE_SLICE_PALETTE: Record<string, string> = {
  K: '#431407', // Crisp dark outline
  R: '#e11d48', // Strawberry red
  G: '#22c55e', // Strawberry leaf green
  W: '#ffffff', // Whipped cream
  P: '#f472b6', // Pink icing & jam
  Y: '#fde047', // Golden sponge cake
  S: '#e2e8f0', // Ceramic plate
};

export const CAKE_SLICE_ROWS: readonly string[] = [
  '....KK...',
  '...KRRK..',
  '..KWWWGK.',
  '.KPPPPPPK',
  '.KYYYYYYK',
  '.KPPPPPPK',
  '.KYYYYYYK',
  'KKKKKKKKK',
  '.SSSSSSS.',
];

// 8 cols x 8 rows: pixel party popper / confetti cannon angled up-right
export const CONFETTI_POPPER_PALETTE: Record<string, string> = {
  K: '#334155', // Crisp outline
  G: '#facc15', // Gold stripes
  P: '#ec4899', // Hot pink stripes
  W: '#ffffff', // Muzzle flash
};

export const CONFETTI_POPPER_ROWS: readonly string[] = [
  '....KKKK',
  '...KWWPK',
  '..KPGPPK',
  '.KGGPPK.',
  '.KGGPK..',
  'KPGPK...',
  'KGGK....',
  'KKK.....',
];

const PIXEL_CONFETTI_COLORS = [
  '#ec4899', // Hot pink
  '#fbbf24', // Warm gold
  '#38bdf8', // Sky blue
  '#34d399', // Mint
  '#a855f7', // Purple
  '#f43f5e', // Coral red
];

/**
 * Generates deterministic staggered pixel-confetti particles fired continuously
 * from the party popper muzzle.
 */
export function generatePixelConfettiStream(
  originX = 21,
  originY = 20,
  waves = 3
): PixelConfettiParticle[] {
  const particles: PixelConfettiParticle[] = [];
  const durationSec = 1.65;
  const templates = [
    { tx: 9, ty: -18, rot: 120, w: 2, h: 1 },
    { tx: 13, ty: -14, rot: -150, w: 1, h: 2 },
    { tx: 5, ty: -20, rot: 180, w: 2, h: 2 },
    { tx: 15, ty: -9, rot: 95, w: 2, h: 1 },
    { tx: 2, ty: -16, rot: -110, w: 1, h: 1 },
    { tx: 11, ty: -21, rot: 210, w: 1, h: 2 },
  ];

  let id = 0;
  for (let w = 0; w < waves; w++) {
    const waveDelay = Number(((w * durationSec) / waves).toFixed(2));
    for (let t = 0; t < templates.length; t++) {
      const tpl = templates[t];
      particles.push({
        id: id++,
        x: originX,
        y: originY,
        width: tpl.w,
        height: tpl.h,
        fill: PIXEL_CONFETTI_COLORS[(w * 2 + t) % PIXEL_CONFETTI_COLORS.length],
        tx: tpl.tx + (w % 2 === 0 ? 0 : 1),
        ty: tpl.ty - (w % 2 === 0 ? 0 : 1),
        rotDeg: tpl.rot,
        delaySec: Number((waveDelay + t * 0.04).toFixed(2)),
        durationSec,
      });
    }
  }

  return particles;
}

export const PIXEL_MASCOT_CONFIGS: readonly PixelMascotConfig[] = [
  {
    id: 'panda',
    label: 'Pixel Panda bertopi ulang tahun menembakkan confetti',
    palette: PANDA_PALETTE,
    frames: PANDA_FRAMES,
  },
  {
    id: 'orange-cat',
    label: 'Pixel Kucing Orange bertopi ulang tahun menembakkan confetti',
    palette: CAT_PALETTE,
    frames: CAT_FRAMES,
  },
];

export type MascotId = PixelMascotConfig['id'];

export const PANDA_EASTER_QUIPS: readonly string[] = [
  'HBD Dina! Sehat terus yaa 🎂',
  'Confetti terus sampai pagi! 🎉',
  'Jangan lupa make a wish ✨',
  'Panda kasih tepuk tangan! 👏',
  'Semoga semua impianmu terkabul 💖',
];

export const CAT_EASTER_QUIPS: readonly string[] = [
  'Meow! Mana traktirannya? 😋',
  'Topi ultahku keren kan? 🥳',
  'Kue stroberi buat Dina! 🍰',
  'Oyen doain yang terbaik 🐾',
  'Awas ketiup angin kenceng~ 🌬️',
];

/**
 * Returns the next Easter-egg quip and wrapped index for a clicked pixel mascot.
 */
export function getNextMascotQuip(
  mascotId: MascotId,
  currentIndex: number
): { text: string; nextIndex: number } {
  const list = mascotId === 'panda' ? PANDA_EASTER_QUIPS : CAT_EASTER_QUIPS;
  const safeIdx = ((currentIndex % list.length) + list.length) % list.length;
  return {
    text: list[safeIdx],
    nextIndex: (safeIdx + 1) % list.length,
  };
}

