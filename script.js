/* ============================================================
   Our Journey — Memory Scrapbook
   Auto-loads photos from folders · Edit captions in config.js
   ============================================================ */

const PHOTO_STORE = {};

const PHOTO_KEYS = ['cover', 'feed', 'group', 'funny', 'romantic', 'food', 'moments', 'official', 'personal'];

/* ── Fast file check ── */
function fileExists(url) {
  const ms = SITE_CONFIG.scanTimeout || 300;
  return Promise.race([
    fetch(url, { method: 'HEAD', cache: 'no-store' }).then(r => r.ok).catch(() => false),
    new Promise(r => setTimeout(() => r(false), ms))
  ]);
}

async function findPhotoAtIndex(folder, prefix, index) {
  const tries = SITE_CONFIG.extensions.map(ext => `${folder}/${prefix}${index}.${ext}`);
  const results = await Promise.all(tries.map(fileExists));
  const hit = results.findIndex(Boolean);
  return hit >= 0 ? { src: tries[hit], index, folder, prefix } : null;
}

async function discoverPhotos(folder, prefix, max) {
  const limit = max || SITE_CONFIG.maxPhotos || 100;
  const batch = SITE_CONFIG.scanBatchSize || 20;
  const found = [];

  for (let start = 1; start <= limit; start += batch) {
    const end = Math.min(start + batch - 1, limit);
    const chunk = await Promise.all(
      Array.from({ length: end - start + 1 }, (_, i) => findPhotoAtIndex(folder, prefix, start + i))
    );
    chunk.filter(Boolean).forEach(p => found.push(p));
  }
  return found.sort((a, b) => a.index - b.index);
}

async function loadAllPhotos() {
  try {
    const res = await fetch('photos.php', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.source === 'php' && data.folders) {
        PHOTO_KEYS.forEach(key => {
          PHOTO_STORE[key] = data.folders[key] || [];
        });
        return;
      }
    }
  } catch (e) {
    console.warn('photos.php unavailable, scanning folders…', e);
  }

  const scans = await Promise.all(
    PHOTO_KEYS.map(key => discoverPhotos(key, key, key === 'cover' ? 5 : undefined))
  );
  PHOTO_KEYS.forEach((key, i) => { PHOTO_STORE[key] = scans[i]; });
}

/* ── Get caption from config, with {n} placeholder support ── */
function getCaption(section, index, defaults) {
  const sectionCfg = SITE_CONFIG[section];
  const map = sectionCfg?.captions || sectionCfg || {};
  const entry = map[index] || map._default || defaults || {};
  const result = { ...entry };

  Object.keys(result).forEach(key => {
    if (typeof result[key] === 'string') {
      result[key] = result[key].replace(/\{n\}/g, index);
    }
  });
  return result;
}

/* ── Empty state placeholder ── */
function emptyState(message) {
  return `<div class="empty-state"><span>📷</span><p>${message}</p><code>See config.js for folder names</code></div>`;
}

/* ============================================================
   INIT — discover all folders, then build UI
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  showLoader(true);

  /* Static UI works immediately — don't wait for photos */
  applyCoverText();
  initCover();
  initMusic();
  initLetters();
  initFinal();
  initLightbox();

  try {
    await loadAllPhotos();
    buildGalleryFromStore();

    PHOTO_STORE.totalCount = PHOTO_KEYS
      .filter(k => k !== 'cover')
      .reduce((sum, key) => sum + (PHOTO_STORE[key]?.length || 0), 0);

    updateLoaderText(`Found ${PHOTO_STORE.totalCount} photos`);

    initCoverBackground();
    initFloatingHearts();
    initFeed();
    initSlider();
    initPolaroidSections();
    initOfficial();
    initPersonal();
    initGallery();
    initStats();
    initScrollReveal();
    initFireflies();
    bindImageErrors();
  } catch (err) {
    console.error('Failed to load photos:', err);
    updateLoaderText('Could not load photos — check console');
  } finally {
    showLoader(false);
  }
});

/* ── Build gallery from already-loaded folders (no duplicate scanning) ── */
function buildGalleryFromStore() {
  PHOTO_STORE.gallery = [];
  SITE_CONFIG.gallery.sources.forEach(({ folder, category }) => {
    (PHOTO_STORE[folder] || []).forEach(p => {
      PHOTO_STORE.gallery.push({ ...p, category });
    });
  });
}

