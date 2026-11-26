/* ==========================================================================
   ADMIN EDIT — Calendario de Adviento
   Candado único (esquina superior derecha). Clave: 180726
   Al desbloquear: abre todos los regalos y permite editar cada detalle
   tanto desde las tarjetas como desde adentro de cada regalo abierto.
   ========================================================================== */
(function () {
  'use strict';

  const ADMIN_KEY = '180726';
  const STORAGE_EDIT = 'arii_advent_edits_v1';

  const FIELD_LABELS = {
    typeLabel: 'Etiqueta del tipo',
    title: 'Título del regalo',
    salutation: 'Saludo',
    paragraphs: 'Párrafos de la carta (un párrafo por línea)',
    closing: 'Despedida / firma',
    intro: 'Texto introductorio',
    lines: 'Motivos / líneas (una por línea)',
    couponTitle: 'Título del cupón',
    couponCode: 'Código del cupón',
    benefit: 'Beneficio / descripción',
    validNote: 'Nota de validez',
    songTitle: 'Nombre de la canción',
    artist: 'Artista / dedicatoria',
    mediaUrl: 'Enlace MP3 / MP4 / YouTube (opcional)',
    lyricsQuote: 'Frase o letra destacada',
    note: 'Nota adicional',
    riddle: 'Acertijo',
    answer: 'Respuesta correcta',
    hint: 'Pista',
    reward: 'Recompensa al acertar',
    promises: 'Promesas (una por línea)',
    finalNote: 'Mensaje final',
    audioLabel: 'Título del audio',
    transcript: 'Mensaje / transcripción',
    challenge: 'Texto del reto',
    prompt: 'Pregunta o consigna',
    activities: 'Opciones de la ruleta (una por línea)',
    videoTitle: 'Título del video',
    scratchMessage: 'Mensaje oculto al raspar',
    secretCode: 'Clave secreta',
    secretMessage: 'Mensaje secreto al desbloquear',
    reasons: 'Motivos del frasco (uno por línea)',
    pactText: 'Texto del pacto',
    stars: 'Mensajes de las estrellas (uno por línea)',
    letterParagraphs: 'Párrafos de la carta final (uno por línea)',
    finalPromise: 'Promesa final',
    bonusMessage: 'Mensaje del bonus navideño',
    questions: 'Preguntas del cuestionario'
  };

  const LONG_KEYS = new Set([
    'intro', 'benefit', 'lyricsQuote', 'note', 'riddle', 'reward',
    'finalNote', 'transcript', 'challenge', 'prompt', 'scratchMessage',
    'secretMessage', 'pactText', 'finalPromise', 'bonusMessage', 'validNote'
  ]);

  const SKIP_KEYS = new Set(['day', 'type', 'melodyPreset', 'targetCount']);

  function readEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_EDIT)) || {}; } catch { return {}; }
  }

  function saveEdits(data) {
    try { localStorage.setItem(STORAGE_EDIT, JSON.stringify(data)); } catch {}
  }

  /* ---- Estilos ---- */
  const style = document.createElement('style');
  style.textContent = `
    #adminLockBtn {
      position: fixed;
      top: 14px;
      right: 18px;
      z-index: 9999;
      background: rgba(10, 30, 15, 0.82);
      border: 1.5px solid rgba(255, 220, 120, 0.55);
      border-radius: 50%;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
      transition: background 0.25s, transform 0.15s;
      backdrop-filter: blur(4px);
    }
    #adminLockBtn:hover { background: rgba(20, 55, 25, 0.95); transform: scale(1.1); }
    #adminLockBtn.unlocked { border-color: rgba(100, 255, 120, 0.7); }

    dialog.admin-dialog {
      border: none;
      padding: 0;
      background: transparent;
      max-width: 94vw;
      margin: auto;
      overflow: visible;
    }
    dialog.admin-dialog::backdrop {
      background: rgba(0, 0, 0, 0.68);
      backdrop-filter: blur(3px);
    }

    .admin-modal-box {
      background: linear-gradient(145deg, #0d2b18, #061a0e);
      border: 2px solid rgba(255, 210, 80, 0.55);
      border-radius: 18px;
      padding: 28px 26px 22px;
      color: #f3ead4;
      font-family: 'Quicksand', sans-serif;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.65);
      box-sizing: border-box;
    }
    .admin-pw-box { width: 330px; max-width: 90vw; text-align: center; }
    .admin-edit-box {
      width: 480px;
      max-width: 92vw;
      max-height: 86vh;
      overflow-y: auto;
      text-align: left;
    }
    .admin-modal-box h2 { margin: 0 0 6px; font-size: 1.22rem; color: #ffd97d; }
    .admin-modal-box p.admin-sub { font-size: 0.85rem; color: #c8bfa0; margin: 0 0 16px; }

    #adminPwInput {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1.5px solid rgba(255, 210, 80, 0.5);
      background: rgba(255, 255, 255, 0.07);
      color: #fff;
      font-size: 1.1rem;
      text-align: center;
      letter-spacing: 4px;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 6px;
    }
    #adminPwInput:focus { border-color: #ffd97d; }
    #adminPwError { color: #ff7a7a; font-size: 0.82rem; min-height: 18px; margin-bottom: 10px; }

    .admin-btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .admin-edit-actions { display: flex; gap: 10px; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; }
    .admin-btn {
      padding: 9px 18px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .admin-btn:hover { opacity: 0.88; }
    .admin-btn-confirm { background: #d9a444; color: #1a0a00; }
    .admin-btn-cancel { background: rgba(255, 255, 255, 0.1); color: #d4c99a; }
    .admin-btn-reset { background: rgba(220, 75, 75, 0.22); color: #ffb3b3; border: 1px solid rgba(255, 130, 130, 0.35); }

    #adminBar {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      background: rgba(10, 30, 15, 0.92);
      border: 1.5px solid rgba(255, 210, 80, 0.55);
      border-radius: 14px;
      padding: 10px 20px;
      color: #ffd97d;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.86rem;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    #adminBar.hidden { display: none; }
    #adminBarLock {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 210, 80, 0.4);
      border-radius: 8px;
      color: #ffd97d;
      padding: 5px 12px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .gift-tile { position: relative; }
    .edit-gift-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 10;
      background: rgba(217, 164, 68, 0.95);
      border: none;
      border-radius: 7px;
      color: #1a0a00;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 3px 7px;
      cursor: pointer;
      display: none;
      font-family: 'Quicksand', sans-serif;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
      pointer-events: auto;
    }
    .edit-gift-btn:hover { background: #f5c14a; }
    body.admin-mode .gift-tile .edit-gift-btn,
    body.admin-mode .bonus-25-btn .edit-gift-btn { display: block; }

    #insideEditBtn {
      display: none;
      background: #d9a444;
      color: #1a0a00;
      border: none;
      border-radius: 999px;
      padding: 10px 18px;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    }
    #insideEditBtn:hover { background: #f5c14a; }
    body.admin-mode #insideEditBtn { display: inline-flex; align-items: center; gap: 6px; }

    .edit-field-group { margin-bottom: 12px; }
    .edit-field-label {
      font-size: 0.82rem;
      color: #e4d8b4;
      margin-bottom: 4px;
      display: block;
      font-weight: 600;
    }
    .edit-field {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 210, 80, 0.38);
      border-radius: 9px;
      color: #fff;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.92rem;
      padding: 8px 11px;
      box-sizing: border-box;
      resize: vertical;
      outline: none;
    }
    .edit-field:focus { border-color: #ffd97d; }
    .edit-q-block {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 210, 80, 0.22);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
  `;
  document.head.appendChild(style);

  let adminUnlocked = false;
  let currentEditDay = null;

  /* ---- Candado superior derecho ---- */
  const lockBtn = document.createElement('button');
  lockBtn.type = 'button';
  lockBtn.id = 'adminLockBtn';
  lockBtn.setAttribute('aria-label', 'Acceso de edición');
  lockBtn.setAttribute('title', 'Acceso de edición');
  lockBtn.textContent = '🔒';
  document.body.appendChild(lockBtn);

  /* ---- Modal contraseña (<dialog>) ---- */
  const pwDialog = document.createElement('dialog');
  pwDialog.id = 'adminPwDialog';
  pwDialog.className = 'admin-dialog';
  pwDialog.innerHTML = `
    <div class="admin-modal-box admin-pw-box">
      <h2>🔐 Acceso de edición</h2>
      <p class="admin-sub">Introduce la clave para abrir y editar todos los regalos</p>
      <input id="adminPwInput" type="password" placeholder="••••••" maxlength="20" autocomplete="off" />
      <div id="adminPwError"></div>
      <div class="admin-btn-row">
        <button type="button" class="admin-btn admin-btn-cancel" id="adminCancelBtn">Cancelar</button>
        <button type="button" class="admin-btn admin-btn-confirm" id="adminConfirmBtn">Entrar ✨</button>
      </div>
    </div>`;
  document.body.appendChild(pwDialog);

  /* ---- Barra flotante ---- */
  const adminBar = document.createElement('div');
  adminBar.id = 'adminBar';
  adminBar.className = 'hidden';
  adminBar.innerHTML = `<span>✏️ Modo edición activo — abre cualquier regalo o pulsa ✏️ para editarlo</span>
    <button type="button" id="adminBarLock">🔒 Cerrar</button>`;
  document.body.appendChild(adminBar);

  /* ---- Modal edición (<dialog>) ---- */
  const editDialog = document.createElement('dialog');
  editDialog.id = 'editGiftDialog';
  editDialog.className = 'admin-dialog';
  editDialog.innerHTML = `
    <div class="admin-modal-box admin-edit-box">
      <h2>✏️ Editar regalo <span id="editGiftDayLabel"></span></h2>
      <p class="admin-sub">Personaliza cualquier parte del contenido de este regalo.</p>
      <div id="editFieldsContainer"></div>
      <div class="admin-edit-actions">
        <button type="button" class="admin-btn admin-btn-reset" id="editResetBtn">↺ Restaurar original</button>
        <div class="admin-btn-row">
          <button type="button" class="admin-btn admin-btn-cancel" id="editCancelBtn">Cancelar</button>
          <button type="button" class="admin-btn admin-btn-confirm" id="editSaveBtn">Guardar ✨</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(editDialog);

  /* ---- Botón "Editar este regalo" dentro de #surpriseDialog ---- */
  function ensureInsideEditButton() {
    const footer = document.querySelector('#surpriseDialog .surprise-footer');
    if (!footer || document.getElementById('insideEditBtn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'insideEditBtn';
    btn.textContent = '✏️ Editar este regalo';
    btn.addEventListener('click', () => {
      if (window.__CURRENT_OPEN_DAY__) {
        openEditModal(Number(window.__CURRENT_OPEN_DAY__));
      }
    });
    footer.appendChild(btn);
  }

  /* ---- Contraseña ---- */
  function openPasswordModal() {
    const inp = document.getElementById('adminPwInput');
    inp.value = '';
    document.getElementById('adminPwError').textContent = '';
    pwDialog.showModal();
    setTimeout(() => inp.focus(), 60);
  }

  function closePasswordModal() {
    if (pwDialog.open) pwDialog.close();
  }

  function attemptUnlock() {
    const val = document.getElementById('adminPwInput').value.trim();
    if (val === ADMIN_KEY) {
      closePasswordModal();
      activateAdminMode();
    } else {
      document.getElementById('adminPwError').textContent = '❌ Clave incorrecta, inténtalo de nuevo.';
      const inp = document.getElementById('adminPwInput');
      inp.value = '';
      inp.focus();
    }
  }

  function lockAdminMode() {
    adminUnlocked = false;
    window.__ADMIN_UNLOCKED__ = false;
    lockBtn.textContent = '🔒';
    lockBtn.classList.remove('unlocked');
    lockBtn.setAttribute('aria-label', 'Acceso de edición');
    document.body.classList.remove('admin-mode');
    adminBar.classList.add('hidden');
    if (typeof window.refreshAdventGrid === 'function') {
      window.refreshAdventGrid();
    }
  }

  function activateAdminMode() {
    adminUnlocked = true;
    window.__ADMIN_UNLOCKED__ = true;
    lockBtn.textContent = '🔓';
    lockBtn.classList.add('unlocked');
    lockBtn.setAttribute('aria-label', 'Cerrar modo edición');
    document.body.classList.add('admin-mode');
    adminBar.classList.remove('hidden');
    ensureInsideEditButton();
    if (typeof window.refreshAdventGrid === 'function') {
      window.refreshAdventGrid();
    }
    injectEditButtons();

    const grid = document.getElementById('giftsGrid');
    if (grid && !grid._adminObserver) {
      grid._adminObserver = new MutationObserver(() => {
        if (adminUnlocked) injectEditButtons();
      });
      grid._adminObserver.observe(grid, { childList: true });
    }
    const bonusWrap = document.getElementById('bonus25Wrap');
    if (bonusWrap && !bonusWrap._adminObserver) {
      bonusWrap._adminObserver = new MutationObserver(() => {
        if (adminUnlocked) injectEditButtons();
      });
      bonusWrap._adminObserver.observe(bonusWrap, { childList: true });
    }
  }

  function createEditTrigger(dayNum) {
    const btn = document.createElement('span');
    btn.className = 'edit-gift-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', `Editar regalo ${dayNum}`);
    btn.textContent = '✏️';
    const triggerEdit = (e) => {
      e.stopPropagation();
      e.preventDefault();
      openEditModal(Number(dayNum));
    };
    btn.addEventListener('click', triggerEdit);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') triggerEdit(e);
    });
    return btn;
  }

  function injectEditButtons() {
    const grid = document.getElementById('giftsGrid');
    if (grid) {
      grid.querySelectorAll('.gift-tile').forEach((card) => {
        if (card.querySelector('.edit-gift-btn')) return;
        const dayAttr = card.dataset.day;
        if (!dayAttr) return;
        card.appendChild(createEditTrigger(dayAttr));
      });
    }
    const bonusBtn = document.querySelector('.bonus-25-btn');
    if (bonusBtn && !bonusBtn.querySelector('.edit-gift-btn')) {
      bonusBtn.style.position = 'relative';
      bonusBtn.appendChild(createEditTrigger(25));
    }
  }

  /* ---- Renderizado dinámico de campos del regalo ---- */
  function openEditModal(day) {
    currentEditDay = day;
    const base = (window.ADVENT_SURPRISES && window.ADVENT_SURPRISES[day]) || {};
    const saved = readEdits()[day] || {};
    const merged = Object.assign({}, base, saved);

    document.getElementById('editGiftDayLabel').textContent = day === 25 ? '#25 (Bonus)' : `#${day}`;
    const container = document.getElementById('editFieldsContainer');
    container.innerHTML = '';

    Object.keys(base).forEach((key) => {
      if (SKIP_KEYS.has(key)) return;
      const val = merged[key];
      const labelText = FIELD_LABELS[key] || key;

      if (key === 'questions' && Array.isArray(val)) {
        const group = document.createElement('div');
        group.className = 'edit-field-group';
        group.dataset.key = key;
        group.dataset.kind = 'questions';
        group.innerHTML = `<span class="edit-field-label">${labelText}</span>`;
        val.forEach((q, idx) => {
          const block = document.createElement('div');
          block.className = 'edit-q-block';
          block.innerHTML = `
            <label class="edit-field-label">Pregunta ${idx + 1}</label>
            <input class="edit-field edit-q-prompt" type="text" data-qidx="${idx}" />
            <label class="edit-field-label" style="margin-top:6px;">Opciones (una por línea)</label>
            <textarea class="edit-field edit-q-options" rows="3" data-qidx="${idx}"></textarea>
          `;
          block.querySelector('.edit-q-prompt').value = q.prompt || '';
          block.querySelector('.edit-q-options').value = Array.isArray(q.options) ? q.options.join('\n') : '';
          group.appendChild(block);
        });
        container.appendChild(group);
        return;
      }

      if (Array.isArray(val)) {
        const group = document.createElement('div');
        group.className = 'edit-field-group';
        group.dataset.key = key;
        group.dataset.kind = 'array';
        const rows = Math.min(8, Math.max(3, val.length));
        group.innerHTML = `<label class="edit-field-label">${labelText}</label>
          <textarea class="edit-field" rows="${rows}"></textarea>`;
        group.querySelector('textarea').value = val.join('\n');
        container.appendChild(group);
        return;
      }

      if (typeof val === 'string') {
        const group = document.createElement('div');
        group.className = 'edit-field-group';
        group.dataset.key = key;
        group.dataset.kind = 'string';
        const useTextarea = LONG_KEYS.has(key) || val.length > 75 || val.includes('\n');
        group.innerHTML = `<label class="edit-field-label">${labelText}</label>` +
          (useTextarea
            ? `<textarea class="edit-field" rows="3"></textarea>`
            : `<input class="edit-field" type="text" />`);
        group.querySelector('.edit-field').value = val;
        container.appendChild(group);
      }
    });

    editDialog.showModal();
  }

  function closeEditModal() {
    if (editDialog.open) editDialog.close();
    currentEditDay = null;
  }

  function saveEdit() {
    if (!currentEditDay) return;
    const day = currentEditDay;
    const base = (window.ADVENT_SURPRISES && window.ADVENT_SURPRISES[day]) || {};
    const container = document.getElementById('editFieldsContainer');
    const updated = {};

    container.querySelectorAll('.edit-field-group').forEach((group) => {
      const key = group.dataset.key;
      const kind = group.dataset.kind;
      if (kind === 'string') {
        updated[key] = group.querySelector('.edit-field').value;
      } else if (kind === 'array') {
        const lines = group.querySelector('textarea').value
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        updated[key] = lines;
      } else if (kind === 'questions') {
        const origQs = Array.isArray(base.questions) ? base.questions : [];
        const newQs = [];
        group.querySelectorAll('.edit-q-block').forEach((block, idx) => {
          const prompt = block.querySelector('.edit-q-prompt').value;
          const options = block.querySelector('.edit-q-options').value
            .split('\n')
            .map((o) => o.trim())
            .filter((o) => o.length > 0);
          newQs.push({
            id: (origQs[idx] && origQs[idx].id) || `q${idx + 1}`,
            prompt,
            options
          });
        });
        updated[key] = newQs;
      }
    });

    const edits = readEdits();
    edits[day] = updated;
    saveEdits(edits);

    closeEditModal();
    if (typeof window.refreshOpenSurpriseModal === 'function') {
      window.refreshOpenSurpriseModal(day);
    }
    showToast(`✅ Regalo #${day} guardado`);
  }

  function resetCurrentEdit() {
    if (!currentEditDay) return;
    const day = currentEditDay;
    const edits = readEdits();
    delete edits[day];
    saveEdits(edits);
    closeEditModal();
    if (typeof window.refreshOpenSurpriseModal === 'function') {
      window.refreshOpenSurpriseModal(day);
    }
    showToast(`↺ Regalo #${day} restaurado al original`);
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);' +
      'background:rgba(10,30,15,0.95);color:#ffd97d;padding:9px 22px;border-radius:12px;' +
      'font-family:Quicksand,sans-serif;font-size:0.9rem;z-index:20000;' +
      'border:1px solid rgba(255,210,80,0.4);box-shadow:0 4px 20px rgba(0,0,0,0.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  /* ---- Eventos ---- */
  lockBtn.addEventListener('click', () => {
    if (adminUnlocked) lockAdminMode();
    else openPasswordModal();
  });

  document.getElementById('adminConfirmBtn').addEventListener('click', attemptUnlock);
  document.getElementById('adminCancelBtn').addEventListener('click', closePasswordModal);
  document.getElementById('adminBarLock').addEventListener('click', lockAdminMode);
  document.getElementById('editSaveBtn').addEventListener('click', saveEdit);
  document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
  document.getElementById('editResetBtn').addEventListener('click', resetCurrentEdit);

  document.getElementById('adminPwInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock();
  });

  pwDialog.addEventListener('click', (e) => {
    if (e.target === pwDialog) closePasswordModal();
  });
  editDialog.addEventListener('click', (e) => {
    if (e.target === editDialog) closeEditModal();
  });

  window.getAdventEdits = readEdits;
})();
