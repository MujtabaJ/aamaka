import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { PERMISSIONS, ROLE_PRESETS } from "../src/lib/rbac";
import { bookCovers, musicCovers, photos } from "../src/lib/photos";

const prisma = new PrismaClient();

function wavBuffer(seconds: number, freq: number) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * seconds);
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t * 3) * Math.min(1, (seconds - t) * 2);
    const sample =
      Math.sin(2 * Math.PI * freq * t) * 0.18 * env +
      Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.06 * env;
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, sample * 32767)), 44 + i * 2);
  }
  return buf;
}

function coverSvg(title: string, accent: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#1A1210"/>
  <g fill="${accent}" opacity="0.35">
    <path d="M400 40l50 100 100 50-100 50-50 100-50-100-100-50 100-50z"/>
    <path d="M160 260l30 60 60 30-60 30-30 60-30-60-60-30 60-30z"/>
    <path d="M620 520l30 60 60 30-60 30-30 60-30-60-60-30 60-30z"/>
  </g>
  <circle cx="400" cy="390" r="170" fill="none" stroke="#C4A35A" stroke-width="3"/>
  <text x="400" y="380" text-anchor="middle" fill="#C4A35A" font-size="18" font-family="Georgia" letter-spacing="6">AA MAKA</text>
  <text x="400" y="430" text-anchor="middle" fill="#F7F1E6" font-size="28" font-family="Georgia">${title}</text>
</svg>`;
}

async function writePublic(rel: string, contents: string | Buffer) {
  const full = path.join(process.cwd(), "public", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return `/${rel.replace(/\\/g, "/")}`;
}

async function writePrivate(name: string, contents: Buffer) {
  const dir = path.join(process.cwd(), "storage", "private");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), contents);
  return name;
}

async function main() {
  await prisma.playEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.albumTrack.deleteMany();
  await prisma.song.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.album.deleteMany();
  await prisma.book.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.article.deleteMany();
  await prisma.homepageHero.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.sitePage.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  const permissions = await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.create({ data: { key: p.key, groupName: p.groupName, description: p.description } }),
    ),
  );
  const permMap = Object.fromEntries(permissions.map((p) => [p.key, p]));

  const roles = {} as Record<string, { id: string }>;
  for (const [name, keys] of Object.entries(ROLE_PRESETS)) {
    roles[name] = await prisma.role.create({
      data: {
        name,
        label: name.replaceAll("_", " "),
        isSystem: true,
        permissions: { connect: keys.map((k) => ({ id: permMap[k].id })) },
      },
    });
  }

  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe_Admin_123!", 12);
  const memberHash = await bcrypt.hash("Member@12345", 12);
  const customerHash = await bcrypt.hash("Customer@12345", 12);

  const admin = await prisma.user.create({
    data: {
      email: (process.env.ADMIN_EMAIL || "admin@aamaka.local").toLowerCase(),
      name: process.env.ADMIN_NAME || "AA Maka Admin",
      passwordHash: adminHash,
      roleId: roles.SUPER_ADMIN.id,
    },
  });
  const member = await prisma.user.create({
    data: {
      email: "member@aamaka.local",
      name: "Amina Member",
      passwordHash: memberHash,
      roleId: roles.CUSTOMER.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "customer@aamaka.local",
      name: "Karim Customer",
      passwordHash: customerHash,
      roleId: roles.CUSTOMER.id,
    },
  });

  await prisma.siteSetting.create({
    data: {
      key: "site",
      value: JSON.stringify({
        siteName: "AA Maka Production",
        siteNameSd: "اي اي مڪا پروڊڪشن",
        tagline: "Sindh's music, culture and heritage — presented globally.",
        mission: "Preserving Sindhi music, poetry and culture for the next generation.",
        email: "hello@aamaka.local",
        phone: "+92 300 0000000",
        whatsapp: "",
        address: "Maka Studio, Sindh, Pakistan",
        socials: {
          youtube: "https://www.youtube.com/@aamaka",
          facebook: "https://www.facebook.com/",
          tiktok: "https://www.tiktok.com/",
          instagram: "https://www.instagram.com/",
        },
        shippingFeePaisa: 25000,
        freeShippingOverPaisa: 500000,
        taxPercent: 0,
        bankInstructions: process.env.BANK_TRANSFER_INSTRUCTIONS,
        enableCod: true,
        enableBankTransfer: true,
      }),
    },
  });

  const heroImage = photos.hero;

  await prisma.homepageHero.create({
    data: {
      kicker: "AA Maka Production",
      title: "Sindh’s music, kept alive.",
      titleSd: "سنڌ جي موسيقي، زندهه رکيل.",
      subtitle:
        "Sufi verses, folk memory and studio craft — recorded with care, offered with a preview, completed for members.",
      imageUrl: heroImage,
      ctaPrimaryLabel: "Listen Now",
      ctaPrimaryHref: "/music",
      ctaSecondaryLabel: "Explore Music",
      ctaSecondaryHref: "/music",
      ctaTertiaryLabel: "Become a Member",
      ctaTertiaryHref: "/membership",
      ctaQuaternaryLabel: "Shop Sindhi Culture",
      ctaQuaternaryHref: "/shop",
      active: true,
    },
  });

  await prisma.announcement.create({
    data: {
      message: "New member-only studio session this month — listen to the preview, unlock the full recording.",
      href: "/membership",
      active: true,
    },
  });

  const pages = [
    {
      slug: "about",
      title: "About AA Maka Production",
      body: `AA Maka Production is a Sindhi music, cultural and media house.

We record Sufi and folk voices, document poetry, and present Sindhi craft with the same care we give a master tape.

This website is the public home of that work: listen, become a member, collect albums, and take a piece of Sindh home.

The catalogue names you see in the demo represent the kind of artists and studio family associated with AA Production / Maka Studio. Demo audio is original placeholder sound — not licensed commercial recordings.`,
    },
    {
      slug: "privacy",
      title: "Privacy policy",
      body: "We store account, order and playback data needed to run the service. We do not sell personal data. Payment card numbers are never stored on our servers.",
    },
    {
      slug: "terms",
      title: "Terms",
      body: "Use of AA Maka Production services is subject to copyright. Previews are for evaluation. Full media is licensed to members and purchasers according to their plan or order.",
    },
    {
      slug: "refund",
      title: "Refund policy",
      body: "Physical products may be returned unused within 7 days where required by law. Digital albums and membership time already used are not refundable except where a file cannot be delivered.",
    },
    {
      slug: "shipping",
      title: "Shipping policy",
      body: "We ship cultural products across Pakistan. International shipping can be enabled later from Admin settings.",
    },
    {
      slug: "membership",
      title: "Membership terms",
      body: "Membership grants streaming access to premium catalogue items while the subscription is active. It is not a transfer of copyright. Early-access titles may become public later.",
    },
  ];
  for (const page of pages) await prisma.sitePage.create({ data: page });

  await prisma.faq.createMany({
    data: [
      { question: "Can I listen without an account?", answer: "Yes. Every visitor can play a short preview.", sortOrder: 1 },
      { question: "What does membership include?", answer: "Full premium audio/video, exclusive releases, early access and member discounts, according to the plan.", sortOrder: 2 },
      { question: "Do I own the files I buy?", answer: "You receive protected access to purchased albums in My Library. Files are not posted as public downloads.", sortOrder: 3 },
    ],
  });

  const genreData = [
    ["sindhi-sufi", "Sindhi Sufi", "Devotional Sindhi Sufi recordings"],
    ["sindhi-folk", "Sindhi Folk", "Village, seasonal and folk memory"],
    ["soofiyano-raag", "Soofiyano Raag", "Raag-based Sufi performance"],
    ["saraiki", "Saraiki", "Saraiki-language catalogue"],
    ["qawwali", "Qawwali", "Qawwali and related forms"],
    ["classical", "Classical", "Classical and semi-classical work"],
    ["folk", "Folk", "Broader folk recordings"],
  ];
  const genres = {} as Record<string, { id: string }>;
  for (const [slug, name, description] of genreData) {
    genres[slug] = await prisma.genre.create({ data: { slug, name, description, published: true } });
  }

  const artistSeeds = [
    {
      slug: "syed-rashid-ali-shah",
      name: "Syed Rashid Ali Shah",
      nameSd: "سيد رشيد علي شاهه",
      bio: "A voice associated with Sindhi Sufi performance — presented here as a catalogue placeholder pending licensed masters.",
    },
    {
      slug: "sodhal-faqeer-laghari",
      name: "Sodhal Faqeer Laghari",
      nameSd: "سوڍل فقير لغاري",
      bio: "Folk and faqiri tradition from Sindh, held in the AA Maka archive as a cultural reference artist.",
    },
    {
      slug: "sanam-marvi",
      name: "Sanam Marvi",
      nameSd: "سنم مروي",
      bio: "A widely known Sindhi and Sufi singer. This demo listing is a placeholder and does not include her copyrighted recordings.",
    },
    {
      slug: "muhammad-qasim-maka",
      name: "Muhammad Qasim Maka",
      nameSd: "محمد قاسم مڪا",
      bio: "Part of the Maka studio family connected with AA Production’s recording work.",
    },
    {
      slug: "aftab-qasim-maka",
      name: "Aftab Qasim Maka",
      nameSd: "آفتاب قاسم مڪا",
      bio: "Studio and production presence within the Maka family catalogue.",
    },
    {
      slug: "ali-qasim-maka",
      name: "Ali Qasim Maka",
      nameSd: "علي قاسم مڪا",
      bio: "Next-generation Maka studio artist listing for the public platform.",
    },
    {
      slug: "ahsan-qasim-maka",
      name: "Ahsan Qasim Maka",
      nameSd: "احسن قاسم مڪا",
      bio: "Maka Studio associated artist placeholder for heritage programming.",
    },
  ];

  const artists = {} as Record<string, { id: string; name: string }>;
  for (const [index, a] of artistSeeds.entries()) {
    const photo = photos.portraits[index] ?? photos.portraits[0];
    artists[a.slug] = await prisma.artist.create({
      data: {
        slug: a.slug,
        name: a.name,
        nameSd: a.nameSd,
        biography: a.bio,
        photoUrl: photo,
        coverUrl: photo,
        featured: true,
        published: true,
        socials: JSON.stringify({ youtube: "https://www.youtube.com/@aamaka" }),
      },
    });
  }

  const albumCover = photos.studio;
  const album = await prisma.album.create({
    data: {
      slug: "maka-studio-sessions",
      title: "Maka Studio Sessions",
      titleSd: "مڪا اسٽوڊيو سيشن",
      description: "A demo album of original placeholder recordings representing the AA Maka Production studio sound.",
      artistId: artists["muhammad-qasim-maka"].id,
      genreId: genres["sindhi-sufi"].id,
      coverUrl: albumCover,
      releaseDate: new Date("2024-11-01"),
      pricePaisa: 150000,
      salePricePaisa: 120000,
      accessType: "paid",
      published: true,
      featured: true,
      copyrightOwner: "AA Maka Production",
    },
  });

  const songSeeds = [
    {
      slug: "ishq-jo-darya",
      title: "Ishq Jo Darya",
      titleSd: "عشق جو درياءُ",
      artist: "syed-rashid-ali-shah",
      genre: "sindhi-sufi",
      exclusive: false,
      access: "preview",
      featured: true,
      desc: "A studio placeholder inspired by Sindhi Sufi longing — preview freely, full take for members.",
    },
    {
      slug: "saanwara-raat",
      title: "Saanwara Raat",
      titleSd: "سانوڻ رات",
      artist: "sodhal-faqeer-laghari",
      genre: "sindhi-folk",
      exclusive: false,
      access: "preview",
      featured: true,
      desc: "Rain-night folk colour, recorded as an original demo bed for the public player.",
    },
    {
      slug: "kafi-jo-rang",
      title: "Kafi Jo Rang",
      titleSd: "ڪافي جو رنگ",
      artist: "sanam-marvi",
      genre: "soofiyano-raag",
      exclusive: true,
      access: "premium",
      featured: true,
      desc: "Member-only placeholder. No third-party master was copied into this file.",
    },
    {
      slug: "maka-studio-overture",
      title: "Maka Studio Overture",
      titleSd: "مڪا اسٽوڊيو اوورچر",
      artist: "muhammad-qasim-maka",
      genre: "classical",
      exclusive: false,
      access: "free",
      featured: true,
      desc: "An original free overture introducing the Maka Studio catalogue.",
    },
    {
      slug: "early-light-session",
      title: "Early Light Session",
      titleSd: "سوير جو سيشن",
      artist: "aftab-qasim-maka",
      genre: "sindhi-sufi",
      exclusive: false,
      access: "early",
      featured: false,
      desc: "Early-access demo for members before a wider public window.",
    },
    {
      slug: "rilli-thread",
      title: "Rilli Thread",
      titleSd: "رلي جو ڌاڳو",
      artist: "ali-qasim-maka",
      genre: "folk",
      exclusive: false,
      access: "paid",
      featured: false,
      desc: "Tied to the Studio Sessions album. Purchase or membership unlocks the full file.",
    },
    {
      slug: "ajrak-evening",
      title: "Ajrak Evening",
      titleSd: "اجرڪ شام",
      artist: "ahsan-qasim-maka",
      genre: "sindhi-folk",
      exclusive: true,
      access: "premium",
      featured: true,
      desc: "Exclusive evening raga-coloured placeholder for members.",
    },
  ];

  const previewWav = wavBuffer(40, 196);
  const fullWav = wavBuffer(90, 220);

  for (const [i, s] of songSeeds.entries()) {
    const cover = musicCovers[i % musicCovers.length];
    const previewKey = await writePrivate(`${s.slug}-preview.wav`, previewWav);
    const fullKey = await writePrivate(`${s.slug}-full.wav`, fullWav);
    const previewMedia = await prisma.mediaAsset.create({
      data: {
        kind: "audio",
        visibility: "public",
        filename: `${s.slug}-preview.wav`,
        mimeType: "audio/wav",
        sizeBytes: previewWav.length,
        storageKey: previewKey,
        durationSec: 40,
      },
    });
    const fullMedia = await prisma.mediaAsset.create({
      data: {
        kind: "audio",
        visibility: "private",
        filename: `${s.slug}-full.wav`,
        mimeType: "audio/wav",
        sizeBytes: fullWav.length,
        storageKey: fullKey,
        durationSec: 90,
      },
    });
    const song = await prisma.song.create({
      data: {
        slug: s.slug,
        title: s.title,
        titleSd: s.titleSd,
        titleEn: s.title,
        artistId: artists[s.artist].id,
        singer: artists[s.artist].name,
        producer: "AA Maka Production",
        genreId: genres[s.genre].id,
        albumId: s.slug === "rilli-thread" || s.slug === "maka-studio-overture" ? album.id : null,
        language: "Sindhi",
        shortDescription: s.desc,
        lyrics: "Original placeholder lyrics for demo playback.\nNo copyrighted verse was reproduced.",
        copyrightOwner: "AA Maka Production",
        licenseInfo: "Demo original. Replace with licensed masters before public launch.",
        copyrightStatus: "owned",
        coverUrl: cover,
        youtubeUrl: "https://www.youtube.com/@aamaka",
        previewMediaId: previewMedia.id,
        fullAudioMediaId: fullMedia.id,
        durationSeconds: 90,
        previewSeconds: 40,
        accessType: s.access,
        published: true,
        featured: s.featured,
        exclusive: s.exclusive,
        earlyAccess: s.access === "early",
        releaseDate: new Date("2025-01-15"),
        seoTitle: `${s.title} | Sindhi Songs | AA Maka Production`,
        seoDescription: s.desc,
      },
    });
    if (song.albumId) {
      await prisma.albumTrack.create({
        data: { albumId: album.id, songId: song.id, position: s.slug === "maka-studio-overture" ? 1 : 2 },
      });
    }
  }

  const culture = await prisma.productCategory.create({
    data: { slug: "sindhi-culture", name: "Sindhi Culture", description: "Ajrak, topi, rilli and heritage craft", published: true, sortOrder: 1 },
  });
  const organic = await prisma.productCategory.create({
    data: { slug: "organic-products", name: "Organic Products", description: "Traditional and natural products", published: true, sortOrder: 2 },
  });
  const subcats = [
    ["ajrak", "Ajrak", culture.id],
    ["sindhi-topi", "Sindhi Topi", culture.id],
    ["rilli", "Rilli", culture.id],
    ["clothing", "Traditional clothing", culture.id],
    ["handicrafts", "Handicrafts", culture.id],
    ["gifts", "Cultural gifts", culture.id],
    ["organic-food", "Organic food", organic.id],
  ];
  const catIds = { culture: culture.id, organic: organic.id } as Record<string, string>;
  for (const [slug, name, parentId] of subcats) {
    const c = await prisma.productCategory.create({ data: { slug, name, parentId, published: true } });
    catIds[slug] = c.id;
  }

  const products = [
    { slug: "ajrak-shawl-maroon", name: "Ajrak Shawl", nameSd: "اجرڪ چادر", sku: "AAM-AJK-001", cat: "ajrak", price: 4500, sale: 3900, stock: 18, img: photos.textileRed, desc: "Hand-block inspired ajrak shawl in deep maroon and ivory." },
    { slug: "sindhi-topi-classic", name: "Sindhi Topi", nameSd: "سنڌي ٽوپي", sku: "AAM-TOP-001", cat: "sindhi-topi", price: 1800, sale: null, stock: 40, img: photos.textilePattern, desc: "Embroidered Sindhi topi with geometric crown work." },
    { slug: "rilli-throw", name: "Rilli Throw", nameSd: "رلي", sku: "AAM-RIL-001", cat: "rilli", price: 6200, sale: null, stock: 8, img: photos.textileMarket, desc: "Patchwork rilli throw for the home. Low-stock demo item." },
    { slug: "embroidered-kurta", name: "Hand-embroidered Kurta", nameSd: "ڪرتو", sku: "AAM-CLT-001", cat: "clothing", price: 7500, sale: 6800, stock: 12, img: photos.clothing, desc: "Light cotton kurta with Sindhi embroidery." },
    { slug: "clay-surahi", name: "Handmade Surahi", nameSd: "سُراهي", sku: "AAM-HND-001", cat: "handicrafts", price: 2200, sale: null, stock: 15, img: photos.pottery, desc: "Earthenware gift from the cultural shop." },
    { slug: "organic-jaggery", name: "Organic Jaggery", nameSd: "گڙ", sku: "AAM-ORG-001", cat: "organic-food", price: 850, sale: null, stock: 50, img: photos.spices, desc: "Traditional gur from approved producers." },
  ];
  for (const p of products) {
    const img = p.img;
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        nameSd: p.nameSd,
        nameEn: p.name,
        sku: p.sku,
        categoryId: catIds[p.cat],
        description: p.desc,
        shortDescription: p.desc,
        images: JSON.stringify([img]),
        pricePaisa: p.price * 100,
        salePricePaisa: p.sale ? p.sale * 100 : null,
        stock: p.stock,
        lowStockAt: 10,
        shippingInfo: "Shipped from Sindh within 3–5 working days.",
        status: "published",
        featured: true,
        seoTitle: `${p.name} | Sindhi Culture Products`,
        seoDescription: p.desc,
      },
    });
    if (p.slug === "sindhi-topi-classic") {
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, sku: "AAM-TOP-001-S", name: "Small", size: "S", stock: 10, pricePaisa: 180000 },
          { productId: product.id, sku: "AAM-TOP-001-M", name: "Medium", size: "M", stock: 20, pricePaisa: 180000 },
          { productId: product.id, sku: "AAM-TOP-001-L", name: "Large", size: "L", stock: 10, pricePaisa: 190000 },
        ],
      });
    }
  }

  await prisma.membershipPlan.createMany({
    data: [
      {
        slug: "monthly",
        name: "Monthly Member",
        nameSd: "ماهوار رڪن",
        description: "Full premium music and video for thirty days.",
        interval: "monthly",
        pricePaisa: 99000,
        trialDays: 0,
        features: JSON.stringify(["Full premium music", "Full premium videos", "Member-only releases", "Member shop discount"]),
        sortOrder: 1,
        active: true,
      },
      {
        slug: "annual",
        name: "Annual Member",
        nameSd: "سالي رڪن",
        description: "A year of the archive, billed once.",
        interval: "annual",
        pricePaisa: 999000,
        trialDays: 7,
        features: JSON.stringify(["Everything in Monthly", "7-day trial", "Early access window", "Priority listening events"]),
        sortOrder: 2,
        active: true,
      },
      {
        slug: "early-access",
        name: "Early Access Member",
        nameSd: "اڳواٽ رڪن",
        description: "Hear selected titles before public release.",
        interval: "monthly",
        pricePaisa: 149000,
        features: JSON.stringify(["Early access releases", "Full premium catalogue", "Studio notes"]),
        sortOrder: 3,
        active: true,
      },
    ],
  });

  const monthly = await prisma.membershipPlan.findUniqueOrThrow({ where: { slug: "monthly" } });
  await prisma.subscription.create({
    data: {
      userId: member.id,
      planId: monthly.id,
      status: "active",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      paymentProvider: "seed",
      paymentReference: "seed_member",
    },
  });

  await prisma.coupon.create({
    data: {
      code: "SINDH10",
      type: "percent",
      value: 10,
      minOrderPaisa: 100000,
      memberOnly: false,
      active: true,
    },
  });

  await prisma.article.createMany({
    data: [
      {
        slug: "history-of-sindhi-music",
        title: "A short history of Sindhi music",
        excerpt: "From kafi to studio tape — how a language kept its songs.",
        body: "Sindhi music is a living conversation between poetry, raag and the land. AA Maka Production records that conversation for listeners who may be far from the Indus.",
        coverUrl: photos.concert,
        published: true,
        featured: true,
        publishedAt: new Date(),
        authorName: "AA Maka Production",
      },
      {
        slug: "sufi-poetry-in-the-studio",
        title: "Sufi poetry in the studio",
        excerpt: "How a verse becomes a take, without emptying it of breath.",
        body: "The studio is not a museum. It is a room where a line of Sindhi verse is given microphone, silence and time.",
        coverUrl: photos.studio,
        published: true,
        publishedAt: new Date(),
        authorName: "AA Maka Production",
      },
      {
        slug: "sindhi-instruments",
        title: "Sindhi instruments",
        excerpt: "Alghoza, dholak, benjo — companions of the voice.",
        body: "These notes introduce instruments often heard beside Sindhi song, photographed here as studio companions.",
        coverUrl: photos.violin,
        published: true,
        publishedAt: new Date(),
        authorName: "AA Maka Production",
      },
    ],
  });

  const bookSeeds = [
    {
      slug: "risalo-companion",
      title: "A Reader's Companion to Shah Jo Risalo",
      titleSd: "شاهه جو رسالو — پڙهندڙ جو ساٿي",
      author: "AA Maka Production",
      category: "poetry",
      format: "paperback",
      pages: 248,
      price: 1800,
      sale: 1590,
      cover: bookCovers[0],
      excerpt: "A studio-side companion to Sindhi Sufi verse — not a reprint of the Risalo itself.",
      description: "Written for listeners who want context around Shah Abdul Latif Bhittai's world: raag, landscape and how a verse reaches the microphone. Original editorial text by AA Maka Production.",
    },
    {
      slug: "voices-of-the-kafi",
      title: "Voices of the Kafi",
      titleSd: "ڪافي جون آوازون",
      author: "Maka Studio Editorial",
      category: "sufi",
      format: "hardcover",
      pages: 192,
      price: 2400,
      sale: null,
      cover: bookCovers[1],
      excerpt: "Essays on kafi performance, breath and the Sindhi language of devotion.",
      description: "Short essays on how kafi is held in the room — from faqiri gatherings to the Maka studio floor.",
    },
    {
      slug: "sindhi-folk-tales",
      title: "Sindhi Folk Tales for the Next Generation",
      titleSd: "ايندڙ نسل لاءِ سنڌي لوڪ ڪهاڻيون",
      author: "AA Maka Archive",
      category: "folk",
      format: "paperback",
      pages: 160,
      price: 1200,
      sale: null,
      cover: bookCovers[2],
      excerpt: "Retold village stories, written for families who want the language kept close.",
      description: "Original retellings in a bilingual spirit. These are newly written versions for this catalogue, not scanned copyrighted collections.",
    },
    {
      slug: "studio-and-the-dargah",
      title: "The Studio and the Dargah",
      titleSd: "اسٽوڊيو ۽ درگاهه",
      author: "Aftab Qasim Maka",
      category: "music",
      format: "ebook",
      pages: 128,
      price: 790,
      sale: null,
      cover: bookCovers[3],
      excerpt: "Notes on recording Sindhi sacred song without emptying it of air.",
      description: "A digital notebook from the Maka studio on microphone placement, silence, and respect. Access appears in My Library after purchase.",
    },
    {
      slug: "ajrak-cloth-of-memory",
      title: "Ajrak: Cloth of Memory",
      titleSd: "اجرڪ: ياد جو ڪپڙو",
      author: "AA Maka Production",
      category: "history",
      format: "hardcover",
      pages: 176,
      price: 2600,
      sale: 2200,
      cover: photos.textileRed,
      excerpt: "Pattern, dye and the geometry that travels from Sindh to the world.",
      description: "A visual-cultural essay on ajrak as living cloth — written for the shop and the archive together.",
    },
    {
      slug: "letters-from-bhit",
      title: "Letters from Bhit",
      titleSd: "ڀٽ جا خط",
      author: "AA Maka Editorial",
      category: "poetry",
      format: "paperback",
      pages: 112,
      price: 990,
      sale: null,
      cover: bookCovers[4],
      excerpt: "Imagined letters walking the road between Bhit Shah and the modern studio.",
      description: "Original literary sketches. Not historical correspondence, and not a transcription of copyrighted verse.",
    },
    {
      slug: "sindhi-rhymes",
      title: "Children's Sindhi Rhymes",
      titleSd: "ٻارن لاءِ سنڌي گيتڙا",
      author: "AA Maka Production",
      category: "children",
      format: "paperback",
      pages: 64,
      price: 650,
      sale: null,
      cover: bookCovers[6],
      excerpt: "Short rhymes to keep Sindhi in the mouth of the next generation.",
      description: "Newly written children's rhymes for the AA Maka catalogue, illustrated with archive photography.",
    },
    {
      slug: "indus-evening-poems",
      title: "Indus Evening: Selected Poems",
      titleSd: "سنڌو جي شام",
      author: "AA Maka Poets",
      category: "poetry",
      format: "ebook",
      pages: 96,
      price: 490,
      sale: null,
      cover: bookCovers[5],
      excerpt: "A small digital chapbook of original Sindhi-English poems around river, dusk and song.",
      description: "Original poems commissioned for this platform. Digital access is granted to the purchaser's library.",
    },
  ];

  for (const b of bookSeeds) {
    await prisma.book.create({
      data: {
        slug: b.slug,
        title: b.title,
        titleSd: b.titleSd,
        titleEn: b.title,
        author: b.author,
        category: b.category,
        format: b.format,
        language: "Sindhi / English",
        pages: b.pages,
        description: b.description,
        excerpt: b.excerpt,
        coverUrl: b.cover,
        pricePaisa: b.price * 100,
        salePricePaisa: b.sale ? b.sale * 100 : null,
        stock: b.format === "ebook" ? 999 : 24,
        featured: true,
        published: true,
        publisher: "AA Maka Production",
        seoTitle: `${b.title} | Sindhi Books`,
        seoDescription: b.excerpt,
      },
    });
  }

  await prisma.notification.create({
    data: {
      audience: "admin",
      type: "seed",
      title: "Platform seeded",
      body: "Demo catalogue, memberships and shop are ready. Change the admin password before production.",
      href: "/admin",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${admin.email}`);
  console.log("Member: member@aamaka.local / Member@12345");
  console.log("Customer: customer@aamaka.local / Customer@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