function showLoader(show) {
  let loader = document.getElementById('pageLoader');
  if (!loader && show) {
    loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-heart">❤️</div><p id="loaderText">Loading memories...</p>';
    document.body.appendChild(loader);
  }
  if (loader) {
    loader.classList.toggle('hidden', !show);
    if (!show) setTimeout(() => loader.remove(), 400);
  }
}

function updateLoaderText(msg) {
  const el = document.getElementById('loaderText');
  if (el) el.textContent = msg;
}

function bindImageErrors() {
  document.querySelectorAll('img:not([data-bound])').forEach(img => {
    img.dataset.bound = '1';
    img.loading = img.loading || 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => img.classList.add('img-broken'), { once: true });
  });
}

function applyCoverText() {
  const cfg = SITE_CONFIG.cover;
  const subtitle = document.querySelector('.cover-subtitle');
  const title = document.querySelector('.cover-title');
  const btn = document.getElementById('beginBtn');
  if (subtitle) subtitle.textContent = cfg.subtitle;
  if (title) title.innerHTML = cfg.quote;
  if (btn) btn.textContent = cfg.buttonText;
}

/* ── Cover Page ── */
function initCover() {
  document.getElementById('beginBtn').addEventListener('click', () => {
    document.getElementById('cover').classList.add('hidden');
    const main = document.getElementById('mainContent');
    main.classList.remove('main-hidden');
    main.classList.add('visible');
    setTimeout(() => { document.getElementById('cover').style.display = 'none'; }, 800);
  });
}

function initCoverBackground() {
  const bg = document.querySelector('.cover-bg');
  if (!bg) return;
  const idx = SITE_CONFIG.cover.photoIndex || 1;
  const coverPhoto = (PHOTO_STORE.cover || []).find(p => p.index === idx) || PHOTO_STORE.cover?.[0];
  if (coverPhoto) {
    bg.style.backgroundImage = `url('${coverPhoto.src}')`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';
  } else {
    bg.style.background = 'linear-gradient(135deg, #1a1530 0%, #c96b7f 50%, #1a1530 100%)';
  }
}

/* ── Music Player ── */
let currentTrack = 0;
let musicPlaying = false;

function initMusic() {
  const tracks = SITE_CONFIG.music;
  if (!tracks.length) return;

  const audio = document.getElementById('music');
  const toggle = document.getElementById('musicToggle');
  const next = document.getElementById('musicNext');
  const title = document.getElementById('musicTitle');

  function loadTrack(index) {
    currentTrack = index;
    audio.src = tracks[index].src;
    title.textContent = tracks[index].title;
    if (musicPlaying) audio.play().catch(() => {});
  }

  loadTrack(0);

  toggle.addEventListener('click', () => {
    if (musicPlaying) {
      audio.pause();
      toggle.textContent = '▶';
      musicPlaying = false;
    } else {
      audio.play().catch(() => {});
      toggle.textContent = '⏸';
      musicPlaying = true;
    }
  });

  next.addEventListener('click', () => {
    loadTrack((currentTrack + 1) % tracks.length);
  });
}

/* ── Floating Hearts ── */
function initFloatingHearts() {
  document.querySelectorAll('.floating-hearts').forEach(container => {
    ['❤️', '💕', '✨', '💖', '⭐', '💗'].forEach((h, i) => {
      for (let j = 0; j < 2; j++) {
        const span = document.createElement('span');
        span.textContent = h;
        span.style.left = Math.random() * 100 + '%';
        span.style.animationDuration = (6 + Math.random() * 8) + 's';
        span.style.animationDelay = (i + j * 0.5) + 's';
        container.appendChild(span);
      }
    });
  });
}

