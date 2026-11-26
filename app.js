/* ==========================================================================
   CALENDARIO DE ADVIENTO ROMÁNTICO PARA ARII
   Lógica real con zona horaria America/Lima, animaciones y 24+1 sorpresas
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    opened: 'arii_advent_opened_v1',
    coupons: 'arii_advent_coupons_v1',
    answers: 'arii_advent_answers_v1',
    wish: 'arii_advent_wish_v1',
    pledge: 'arii_advent_pledge_v1',
    challenge10: 'arii_advent_challenge10_v1'
  };

  const PERU_TZ = (window.ADVENT_CONFIG && window.ADVENT_CONFIG.timeZone) || 'America/Lima';

  /* ------------------------------------------------------------------------
     1. UTILIDADES DE ALMACENAMIENTO SEGURO
     ------------------------------------------------------------------------ */
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silencioso si localStorage no está disponible
    }
  }

  function getOpenedDays() {
    const arr = readStorage(STORAGE_KEYS.opened, []);
    return Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n)) : [];
  }

  function markDayOpened(day) {
    const set = new Set(getOpenedDays());
    set.add(day);
    writeStorage(STORAGE_KEYS.opened, Array.from(set).sort((a, b) => a - b));
  }

  /* ------------------------------------------------------------------------
     2. FECHA Y CUENTA REGRESIVA EN PERÚ (Temporal API + Fallback Seguro)
     ------------------------------------------------------------------------ */
  async function ensureTemporalIfNeeded() {
    if (typeof Temporal !== 'undefined') return true;
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1800));
      const mod = await Promise.race([import('https://esm.sh/temporal-polyfill'), timeout]);
      if (mod && mod.Temporal) {
        globalThis.Temporal = mod.Temporal;
        return true;
      }
    } catch {
      // Fallback offline via Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' })
    }
    return false;
  }

  function getPeruNowParts() {
    if (typeof Temporal !== 'undefined') {
      try {
        const zdt = Temporal.Now.zonedDateTimeISO(PERU_TZ);
        return {
          year: zdt.year,
          month: zdt.month,
          day: zdt.day,
          hour: zdt.hour,
          minute: zdt.minute,
          zonedDateTime: zdt
        };
      } catch {
        // Continúa al fallback Intl
      }
    }

    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: PERU_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      zonedDateTime: null
    };
  }

  function getTargetYear(peruYear) {
    const configured = window.ADVENT_CONFIG && window.ADVENT_CONFIG.targetYear;
    return Number.isInteger(configured) ? configured : peruYear;
  }

  function isDayUnlocked(dayNum) {
    if (window.__ADMIN_UNLOCKED__) return true;
    const now = getPeruNowParts();
    const targetYear = getTargetYear(now.year);

    if (now.year > targetYear) return true;
    if (now.year < targetYear) return false;
    if (now.month < 12) return false;
    if (now.month > 12) return true;

    return dayNum <= now.day;
  }

  function getDayState(dayNum) {
    const now = getPeruNowParts();
    const targetYear = getTargetYear(now.year);
    const opened = getOpenedDays().includes(dayNum);

    if (!isDayUnlocked(dayNum)) {
      return { unlocked: false, isToday: false, opened: false };
    }

    const isToday = now.year === targetYear && now.month === 12 && now.day === dayNum;
    return { unlocked: true, isToday, opened };
  }

  function computeDaysUntilChristmas() {
    const now = getPeruNowParts();
    let christmasYear = getTargetYear(now.year);

    if (typeof Temporal !== 'undefined' && now.zonedDateTime) {
      const todayPlain = now.zonedDateTime.toPlainDate();
      let xmasPlain = Temporal.PlainDate.from({ year: christmasYear, month: 12, day: 25 });
      if (Temporal.PlainDate.compare(todayPlain, xmasPlain) > 0) {
        xmasPlain = Temporal.PlainDate.from({ year: christmasYear + 1, month: 12, day: 25 });
      }
      const diff = todayPlain.until(xmasPlain, { largestUnit: 'day' });
      return { daysLeft: diff.days, isChristmasEve: now.month === 12 && now.day === 24, isChristmasDay: now.month === 12 && now.day === 25 };
    }

    // Fallback calendárico exacto sin deriva de horario
    const utcToday = Date.UTC(now.year, now.month - 1, now.day);
    let utcXmas = Date.UTC(christmasYear, 11, 25);
    if (utcToday > utcXmas) {
      utcXmas = Date.UTC(christmasYear + 1, 11, 25);
    }
    const daysLeft = Math.round((utcXmas - utcToday) / 86400000);
    return { daysLeft, isChristmasEve: now.month === 12 && now.day === 24, isChristmasDay: now.month === 12 && now.day === 25 };
  }

  function updateCountdownUI() {
    const labelEl = document.getElementById('countdownLabel');
    const daysEl = document.getElementById('countdownDays');
    const subEl = document.getElementById('countdownSub');
    const peruDateEl = document.getElementById('peruDateDisplay');

    const { daysLeft, isChristmasEve, isChristmasDay } = computeDaysUntilChristmas();
    if (isChristmasDay) {
      labelEl.textContent = '¡Hoy es!';
      daysEl.textContent = '¡Navidad!';
      subEl.textContent = 'Feliz Navidad, Arii ♡';
    } else if (isChristmasEve) {
      labelEl.textContent = '¡Ya casi!';
      daysEl.textContent = '1 día';
      subEl.textContent = 'Hoy es Nochebuena ♡';
    } else {
      labelEl.textContent = 'Faltan:';
      daysEl.textContent = `${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`;
      subEl.textContent = 'para Navidad ♡';
    }

    const formattedNow = new Intl.DateTimeFormat('es-PE', {
      timeZone: PERU_TZ,
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
    peruDateEl.textContent = formattedNow;
  }

  /* ------------------------------------------------------------------------
     3. ARTE VECTORIAL DE LOS 24 REGALOS (FIEL A LA REFERENCIA)
     ------------------------------------------------------------------------ */
  const GIFT_STYLES = {
    1:  { kind: 'box', bg: '#a31720', trim: '#750c13', ribbon: '#e9bd62', snow: true, numColor: '#fff7ea' },
    2:  { kind: 'env', bg: '#e3c9a4', flap: '#cfa97b', seal: '#a81822', tree: true, numColor: '#4c2614' },
    3:  { kind: 'box', bg: '#164527', trim: '#0d2c18', ribbon: '#d9a444', snow: false, plaid: true, numColor: '#fff5e0' },
    4:  { kind: 'env-box', bg: '#9b151e', flap: '#7a0d15', ribbon: '#d82b34', hearts: true, numColor: '#fff5e4' },
    5:  { kind: 'env', bg: '#d9bc94', flap: '#c59f6f', seal: '#a81822', hearts: true, numColor: '#4a2413' },
    6:  { kind: 'env-box', bg: '#184b2b', flap: '#11371f', ribbon: '#a81822', snow: true, numColor: '#fff5e4' },
    7:  { kind: 'env-box', bg: '#1a4f2d', flap: '#12381f', ribbon: '#b81c26', snow: true, whiteBow: true, numColor: '#fff5e4' },
    8:  { kind: 'env-box', bg: '#9e1720', flap: '#780e16', ribbon: '#e9bd62', dots: true, numColor: '#fff7ea' },
    9:  { kind: 'env', bg: '#e2c59f', flap: '#cca474', seal: '#9f1822', snow: true, tree: true, numColor: '#4b2514' },
    10: { kind: 'holly-box', bg: '#154727', trim: '#0d2e18', ribbon: '#d9a444', numColor: '#fff5e0' },
    11: { kind: 'striped-box', bg: '#a81822', stripe: '#f2e4d0', ribbon: '#850e16', numColor: '#ffffff' },
    12: { kind: 'bauble', bg: '#a31720', gold: '#e8bc5c', numColor: '#fff7e6' },
    13: { kind: 'box', bg: '#a81922', trim: '#780f16', ribbon: '#e3b354', snow: true, dots: true, numColor: '#fff8ec' },
    14: { kind: 'env', bg: '#dec19b', flap: '#c89f70', seal: '#a81822', snow: true, hearts: true, numColor: '#4c2614' },
    15: { kind: 'box', bg: '#174829', trim: '#0f311b', ribbon: '#b31b24', snow: true, numColor: '#fff5e4' },
    16: { kind: 'box', bg: '#a61720', trim: '#760e15', ribbon: '#e5b656', snow: true, numColor: '#fff8ec' },
    17: { kind: 'env', bg: '#e4c9a4', flap: '#cca678', seal: '#a81822', snow: true, numColor: '#4b2514' },
    18: { kind: 'box', bg: '#7f141c', trim: '#590b11', ribbon: '#18542f', snow: true, plaid: true, numColor: '#fff5e0' },
    19: { kind: 'env', bg: '#dfc39c', flap: '#c89e70', seal: '#9c1620', snow: true, tree: true, numColor: '#4b2514' },
    20: { kind: 'env-box', bg: '#164628', flap: '#0e301a', ribbon: '#a81822', hearts: true, numColor: '#fff5e4' },
    21: { kind: 'pine-box', bg: '#9b1820', ribbon: '#19542e', plaid: true, snow: true, numColor: '#fff8ec' },
    22: { kind: 'terracotta', bg: '#b4492d', grid: '#8c2f18', numColor: '#fff6e8' },
    23: { kind: 'box', bg: '#154426', trim: '#0d2c18', ribbon: '#b31b24', snow: true, stars: true, numColor: '#fff7e6' },
    24: { kind: 'grand-24', bg: '#c41c27', ribbon: '#ffd86b', numColor: '#ffffff' }
  };

  function buildGiftSvg(day, unlocked) {
    const s = GIFT_STYLES[day];
    const uid = `g${day}`;

    if (s.kind === 'bauble') {
      return `
        <svg class="gift-art-svg" viewBox="0 0 110 105" aria-hidden="true">
          <defs>
            <radialGradient id="${uid}b" cx="35%" cy="32%" r="70%">
              <stop offset="0%" stop-color="#df3640"/>
              <stop offset="55%" stop-color="#9e141d"/>
              <stop offset="100%" stop-color="#5c080e"/>
            </radialGradient>
          </defs>
          <path d="M55,2 L55,14" stroke="#e8bc5c" stroke-width="2.5"/>
          <rect x="46" y="12" width="18" height="9" rx="3" fill="#d9a444"/>
          <circle cx="55" cy="59" r="39" fill="url(#${uid}b)" stroke="#e8bc5c" stroke-width="2"/>
          <path d="M22,42 Q55,30 88,42" fill="none" stroke="#e8bc5c" stroke-width="1.8" opacity="0.75"/>
          <path d="M22,76 Q55,88 88,76" fill="none" stroke="#e8bc5c" stroke-width="1.8" opacity="0.75"/>
          <circle cx="38" cy="36" r="5" fill="#ffffff" opacity="0.22"/>
          <text x="55" y="60" class="gift-number-label" fill="${s.numColor}">${day}</text>
        </svg>`;
    }

    if (s.kind === 'env') {
      return `
        <svg class="gift-art-svg" viewBox="0 0 110 100" aria-hidden="true">
          <rect x="7" y="20" width="96" height="68" rx="6" fill="${s.bg}" stroke="#8c6239" stroke-width="1.8"/>
          <polygon points="7,20 55,56 103,20" fill="${s.flap}" stroke="#8c6239" stroke-width="1.2"/>
          <path d="M7,88 L42,52 M103,88 L68,52" stroke="#9e7448" stroke-width="1.2" opacity="0.55"/>
          ${s.snow ? `<path d="M9,20 Q28,12 46,20 Q68,13 92,19 Q101,18 103,24 Q74,26 48,24 Q24,27 9,20 Z" fill="#f3f7fc"/>` : ''}
          ${s.tree ? `<polygon points="84,68 77,55 91,55" fill="#18502c"/><polygon points="84,59 79,48 89,48" fill="#1d6135"/><rect x="82.7" y="68" width="2.6" height="4.5" fill="#59351e"/>` : ''}
          ${s.hearts ? `<text x="23" y="42" font-size="13" fill="#a81822">♥</text>` : ''}
          <circle cx="55" cy="49" r="8.5" fill="${s.seal}"/>
          <text x="55" y="49.5" font-size="10" text-anchor="middle" dominant-baseline="central" fill="#ffeceb">♡</text>
          <text x="55" y="71" class="gift-number-label" fill="${s.numColor}">${day}</text>
        </svg>`;
    }

    if (s.kind === 'grand-24') {
      return `
        <svg class="gift-art-svg" viewBox="0 0 116 108" aria-hidden="true">
          <defs>
            <linearGradient id="${uid}box" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#e42f3b"/>
              <stop offset="55%" stop-color="#b51420"/>
              <stop offset="100%" stop-color="#700911"/>
            </linearGradient>
          </defs>
          <!-- Golden Aura & Light Rays -->
          <circle cx="58" cy="56" r="48" fill="#ffd970" opacity="0.22"/>
          <g stroke="#ffe89e" stroke-width="2" stroke-linecap="round" opacity="0.8">
            <line x1="58" y1="2" x2="58" y2="10"/><line x1="18" y1="16" x2="25" y2="23"/>
            <line x1="98" y1="16" x2="91" y2="23"/><line x1="8" y1="54" x2="15" y2="54"/>
            <line x1="101" y1="54" x2="108" y2="54"/>
          </g>
          <!-- Box Body & Lid -->
          <rect x="13" y="34" width="90" height="60" rx="7" fill="url(#${uid}box)" stroke="#ffe188" stroke-width="2"/>
          <rect x="9" y="25" width="98" height="15" rx="4" fill="#d9232f" stroke="#ffe188" stroke-width="1.6"/>
          <!-- Glowing Gold Ribbon -->
          <rect x="52" y="25" width="12" height="69" fill="#ffe180"/>
          <rect x="13" y="54" width="90" height="9" fill="#ffe180" opacity="0.9"/>
          <!-- Big Radiant Gold Bow -->
          <path d="M56,25 C34,5 20,16 32,26 C40,32 52,27 56,25 Z" fill="#ffe282" stroke="#c9851e" stroke-width="1.2"/>
          <path d="M60,25 C82,5 96,16 84,26 C76,32 64,27 60,25 Z" fill="#ffe282" stroke="#c9851e" stroke-width="1.2"/>
          <circle cx="58" cy="24" r="6" fill="#fff2b8" stroke="#c9851e" stroke-width="1.2"/>
          <!-- Little Sparkles -->
          <text x="24" y="49" font-size="10" fill="#fff3b8">✦</text>
          <text x="87" y="82" font-size="10" fill="#fff3b8">✦</text>
          <!-- Number Badge -->
          <rect x="33" y="42" width="50" height="34" rx="8" fill="#8f0d16" opacity="0.88"/>
          <text x="58" y="60" class="gift-number-label" fill="#ffffff" style="font-size:31px; filter: drop-shadow(0 0 6px #ffe388);">${day}</text>
          <!-- Glowing Heart Underneath -->
          <text x="58" y="99" font-size="16" text-anchor="middle" fill="#ffe58f">♥</text>
        </svg>`;
    }

    // Variantes de cajas y sobres navideños (1, 3, 4, 6, 7, 8, 10, 11, 13, 15, 16, 18, 20, 21, 22, 23)
    const isEnvBox = s.kind === 'env-box';
    const isStriped = s.kind === 'striped-box';
    const isTerracotta = s.kind === 'terracotta';
    const ribbonColor = s.ribbon || '#e5b858';
    const bowColor = s.whiteBow ? '#f6f8fc' : ribbonColor;

    return `
      <svg class="gift-art-svg" viewBox="0 0 110 100" aria-hidden="true">
        <defs>
          <pattern id="${uid}stripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <rect width="14" height="14" fill="${s.bg}"/>
            <rect width="6" height="14" fill="${s.stripe || '#fff'}"/>
          </pattern>
          <pattern id="${uid}plaid" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="${s.bg}"/>
            <rect x="0" y="6" width="16" height="3" fill="#081a0f" opacity="0.38"/>
            <rect x="6" y="0" width="3" height="16" fill="#081a0f" opacity="0.38"/>
            <rect x="12" y="0" width="1.2" height="16" fill="#e8bd62" opacity="0.55"/>
          </pattern>
        </defs>
        ${s.kind === 'holly-box' ? `
          <ellipse cx="42" cy="24" rx="14" ry="7" fill="#1d6537" transform="rotate(-15 42 24)"/>
          <ellipse cx="66" cy="24" rx="14" ry="7" fill="#1d6537" transform="rotate(15 66 24)"/>
          <circle cx="54" cy="25" r="4" fill="#c71f28"/><circle cx="60" cy="27" r="3.5" fill="#a8151d"/>
        ` : ''}
        ${s.kind === 'pine-box' ? `
          <path d="M16,28 Q35,10 55,20 Q78,10 94,28 Z" fill="#17522c"/>
          <path d="M22,22 Q40,12 58,20 Q78,13 88,24 Z" fill="#f3f7fb" opacity="0.9"/>
        ` : ''}
        <!-- Box Base -->
        <rect x="11" y="28" width="88" height="60" rx="6"
          fill="${isStriped ? `url(#${uid}stripe)` : s.plaid ? `url(#${uid}plaid)` : s.bg}"
          stroke="rgba(255,228,175,0.28)" stroke-width="1.5"/>
        <!-- Lid or Envelope Flap -->
        ${isEnvBox
          ? `<polygon points="11,28 55,54 99,28" fill="${s.flap}" stroke="rgba(255,228,175,0.22)" stroke-width="1.2"/>`
          : `<rect x="8" y="23" width="94" height="13" rx="3.5" fill="${s.trim || s.bg}" stroke="rgba(255,228,175,0.28)" stroke-width="1.2"/>`
        }
        ${isTerracotta ? `
          <line x1="36" y1="28" x2="36" y2="88" stroke="${s.grid}" stroke-width="2" opacity="0.6"/>
          <line x1="74" y1="28" x2="74" y2="88" stroke="${s.grid}" stroke-width="2" opacity="0.6"/>
          <line x1="11" y1="58" x2="99" y2="58" stroke="${s.grid}" stroke-width="2" opacity="0.6"/>
          <text x="86" y="64" font-size="14" fill="#fff0df">♡</text>
        ` : `
          <!-- Vertical Ribbon -->
          <rect x="50" y="23" width="10" height="65" fill="${ribbonColor}" opacity="0.9"/>
        `}
        <!-- Snow Cap -->
        ${s.snow ? `<path d="M10,25 Q28,17 44,24 Q64,16 88,23 Q98,21 101,28 Q75,30 50,27 Q26,31 10,25 Z" fill="#f4f8fc" opacity="0.92"/>` : ''}
        <!-- Top Bow -->
        <path d="M53,23 C36,8 24,16 33,24 C40,29 50,25 53,23 Z" fill="${bowColor}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
        <path d="M57,23 C74,8 86,16 77,24 C70,29 60,25 57,23 Z" fill="${bowColor}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
        <circle cx="55" cy="23" r="5" fill="${bowColor}"/>
        ${s.dots ? `<circle cx="25" cy="48" r="2" fill="#fff3dc" opacity="0.65"/><circle cx="85" cy="76" r="2" fill="#fff3dc" opacity="0.65"/>` : ''}
        ${s.stars ? `<text x="23" y="48" font-size="9" fill="#ffe699">✦</text><text x="82" y="79" font-size="9" fill="#ffe699">✦</text>` : ''}
        ${s.hearts ? `<text x="22" y="78" font-size="10" fill="#ffd9d6" opacity="0.85">♡</text>` : ''}
        <!-- Number Pill Backplate for High Legibility -->
        <circle cx="55" cy="61" r="17" fill="rgba(16, 10, 8, ${unlocked ? '0.45' : '0.32'})"/>
        <text x="55" y="61" class="gift-number-label" fill="${s.numColor}">${day}</text>
      </svg>`;
  }

  /* ------------------------------------------------------------------------
     4. AUDIO WEB AUDIO API (CAJITA MUSICAL SUAVE + MELODÍA AMBIENTE)
     ------------------------------------------------------------------------ */
  let audioCtx = null;
  let activeMusicTimer = null;
  let isAmbientMusicPlaying = false;

  const MELODIES = {
    ambient: [
      [392.0, 0.45], [392.0, 0.25], [440.0, 0.6], [392.0, 0.6], [523.25, 0.6], [493.88, 1.1],
      [392.0, 0.45], [392.0, 0.25], [440.0, 0.6], [392.0, 0.6], [587.33, 0.6], [523.25, 1.1],
      [392.0, 0.45], [392.0, 0.25], [783.99, 0.6], [659.25, 0.6], [523.25, 0.6], [493.88, 0.6], [440.0, 1.0]
    ],
    romantic: [
      [523.25, 0.45], [587.33, 0.45], [659.25, 0.7], [587.33, 0.45], [523.25, 0.7],
      [440.0, 0.45], [493.88, 0.45], [523.25, 0.9],
      [659.25, 0.45], [698.46, 0.45], [783.99, 0.85], [659.25, 0.5], [587.33, 0.95]
    ],
    'silent-night': [
      [392.0, 0.7], [440.0, 0.3], [392.0, 0.55], [329.63, 1.15],
      [392.0, 0.7], [440.0, 0.3], [392.0, 0.55], [329.63, 1.15],
      [587.33, 0.85], [587.33, 0.45], [493.88, 1.15],
      [523.25, 0.85], [523.25, 0.45], [392.0, 1.15]
    ]
  };

  function playMusicBoxNote(freq, duration) {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + Math.max(0.3, duration * 1.15));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + Math.max(0.35, duration * 1.2));
  }

  function stopMelody() {
    if (activeMusicTimer) {
      clearTimeout(activeMusicTimer);
      activeMusicTimer = null;
    }
    isAmbientMusicPlaying = false;
    const btn = document.getElementById('toggleMusicBtn');
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  function startMelody(preset = 'ambient', onStop) {
    stopMelody();
    const notes = MELODIES[preset] || MELODIES.ambient;
    let idx = 0;
    isAmbientMusicPlaying = true;

    const step = () => {
      if (!isAmbientMusicPlaying) {
        if (onStop) onStop();
        return;
      }
      const [freq, dur] = notes[idx % notes.length];
      playMusicBoxNote(freq, dur);
      idx += 1;
      activeMusicTimer = setTimeout(step, dur * 1000);
    };
    step();
  }

  /* ------------------------------------------------------------------------
     5. RENDERIZADO DEL TABLERO Y BONUS 25
     ------------------------------------------------------------------------ */
  function renderCalendarGrid() {
    const grid = document.getElementById('giftsGrid');
    const progressText = document.getElementById('progressText');
    const openedSet = new Set(getOpenedDays());
    let unlockedOpenedCount = 0;

    grid.innerHTML = '';
    for (let day = 1; day <= 24; day += 1) {
      const state = getDayState(day);
      if (state.opened && day <= 24) unlockedOpenedCount += 1;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gift-tile';
      btn.setAttribute('role', 'listitem');
      btn.dataset.day = String(day);

      if (day === 24) btn.classList.add('is-day-24');
      if (!state.unlocked) {
        btn.classList.add('is-locked');
        btn.setAttribute('aria-label', `Regalo del día ${day} de diciembre, bloqueado hasta su fecha`);
      } else if (state.opened) {
        btn.classList.add('is-opened');
        btn.setAttribute('aria-label', `Regalo del día ${day}, ya abierto. Toca para volver a verlo`);
      } else if (state.isToday) {
        btn.classList.add('is-available-today');
        btn.setAttribute('aria-label', `Regalo del día ${day}, disponible hoy para abrir`);
      } else {
        btn.classList.add('is-past-available');
        btn.setAttribute('aria-label', `Regalo del día ${day}, disponible para abrir`);
      }

      const chipContent = !state.unlocked ? '🔒' : state.opened ? '✓' : '★';
      btn.innerHTML = `
        ${buildGiftSvg(day, state.unlocked)}
        <span class="gift-status-chip" aria-hidden="true">${chipContent}</span>
      `;

      btn.addEventListener('click', () => handleGiftClick(day, btn));
      grid.appendChild(btn);
    }

    progressText.textContent = `${unlockedOpenedCount} de 24 sorpresas descubiertas ♡`;
    renderBonus25();
  }

  function renderBonus25() {
    const wrap = document.getElementById('bonus25Wrap');
    const state = getDayState(25);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `bonus-25-btn${state.unlocked ? ' is-unlocked' : ''}`;
    btn.setAttribute(
      'aria-label',
      state.unlocked
        ? 'Bonus navideño del 25 de diciembre, desbloqueado. Toca para abrir'
        : 'Bonus navideño del 25 de diciembre, bloqueado hasta Navidad'
    );

    btn.innerHTML = `
      <span class="bonus-star-icon" aria-hidden="true">${state.unlocked ? '🎄' : '✨'}</span>
      <span class="bonus-copy">
        <span class="bonus-title">25 · Bonus Navideño para Arii</span>
        <span class="bonus-sub">${
          state.unlocked
            ? state.opened
              ? '¡Feliz Navidad! Toca para volver a abrir tu regalo extra ♡'
              : '¡Ya es Navidad! Toca para abrir tu regalo extra ♡'
            : 'Se desbloquea exclusivamente el 25 de diciembre ♡'
        }</span>
      </span>
      <span aria-hidden="true">${state.unlocked ? '🎁' : '🔒'}</span>
    `;

    btn.addEventListener('click', () => handleGiftClick(25, btn));
    wrap.innerHTML = '';
    wrap.appendChild(btn);
  }

  /* ------------------------------------------------------------------------
     6. MODALES ACCESIBLES (<dialog>) Y TRANSICIÓN TOP-LAYER SEGURA
     ------------------------------------------------------------------------ */
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      supportsDisplayTransition = false;
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
  }

  async function closeTopLayer(dialog) {
    if (!dialog || !dialog.open) return;
    if (!supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 450))
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }
    dialog.close();
  }

  function setupDialogBehaviors() {
    const dialogs = document.querySelectorAll('dialog.festive-dialog');
    for (const dialog of dialogs) {
      dialog.addEventListener('close', () => {
        dialog.returnValue = '';
        if (dialog.id === 'surpriseDialog') {
          cleanupActiveSurpriseMedia();
        }
      });

      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeTopLayer(dialog);
      });

      // Fallback para navegadores sin `closedby="any"` (ej. Safari)
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const outside = (e) => {
          const r = dialog.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => {
          pressedOutside = outside(e);
        });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && outside(e)) closeTopLayer(dialog);
        });
      }
    }

    document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-close-dialog'));
        closeTopLayer(target);
      });
    });
  }

  let activeCleanupFn = null;
  function cleanupActiveSurpriseMedia() {
    if (typeof activeCleanupFn === 'function') {
      activeCleanupFn();
      activeCleanupFn = null;
    }
  }

  /* ------------------------------------------------------------------------
     7. APERTURA DE REGALOS CON VERIFICACIÓN REAL DE FECHA
     ------------------------------------------------------------------------ */
  function handleGiftClick(dayNum, triggerEl) {
    // COMPROBACIÓN REAL DE FECHA EN PERÚ ANTES DE ACCEDER AL CONTENIDO
    if (!isDayUnlocked(dayNum)) {
      triggerEl.classList.remove('shake-locked');
      void triggerEl.offsetWidth;
      triggerEl.classList.add('shake-locked');

      const lockedDialog = document.getElementById('lockedDialog');
      const lockedMessage = document.getElementById('lockedMessage');
      const lockedDatePill = document.getElementById('lockedUnlockDate');

      if (dayNum === 25) {
        lockedMessage.textContent = 'Un poquito de paciencia, mi amor... este regalo extra es exclusivo para la mañana de Navidad ♡';
        lockedDatePill.textContent = 'Se desbloquea el 25 de diciembre';
      } else {
        lockedMessage.textContent = 'Un poquito de paciencia, mi amor... todavía no llega el momento de abrir este regalo ♡';
        lockedDatePill.textContent = `Disponible a partir del ${dayNum} de diciembre`;
      }
      lockedDialog.showModal();
      return;
    }

    const baseSurprise = window.ADVENT_SURPRISES && window.ADVENT_SURPRISES[dayNum];
    if (!baseSurprise) return;

    const edits = typeof window.getAdventEdits === 'function' ? window.getAdventEdits() : {};
    const customEdit = edits[dayNum];
    const surprise = customEdit
      ? Object.assign({}, baseSurprise, {
          title: customEdit.title || baseSurprise.title,
          _customMsg: customEdit.msg || '',
          _customEmoji: customEdit.emoji || ''
        })
      : baseSurprise;

    if (!window.__ADMIN_UNLOCKED__) {
      const alreadyOpened = getOpenedDays().includes(dayNum);
      if (!alreadyOpened) {
        markDayOpened(dayNum);
        renderCalendarGrid();
        const updatedTrigger = dayNum === 25
          ? document.querySelector('.bonus-25-btn')
          : document.querySelector(`.gift-tile[data-day="${dayNum}"]`);
        if (updatedTrigger) updatedTrigger.classList.add('unlock-burst');
      }
    }

    openSurpriseModal(surprise);
  }

  function triggerGoldenBurst(container, count = 18) {
    container.innerHTML = '';
    const icons = ['✦', '♡', '✨', '❄', '★'];
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement('span');
      p.className = 'burst-particle';
      p.textContent = icons[i % icons.length];
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35);
      const dist = 65 + Math.random() * 145;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist - 20}px`);
      p.style.setProperty('--rot', `${Math.round(Math.random() * 220 - 110)}deg`);
      container.appendChild(p);
    }
  }

  function openSurpriseModal(surprise) {
    cleanupActiveSurpriseMedia();

    const dialog = document.getElementById('surpriseDialog');
    const shell = document.getElementById('surpriseShell');
    const dayBadge = document.getElementById('surpriseDayBadge');
    const typePill = document.getElementById('surpriseTypePill');
    const titleEl = document.getElementById('surpriseTitle');
    const bodyEl = document.getElementById('surpriseBody');
    const burstEl = document.getElementById('sparkleBurst');

    shell.classList.remove('is-grand-24', 'is-bonus-25');
    if (surprise.day === 24) shell.classList.add('is-grand-24');
    if (surprise.day === 25) shell.classList.add('is-bonus-25');

    dayBadge.textContent = surprise.day === 25 ? '25 de Diciembre' : `Día ${surprise.day} de Diciembre`;
    typePill.textContent = (surprise._customEmoji ? `${surprise._customEmoji} ` : '') + (surprise.typeLabel || 'Sorpresa');
    titleEl.textContent = surprise.title;
    bodyEl.innerHTML = '';

    if (surprise._customMsg) {
      const safeParagraphs = surprise._customMsg
        .split(/\n+/)
        .filter((line) => line.trim().length > 0)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('');
      bodyEl.innerHTML = `
        <article class="parchment-letter">
          ${surprise._customEmoji ? `<div style="font-size:2rem;text-align:center;margin-bottom:10px;">${escapeHtml(surprise._customEmoji)}</div>` : ''}
          ${safeParagraphs}
        </article>
      `;
    } else {
      renderSurpriseContent(surprise, bodyEl);
    }
    triggerGoldenBurst(burstEl, surprise.day >= 24 ? 28 : 16);

    dialog.showModal();
    shell.scrollTop = 0;
  }

  /* ------------------------------------------------------------------------
     8. RENDERIZADORES POR TIPO DE SORPRESA (15 FORMATOS DISTINTOS)
     ------------------------------------------------------------------------ */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function extractYouTubeEmbedUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/embed/')) return url;
        const vid = parsed.searchParams.get('v');
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }
      if (parsed.hostname === 'youtu.be') {
        const vid = parsed.pathname.slice(1);
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }
    } catch {
      return null;
    }
    return null;
  }

  function renderSurpriseContent(s, container) {
    switch (s.type) {
      case 'carta-sobre': {
        container.innerHTML = `
          <div class="envelope-stage">
            <button type="button" class="envelope-card" id="openEnvelopeBtn">
              <div class="wax-seal">♡</div>
              <div><strong>Toca para abrir el sobre sellado</strong></div>
              <div style="font-size:0.85rem;opacity:0.8;margin-top:4px;">Para: Arii</div>
            </button>
          </div>
        `;
        const openBtn = container.querySelector('#openEnvelopeBtn');
        openBtn.addEventListener('click', () => {
          const paras = s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
          container.innerHTML = `
            <article class="parchment-letter">
              <p class="letter-salutation">${escapeHtml(s.salutation)}</p>
              ${paras}
              <p class="letter-closing">${escapeHtml(s.closing)}</p>
            </article>
          `;
        });
        break;
      }

      case 'revelado-progresivo': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <div class="reveal-list">
              ${s.lines.map((line, idx) => `
                <button type="button" class="reveal-step-btn" data-idx="${idx}">
                  ✨ Toca para revelar motivo #${idx + 1}
                </button>
              `).join('')}
            </div>
          </div>
        `;
        container.querySelectorAll('.reveal-step-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            btn.classList.add('is-revealed');
            btn.textContent = s.lines[idx];
          });
        });
        break;
      }

      case 'cupon': {
        const redeemedMap = readStorage(STORAGE_KEYS.coupons, {});
        const isRedeemed = Boolean(redeemedMap[s.day]);
        container.innerHTML = `
          <div class="coupon-ticket">
            <div class="coupon-kicker">${escapeHtml(s.couponTitle)}</div>
            <h2 class="coupon-heading">${escapeHtml(s.title)}</h2>
            <p style="margin:6px 0 10px;">${escapeHtml(s.benefit)}</p>
            <div class="coupon-code-box">${escapeHtml(s.couponCode)}</div>
            <p style="font-size:0.86rem;opacity:0.85;margin:6px 0 14px;">${escapeHtml(s.validNote)}</p>
            <button type="button" class="festive-btn primary-btn" id="redeemCouponBtn">
              ${isRedeemed ? '✓ Cupón guardado / canjeado ♡' : 'Guardar y marcar para canjear ♡'}
            </button>
          </div>
        `;
        const btn = container.querySelector('#redeemCouponBtn');
        btn.addEventListener('click', () => {
          const map = readStorage(STORAGE_KEYS.coupons, {});
          map[s.day] = true;
          writeStorage(STORAGE_KEYS.coupons, map);
          btn.textContent = '✓ Cupón guardado / canjeado ♡';
        });
        break;
      }

      case 'cancion': {
        const yt = extractYouTubeEmbedUrl(s.mediaUrl);
        container.innerHTML = `
          <div class="music-player-card">
            <div class="vinyl-row">
              <div class="vinyl-disc" id="vinylDisc" aria-hidden="true"></div>
              <div style="flex:1;min-width:190px;">
                <div style="font-weight:700;font-size:1.05rem;color:#ffeab8;">${escapeHtml(s.songTitle)}</div>
                <div style="font-size:0.86rem;opacity:0.85;margin-top:2px;">${escapeHtml(s.artist)}</div>
              </div>
              <button type="button" class="festive-btn primary-btn" id="playSongBtn">▶ Reproducir</button>
            </div>
            ${s.mediaUrl && !yt ? `<audio controls src="${escapeHtml(s.mediaUrl)}" style="width:100%;margin-top:12px;"></audio>` : ''}
            ${yt ? `<div class="video-container"><iframe src="${escapeHtml(yt)}" allowfullscreen title="${escapeHtml(s.songTitle)}"></iframe></div>` : ''}
            <blockquote class="quote-box">${escapeHtml(s.lyricsQuote)}</blockquote>
            <p style="font-size:0.85rem;opacity:0.85;margin:0;">${escapeHtml(s.note)}</p>
          </div>
        `;
        const playBtn = container.querySelector('#playSongBtn');
        const vinyl = container.querySelector('#vinylDisc');
        let localPlaying = false;
        playBtn.addEventListener('click', () => {
          if (localPlaying) {
            stopMelody();
            localPlaying = false;
            vinyl.classList.remove('is-spinning');
            playBtn.textContent = '▶ Reproducir';
          } else {
            localPlaying = true;
            vinyl.classList.add('is-spinning');
            playBtn.textContent = '⏸ Pausar';
            startMelody(s.melodyPreset || 'romantic', () => {
              localPlaying = false;
              vinyl.classList.remove('is-spinning');
              playBtn.textContent = '▶ Reproducir';
            });
          }
        });
        activeCleanupFn = () => {
          if (localPlaying) stopMelody();
        };
        break;
      }

      case 'acertijo': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="font-family:var(--font-serif);font-size:1.2rem;line-height:1.5;margin-top:0;">${escapeHtml(s.riddle)}</p>
            <form class="inline-form" id="riddleForm">
              <input type="text" class="festive-input" id="riddleInput" placeholder="Escribe tu respuesta aquí..." required>
              <button type="submit" class="festive-btn primary-btn">Comprobar</button>
            </form>
            <button type="button" class="festive-btn secondary-btn" id="hintBtn" style="margin-top:10px;padding:6px 14px;font-size:0.82rem;">Ver pista ✨</button>
            <div id="riddleFeedback"></div>
          </div>
        `;
        const form = container.querySelector('#riddleForm');
        const input = container.querySelector('#riddleInput');
        const feedback = container.querySelector('#riddleFeedback');
        container.querySelector('#hintBtn').addEventListener('click', () => {
          feedback.innerHTML = `<div class="feedback-note">${escapeHtml(s.hint)}</div>`;
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const ok = s.acceptedAnswers.some((ans) =>
            ans.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === val
          );
          if (ok) {
            feedback.innerHTML = `<div class="feedback-note" style="background:rgba(36,120,66,0.45);">${escapeHtml(s.rewardMessage)}</div>`;
          } else {
            feedback.innerHTML = `<div class="feedback-note">Mmm casi, mi amor ♡ Inténtalo una vez más o mira la pista.</div>`;
          }
        });
        break;
      }

      case 'minijuego-corazones': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.instructions)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong id="heartScoreLabel">Corazones atrapados: 0 / ${s.targetScore}</strong>
              <button type="button" class="festive-btn primary-btn" id="startHeartsBtn" style="padding:6px 14px;font-size:0.85rem;">Empezar juego ♡</button>
            </div>
            <div class="catch-arena" id="catchArena"></div>
            <div id="heartsReward"></div>
          </div>
        `;
        const arena = container.querySelector('#catchArena');
        const scoreEl = container.querySelector('#heartScoreLabel');
        const startBtn = container.querySelector('#startHeartsBtn');
        const rewardEl = container.querySelector('#heartsReward');
        let score = 0;
        let gameTimer = null;
        let running = false;

        const stopGame = () => {
          running = false;
          if (gameTimer) clearInterval(gameTimer);
          gameTimer = null;
        };

        startBtn.addEventListener('click', () => {
          stopGame();
          score = 0;
          running = true;
          arena.innerHTML = '';
          rewardEl.innerHTML = '';
          scoreEl.textContent = `Corazones atrapados: 0 / ${s.targetScore}`;
          startBtn.textContent = 'Reiniciar';

          const spawnHeart = () => {
            if (!running) return;
            const heart = document.createElement('button');
            heart.type = 'button';
            heart.className = 'falling-heart-btn';
            heart.textContent = Math.random() > 0.35 ? '❤️' : '💖';
            heart.setAttribute('aria-label', 'Atrapar corazón');
            const leftPct = 8 + Math.random() * 82;
            heart.style.left = `${leftPct}%`;
            arena.appendChild(heart);

            const anim = heart.animate(
              [{ transform: 'translateY(0px)' }, { transform: 'translateY(290px)' }],
              { duration: 2400 + Math.random() * 900, easing: 'linear' }
            );
            anim.onfinish = () => heart.remove();

            heart.addEventListener('click', () => {
              if (!running) return;
              score += 1;
              scoreEl.textContent = `Corazones atrapados: ${score} / ${s.targetScore}`;
              heart.remove();
              if (score >= s.targetScore) {
                stopGame();
                arena.innerHTML = '';
                rewardEl.innerHTML = `
                  <div class="feedback-note">
                    <strong>${escapeHtml(s.rewardTitle)}</strong><br>
                    ${escapeHtml(s.rewardMessage)}
                  </div>
                `;
              }
            });
          };

          spawnHeart();
          gameTimer = setInterval(spawnHeart, 580);
        });

        activeCleanupFn = stopGame;
        break;
      }

      case 'promesas-estrellas': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <div class="reveal-list">
              ${s.promises.map((p, i) => `
                <button type="button" class="reveal-step-btn" data-p="${i}">
                  ⭐ Estrella ${i + 1} · Toca para encender promesa
                </button>
              `).join('')}
            </div>
          </div>
        `;
        container.querySelectorAll('.reveal-step-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.p);
            btn.classList.add('is-revealed');
            btn.textContent = `🌟 ${s.promises[idx]}`;
          });
        });
        break;
      }

      case 'pregunta-interactiva': {
        const saved = readStorage(STORAGE_KEYS.answers, {});
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <div class="reveal-list" id="quizQuestions"></div>
            <div id="quizDone"></div>
          </div>
        `;
        const qWrap = container.querySelector('#quizQuestions');
        const doneEl = container.querySelector('#quizDone');
        const renderQuiz = () => {
          qWrap.innerHTML = s.questions.map((q) => `
            <div style="margin-bottom:8px;">
              <div style="font-weight:700;margin-bottom:6px;color:#ffe6aa;">${escapeHtml(q.prompt)}</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${q.options.map((opt) => {
                  const active = saved[q.id] === opt;
                  return `<button type="button" class="reveal-step-btn${active ? ' is-revealed' : ''}" style="width:auto;padding:7px 12px;font-size:0.86rem;" data-qid="${q.id}" data-opt="${escapeHtml(opt)}">${active ? '♥ ' : ''}${escapeHtml(opt)}</button>`;
                }).join('')}
              </div>
            </div>
          `).join('');

          if (Object.keys(saved).length >= s.questions.length) {
            doneEl.innerHTML = `<div class="feedback-note">${escapeHtml(s.finalNote)}</div>`;
          }

          qWrap.querySelectorAll('button[data-qid]').forEach((btn) => {
            btn.addEventListener('click', () => {
              saved[btn.dataset.qid] = btn.dataset.opt;
              writeStorage(STORAGE_KEYS.answers, saved);
              renderQuiz();
            });
          });
        };
        renderQuiz();
        break;
      }

      case 'audio': {
        container.innerHTML = `
          <div class="music-player-card">
            <div style="font-weight:700;color:#ffe7aa;margin-bottom:8px;">🎙️ ${escapeHtml(s.audioLabel)}</div>
            ${s.mediaUrl
              ? `<audio controls src="${escapeHtml(s.mediaUrl)}" style="width:100%;"></audio>`
              : `<p style="font-size:0.85rem;opacity:0.85;margin-top:0;">Puedes enlazar un audio real en <code>data/surprises.js</code> (día 9 → <code>mediaUrl</code>). Mientras tanto, lee este mensajito escuchando la melodía:</p>
                 <button type="button" class="festive-btn primary-btn" id="playVoiceNoteMusic">▶ Reproducir música de fondo ♡</button>`
            }
            <blockquote class="quote-box">${escapeHtml(s.transcript)}</blockquote>
          </div>
        `;
        const btn = container.querySelector('#playVoiceNoteMusic');
        if (btn) {
          let on = false;
          btn.addEventListener('click', () => {
            if (on) {
              stopMelody();
              on = false;
              btn.textContent = '▶ Reproducir música de fondo ♡';
            } else {
              on = true;
              btn.textContent = '⏸ Pausar melodía';
              startMelody('romantic', () => {
                on = false;
                btn.textContent = '▶ Reproducir música de fondo ♡';
              });
            }
          });
          activeCleanupFn = () => { if (on) stopMelody(); };
        }
        break;
      }

      case 'reto': {
        const done = readStorage(STORAGE_KEYS.challenge10, false);
        container.innerHTML = `
          <div class="parchment-letter" style="text-align:center;">
            <p style="font-size:1.22rem;">${escapeHtml(s.challenge)}</p>
            <button type="button" class="festive-btn primary-btn" id="acceptChallengeBtn">
              ${done ? '✓ Reto aceptado ♡' : escapeHtml(s.buttonText)}
            </button>
            <div id="challengeStatus">${done ? `<div class="feedback-note" style="color:#4a1d11;background:rgba(168,24,34,0.12);">${escapeHtml(s.completedMessage)}</div>` : ''}</div>
          </div>
        `;
        container.querySelector('#acceptChallengeBtn').addEventListener('click', (e) => {
          writeStorage(STORAGE_KEYS.challenge10, true);
          e.currentTarget.textContent = '✓ Reto aceptado ♡';
          container.querySelector('#challengeStatus').innerHTML = `<div class="feedback-note" style="color:#4a1d11;background:rgba(168,24,34,0.12);">${escapeHtml(s.completedMessage)}</div>`;
        });
        break;
      }

      case 'esfera-deseos': {
        const currentWish = readStorage(STORAGE_KEYS.wish, '');
        container.innerHTML = `
          <div class="interactive-card" style="text-align:center;">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <div style="font-size:3.2rem;margin:6px 0;" aria-hidden="true">🔮🎄</div>
            <form id="wishForm">
              <textarea class="festive-textarea" id="wishInput" rows="3" placeholder="${escapeHtml(s.placeholder)}">${escapeHtml(currentWish)}</textarea>
              <button type="submit" class="festive-btn primary-btn" style="margin-top:10px;">Guardar deseo en la esfera ✨</button>
            </form>
            <div id="wishFeedback">${currentWish ? `<div class="feedback-note">${escapeHtml(s.savedNote)}<br>“${escapeHtml(currentWish)}”</div>` : ''}</div>
          </div>
        `;
        container.querySelector('#wishForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const val = container.querySelector('#wishInput').value.trim();
          if (!val) return;
          writeStorage(STORAGE_KEYS.wish, val);
          container.querySelector('#wishFeedback').innerHTML = `<div class="feedback-note">${escapeHtml(s.savedNote)}<br>“${escapeHtml(val)}”</div>`;
        });
        break;
      }

      case 'minijuego-memoria': {
        const icons = ['❤️', '☃️', '🧸', '🏮', '⭐', '🎁'];
        const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.instructions)}</p>
            <div class="memory-grid" id="memoryGrid"></div>
            <div id="memoryReward"></div>
          </div>
        `;
        const grid = container.querySelector('#memoryGrid');
        const reward = container.querySelector('#memoryReward');
        let first = null;
        let lock = false;
        let matched = 0;

        deck.forEach((symbol, idx) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'memory-card';
          card.dataset.symbol = symbol;
          card.setAttribute('aria-label', `Carta ${idx + 1}`);
          card.textContent = '❄';
          card.addEventListener('click', () => {
            if (lock || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
            card.classList.add('is-flipped');
            card.textContent = symbol;

            if (!first) {
              first = card;
              return;
            }
            if (first.dataset.symbol === card.dataset.symbol) {
              first.classList.add('is-matched');
              card.classList.add('is-matched');
              first = null;
              matched += 1;
              if (matched === icons.length) {
                reward.innerHTML = `<div class="feedback-note">${escapeHtml(s.rewardMessage)}</div>`;
              }
            } else {
              lock = true;
              const prev = first;
              first = null;
              setTimeout(() => {
                prev.classList.remove('is-flipped');
                card.classList.remove('is-flipped');
                prev.textContent = '❄';
                card.textContent = '❄';
                lock = false;
              }, 680);
            }
          });
          grid.appendChild(card);
        });
        break;
      }

      case 'recuerdo-editable': {
        container.innerHTML = `
          <article class="parchment-letter">
            <div style="font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8c2329;">${escapeHtml(s.dateLabel)}</div>
            <h2 style="margin:6px 0 10px;font-size:1.45rem;color:#3d1a10;">${escapeHtml(s.heading)}</h2>
            <p>${escapeHtml(s.body)}</p>
            <p class="letter-closing">${escapeHtml(s.footerQuote)}</p>
          </article>
        `;
        break;
      }

      case 'ruleta-actividad': {
        container.innerHTML = `
          <div class="interactive-card" style="text-align:center;">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <button type="button" class="festive-btn primary-btn" id="spinPlanBtn">🎡 Girar ruleta navideña</button>
            <div id="rouletteResult" style="margin-top:12px;"></div>
          </div>
        `;
        const resEl = container.querySelector('#rouletteResult');
        let spinTimer = null;
        container.querySelector('#spinPlanBtn').addEventListener('click', () => {
          if (spinTimer) clearInterval(spinTimer);
          let ticks = 0;
          spinTimer = setInterval(() => {
            const pick = s.activities[Math.floor(Math.random() * s.activities.length)];
            resEl.innerHTML = `<div class="feedback-note">✨ ${escapeHtml(pick)}</div>`;
            ticks += 1;
            if (ticks >= 10) {
              clearInterval(spinTimer);
              spinTimer = null;
            }
          }, 90);
        });
        activeCleanupFn = () => {
          if (spinTimer) clearInterval(spinTimer);
          spinTimer = null;
        };
        break;
      }

      case 'video': {
        const yt = extractYouTubeEmbedUrl(s.mediaUrl);
        container.innerHTML = `
          <div class="video-frame-card">
            <p style="margin-top:0;">${escapeHtml(s.caption)}</p>
            <div class="video-container">
              ${yt
                ? `<iframe src="${escapeHtml(yt)}" allowfullscreen title="${escapeHtml(s.title)}"></iframe>`
                : s.mediaUrl
                  ? `<video controls src="${escapeHtml(s.mediaUrl)}"></video>`
                  : `<div style="height:100%;display:grid;place-items:center;padding:20px;text-align:center;color:#ffe6b5;">
                       <div>
                         <div style="font-size:2.4rem;margin-bottom:8px;">🎬🎄</div>
                         <p style="margin:0;font-size:0.95rem;line-height:1.5;">${escapeHtml(s.fallbackMessage)}</p>
                       </div>
                     </div>`
              }
            </div>
          </div>
        `;
        break;
      }

      case 'raspa-nieve': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.instructions)}</p>
            <div class="scratch-box">
              <div>
                <h3 style="margin:0 0 6px;font-family:var(--font-serif);font-size:1.45rem;color:#ffe59d;">${escapeHtml(s.hiddenTitle)}</h3>
                <p style="margin:0;line-height:1.5;">${escapeHtml(s.hiddenMessage)}</p>
              </div>
              <canvas class="scratch-canvas" id="scratchCanvas"></canvas>
            </div>
            <button type="button" class="festive-btn secondary-btn" id="revealScratchBtn" style="margin-top:10px;padding:6px 14px;font-size:0.82rem;">Limpiar toda la nieve ✨</button>
          </div>
        `;
        const canvas = container.querySelector('#scratchCanvas');
        const ctx = canvas.getContext('2d');
        requestAnimationFrame(() => {
          const rect = canvas.getBoundingClientRect();
          canvas.width = Math.max(260, Math.round(rect.width));
          canvas.height = Math.max(150, Math.round(rect.height));
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#cfdbe8');
          grad.addColorStop(0.5, '#eef5fc');
          grad.addColorStop(1, '#b8c8d8');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#533522';
          ctx.font = '600 16px Quicksand, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❄️ Raspa aquí con tu dedo o cursor ❄️', canvas.width / 2, canvas.height / 2);

          let drawing = false;
          const onPointerUp = () => { drawing = false; };
          const scratchAt = (clientX, clientY) => {
            const b = canvas.getBoundingClientRect();
            const x = ((clientX - b.left) / b.width) * canvas.width;
            const y = ((clientY - b.top) / b.height) * canvas.height;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 24, 0, Math.PI * 2);
            ctx.fill();
          };
          canvas.addEventListener('pointerdown', (e) => { drawing = true; scratchAt(e.clientX, e.clientY); });
          canvas.addEventListener('pointermove', (e) => { if (drawing) scratchAt(e.clientX, e.clientY); });
          window.addEventListener('pointerup', onPointerUp);
          activeCleanupFn = () => window.removeEventListener('pointerup', onPointerUp);
        });
        container.querySelector('#revealScratchBtn').addEventListener('click', () => {
          canvas.style.opacity = '0';
          canvas.style.pointerEvents = 'none';
        });
        break;
      }

      case 'candado-secreto': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.clueClean)}</p>
            <form class="inline-form" id="lockForm">
              <input type="text" inputmode="numeric" maxlength="4" class="festive-input" id="lockInput" placeholder="Ej. 024" required>
              <button type="submit" class="festive-btn primary-btn">Abrir cofre 🔐</button>
            </form>
            <div id="lockFeedback"></div>
          </div>
        `;
        container.querySelector('#lockForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const val = container.querySelector('#lockInput').value.trim();
          const fb = container.querySelector('#lockFeedback');
          if (val === String(s.secretCode)) {
            fb.innerHTML = `<div class="feedback-note" style="background:rgba(36,120,66,0.45);">🔓 ${escapeHtml(s.unlockedMessage)}</div>`;
          } else {
            fb.innerHTML = `<div class="feedback-note">Ese código no abre el cofre... recuerda: ¿cuántos días tiene el calendario principal? ♡</div>`;
          }
        });
        break;
      }

      case 'frasco-motivos': {
        let index = 0;
        container.innerHTML = `
          <div class="interactive-card" style="text-align:center;">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <button type="button" class="festive-btn primary-btn" id="drawJarNoteBtn">🍯 Sacar un papelito dorado ✨</button>
            <div id="jarNoteOut" style="margin-top:12px;"></div>
          </div>
        `;
        container.querySelector('#drawJarNoteBtn').addEventListener('click', () => {
          const note = s.notes[index % s.notes.length];
          index += 1;
          container.querySelector('#jarNoteOut').innerHTML = `
            <div class="parchment-letter" style="text-align:center;padding:16px;">
              “${escapeHtml(note)}”
            </div>
          `;
        });
        break;
      }

      case 'pacto-firma': {
        const signed = readStorage(STORAGE_KEYS.pledge, false);
        container.innerHTML = `
          <div class="parchment-letter" style="text-align:center;">
            <p style="font-size:1.2rem;">${escapeHtml(s.pledgeText)}</p>
            <button type="button" class="festive-btn primary-btn" id="signPledgeBtn">
              ${signed ? `✓ ${escapeHtml(s.signedText)}` : escapeHtml(s.buttonLabel)}
            </button>
          </div>
        `;
        container.querySelector('#signPledgeBtn').addEventListener('click', (e) => {
          writeStorage(STORAGE_KEYS.pledge, true);
          e.currentTarget.textContent = `✓ ${s.signedText}`;
        });
        break;
      }

      case 'lluvia-estrellas': {
        container.innerHTML = `
          <div class="interactive-card">
            <p style="margin-top:0;">${escapeHtml(s.intro)}</p>
            <div class="reveal-list">
              ${s.words.map((w, i) => `
                <button type="button" class="reveal-step-btn" data-w="${i}">
                  🌠 Estrella fugaz #${i + 1} · Toca para descubrir
                </button>
              `).join('')}
            </div>
          </div>
        `;
        container.querySelectorAll('.reveal-step-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const w = s.words[Number(btn.dataset.w)];
            btn.classList.add('is-revealed');
            btn.textContent = `✨ ${w.label}: ${w.detail}`;
          });
        });
        break;
      }

      case 'gran-regalo-24': {
        const yt = extractYouTubeEmbedUrl(s.videoUrl);
        const letterHtml = s.letterParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
        container.innerHTML = `
          <div style="display:grid;gap:16px;">
            <article class="parchment-letter">
              <p class="letter-salutation">${escapeHtml(s.salutation)}</p>
              ${letterHtml}
              <p class="letter-closing">${escapeHtml(s.closing)}</p>
            </article>

            <div class="music-player-card">
              <div class="vinyl-row">
                <div class="vinyl-disc" id="vinyl24" aria-hidden="true"></div>
                <div style="flex:1;min-width:180px;">
                  <div style="font-weight:700;color:#ffe6a1;">${escapeHtml(s.songTitle)}</div>
                  <div style="font-size:0.86rem;opacity:0.88;">${escapeHtml(s.songArtist)}</div>
                </div>
                <button type="button" class="festive-btn primary-btn" id="play24Btn">▶ Canción de Nochebuena</button>
              </div>
              ${s.songUrl ? `<audio controls src="${escapeHtml(s.songUrl)}" style="width:100%;margin-top:10px;"></audio>` : ''}
            </div>

            <div class="video-frame-card">
              <h3 style="margin:0 0 6px;font-family:var(--font-serif);color:#ffe7a8;">🎬 ${escapeHtml(s.videoTitle)}</h3>
              <div class="video-container">
                ${yt
                  ? `<iframe src="${escapeHtml(yt)}" allowfullscreen title="${escapeHtml(s.videoTitle)}"></iframe>`
                  : s.videoUrl
                    ? `<video controls src="${escapeHtml(s.videoUrl)}"></video>`
                    : `<div style="height:100%;display:grid;place-items:center;padding:18px;text-align:center;color:#ffe8ba;">
                         <p style="margin:0;font-size:0.95rem;line-height:1.5;">${escapeHtml(s.videoFallbackNote)}</p>
                       </div>`
                }
              </div>
            </div>

            <div class="feedback-note" style="text-align:center;font-family:var(--font-serif);font-size:1.18rem;">
              ${escapeHtml(s.finalConstellationText)}
            </div>
          </div>
        `;
        const play24Btn = container.querySelector('#play24Btn');
        const vinyl24 = container.querySelector('#vinyl24');
        let on24 = false;
        play24Btn.addEventListener('click', () => {
          if (on24) {
            stopMelody();
            on24 = false;
            vinyl24.classList.remove('is-spinning');
            play24Btn.textContent = '▶ Canción de Nochebuena';
          } else {
            on24 = true;
            vinyl24.classList.add('is-spinning');
            play24Btn.textContent = '⏸ Pausar';
            startMelody('silent-night', () => {
              on24 = false;
              vinyl24.classList.remove('is-spinning');
              play24Btn.textContent = '▶ Canción de Nochebuena';
            });
          }
        });
        activeCleanupFn = () => { if (on24) stopMelody(); };
        break;
      }

      case 'bonus-25': {
        const paras = s.messageParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
        container.innerHTML = `
          <div style="display:grid;gap:14px;">
            <p style="margin:0;text-align:center;font-family:var(--font-serif);font-size:1.2rem;color:#ffe9b0;">
              ✨ ${escapeHtml(s.subtitle)} ✨
            </p>
            <article class="parchment-letter">
              ${paras}
            </article>
            <div class="coupon-ticket">
              <div class="coupon-kicker">REGALO EXTRA DE NAVIDAD</div>
              <p style="margin:6px 0 0;font-weight:700;">${escapeHtml(s.giftCoupon)}</p>
            </div>
          </div>
        `;
        break;
      }

      default:
        container.innerHTML = `<div class="parchment-letter"><p>${escapeHtml(s.title)}</p></div>`;
    }
  }

  /* ------------------------------------------------------------------------
     9. AMBIENTACIÓN: ESTRELLAS, GUIRNALDAS DE LUCES, LUCES DEL TABLERO Y NIEVE
     ------------------------------------------------------------------------ */
  function populateBackdropLights() {
    const starsLayer = document.getElementById('starsLayer');
    for (let i = 0; i < 48; i += 1) {
      const star = document.createElement('span');
      star.className = 'bg-star';
      const size = 1.5 + Math.random() * 2.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 90}%`;
      star.style.setProperty('--dur', `${2.6 + Math.random() * 3.4}s`);
      star.style.setProperty('--delay', `${Math.random() * 3}s`);
      starsLayer.appendChild(star);
    }

    const leftFestoon = document.getElementById('festoonLeft');
    const rightFestoon = document.getElementById('festoonRight');
    const leftPts = [[8, 28], [18, 52], [29, 68], [41, 78], [54, 80], [67, 74], [80, 61], [92, 46]];
    const rightPts = [[8, 44], [20, 60], [33, 72], [46, 78], [59, 75], [71, 65], [83, 49], [93, 30]];

    leftPts.forEach(([x, y], i) => {
      const b = document.createElement('span');
      b.className = 'festoon-bulb';
      b.style.left = `${x}%`;
      b.style.top = `${y}px`;
      b.style.setProperty('--dur', `${2.4 + (i % 3) * 0.6}s`);
      b.style.setProperty('--delay', `${i * 0.3}s`);
      leftFestoon.appendChild(b);
    });

    rightPts.forEach(([x, y], i) => {
      const b = document.createElement('span');
      b.className = 'festoon-bulb';
      b.style.left = `${x}%`;
      b.style.top = `${y}px`;
      b.style.setProperty('--dur', `${2.4 + (i % 3) * 0.6}s`);
      b.style.setProperty('--delay', `${i * 0.25}s`);
      rightFestoon.appendChild(b);
    });

    const boardLights = document.getElementById('boardLights');
    for (let i = 0; i < 34; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'fairy-dot';
      dot.style.left = `${4 + (i * 19) % 92}%`;
      dot.style.top = `${6 + Math.floor(i / 6) * 18 + (i % 3) * 3}%`;
      dot.style.setProperty('--dur', `${2.2 + (i % 4) * 0.55}s`);
      dot.style.setProperty('--delay', `${(i * 0.2) % 2.5}s`);
      boardLights.appendChild(dot);
    }
  }

  let snowAnimationId = null;
  let motionPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initSnowCanvas() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const flakes = [];
    const FLAKES_COUNT = window.innerWidth < 700 ? 48 : 85;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < FLAKES_COUNT; i += 1) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.1 + Math.random() * 2.6,
        vy: 0.45 + Math.random() * 0.95,
        vx: (Math.random() - 0.5) * 0.45,
        isGold: i % 9 === 0,
        alpha: 0.35 + Math.random() * 0.55
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.isGold
          ? `rgba(255, 224, 138, ${f.alpha})`
          : `rgba(244, 249, 255, ${f.alpha})`;
        ctx.fill();

        if (!motionPaused) {
          f.y += f.vy;
          f.x += f.vx + Math.sin(f.y * 0.015) * 0.22;
          if (f.y > height + 8) {
            f.y = -8;
            f.x = Math.random() * width;
          }
          if (f.x > width + 8) f.x = -8;
          if (f.x < -8) f.x = width + 8;
        }
      }
      if (!motionPaused) {
        snowAnimationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return {
      pause: () => {
        motionPaused = true;
        if (snowAnimationId) cancelAnimationFrame(snowAnimationId);
        snowAnimationId = null;
      },
      resume: () => {
        if (!motionPaused) return;
        motionPaused = false;
        draw();
      }
    };
  }

  function setupAmbientControls(snowController) {
    const toggleMotionBtn = document.getElementById('toggleMotionBtn');
    const toggleMusicBtn = document.getElementById('toggleMusicBtn');

    if (motionPaused) {
      document.body.classList.add('motion-paused');
      toggleMotionBtn.querySelector('.ambient-btn-text').textContent = 'Reanudar magia';
      toggleMotionBtn.setAttribute('aria-label', 'Reanudar animaciones de nieve y luces');
    }

    toggleMotionBtn.addEventListener('click', () => {
      if (motionPaused) {
        document.body.classList.remove('motion-paused');
        snowController.resume();
        toggleMotionBtn.querySelector('.ambient-btn-text').textContent = 'Pausar magia';
        toggleMotionBtn.setAttribute('aria-label', 'Pausar animaciones de nieve y luces');
      } else {
        document.body.classList.add('motion-paused');
        snowController.pause();
        toggleMotionBtn.querySelector('.ambient-btn-text').textContent = 'Reanudar magia';
        toggleMotionBtn.setAttribute('aria-label', 'Reanudar animaciones de nieve y luces');
      }
    });

    toggleMusicBtn.addEventListener('click', () => {
      if (isAmbientMusicPlaying) {
        stopMelody();
      } else {
        toggleMusicBtn.setAttribute('aria-pressed', 'true');
        startMelody('ambient', () => {
          toggleMusicBtn.setAttribute('aria-pressed', 'false');
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. INICIALIZACIÓN PRINCIPAL (RENDER INMEDIATO + UPGRADE TEMPORAL)
     ------------------------------------------------------------------------ */
  function init() {
    window.refreshAdventGrid = renderCalendarGrid;
    populateBackdropLights();
    setupDialogBehaviors();
    updateCountdownUI();
    renderCalendarGrid();

    const snowController = initSnowCanvas();
    setupAmbientControls(snowController);

    // Carga progresiva de Temporal polyfill sin bloquear el primer pintado
    ensureTemporalIfNeeded().then((loaded) => {
      if (loaded) {
        updateCountdownUI();
        renderCalendarGrid();
      }
    });

    // Refresca contador y desbloqueo de medianoche Perú automáticamente cada 30s
    let lastPeruDay = getPeruNowParts().day;
    setInterval(() => {
      updateCountdownUI();
      const nowDay = getPeruNowParts().day;
      if (nowDay !== lastPeruDay) {
        lastPeruDay = nowDay;
        renderCalendarGrid();
      }
    }, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
