/** Openly licensed Unsplash photographs used as illustrative cultural imagery. */

const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photos = {
  hero: u("photo-1493225457124-a3eb161ffa5f", 2000),
  culture: u("photo-1519681393784-d120267933ba", 1800),
  studio: u("photo-1511379938547-c1f69419868d"),
  concert: u("photo-1493225457124-a3eb161ffa5f"),
  violin: u("photo-1507838153414-b4b713384a76"),
  guitar: u("photo-1514320291840-2e0a9bf2a9ae"),
  listening: u("photo-1511671782779-c97d3d27a1d4"),
  drum: u("photo-1519892300165-cb5542fb47c7"),
  mic: u("photo-1478737270239-2f02b77fc618"),
  portraits: [
    u("photo-1507003211169-0a1dd7228f2d", 900),
    u("photo-1500648767791-00dcc994a43e", 900),
    u("photo-1531123897727-8f129e1688ce", 900),
    u("photo-1472099645785-5658abf4ff4e", 900),
    u("photo-1506794778202-cad84cf45f1d", 900),
    u("photo-1539571696357-5a69c17a67c6", 900),
    u("photo-1544005313-94ddf0286df2", 900),
  ],
  textileRed: u("photo-1558618666-fcd25c85cd64"),
  textilePattern: u("photo-1578662996442-48f60103fc96"),
  textileMarket: u("photo-1472851294608-062f824d29cc"),
  clothing: u("photo-1523381210434-271e8be1f52b"),
  pottery: u("photo-1610701596007-11502861dcfa"),
  spices: u("photo-1596040033229-a9821ebd058d"),
  booksLibrary: u("photo-1481627834876-b7833e8f5570"),
  booksStack: u("photo-1512820790803-83ca734da794"),
  bookOpen: u("photo-1544947950-fa07a98d237f"),
  booksShelf: u("photo-1524995997946-a1c2e315a42f"),
  libraryHall: u("photo-1507842217343-583bb7270b66"),
  oldBooks: u("photo-1532012197267-da84d127e765"),
  reading: u("photo-1541963463532-d68292c34b19"),
  writing: u("photo-1455390582262-044cdead277a"),
};

export const musicCovers = [
  photos.studio,
  photos.concert,
  photos.violin,
  photos.guitar,
  photos.listening,
  photos.drum,
  photos.mic,
];

export const bookCovers = [
  photos.bookOpen,
  photos.booksStack,
  photos.oldBooks,
  photos.booksLibrary,
  photos.libraryHall,
  photos.reading,
  photos.booksShelf,
  photos.writing,
];
