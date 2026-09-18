#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/media/photos"
mkdir -p "$DIR" "$ROOT/public/media/products" "$ROOT/public/media/books" "$ROOT/public/media/covers"

fetch() {
  local id="$1"
  local out="$2"
  local w="${3:-1600}"
  echo "Downloading $out"
  curl -fsSL -A "AAMakaProduction/1.0 (cultural archive)" \
    "https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80" \
    -o "$out"
}

# Cinematic landscape / desert — homepage hero
fetch photo-1509316785289-025f5b846b35 "$DIR/hero.jpg" 2000
# Night mountains — cultural story banner
fetch photo-1519681393784-d120267933ba "$DIR/culture.jpg" 1800
# Music studio
fetch photo-1511379938547-c1f69419868d "$DIR/studio.jpg" 1400
# Concert / performance
fetch photo-1493225457124-a3eb161ffa5f "$DIR/concert.jpg" 1400
# Violin / classical
fetch photo-1465847899084-d164df4ded48 "$DIR/violin.jpg" 1200
# Acoustic guitar
fetch photo-1514320291840-2e0a9bf2a9ae "$DIR/guitar.jpg" 1200
# Vinyl / listening
fetch photo-1511671782779-c97d3d27a1d4 "$DIR/listening.jpg" 1200
# Drum
fetch photo-1519892300165-cb5542fb47c7 "$DIR/drum.jpg" 1200
# Microphone
fetch photo-1478737270239-2f02b77fc618 "$DIR/mic.jpg" 1200

# Artist portraits (illustrative, not the named singers)
fetch photo-1507003211169-0a1dd7228f2d "$DIR/portrait-1.jpg" 900
fetch photo-1500648767791-00dcc994a43e "$DIR/portrait-2.jpg" 900
fetch photo-1531123897727-8f129e1688ce "$DIR/portrait-3.jpg" 900
fetch photo-1472099645785-5658abf4ff4e "$DIR/portrait-4.jpg" 900
fetch photo-1506794778202-cad84cf45f1d "$DIR/portrait-5.jpg" 900
fetch photo-1539571696357-5a69c17a67c6 "$DIR/portrait-6.jpg" 900
fetch photo-1508214751196-bcfd4ed5f1ea "$DIR/portrait-7.jpg" 900

# Textiles, crafts, food
fetch photo-1558618666-fcd25c85cd64 "$DIR/textile-red.jpg" 1200
fetch photo-1578662996442-48f60103fc96 "$DIR/textile-pattern.jpg" 1200
fetch photo-1601924993426-16cc04d2aa20 "$DIR/textile-market.jpg" 1200
fetch photo-1489987707025-941c8cddfbf5 "$DIR/clothing.jpg" 1200
fetch photo-1610701596007-11502861dcfa "$DIR/pottery.jpg" 1200
fetch photo-1596040033229-a9821ebd058d "$DIR/spices.jpg" 1200

# Books & manuscripts
fetch photo-1481627834876-b7833e8f5570 "$DIR/books-library.jpg" 1200
fetch photo-1512820790803-83ca734da794 "$DIR/books-stack.jpg" 1200
fetch photo-1544947950-fa07a98d237f "$DIR/book-open.jpg" 1200
fetch photo-1524995997946-a1c2e315a42f "$DIR/books-shelf.jpg" 1200
fetch photo-1507842217343-583bb7270b66 "$DIR/library-hall.jpg" 1200
fetch photo-1524578271613-d050e891b52a "$DIR/old-books.jpg" 1200
fetch photo-14565130808-af504592aa9e "$DIR/reading.jpg" 1200
fetch photo-1455390582262-044cdead277a "$DIR/writing.jpg" 1200

echo "Photos downloaded to $DIR"
ls -lh "$DIR" | awk '{print $5, $9}'