/* ── Instagram Feed (feed/ folder only) ── */
function initFeed() {
  const container = document.getElementById('feedContainer');
  const photos = PHOTO_STORE.feed;
  const username = SITE_CONFIG.feed.username;

  if (!photos.length) {
    container.innerHTML = emptyState('Add photos to <strong>feed/</strong> as feed1.jpg, feed2.jpg …');
    return;
  }

  photos.forEach((photo, i) => {
    const post = getCaption('feed', photo.index, {
      place: '📍 Our place',
      date: '🗓 Our date',
      caption: 'A beautiful memory',
      letter: 'Every moment with you is special.',
      likes: 100
    });

    const el = document.createElement('article');
    el.className = 'feed-post';
    el.innerHTML = `
      <div class="feed-header">
        <div class="feed-avatar">💑</div>
        <span class="feed-user">${username}</span>
      </div>
      <img class="feed-photo" src="${photo.src}" alt="Memory ${photo.index}" loading="lazy">
      <div class="feed-actions">
        <button class="like-btn" aria-label="Like">🤍</button>
        <span class="like-count">${post.likes} likes</span>
      </div>
      <div class="feed-body">
        <p class="feed-place">${post.place}</p>
        <p class="feed-date">${post.date}</p>
        <p class="feed-caption"><strong>${username}</strong> ❤️ "${post.caption}"</p>
        <div class="feed-letter">${post.letter}</div>
      </div>
    `;

    const likeBtn = el.querySelector('.like-btn');
    const likeCount = el.querySelector('.like-count');
    let liked = false;
    let count = post.likes;

    likeBtn.addEventListener('click', () => {
      liked = !liked;
      count += liked ? 1 : -1;
      likeBtn.textContent = liked ? '❤️' : '🤍';
      likeBtn.classList.toggle('liked', liked);
      likeCount.textContent = count + ' likes';
    });

    el.querySelector('.feed-photo').addEventListener('click', () => {
      openLightbox(photo.src, post.caption);
    });

    container.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 120 * i);
  });
}

/* ── Group Slider (group/ folder only) ── */
let sliderPhotos = [];
let sliderIndex = 0;
let autoSlideTimer = null;

function initSlider() {
  sliderPhotos = PHOTO_STORE.group;
  const track = document.getElementById('sliderTrack');
  const dots = document.getElementById('sliderDots');
  const wrap = document.querySelector('.slider-wrap');

  if (!sliderPhotos.length) {
    wrap.innerHTML = emptyState('Add photos to <strong>group/</strong> as group1.jpg, group2.jpg …');
    return;
  }

  sliderPhotos.forEach((photo, i) => {
    const cap = getCaption('group', photo.index, { title: `Group Moment ${photo.index}`, desc: 'Together forever' });

    const slide = document.createElement('div');
    slide.className = 'slider-slide';
    slide.innerHTML = `
      <img src="${photo.src}" alt="${cap.title}" loading="lazy">
      <div class="slider-caption">
        <h3>${cap.title}</h3>
        <p>${cap.desc}</p>
      </div>
    `;
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
  });

  document.getElementById('sliderPrev').addEventListener('click', () => goToSlide(sliderIndex - 1));
  document.getElementById('sliderNext').addEventListener('click', () => goToSlide(sliderIndex + 1));

  autoSlideTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
  wrap.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
  wrap.addEventListener('mouseleave', () => {
    autoSlideTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToSlide(sliderIndex + (diff > 0 ? 1 : -1));
  });
}

