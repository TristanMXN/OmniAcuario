import { state, TYPE, CARE_COLOR } from '../state.js';
import { inferCompat, compatIds, getCompatHint } from '../utils/compat.js';
import { openDetail } from './modal.js';
import { addToTank, removeFromTank, changeQty } from './tank.js';

// ── SUBCATEGORIES ──────────────────────────────
const FISH_SUBCATS = [
  { f: 'viviparo',     label: 'Vivíparos'            },
  { f: 'tetra',        label: 'Tetras y Carácidos'   },
  { f: 'ciprinido',    label: 'Ciprínidos y Rasboras' },
  { f: 'ciclido',      label: 'Cíclidos'             },
  { f: 'laberintido',  label: 'Laberínticos'         },
  { f: 'fondo',        label: 'Fondo y Siluros'      },
  { f: 'especial',     label: 'Especiales y Exóticos' },
];

const PLANT_SUBCATS = [
  { f: 'bajo_req',  label: 'Bajos Req.'  },
  { f: 'medio_req', label: 'Medios Req.' },
  { f: 'alto_req',  label: 'Altos Req.'  },
];

const SHRIMP_SUBCATS = [
  { f: 'neocaridina',       label: 'Neocaridina'       },
  { f: 'caridina',          label: 'Caridina'          },
  { f: 'camarones_grandes', label: 'Camarones Grandes' },
];

const SNAIL_SUBCATS = [
  { f: 'ornamental',    label: 'Ornamentales'     },
  { f: 'limpiador',     label: 'Limpiadores'      },
  { f: 'control_plaga', label: 'Control de plaga' },
  { f: 'cangrejo',      label: 'Cangrejos'        },
];

const ALL_SUBCATS = [...FISH_SUBCATS, ...PLANT_SUBCATS, ...SHRIMP_SUBCATS, ...SNAIL_SUBCATS];

// ── FILTERS & SORT ─────────────────────────────
function matchesFilter(s, f) {
  if (f === 'fish')   return s.type === 'fish';
  if (f === 'plant')  return s.type === 'plant';
  if (f === 'shrimp') return s.category === 'shrimp';
  if (f === 'snails') return s.category === 'snail';
  if (ALL_SUBCATS.find(sc => sc.f === f)) return s.subcategory === f;
  return true;
}

function countByFilter(f) {
  return state.db.species.filter(s => matchesFilter(s, f)).length;
}

function filteredSpecies() {
  return state.db.species.filter(s => matchesFilter(s, state.activeFilter));
}

function sortedSpecies(species) {
  const careOrder = { 'Muy fácil': 0, 'Fácil': 1, 'Intermedio': 2, 'Difícil': 3 };
  const sort = state.activeSort;

  if (sort === 'name') return [...species].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'care') return [...species].sort((a, b) => (careOrder[a.care]||1) - (careOrder[b.care]||1));
  if (sort === 'size') return [...species].sort((a, b) => (a.size_cm||0) - (b.size_cm||0));

  if (state.tank.length === 0) return [...species].sort((a, b) => a.name.localeCompare(b.name));
  return [...species].sort((a, b) => {
    const score = s => {
      if (state.tank.find(t => t.meta.id === s.id)) return -1;
      const compat = state.db.compatibility[s.id] || { compatible: [], incompatible: [] };
      const tankIds = state.tank.map(t => t.meta.id);
      const bad  = compatIds(compat.incompatible);
      const good = compatIds(compat.compatible);
      if (tankIds.some(id => bad.includes(id)))  return 4;
      if (tankIds.some(id => good.includes(id))) return 0;
      const warnIds = tankIds.filter(id => !bad.includes(id) && !good.includes(id));
      if (warnIds.length === 0) return 1;
      let worst = 1;
      for (const id of warnIds) {
        const t = state.db.species.find(x => x.id === id);
        if (!t) continue;
        const inf = inferCompat(s, t);
        if (inf.status === 'incompat') return 3;
        if (inf.status === 'compat'  && worst > 1) worst = 1;
        if (inf.status === 'warn'    && worst > 2) worst = 2;
      }
      return worst;
    };
    return score(a) - score(b);
  });
}

