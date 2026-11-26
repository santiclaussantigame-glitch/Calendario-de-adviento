/* ==========================================================================
   ADMIN EDIT — Calendario de Adviento
   Candado único (esquina superior derecha). Clave: 180726
   Al desbloquear: abre todos los regalos y permite editar su contenido.
   ========================================================================== */
(function () {
  'use strict';

  const ADMIN_KEY    = '180726';
  const STORAGE_EDIT = 'arii_advent_edits_v1';

  /* ---- utilidades ---- */
  function readEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_EDIT)) || {}; } catch { return {}; }
  }
  function saveEdits(data) {
    try { localStorage.setItem(STORAGE_EDIT, JSON.stringify(data)); } catch {}
  }

  /* ---- inyectar estilos ---- */
  const style = document.createElement('style');
  style.textContent = `
    /* --- Botón candado --- */
    #adminLockBtn {
      position: fixed;
      top: 14px;
      right: 18px;
      z-index: 9999;
      background: rgba(10, 30, 15, 0.82);
      border: 1.5px solid rgba(255,220,120,0.55);
      border-radius: 50%;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.5);
      transition: background 0.25s, transform 0.15s;
      backdrop-filter: blur(4px);
    }
    #adminLockBtn:hover { background: rgba(20,55,25,0.95); transform: scale(1.1); }
    #adminLockBtn.unlocked { border-color: rgba(100,255,120,0.7); }

    /* --- Overlay modal clave --- */
    #adminOverlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.65);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(3px);
    }
    #adminOverlay.hidden { display: none; }
    #adminModal {
      background: linear-gradient(145deg,#0d2b18,#061a0e);
      border: 2px solid rgba(255,210,80,0.55);
      border-radius: 18px;
      padding: 36px 32px 28px;
      max-width: 340px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      color: #f3ead4;
      font-family: 'Quicksand', sans-serif;
    }
    #adminModal h2 { margin: 0 0 8px; font-size: 1.3rem; color: #ffd97d; }
    #adminModal p  { font-size: 0.88rem; color: #c8bfa0; margin: 0 0 18px; }
    #adminPwInput {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1.5px solid rgba(255,210,80,0.5);
      background: rgba(255,255,255,0.07);
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
    .admin-btn-row { display: flex; gap: 10px; justify-content: center; margin-top: 4px; }
    .admin-btn {
      padding: 9px 22px; border-radius: 10px; border: none; cursor: pointer;
      font-family: 'Quicksand', sans-serif; font-weight: 700; font-size: 0.95rem;
      transition: opacity 0.2s;
    }
    .admin-btn:hover { opacity: 0.85; }
    .admin-btn-confirm { background: #d9a444; color: #1a0a00; }
    .admin-btn-cancel  { background: rgba(255,255,255,0.1); color: #d4c99a; }

    /* --- Barra de edición flotante (aparece solo en modo admin) --- */
    #adminBar {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      background: rgba(10,30,15,0.92);
      border: 1.5px solid rgba(255,210,80,0.55);
      border-radius: 14px;
      padding: 10px 22px;
      color: #ffd97d;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      transition: opacity 0.3s;
    }
    #adminBar.hidden { display: none; }
    #adminBar span { opacity: 0.85; }
    #adminBarLock {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,210,80,0.4);
      border-radius: 8px;
      color: #ffd97d;
      padding: 5px 12px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 700;
    }
    #adminBarLock:hover { background: rgba(255,255,255,0.14); }

    /* --- Botón editar en cada tarjeta (solo modo admin) --- */
    .gift-tile { position: relative; }
    .edit-gift-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 10;
      background: rgba(217,164,68,0.92);
      border: none;
      border-radius: 7px;
      color: #1a0a00;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      cursor: pointer;
      display: none;
      font-family: 'Quicksand', sans-serif;
      box-shadow: 0 1px 6px rgba(0,0,0,0.3);
      transition: background 0.2s;
      pointer-events: auto;
    }
    .edit-gift-btn:hover { background: #f5c14a; }
    body.admin-mode .gift-tile .edit-gift-btn,
    body.admin-mode .bonus-25-btn .edit-gift-btn { display: block; }

    /* --- Modal de edición de regalo --- */
    #editGiftOverlay {
      position: fixed; inset: 0; z-index: 11000;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(3px);
    }
    #editGiftOverlay.hidden { display: none; }
    #editGiftModal {
      background: linear-gradient(145deg,#0d2b18,#061a0e);
      border: 2px solid rgba(255,210,80,0.55);
      border-radius: 18px;
      padding: 32px 28px 24px;
      max-width: 400px;
      width: 93%;
      color: #f3ead4;
      font-family: 'Quicksand', sans-serif;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    }
    #editGiftModal h2 { margin: 0 0 6px; font-size: 1.2rem; color: #ffd97d; }
    #editGiftModal p  { font-size: 0.84rem; color: #c8bfa0; margin: 0 0 14px; }
    .edit-field-label { font-size: 0.82rem; color: #c8bfa0; margin-bottom: 4px; display: block; }
    .edit-field {
      width: 100%;
      background: rgba(255,255,255,0.07);
      border: 1.5px solid rgba(255,210,80,0.4);
      border-radius: 9px;
      color: #fff;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem;
      padding: 9px 12px;
      box-sizing: border-box;
      margin-bottom: 14px;
      resize: vertical;
      outline: none;
    }
    .edit-field:focus { border-color: #ffd97d; }
    .edit-btn-row { display: flex; gap: 10px; justify-content: flex-end; }
    .edit-btn-save   { background: #d9a444; color: #1a0a00; padding: 9px 22px; border: none; border-radius: 10px; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.95rem; }
    .edit-btn-cancel { background: rgba(255,255,255,0.1); color: #d4c99a; padding: 9px 18px; border: none; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 0.95rem; }
    .edit-btn-save:hover { background: #f5c14a; }
    .edit-btn-cancel:hover { background: rgba(255,255,255,0.16); }
  `;
  document.head.appendChild(style);

  /* ---- Estado ---- */
  let adminUnlocked = false;
  let currentEditDay = null;

  /* ---- Crear botón candado ---- */
  const lockBtn = document.createElement('button');
  lockBtn.id = 'adminLockBtn';
  lockBtn.setAttribute('aria-label', 'Acceso de edición');
  lockBtn.setAttribute('title', 'Acceso de edición');
  lockBtn.textContent = '🔒';
  document.body.appendChild(lockBtn);

  /* ---- Crear overlay/modal de contraseña ---- */
  const overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.className = 'hidden';
  overlay.innerHTML = `
    <div id="adminModal" role="dialog" aria-modal="true" aria-labelledby="adminModalTitle">
      <h2 id="adminModalTitle">🔐 Acceso de edición</h2>
      <p>Introduce la clave para editar los regalos</p>
      <input id="adminPwInput" type="password" placeholder="••••••" maxlength="20" autocomplete="off" />
      <div id="adminPwError"></div>
      <div class="admin-btn-row">
        <button class="admin-btn admin-btn-cancel" id="adminCancelBtn">Cancelar</button>
        <button class="admin-btn admin-btn-confirm" id="adminConfirmBtn">Entrar ✨</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  /* ---- Barra flotante modo admin ---- */
  const adminBar = document.createElement('div');
  adminBar.id = 'adminBar';
  adminBar.className = 'hidden';
  adminBar.innerHTML = `<span>✏️ Modo edición activo — haz clic en ✏️ de cualquier regalo para editarlo</span>
    <button id="adminBarLock">🔒 Cerrar sesión</button>`;
  document.body.appendChild(adminBar);

  /* ---- Modal edición de regalo ---- */
  const editOverlay = document.createElement('div');
  editOverlay.id = 'editGiftOverlay';
  editOverlay.className = 'hidden';
  editOverlay.innerHTML = `
    <div id="editGiftModal" role="dialog" aria-modal="true">
      <h2>✏️ Editar regalo <span id="editGiftDayLabel"></span></h2>
      <p>Personaliza el contenido que verá Arii al abrir este regalo.</p>
      <label class="edit-field-label" for="editTitleInput">Título del regalo</label>
      <input class="edit-field" id="editTitleInput" type="text" placeholder="Ej: Una tarde de películas 🎬" />
      <label class="edit-field-label" for="editMsgInput">Mensaje / sorpresa</label>
      <textarea class="edit-field" id="editMsgInput" rows="4" placeholder="Escribe aquí la descripción o sorpresa del día…"></textarea>
      <label class="edit-field-label" for="editEmojiInput">Emoji del día (opcional)</label>
      <input class="edit-field" id="editEmojiInput" type="text" placeholder="🎁" maxlength="4" />
      <div class="edit-btn-row">
        <button class="edit-btn-cancel" id="editCancelBtn">Cancelar</button>
        <button class="edit-btn-save" id="editSaveBtn">Guardar ✨</button>
      </div>
    </div>`;
  document.body.appendChild(editOverlay);

  /* ---- Lógica contraseña ---- */
  function openPasswordModal() {
    overlay.classList.remove('hidden');
    const inp = document.getElementById('adminPwInput');
    inp.value = '';
    document.getElementById('adminPwError').textContent = '';
    setTimeout(() => inp.focus(), 80);
  }

  function closePasswordModal() {
    overlay.classList.add('hidden');
  }

  function attemptUnlock() {
    const val = document.getElementById('adminPwInput').value.trim();
    if (val === ADMIN_KEY) {
      adminUnlocked = true;
      closePasswordModal();
      activateAdminMode();
    } else {
      const errEl = document.getElementById('adminPwError');
      errEl.textContent = '❌ Clave incorrecta, inténtalo de nuevo.';
      document.getElementById('adminPwInput').value = '';
      document.getElementById('adminPwInput').focus();
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

  /* ---- Activar modo admin ---- */
  function activateAdminMode() {
    adminUnlocked = true;
    window.__ADMIN_UNLOCKED__ = true;
    lockBtn.textContent = '🔓';
    lockBtn.classList.add('unlocked');
    lockBtn.setAttribute('aria-label', 'Cerrar modo edición');
    document.body.classList.add('admin-mode');
    adminBar.classList.remove('hidden');
    if (typeof window.refreshAdventGrid === 'function') {
      window.refreshAdventGrid();
    }
    injectEditButtons();
    // Re-inyectar cuando renderCalendarGrid() recrea los elementos
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

  /* ---- Inyectar botones de edición en cada tarjeta ---- */
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

  /* ---- Modal edición ---- */
  function openEditModal(day) {
    currentEditDay = day;
    const edits = readEdits();
    const saved = edits[day] || {};
    const orig = (window.ADVENT_SURPRISES && window.ADVENT_SURPRISES[day]) || {};
    document.getElementById('editGiftDayLabel').textContent = `#${day}`;
    document.getElementById('editTitleInput').value  = saved.title || orig.title || '';
    document.getElementById('editMsgInput').value    = saved.msg    || '';
    document.getElementById('editEmojiInput').value  = saved.emoji  || '';
    editOverlay.classList.remove('hidden');
    setTimeout(() => document.getElementById('editTitleInput').focus(), 80);
  }

  function closeEditModal() {
    editOverlay.classList.add('hidden');
    currentEditDay = null;
  }

  function saveEdit() {
    if (!currentEditDay) return;
    const edits = readEdits();
    edits[currentEditDay] = {
      title : document.getElementById('editTitleInput').value.trim(),
      msg   : document.getElementById('editMsgInput').value.trim(),
      emoji : document.getElementById('editEmojiInput').value.trim()
    };
    saveEdits(edits);
    closeEditModal();
    // Notificar que los cambios se guardaron
    showToast(`✅ Regalo #${currentEditDay} guardado`);
    // Propagar al sistema principal si está disponible
    if (typeof window.refreshAdventCard === 'function') {
      window.refreshAdventCard(currentEditDay);
    }
  }

  /* ---- Toast ---- */
  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);' +
      'background:rgba(10,30,15,0.95);color:#ffd97d;padding:9px 22px;border-radius:12px;' +
      'font-family:Quicksand,sans-serif;font-size:0.9rem;z-index:12000;' +
      'border:1px solid rgba(255,210,80,0.4);box-shadow:0 4px 20px rgba(0,0,0,0.4);' +
      'animation:fadeInUp 0.25s ease;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  /* ---- Eventos ---- */
  lockBtn.addEventListener('click', () => {
    if (adminUnlocked) {
      lockAdminMode();
    } else {
      openPasswordModal();
    }
  });

  document.getElementById('adminConfirmBtn').addEventListener('click', attemptUnlock);
  document.getElementById('adminCancelBtn').addEventListener('click', closePasswordModal);
  document.getElementById('adminBarLock').addEventListener('click', lockAdminMode);
  document.getElementById('editSaveBtn').addEventListener('click', saveEdit);
  document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);

  // Enter en el input de contraseña
  document.getElementById('adminPwInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock();
    if (e.key === 'Escape') closePasswordModal();
  });

  // Escape cierra modales
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!editOverlay.classList.contains('hidden')) closeEditModal();
      else if (!overlay.classList.contains('hidden')) closePasswordModal();
    }
  });

  // Clic fuera del modal de clave lo cierra
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePasswordModal();
  });
  editOverlay.addEventListener('click', (e) => {
    if (e.target === editOverlay) closeEditModal();
  });

  /* ---- Exponer edits al sistema principal ---- */
  window.getAdventEdits = readEdits;

})();