function goToSlide(index) {
  if (!sliderPhotos.length) return;
  const total = sliderPhotos.length;
  sliderIndex = ((index % total) + total) % total;
  document.getElementById('sliderTrack').style.transform = `translateX(-${sliderIndex * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === sliderIndex);
  });
}

/* ── Polaroid sections (funny, romantic, food, moments) ── */
function initPolaroidSections() {
  (SITE_CONFIG.polaroidSections || []).forEach(({ key, gridId, emoji }) => {
    renderPolaroidGrid(gridId, key, emoji);
  });
}

function renderPolaroidGrid(gridId, key, defaultEmoji) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const photos = PHOTO_STORE[key] || [];
  if (!photos.length) {
    grid.innerHTML = emptyState(
      `Add photos to <strong>${key}/</strong> as ${key}1.jpg, ${key}2.jpg …`
    );
    return;
  }

  photos.forEach(photo => {
    const cap = getCaption(key, photo.index, {
      caption: `${key} moment ${photo.index}`,
      emoji: defaultEmoji
    });

    const card = document.createElement('div');
    card.className = 'polaroid reveal';
    card.style.setProperty('--r', `${(Math.random() * 8 - 4).toFixed(1)}deg`);
    card.innerHTML = `
      <img src="${photo.src}" alt="${cap.caption}" loading="lazy" decoding="async">
      <p class="caption">${cap.caption}</p>
      <span class="emoji-tag">${cap.emoji}</span>
    `;
    card.addEventListener('click', () => openLightbox(photo.src, cap.caption));
    grid.appendChild(card);
  });
}

/* ── Memory Letters ── */
function initLetters() {
  const container = document.getElementById('envelopes');
  const modal = document.getElementById('letterModal');
  const content = document.getElementById('letterContent');

  SITE_CONFIG.letters.forEach(letter => {
    const el = document.createElement('div');
    el.className = 'envelope reveal';
    el.innerHTML = `
      <div class="envelope-body">
        <div class="envelope-flap"></div>
        <span class="envelope-heart">💌</span>
        <span class="envelope-label">${letter.label}</span>
      </div>
    `;
    el.addEventListener('click', () => {
      content.innerHTML = `
        <h3>${letter.title}</h3>
        ${letter.body.map(p => `<p>${p}</p>`).join('')}
      `;
      modal.classList.add('open');
    });
    container.appendChild(el);
  });

  document.getElementById('modalClose').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
}

/* ── Official (official/ folder only) ── */
function initOfficial() {
  const grid = document.getElementById('officialGrid');
  const photos = PHOTO_STORE.official;

  if (!photos.length) {
    grid.innerHTML = emptyState('Add photos to <strong>official/</strong> as official1.jpg, official2.jpg …');
    return;
  }

  photos.forEach(photo => {
    const cap = getCaption('official', photo.index, {
      title: `Official Moment ${photo.index}`,
      desc: 'A milestone worth celebrating'
    });

    const el = document.createElement('div');
    el.className = 'official-card reveal';
    el.innerHTML = `
      <img src="${photo.src}" alt="${cap.title}" loading="lazy">
      <div class="official-card-body">
        <h3>${cap.title}</h3>
        <p>${cap.desc}</p>
      </div>
    `;
    el.querySelector('img').addEventListener('click', () => openLightbox(photo.src, cap.title));
    grid.appendChild(el);
  });
}

/* ── Personal (personal/ folder only) ── */
function initPersonal() {
  const grid = document.getElementById('personalGrid');
  const photos = PHOTO_STORE.personal;

  if (!photos.length) {
    grid.innerHTML = emptyState('Add photos to <strong>personal/</strong> as personal1.jpg, personal2.jpg …');
    return;
  }

  photos.forEach(photo => {
    const cap = getCaption('personal', photo.index, { caption: `Personal memory ${photo.index}` });

    const el = document.createElement('div');
    el.className = 'pinterest-item reveal';
    el.innerHTML = `
      <img src="${photo.src}" alt="${cap.caption}" loading="lazy">
      <div class="pin-caption">${cap.caption}</div>
    `;
    el.addEventListener('click', () => openLightbox(photo.src, cap.caption));
    grid.appendChild(el);
  });

  startTypewriter();
}

function startTypewriter() {
  const tw = document.getElementById('typewriter');
  const phrases = SITE_CONFIG.typewriterPhrases;
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function step() {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      tw.textContent = phrase.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(step, 2000);
        return;
      }
    } else {
      tw.textContent = phrase.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(step, deleting ? 40 : 80);
  }
  step();
}

/* ── Gallery (all folders combined) ── */
function initGallery() {
  const filters = document.getElementById('galleryFilters');
  const masonry = document.getElementById('masonryGallery');
  const items = PHOTO_STORE.gallery;
  let activeFilter = 'All';

  SITE_CONFIG.gallery.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterGallery();
    });
    filters.appendChild(btn);
  });

  if (!items.length) {
    masonry.innerHTML = emptyState('Add photos to any gallery folder (funny, personal, official, etc.)');
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'masonry-item reveal';
    el.dataset.category = item.category;
    el.innerHTML = `
      <img src="${item.src}" alt="${item.category}" loading="lazy">
      <span class="masonry-tag">${item.category}</span>
    `;
    el.addEventListener('click', () => openLightbox(item.src, item.category));
    masonry.appendChild(el);
  });

  function filterGallery() {
    document.querySelectorAll('.masonry-item').forEach(el => {
      const show = activeFilter === 'All' || el.dataset.category === activeFilter;
      el.classList.toggle('hidden-item', !show);
    });
  }
}

/* ── Stats (photo count = auto) ── */
function initStats() {
  const photosEl = document.querySelector('.stat-num[data-target="photos"]');
  if (photosEl) photosEl.dataset.target = PHOTO_STORE.totalCount || 0;

  const tripsEl = document.querySelector('.stat-num[data-target="trips"]');
  if (tripsEl) tripsEl.dataset.target = SITE_CONFIG.stats.trips;

  const countriesEl = document.querySelector('.stat-num[data-target="countries"]');
  if (countriesEl) countriesEl.dataset.target = SITE_CONFIG.stats.countries;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateStats();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(document.getElementById('statsGrid'));
}

function animateStats() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = el.dataset.target;
    if (target === 'infinity') {
      el.textContent = '∞';
      return;
    }

    const end = parseInt(target, 10) || 0;
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * end).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ── Final Page ── */
function initFinal() {
  const cfg = SITE_CONFIG.final;
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const message = document.getElementById('finalMessage');
  const heading = document.querySelector('.final-content h2');
  let noIndex = 0;

  if (heading) heading.textContent = cfg.question;

  yesBtn.addEventListener('click', () => {
    message.textContent = cfg.yesMessage;
    message.classList.add('show');
    launchConfetti();
    startFireworks();
  });

  function moveNoBtn() {
    noBtn.style.position = 'fixed';
    noBtn.style.left = Math.max(10, Math.random() * (window.innerWidth - noBtn.offsetWidth - 20)) + 'px';
    noBtn.style.top = Math.max(10, Math.random() * (window.innerHeight - noBtn.offsetHeight - 20)) + 'px';
    noIndex = (noIndex + 1) % cfg.noTexts.length;
    noBtn.textContent = cfg.noTexts[noIndex];
  }

  noBtn.addEventListener('mouseenter', moveNoBtn);
  noBtn.addEventListener('touchstart', e => { e.preventDefault(); moveNoBtn(); }, { passive: false });
}

/* ── Confetti ── */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#e8879a', '#c9a227', '#2ed573', '#ff6b81', '#ffe066', '#fff'];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * canvas.height,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2 + Math.random() * 4,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10
  }));

  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(frame * 0.05 + p.rot) * 1.5;
      p.rot += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (++frame < 200) requestAnimationFrame(draw);
    else canvas.remove();
  })();
}

/* ── Fireworks ── */
function startFireworks() {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const particles = [];
  const colors = ['#e8879a', '#c9a227', '#ffe066', '#ff6b81', '#fff'];
  let bursts = 0;

  function burst(x, y) {
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  const interval = setInterval(() => {
    burst(
      Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
      Math.random() * canvas.height * 0.5 + canvas.height * 0.1
    );
    if (++bursts > 8) clearInterval(interval);
  }, 600);

  (function animate() {
    ctx.fillStyle = 'rgba(15, 12, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.015;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length > 0 || bursts <= 8) requestAnimationFrame(animate);
  })();
}

/* ── Fireflies ── */
function initFireflies() {
  const container = document.querySelector('.final-fireflies');
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const span = document.createElement('span');
    span.style.left = Math.random() * 100 + '%';
    span.style.top = Math.random() * 100 + '%';
    span.style.animationDelay = Math.random() * 4 + 's';
    span.style.animationDuration = (3 + Math.random() * 3) + 's';
    container.appendChild(span);
  }
}

/* ── Lightbox ── */
function openLightbox(src, caption) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption || '';
  document.getElementById('lightbox').classList.add('open');
}

function initLightbox() {
  document.getElementById('lightboxClose').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('open');
  });
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox') document.getElementById('lightbox').classList.remove('open');
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .feed-post').forEach(el => observer.observe(el));
}

function toggleMusic() {
  document.getElementById('musicToggle').click();
}
