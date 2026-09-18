export const en = {
  brand: "AA Maka Production",
  brandShort: "AA Maka",
  tagline: "Sindh's music, culture and heritage — presented globally.",
  mission: "Preserving Sindhi music, poetry and culture for the next generation.",
  nav: {
    home: "Home",
    music: "Music",
    albums: "Albums",
    artists: "Artists",
    shop: "Shop",
    books: "Books",
    membership: "Membership",
    about: "About",
    stories: "Stories",
    contact: "Contact",
    account: "Account",
    cart: "Cart",
    search: "Search",
  },
  cta: {
    listenNow: "Listen Now",
    exploreMusic: "Explore Music",
    becomeMember: "Become a Member",
    shopCulture: "Shop Sindhi Culture",
    unlockFull: "Unlock Full Song",
    buyAlbum: "Buy Album",
    addToCart: "Add to cart",
    buyNow: "Buy now",
    preview: "Preview",
    subscribe: "Subscribe",
    send: "Send message",
  },
  player: {
    preview: "Preview",
    locked: "Full track is reserved for members and purchasers.",
  },
  membership: {
    exclusive: "Exclusive Music for Members",
    previewHint: "Listen to the preview — unlock the full song with membership.",
  },
  footer: {
    policies: "Policies",
    follow: "Follow AA Maka",
    newsletter: "Hear the next release first",
  },
};

export const sd = {
  brand: "اي اي مڪا پروڊڪشن",
  brandShort: "اي اي مڪا",
  tagline: "سنڌ جي موسيقي، ثقافت ۽ ورثو — دنيا تائين.",
  mission: "ايندڙ نسل لاءِ سنڌي موسيقي، شاعري ۽ ثقافت کي سانڍڻ.",
  nav: {
    home: "گهر",
    music: "موسيقي",
    albums: "البم",
    artists: "فنڪار",
    shop: "دڪان",
    books: "ڪتاب",
    membership: "رڪنيت",
    about: "اسان بابت",
    stories: "ڪهاڻيون",
    contact: "رابطو",
    account: "کاتو",
    cart: "ٽوڪري",
    search: "ڳولا",
  },
  cta: {
    listenNow: "هاڻي ٻڌو",
    exploreMusic: "موسيقي ڏسو",
    becomeMember: "رڪن بڻجو",
    shopCulture: "سنڌي ثقافت خريد ڪريو",
    unlockFull: "پوري گيت کي کوليو",
    buyAlbum: "البم خريد ڪريو",
    addToCart: "ٽوڪري ۾ وجهو",
    buyNow: "هاڻي خريد ڪريو",
    preview: "جائزو",
    subscribe: "رڪنيت وٺو",
    send: "پيغام موڪليو",
  },
  player: {
    preview: "مختصر ٻڌڻ",
    locked: "مڪمل گيت رڪنن ۽ خريدارن لاءِ محفوظ آهي.",
  },
  membership: {
    exclusive: "رڪنن لاءِ خاص موسيقي",
    previewHint: "مختصر ٽڪرو ٻڌو — مڪمل گيت لاءِ رڪنيت وٺو.",
  },
  footer: {
    policies: "پاليسيون",
    follow: "اي اي مڪا سان رهو",
    newsletter: "ايندڙ رليز سڀ کان اڳ ٻڌو",
  },
};

export type Dictionary = typeof en;
export type Locale = "en" | "sd";

export const dictionaries: Record<Locale, Dictionary> = { en, sd };

export function getDictionary(locale: string | undefined): Dictionary {
  return locale === "sd" ? sd : en;
}

export function isRtl(locale: string | undefined) {
  return locale === "sd";
}