// ── CARD HTML ──────────────────────────────────
function cardHTML(s) {
  const cfg = TYPE[s.type];
  const emoji = s.type === 'fish' ? '🐟' : s.type === 'plant' ? '🌿' : s.emoji;
  const inTank = state.tank.find(t => t.meta.id === s.id);
  const qty = inTank ? inTank.qty : 0;
  const compatHint = getCompatHint(s);
  const compatHintHTML = compatHint
    ? compatHint.map(h => '<div class="compat-hint ' + h.cls + '" onclick="event.stopPropagation()">' + h.text + '</div>').join('')
    : '';
  const careColor = CARE_COLOR[s.care] || 'var(--text-3)';
  const sizeText = s.size_cm ? 'hasta ' + s.size_cm + ' cm' : '';

  return `
  <div class="species-card ${inTank ? 'in-tank' : ''}"
       style="--card-color:${s.color};--card-bg:${cfg.bg}"
       data-id="${s.id}" onclick="openDetail('${s.id}')">
    <div class="card-top-bar"></div>
    ${inTank ? '<div class="card-in-tank-badge">✓ En pecera</div>' : ''}
    <div class="card-header">
      <div class="card-emoji">${emoji}</div>
      <div class="card-info">
        <div class="card-name">${s.name}</div>
        <div class="card-scientific">${s.scientific}</div>
        <div class="card-family">${s.family}</div>
        <div class="card-tags">
          <span class="tag" style="background:${cfg.bg};color:${cfg.color}">${s.category === 'shrimp' ? '🦐 Gambas' : s.category === 'snail' ? '🐌 Caracoles' : cfg.icon + ' ' + cfg.label}</span>
          <span class="tag care-tag" style="background:${careColor}18;color:${careColor};border:1px solid ${careColor}40">${s.care}</span>
          ${sizeText ? '<span class="tag" style="background:var(--bg-surface);color:var(--text-3)">📏 ' + sizeText + '</span>' : ''}
        </div>
      </div>
    </div>
    <div class="card-params">
      <div class="param-box"><div class="param-label">Temp</div><div class="param-value">${s.temp[0]}–${s.temp[1]}°C</div></div>
      <div class="param-box"><div class="param-label">pH</div><div class="param-value">${s.ph[0]}–${s.ph[1]}</div></div>
      ${s.min_liters ? `<div class="param-box"><div class="param-label">Mín. L</div><div class="param-value">${s.min_liters}L</div></div>` : ''}
    </div>
    ${compatHintHTML}
    <div class="card-qty" onclick="event.stopPropagation()">
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${s.id}',-1)">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${s.id}',1)">+</button>
      </div>
      <button class="card-add-btn ${inTank ? 'remove' : ''}"
        onclick="${inTank ? 'removeFromTank(\'' + s.id + '\')' : 'addToTank(\'' + s.id + '\')'}">
        ${inTank ? '✕ Quitar' : '+ Agregar'}
      </button>
    </div>
  </div>`;
}

