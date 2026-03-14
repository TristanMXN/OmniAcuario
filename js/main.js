import { state } from './state.js';
import { renderHome } from './modules/home.js';
import { renderCatalog, toggleSortMenu } from './modules/catalog.js';
import { renderTank, addToTank, removeFromTank, changeQty } from './modules/tank.js';
import { renderTools, toggleTool, toggleSubCat, pickSubstrate, selectGlassType, selectSafety, calculateGlass, calculateSubstrate } from './modules/tools.js';
import { renderChem, toggleChemCat, toggleChemItem } from './modules/chem.js';
import { openDetail, closeModal, switchModalTab } from './modules/modal.js';
import { openInfoModal, closeInfoModal } from './modules/info.js';
import { showLitersFormula, closeGenericModal } from './utils/liters.js';
import { saveTank, loadTank } from './utils/storage.js';

// ── BUBBLE BACKGROUND ──────────────────────────
(function () {
  const canvas = document.getElementById('bubble-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, bubbles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function randomBubble() {
    const r = 3 + Math.random() * 14;
    return { x: Math.random() * W, y: H + r + Math.random() * H, r, speed: 0.25 + Math.random() * 0.6, drift: (Math.random() - 0.5) * 0.35, alpha: 0.12 + Math.random() * 0.22, wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.012 + Math.random() * 0.018 };
  }

  const COUNT = 38;
  for (let i = 0; i < COUNT; i++) { const b = randomBubble(); b.y = Math.random() * H; bubbles.push(b); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const b of bubbles) {
      b.wobble += b.wobbleSpeed;
      b.x += b.drift + Math.sin(b.wobble) * 0.4;
      b.y -= b.speed;
      if (b.y + b.r < 0) Object.assign(b, randomBubble());
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100,210,255,${b.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,240,255,${b.alpha * 0.6})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── TAB NAVIGATION ─────────────────────────────
export function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  if (tab === 'catalog') renderCatalog();
  if (tab === 'chem')    renderChem();
}

// ── BIND EVENTS ────────────────────────────────
function bindEvents() {
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

// ── BOOT ───────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('data/db.json');
    state.db = await res.json();
    loadTank();
    renderHome();
    renderCatalog();
    renderTank();
    renderTools();
    bindEvents();
  } catch (e) {
    document.body.innerHTML = '<p style="padding:40px;text-align:center;color:#e53935">Error cargando la base de datos.</p>';
  }
}

// ── EXPOSE GLOBALS (llamados desde HTML inline) ─
window.switchTab         = switchTab;
window.openDetail        = openDetail;
window.closeModal        = closeModal;
window.switchModalTab    = switchModalTab;
window.addToTank         = addToTank;
window.removeFromTank    = removeFromTank;
window.changeQty         = changeQty;
window.toggleTool        = toggleTool;
window.toggleSubCat      = toggleSubCat;
window.pickSubstrate     = pickSubstrate;
window.selectGlassType   = selectGlassType;
window.selectSafety      = selectSafety;
window.calculateGlass    = calculateGlass;
window.calculateSubstrate= calculateSubstrate;
window.toggleSortMenu    = toggleSortMenu;
window.toggleChemCat     = toggleChemCat;
window.toggleChemItem    = toggleChemItem;
window.showLitersFormula = showLitersFormula;
window.closeGenericModal = closeGenericModal;
window.openInfoModal     = openInfoModal;
window.closeInfoModal    = closeInfoModal;

boot();

// Escuchar cambios de pecera para re-renderizar home y catálogo
window.addEventListener('tankChanged', () => {
  saveTank();
  if (state.activeTab === 'catalog') renderCatalog();
});
