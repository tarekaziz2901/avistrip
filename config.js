/* ============================================================
   ✏️ CUSTOMIZE HERE — captions, messages & site settings
   ============================================================
   
   PHOTO FOLDERS (add images with these names):
   
   cover/          → cover1.jpg          (hero background)
   feed/           → feed1.jpg … feed50.jpg
   group/          → group1.jpg … group50.jpg
   funny/          → funny1.jpg … funny100.jpg
   romantic/       → romantic1.jpg … romantic100.jpg
   food/           → food1.jpg … food100.jpg
   moments/        → moments1.jpg … moments100.jpg
   official/       → official1.jpg … official100.jpg
   personal/       → personal1.jpg … personal100.jpg
   
   Just drop photos in the folder — the site finds them automatically.
   Edit captions below for each photo number (1, 2, 3…).
   ============================================================ */

const SITE_CONFIG = {

  // Max photos per folder
  maxPhotos: 100,
  scanBatchSize: 20,
  scanTimeout: 300,

  // Supported image types
  extensions: ['jpg', 'jpeg', 'png', 'webp'],

  // ── Cover Page ──
  cover: {
    // Uses cover/cover1.jpg — change number here if needed
    photoIndex: 1,
    subtitle: '✨ Our Journey',
    quote: 'Every picture tells a story,<br>and every story becomes a memory.',
    buttonText: 'Begin Our Adventure ❤️'
  },

  // ── Instagram Feed (feed/ folder) ──
  feed: {
    username: 'our_journey',
    captions: {
      1: {
        place: '📍 Avis, Portugal',
        date: '🗓 A day to remember',
        caption: 'Everyone hand on hand 😂',
        letter: "It wasn't perfect, but that's what made it unforgettable.",
        likes: 247
      },
      2: {
        place: '📍  Avis, Portugal',
        date: '🗓 A day to remember',
        caption: 'Beer also made us more adventurous and we ended up in a field 🌾',
        letter: 'Getting lost together is still going somewhere beautiful.',
        likes: 189
      },
      3: {
        place: '📍 Lisbon, Portugal',
        date: '🗓 A day to remember',
        caption: 'Sunny day and endless conversations ☕',
        letter: 'Home is wherever we are together.',
        likes: 312
      },
      _default: {
        place: '📍 Somewhere beautiful',
        date: '🗓 A day to remember',
        caption: 'Another chapter in our story ❤️',
        letter: 'Every moment with you is a treasure.',
        likes: 100
      }
    }
  },

  // ── Group Slider (group/ folder) ──
  group: {
    captions: {
      1: { title: 'Squad Goals', desc: 'The crew that laughs together, stays together' },
      2: { title: 'Adventure Day', desc: 'No plan, no problem — just us and the open road' },
      3: { title: 'Golden Hour Gang', desc: 'Caught the sunset and each other smiling' },
      _default: { title: 'Group Moment #{n}', desc: 'Memories made together' }
    }
  },

  // ── Funny Polaroids (funny/ folder) ──
  funny: {
    captions: {
      1: { caption: 'That face when the food finally arrived 🍕', emoji: '😂' },
      2: { caption: 'Plot twist: we were both wrong', emoji: '🤣' },
      3: { caption: 'Professional photobombers since day one', emoji: '📸' },
      4: { caption: 'Attempt #47 at a normal selfie', emoji: '😜' },
      _default: { caption: 'Funny moment #{n}', emoji: '😂' }
    }
  },

  // ── Romantic (romantic/ folder) ──
  romantic: {
    captions: {
      1: { caption: 'Every moment with you feels like a dream 💕', emoji: '❤️' },
      2: { caption: 'My favorite person in my favorite place', emoji: '💑' },
      3: { caption: 'Sun bruning but we are enjoying the moment', emoji: '🌅' },
      _default: { caption: 'Romantic moment #{n}', emoji: '❤️' }
    }
  },

  // ── Food (food/ folder) ──
  food: {
    captions: {
      1: { caption: 'First bite, best bite 🍕', emoji: '😋' },
      2: { caption: 'Food coma incoming', emoji: '🤤' },
      3: { caption: 'We came for the view, stayed for the food', emoji: '🍜' },
      _default: { caption: 'Food moment #{n}', emoji: '🍕' }
    }
  },

  // ── Special Moments (moments/ folder) ──
  moments: {
    captions: {
      1: { caption: "A day we'll never forget", emoji: '✨' },
      2: { caption: 'Right place, right time', emoji: '📸' },
      3: { caption: 'Little moment, big memory', emoji: '💫' },
      _default: { caption: 'Special moment #{n}', emoji: '📸' }
    }
  },

  // ── Polaroid sections (drives script.js — one grid per folder) ──
  polaroidSections: [
    { key: 'funny',    gridId: 'polaroidGrid', emoji: '😂' },
    { key: 'romantic', gridId: 'romanticGrid', emoji: '❤️' },
    { key: 'food',     gridId: 'foodGrid',     emoji: '🍕' },
    { key: 'moments',  gridId: 'momentsGrid',  emoji: '📸' }
  ],

  // ── Official Moments (official/ folder) ──
  official: {
    captions: {
      1: { title: ' Day of connection', desc: 'Years of hard work, one proud moment' },
      2: { title: 'Celebration Moment', desc: 'Dressed up, hearts full, memories made' },
      3: { title: 'Milestone Reached', desc: 'Every achievement sweeter together' },
      _default: { title: 'Official Moment #{n}', desc: 'A milestone worth celebrating' }
    }
  },

  // ── Personal Memories (personal/ folder) ──
  personal: {
    captions: {
      1: { caption: 'Mirror selfie ☕' },
      2: { caption: 'Sunset chasers 🌅' },
      3: { caption: 'Just us being us' },
      _default: { caption: 'Personal memory #{n}' }
    }
  },

  // ── Gallery categories (maps folder → filter label) ──
  gallery: {
    categories: ['All', 'Funny 😂', 'Romantic 💕', 'Food 🍕', 'Special 📸', 'Official 🎓', 'Personal ❤️'],
    sources: [
      { folder: 'funny',    category: 'Funny 😂' },
      { folder: 'romantic', category: 'Romantic 💕' },
      { folder: 'food',     category: 'Food 🍕' },
      { folder: 'moments',  category: 'Special 📸' },
      { folder: 'official', category: 'Official 🎓' },
      { folder: 'personal', category: 'Personal ❤️' }
    ],
    captions: {
      _default: { caption: 'Memory #{n}' }
    }
  },

  // ── Memory Letters (text only — no photos) ──
  letters: [
    {
      label: 'Letter #1',
      title: 'Dear Everyone,',
      body: [
        'Thank you for making every journey unforgettable.',
        'From silly moments to important milestones, every memory means something special.',
        'You turn ordinary days into stories worth telling.',
        '❤️ Forever yours'
      ]
    },
    {
      label: 'Letter #2',
      title: 'To My Favorite Person,',
      body: [
        'Remember that time we got completely lost and found the best view?',
        "That's us — always finding magic in the unexpected.",
        "I wouldn't trade a single moment.",
        '💌 With all my love'
      ]
    },
    {
      label: 'Letter #3',
      title: 'A Little Note,',
      body: [
        'Every photo in this scrapbook is a piece of our story.',
        "The funny ones, the messy ones, the perfect ones — they're all ours.",
        "Here's to a million more.",
        '✨ Always'
      ]
    }
  ],

  // ── Stats (Photos count updates automatically) ──
  stats: {
    trips: 15,
    countries: 4
  },

  // ── Typewriter (Personal section) ──
  typewriterPhrases: [
    'Every sunset reminds me of you...',
    'Selfies, food pics, and everything in between...',
    "These little moments? They're everything.",
    'Our story, one photo at a time ❤️'
  ],

  // ── Music (add .mp3 files to project root) ──
  music: [
    { src: 'music.mp3', title: 'Romantic Journey' },
    { src: 'music2.mp3', title: 'Soft Memories' }
  ],

  // ── Final Page ──
  final: {
    question: 'Will you continue this journey with me? ❤️',
    yesMessage: '"Then let\'s create endless memories together."',
    noTexts: ['NO 😜', 'No 😏', 'Really?', 'Think again 😂', 'Nice try 😜', 'Impossible ❤️']
  }
};