// ── RENDER ─────────────────────────────────────
export function renderCatalog() {
  const subBar = document.querySelector('.subfilter-bar');
  const subScrollLeft = subBar ? subBar.scrollLeft : 0;

  const filters = [
    { f: 'fish',   label: '🐟 Peces' },
    { f: 'plant',  label: '🌿 Plantas' },
    { f: 'shrimp', label: '🦐 Gambas' },
    { f: 'snails', label: '🐌 Caracoles' },
  ];

  const isFishActive   = state.activeFilter === 'fish'   || FISH_SUBCATS.find(sc => sc.f === state.activeFilter);
  const isPlantActive  = state.activeFilter === 'plant'  || PLANT_SUBCATS.find(sc => sc.f === state.activeFilter);
  const isShrimpActive = state.activeFilter === 'shrimp' || SHRIMP_SUBCATS.find(sc => sc.f === state.activeFilter);
  const isSnailActive  = state.activeFilter === 'snails' || SNAIL_SUBCATS.find(sc => sc.f === state.activeFilter);
  const activeTopFilter = isFishActive ? 'fish' : isPlantActive ? 'plant' : isShrimpActive ? 'shrimp' : isSnailActive ? 'snails' : state.activeFilter;

  const buildSubBar = (topFilter, subcats) => {
    const activeSub = state.activeFilter;
    return '<div class="subfilter-bar">'
      + '<button class="subfilter-btn ' + (activeSub === topFilter ? 'active' : '') + '" data-filter="' + topFilter + '">Todos <span class="filter-count">' + countByFilter(topFilter) + '</span></button>'
      + subcats.filter(sc => countByFilter(sc.f) > 0).map(sc =>
          '<button class="subfilter-btn ' + (activeSub === sc.f ? 'active' : '') + '" data-filter="' + sc.f + '">'
          + sc.label + ' <span class="filter-count">' + countByFilter(sc.f) + '</span></button>'
        ).join('')
      + '</div>';
  };

  const subFilterHTML = isFishActive   ? buildSubBar('fish',   FISH_SUBCATS)
                      : isPlantActive  ? buildSubBar('plant',  PLANT_SUBCATS)
                      : isShrimpActive ? buildSubBar('shrimp', SHRIMP_SUBCATS)
                      : isSnailActive  ? buildSubBar('snails', SNAIL_SUBCATS)
                      : '';

  const sortOptions = [
    { v: 'name',   label: '🔤 Nombre' },
    { v: 'care',   label: '⭐ Dificultad' },
    { v: 'size',   label: '📏 Tamaño' },
    { v: 'compat', label: '🤝 Compatibilidad' },
  ];

  document.getElementById('tab-catalog').innerHTML =
    '<div class="catalog-page">'
    + '<div class="cat-top-row">'
    + '<div class="cat-search-bar" style="flex:1"><input type="text" id="cat-search-input" placeholder="🔍  Buscar especie..." value="' + state.catalogSearch + '" autocomplete="off" /></div>'
    + '<button class="sort-icon-btn" onclick="toggleSortMenu()" id="sort-icon-btn" title="Ordenar">&#9776;</button>'
    + '</div>'
    + '<div id="sort-dropdown" class="sort-dropdown hidden">'
    + sortOptions.map(({v, label}) =>
        '<button class="sort-option ' + (state.activeSort===v?'active':'') + '" data-sort="' + v + '">'
        + label + (state.activeSort===v ? ' <span class="sort-check">✓</span>' : '') + '</button>'
      ).join('')
    + '</div>'
    + '<div class="filter-bar">'
    + filters.map(({f, label}) =>
        '<button class="filter-btn ' + (activeTopFilter===f?'active':'') + '" data-filter="' + f + '">'
        + label + ' <span class="filter-count">' + countByFilter(f) + '</span></button>'
      ).join('')
    + '</div>'
    + subFilterHTML
    + '<div id="catalog-grid-wrap"></div>'
    + '</div>';

  updateCatalogGrid();
  bindCatalogEvents();

  if (subScrollLeft > 0) {
    const newSubBar = document.querySelector('.subfilter-bar');
    if (newSubBar) newSubBar.scrollLeft = subScrollLeft;
  }
}

function updateCatalogGrid() {
  const wrap = document.getElementById('catalog-grid-wrap');
  if (!wrap) return;
  const normalize = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = normalize(state.catalogSearch);
  let species = filteredSpecies();
  if (q) species = species.filter(s =>
    normalize(s.name).includes(q) ||
    normalize(s.scientific).includes(q) ||
    normalize(s.name_en).includes(q)
  );
  species = sortedSpecies(species);
  wrap.innerHTML = species.length === 0
    ? '<div class="search-empty"><div style="font-size:40px">🐟</div><div class="search-empty-title">Sin resultados</div></div>'
    : '<div class="catalog-grid">' + species.map(s => cardHTML(s)).join('') + '</div>';
}

function bindCatalogEvents() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { state.activeFilter = btn.dataset.filter; renderCatalog(); });
  });
  document.querySelectorAll('.subfilter-btn').forEach(btn => {
    btn.addEventListener('click', () => { state.activeFilter = btn.dataset.filter; renderCatalog(); });
  });
  document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => { state.activeSort = btn.dataset.sort; renderCatalog(); });
  });
  const input = document.getElementById('cat-search-input');
  if (input) {
    input.addEventListener('input', e => { state.catalogSearch = e.target.value; updateCatalogGrid(); });
  }
}

export function toggleSortMenu() {
  const dd = document.getElementById('sort-dropdown');
  if (dd) dd.classList.toggle('hidden');
}
