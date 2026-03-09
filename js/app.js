// ── STATE ──────────────────────────────────────
const state = {
  db: null,           // db.json loaded catalog
  detailCache: {},    // species detail cache
  tank: [],           // [{ meta, qty }]
  activeTab: 'home',
  activeFilter: 'fish',
  catalogSearch: '',
  activeSort: 'compat',
  modalSpecies: null,
  modalTab: 'general',
};

// ── TYPE CONFIG ────────────────────────────────
const TYPE = {
  fish:        { label: 'Peces',        color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  icon: '🐟' },
  plant:       { label: 'Plantas',      color: '#00e5a0', bg: 'rgba(0,229,160,0.1)',  icon: '🌿' },
  invertebrate:{ label: 'Invertebrados',color: '#c084fc', bg: 'rgba(192,132,252,0.1)',icon: '🦐' },
};
const CARE_COLOR = {
  'Muy fácil': '#00e5a0', 'Fácil': '#00e5a0',
  'Intermedio':  '#ffaa00', 'Difícil': '#ff4f6d',
};

// ── BOOT ──────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('data/db.json');
    state.db = await res.json();
    render();
    bindEvents();
  } catch (e) {
    document.body.innerHTML = '<p style="padding:40px;text-align:center;color:#e53935">Error cargando la base de datos.</p>';
  }
}

// ── RENDER ROOT ────────────────────────────────
// Full re-render (boot only)
function render() {
  renderHome();
  renderCatalog();
  renderTank();
  renderTools();
}

// Selective re-render after tank changes
function renderAfterTankChange() {
  renderHome();
  renderTank();
  if (state.activeTab === 'catalog') renderCatalog();
}

// ── TIPS ───────────────────────────────────────
const DAILY_CARDS = [
  { type: 'tip',  icon: '💧', label: '💡 Consejo del día', text: 'Haz siempre un ciclo de nitrógeno antes de agregar peces. Espera a que el amoniaco y el nitrito lleguen a 0 ppm.' },
  { type: 'fact', icon: '🧬', label: '🔬 ¿Sabías que?',    text: 'El Tetra Neón tiene una enfermedad incurable causada por un microsporidio. Una vez infectado, no hay tratamiento.' },
  { type: 'tip',  icon: '🌡️', label: '💡 Consejo del día', text: 'Los cambios bruscos de temperatura estresan a los peces. Aclimata los ejemplares nuevos flotando la bolsa 15 minutos.' },
  { type: 'fact', icon: '🫁', label: '🔬 ¿Sabías que?',    text: 'El Betta puede respirar aire atmosférico directamente gracias a su órgano laberinto. Puede sobrevivir fuera del agua varios minutos.' },
  { type: 'tip',  icon: '🦐', label: '💡 Consejo del día', text: 'El cobre es letal para camarones incluso en concentraciones mínimas. Revisa siempre los componentes de los medicamentos.' },
  { type: 'fact', icon: '🔬', label: '🔬 ¿Sabías que?',    text: 'El Platy fue el primer vertebrado usado como modelo de investigación del cáncer. Su genética lo predispone al melanoma.' },
  { type: 'tip',  icon: '🌿', label: '💡 Consejo del día', text: 'Las plantas de raíz como la Espada Amazónica necesitan sustrato nutritivo o pastillas fertilizantes en la base.' },
  { type: 'fact', icon: '🌊', label: '🔬 ¿Sabías que?',    text: 'El Camarón Amano fue popularizado por Takashi Amano en los 90. Su larva es marina y no puede reproducirse en agua dulce.' },
  { type: 'tip',  icon: '🐟', label: '💡 Consejo del día', text: 'Los peces de cardumen estresados y solitarios son más susceptibles a enfermedades. Respeta el mínimo de grupo.' },
  { type: 'fact', icon: '🐌', label: '🔬 ¿Sabías que?',    text: 'El Caracol Nerita pone huevos en el vidrio, pero ninguno eclosionará en agua dulce. Sus larvas necesitan pasar por agua salada.' },
  { type: 'tip',  icon: '⚗️', label: '💡 Consejo del día', text: 'El nitrato acumulado es causa frecuente de HITH en Óscares y cíclidos. Los cambios de agua regulares son clave.' },
  { type: 'fact', icon: '🌿', label: '🔬 ¿Sabías que?',    text: 'La Vallisneria es extremadamente sensible al glutaraldehído (Excel/Easy Carbo). Una dosis estándar puede matarla en 24 horas.' },
  { type: 'tip',  icon: '🌑', label: '💡 Consejo del día', text: 'Las algas de barba negra suelen indicar exceso de CO₂ o luz irregular. Revisa el fotoperíodo antes de tratar.' },
  { type: 'fact', icon: '🐟', label: '🔬 ¿Sabías que?',    text: 'El Óscar reconoce a su dueño y puede aprender a comer de la mano. Es uno de los peces más inteligentes del acuarismo.' },
  { type: 'tip',  icon: '🔄', label: '💡 Consejo del día', text: 'Un cambio de agua semanal del 20–30% es más efectivo que cambios grandes y esporádicos para mantener la calidad.' },
  { type: 'fact', icon: '🦐', label: '🔬 ¿Sabías que?',    text: 'Un Camarón Cherry hembra puede guardar esperma y fertilizar múltiples puestas a partir de un solo apareamiento.' },
  { type: 'tip',  icon: '🪨', label: '💡 Consejo del día', text: 'Los Corydoras necesitan arena fina obligatoriamente. La grava puede destruir sus barbillas en semanas.' },
  { type: 'fact', icon: '🌱', label: '🔬 ¿Sabías que?',    text: 'El Anubias crece tan lento que puede vivir décadas en el mismo acuario. Un rizoma bien cuidado puede superar un metro de largo.' },
  { type: 'tip',  icon: '🧪', label: '💡 Consejo del día', text: 'Mide el pH, amoniaco y nitrito cada semana durante el primer mes de un acuario nuevo.' },
  { type: 'fact', icon: '🐠', label: '🔬 ¿Sabías que?',    text: 'El Guppy fue el primer pez en viajar al espacio, en 1976, para estudiar el comportamiento en microgravedad.' },
  { type: 'tip',  icon: '🌊', label: '💡 Consejo del día', text: 'El filtro biológico tarda 4–8 semanas en madurar. Nunca lo limpies con agua de la llave — usa agua del propio acuario.' },
  { type: 'fact', icon: '🪸', label: '🔬 ¿Sabías que?',    text: 'El Otocinclus muere frecuentemente de hambre en acuarios nuevos. Sin biofilm establecido, no sobrevive aunque el agua sea perfecta.' },
  { type: 'tip',  icon: '🐠', label: '💡 Consejo del día', text: 'Pon en cuarentena siempre los peces nuevos al menos 2 semanas antes de introducirlos al acuario principal.' },
  { type: 'fact', icon: '🧪', label: '🔬 ¿Sabías que?',    text: 'El agua de la llave contiene cloro que destruye el ciclo biológico. El acondicionador de agua lo neutraliza en segundos.' },
];

const TRIVIA = [
  { q: '¿Cuánto tarda el ciclo de nitrógeno?',              a: 'Entre 4 y 8 semanas. El amoniaco se convierte en nitrito y luego en nitrato gracias a bacterias beneficiosas.' },
  { q: '¿Qué es el pH y por qué importa?',                  a: 'Mide la acidez del agua (0–14). Cada especie tiene un rango óptimo; fuera de él se estresa y enferma.' },
  { q: '¿Por qué no limpiar el filtro con agua del grifo?',  a: 'El cloro del grifo mata las bacterias beneficiosas del filtro biológico, destruyendo el ciclo de nitrógeno.' },
  { q: '¿Qué significa GH en el agua?',                     a: 'Dureza general: mide los minerales (calcio y magnesio) disueltos. Afecta directamente la salud de peces y plantas.' },
  { q: '¿Para qué sirve el sustrato nutritivo?',            a: 'Aporta nutrientes a las raíces de las plantas. A diferencia de la grava inerte, fertiliza activamente el sustrato.' },
  { q: '¿Qué es el KH del agua?',                           a: 'Dureza de carbonatos: actúa como tampón del pH, estabilizándolo y evitando bajadas bruscas peligrosas.' },
  { q: '¿Por qué los Bettas no van con Guppys?',            a: 'Las aletas coloridas del Guppy activan el instinto territorial del Betta, que las ataca confundiéndolas con rivales.' },
  { q: '¿Qué es el "nuevo síndrome de acuario"?',           a: 'Pico de amoniaco en un acuario sin ciclar. Puede matar peces en horas si no se detecta a tiempo.' },
  { q: '¿Cuánto tiempo puede vivir un Óscar?',              a: 'Entre 10 y 15 años con buen cuidado. Es uno de los peces de acuario más longevos y demandantes.' },
  { q: '¿Por qué flotar la bolsa del pez nuevo?',           a: 'Para igualar gradualmente la temperatura. Un cambio brusco de más de 2°C puede causar shock térmico.' },
  { q: '¿Qué hace el acondicionador de agua?',              a: 'Neutraliza el cloro y las cloraminas del grifo al instante, haciendo el agua segura para los peces.' },
  { q: '¿A qué profundidad poner el sustrato?',             a: 'Mínimo 5–7 cm para plantas con raíz. Menos impide el enraizamiento y acumula gas sulfhídrico tóxico.' },
];

// ── HOME ────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: 'Buenos días', icon: '🌅' };
  if (h >= 12 && h < 19) return { text: 'Buenas tardes', icon: '🌤' };
  return { text: 'Buenas noches', icon: '🌙' };
}

function renderHome() {
  const yearDay   = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const card      = DAILY_CARDS[yearDay % DAILY_CARDS.length];
  const trivia    = TRIVIA[yearDay % TRIVIA.length];
  const species   = state.db.species;
  // Rotate through all species including plants and invertebrates
  const sod       = species[yearDay % species.length];
  const greeting  = getGreeting();
  const cardColor = card.type === 'tip' ? 'var(--accent)' : 'var(--accent2)';
  const cardBg    = card.type === 'tip' ? 'rgba(0,212,255,0.06)' : 'rgba(0,229,160,0.06)';
  const cardBorder= card.type === 'tip' ? 'rgba(0,212,255,0.2)' : 'rgba(0,229,160,0.2)';

  document.getElementById('tab-home').innerHTML = `
    <div class="home-page">

      <!-- HERO -->
      <div class="home-hero">
        <div class="home-hero-bg"></div>
        <div class="home-hero-content">
          <div class="home-hero-greeting">${greeting.icon} ${greeting.text}, acuarista</div>
          <div class="home-hero-title">OmniAcuario</div>
          <div class="home-hero-sub">El universo del acuario</div>
        </div>
      </div>

      <!-- ESPECIE DEL DÍA -->
      <div class="home-sod" onclick="openDetail('${sod.id}')">
        <div class="home-sod-label">🌟 Especie del día</div>
        <div class="home-sod-body">
          <div class="home-sod-emoji">${getEmoji(sod)}</div>
          <div class="home-sod-info">
            <div class="home-sod-name">${sod.name}</div>
            <div class="home-sod-sci">${sod.scientific}</div>
            <div class="home-sod-origin">📍 ${sod.origin_region}</div>
            <div class="home-sod-tags">
              <span class="home-tag" style="color:${CARE_COLOR[sod.care]||'var(--text-3)'}">${{' Muy fácil':'🟢','Fácil':'🟢','Intermedio':'🟡','Difícil':'🔴'}[sod.care]||'🟢'} ${sod.care}</span>
              <span class="home-tag">🌡 ${sod.temp[0]}–${sod.temp[1]}°C</span>
              <span class="home-tag">⚗️ pH ${sod.ph[0]}–${sod.ph[1]}</span>
            </div>
          </div>
        </div>
        <div class="home-sod-cta">Ver ficha completa →</div>
      </div>

      <!-- DATO DEL DÍA -->
      <div class="home-daily-card" style="background:${cardBg};border-color:${cardBorder}">
        <div class="home-daily-label" style="color:${cardColor}">${card.label}</div>
        <div class="home-daily-text">${card.icon} ${card.text}</div>
      </div>

      <!-- TRIVIA -->
      <div class="home-trivia" onclick="this.classList.toggle('revealed')">
        <div class="home-trivia-label">🧠 Trivia del día</div>
        <div class="home-trivia-q">${trivia.q}</div>
        <div class="home-trivia-reveal-hint">Tocá para ver la respuesta</div>
        <div class="home-trivia-a">${trivia.a}</div>
      </div>

    </div>`;
}

// ── FISH SUBCATEGORIES ─────────────────────────
const FISH_SUBCATS = [
  { f: 'viviparo',     label: 'Vivíparos'           },
  { f: 'tetra',        label: 'Tetras y Carácidos'  },
  { f: 'ciprinido',    label: 'Ciprínidos y Rasboras'},
  { f: 'ciclido',      label: 'Cíclidos'            },
  { f: 'laberintido',  label: 'Laberínticos'        },
  { f: 'fondo',        label: 'Fondo y Siluros'     },
  { f: 'especial',     label: 'Especiales y Exóticos'},
];

const PLANT_SUBCATS = [
  { f: 'bajo_req',  label: 'Bajos Req.'  },
  { f: 'medio_req', label: 'Medios Req.' },
  { f: 'alto_req',  label: 'Altos Req.'  },
];

const SHRIMP_SUBCATS = [
  { f: 'neocaridina',      label: 'Neocaridina'      },
  { f: 'caridina',         label: 'Caridina'         },
  { f: 'camarones_grandes',label: 'Camarones Grandes' },
];

const SNAIL_SUBCATS = [
  { f: 'ornamental',    label: 'Ornamentales'     },
  { f: 'limpiador',     label: 'Limpiadores'      },
  { f: 'control_plaga', label: 'Control de plaga' },
  { f: 'cangrejo',      label: 'Cangrejos'        },
];

const ALL_SUBCATS = [...FISH_SUBCATS, ...PLANT_SUBCATS, ...SHRIMP_SUBCATS, ...SNAIL_SUBCATS];

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

function sortedSpecies(species) {
  const careOrder = { 'Muy fácil': 0, 'Fácil': 1, 'Intermedio': 2, 'Difícil': 3 };
  const sort = state.activeSort;

  if (sort === 'name') return [...species].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'care') return [...species].sort((a, b) => (careOrder[a.care]||1) - (careOrder[b.care]||1));
  if (sort === 'size') return [...species].sort((a, b) => (a.size_cm||0) - (b.size_cm||0));

  // compat (default) — when no tank just sort by name
  if (state.tank.length === 0) return [...species].sort((a, b) => a.name.localeCompare(b.name));
  return [...species].sort((a, b) => {
    const score = s => {
      if (state.tank.find(t => t.meta.id === s.id)) return -1;
      const compat = state.db.compatibility[s.id] || { compatible: [], incompatible: [] };
      const tankIds = state.tank.map(t => t.meta.id);
      const bad  = compatIds(compat.incompatible);
      const good = compatIds(compat.compatible);
      if (tankIds.some(id => bad.includes(id)))  return 4; // explícito incompatible
      if (tankIds.some(id => good.includes(id))) return 0; // explícito compatible
      // sin datos explícitos — usar inferencia
      const warnIds = tankIds.filter(id => !bad.includes(id) && !good.includes(id));
      if (warnIds.length === 0) return 1;
      let worst = 1;
      for (const id of warnIds) {
        const t = state.db.species.find(x => x.id === id);
        if (!t) continue;
        const inf = inferCompat(s, t);
        if (inf.status === 'incompat') return 3; // inferido incompatible
        if (inf.status === 'compat'  && worst > 1) worst = 1;
        if (inf.status === 'warn'    && worst > 2) worst = 2;
      }
      return worst;
    };
    return score(a) - score(b);
  });
}

function renderCatalog() {
  // Save subfilter scroll position before re-render
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
        + label
        + (state.activeSort===v ? ' <span class="sort-check">✓</span>' : '')
        + '</button>'
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


function filteredSpecies() {
  return state.db.species.filter(s => matchesFilter(s, state.activeFilter));
}

function cardHTML(s) {
  const cfg = TYPE[s.type];
  const emoji = s.type === 'fish' ? '🐟' : s.type === 'plant' ? '🌿' : s.emoji;
  const inTank = state.tank.find(t => t.meta.id === s.id);
  const qty = inTank ? inTank.qty : 0;
  const compatHint = getCompatHint(s);
  const compatHintHTML = compatHint
    ? compatHint.map(function(h) {
        return '<div class="compat-hint ' + h.cls + '" onclick="event.stopPropagation()">' + h.text + '</div>';
      }).join('')
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
      <div class="param-box">
        <div class="param-label">Temp</div>
        <div class="param-value">${s.temp[0]}–${s.temp[1]}°C</div>
      </div>
      <div class="param-box">
        <div class="param-label">pH</div>
        <div class="param-value">${s.ph[0]}–${s.ph[1]}</div>
      </div>
      ${s.min_liters ? `<div class="param-box">
        <div class="param-label">Mín. L</div>
        <div class="param-value">${s.min_liters}L</div>
      </div>` : ''}
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

// ── COMPATIBILITY INFERENCE ENGINE ────────────
// Used when no explicit compat entry exists between two species.
// Returns { status: 'compat'|'incompat'|'neutral', icon, reason, inferred: true }
function inferCompat(a, b) {
  if (a.type === 'plant' || b.type === 'plant') return { status: 'compat', reason: '🌿 Las plantas son compatibles con todas las especies.' };
  const issues = [];
  const positives = [];

  // 1. Parameter overlap
  const paramOverlap = (a1, a2, b1, b2) => Math.max(a1, b1) <= Math.min(a2, b2);
  const tempOk = paramOverlap(a.temp[0], a.temp[1], b.temp[0], b.temp[1]);
  const phOk   = paramOverlap(a.ph[0],   a.ph[1],   b.ph[0],   b.ph[1]);
  const ghOk   = paramOverlap(a.gh[0],   a.gh[1],   b.gh[0],   b.gh[1]);

  if (!tempOk) issues.push(`rangos de temperatura incompatibles (${a.temp[0]}–${a.temp[1]}°C vs ${b.temp[0]}–${b.temp[1]}°C)`);
  if (!phOk)   issues.push(`rangos de pH incompatibles (${a.ph[0]}–${a.ph[1]} vs ${b.ph[0]}–${b.ph[1]})`);
  if (!ghOk)   issues.push(`dureza del agua incompatible (GH ${a.gh[0]}–${a.gh[1]} vs ${b.gh[0]}–${b.gh[1]})`);
  if (tempOk && phOk && ghOk) positives.push('parámetros de agua compatibles');

  // 2. Size — big fish eat small fish (ratio >4x is risky)
  const sizeA = a.size_cm || 5;
  const sizeB = b.size_cm || 5;
  const ratio = Math.max(sizeA, sizeB) / Math.min(sizeA, sizeB);
  if (ratio >= 5) {
    const big = sizeA > sizeB ? a : b;
    const small = sizeA > sizeB ? b : a;
    issues.push(`${big.name} (${big.size_cm} cm) puede comerse a ${small.name} (${small.size_cm} cm)`);
  } else if (ratio < 2) {
    positives.push('tamaños similares');
  }

  // 3. Temperament
  const aggressive = ['Agresivo', 'Semi-agresivo', 'Agresivo / Territorial'];
  const aAgg = aggressive.some(t => a.temperament?.includes(t));
  const bAgg = aggressive.some(t => b.temperament?.includes(t));
  if (aAgg && bAgg) issues.push('ambas especies tienen temperamento agresivo o semi-agresivo');
  else if (!aAgg && !bAgg) positives.push('ambas son pacíficas');

  // 4. Carnivore + small prey
  const carnivore = s => s.diet?.toLowerCase().includes('carnív');
  if (carnivore(a) && sizeB < sizeA * 0.4) issues.push(`${a.name} es carnívoro y ${b.name} puede ser presa`);
  if (carnivore(b) && sizeA < sizeB * 0.4) issues.push(`${b.name} es carnívoro y ${a.name} puede ser presa`);

  // 5. African cichlid water vs softwater species
  const african = s => s.subcategory === 'ciclido' && s.gh && s.gh[0] >= 8;
  const softwater = s => s.gh && s.gh[1] <= 10;
  if (african(a) && softwater(b)) issues.push(`${a.name} necesita agua muy dura, ${b.name} prefiere agua blanda`);
  if (african(b) && softwater(a)) issues.push(`${b.name} necesita agua muy dura, ${a.name} prefiere agua blanda`);

  // 6. Coldwater vs tropical
  const cold = s => s.temp && s.temp[1] <= 22;
  const tropical = s => s.temp && s.temp[0] >= 24;
  if (cold(a) && tropical(b)) issues.push(`${a.name} es de agua fría y ${b.name} necesita agua cálida`);
  if (cold(b) && tropical(a)) issues.push(`${b.name} es de agua fría y ${a.name} necesita agua cálida`);

  // ── Verdict
  const criticalIssues = issues.filter(i =>
    i.includes('temperatura') || i.includes('carnívoro') || i.includes('comerse') || i.includes('fría')
  );

  if (criticalIssues.length > 0 || issues.length >= 3) {
    return {
      status: 'incompat',
      icon: '✗',
      reason: '⚙️ Estimado: ' + criticalIssues.concat(issues.filter(i => !criticalIssues.includes(i))).slice(0, 2).join('; ') + '.',
      inferred: true
    };
  }
  if (issues.length >= 1) {
    return {
      status: 'neutral',
      icon: '⚠️',
      reason: '⚙️ Estimado: posible incompatibilidad — ' + issues[0] + (positives.length ? '. A favor: ' + positives[0] : '') + '.',
      inferred: true
    };
  }
  return {
    status: 'compat',
    icon: '✓',
    reason: '⚙️ Estimado: sin señales de incompatibilidad' + (positives.length ? ' — ' + positives.slice(0,2).join(', ') : '') + '.',
    inferred: true
  };
}


function compatIds(list) { return list.map(function(x){ return typeof x === 'string' ? x : x.id; }); }
function compatReason(list, id) {
  const entry = list.find(function(x){ return (typeof x === 'string' ? x : x.id) === id; });
  return (entry && entry.reason) ? entry.reason : null;
}

function getCompatHint(s) {
  if (state.tank.length === 0) return null;
  if (state.tank.find(t => t.meta.id === s.id)) return null;
  if (s.type === 'plant') return null; // plantas siempre compatibles

  const compat = state.db.compatibility[s.id] || { compatible: [], incompatible: [] };
  const tankSpecies = state.tank.map(t => t.meta).filter(t => t.type !== 'plant');
  const tankIds = tankSpecies.map(t => t.id);
  const badIds  = compatIds(compat.incompatible);
  const goodIds = compatIds(compat.compatible);
  const badOnes  = tankIds.filter(id => badIds.includes(id));
  const goodOnes = tankIds.filter(id => goodIds.includes(id));
  const warnOnes = tankIds.filter(id => !badIds.includes(id) && !goodIds.includes(id));

  const hints = [];
  if (badOnes.length > 0) {
    const names = badOnes.map(id => state.db.species.find(x => x.id === id)?.name).filter(Boolean);
    hints.push({ cls: 'bad', text: '⚠️ Incompatible con: ' + names.join(', ') });
  }
  if (goodOnes.length > 0) {
    hints.push({ cls: 'ok', text: '✓ Compatible con ' + goodOnes.length + ' especie' + (goodOnes.length > 1 ? 's' : '') + ' en tu pecera' });
  }
  if (warnOnes.length > 0) {
    let inferIncompat = 0, inferCompatOk = 0, inferWarn = 0;
    warnOnes.forEach(id => {
      const t = state.db.species.find(x => x.id === id);
      if (!t) return;
      const inf = inferCompat(s, t);
      if (inf.status === 'incompat') inferIncompat++;
      else if (inf.status === 'compat') inferCompatOk++;
      else inferWarn++;
    });
    if (inferIncompat > 0)
      hints.push({ cls: 'bad',  text: '⚙️ Estimado: prob. incompatible con ' + inferIncompat + ' especie' + (inferIncompat > 1 ? 's' : '') + ' — ver tab Compatibilidad' });
    if (inferCompatOk > 0)
      hints.push({ cls: 'ok',   text: '⚙️ Estimado: sin señales de incompatibilidad con ' + inferCompatOk + ' especie' + (inferCompatOk > 1 ? 's' : '') });
    if (inferWarn > 0)
      hints.push({ cls: 'warn', text: '⚙️ Estimado: ' + inferWarn + ' especie' + (inferWarn > 1 ? 's' : '') + ' sin datos suficientes — proceder con cuidado' });
  }
  return hints.length > 0 ? hints : null;
}

// ── TANK ACTIONS ───────────────────────────────
function addToTank(id) {
  const meta = state.db.species.find(s => s.id === id);
  if (!meta || state.tank.find(t => t.meta.id === id)) return;
  const qty = meta.schooling ? meta.min_school : 1;
  state.tank.push({ meta, qty });
  renderAfterTankChange();
}

function removeFromTank(id) {
  state.tank = state.tank.filter(t => t.meta.id !== id);
  renderAfterTankChange();
}

function changeQty(id, delta) {
  const entry = state.tank.find(t => t.meta.id === id);
  if (entry) {
    entry.qty = Math.max(1, entry.qty + delta);
    renderAfterTankChange();
    return;
  }
  if (delta > 0) addToTank(id);
}

// ── TANK STATS (shared helper) ─────────────────
function computeTankStats() {
  const all = state.tank.map(t => t.meta);
  const baseLiters  = Math.max(...state.tank.map(({ meta: s }) => s.min_liters || 0));
  const extraLiters = state.tank.reduce((sum, { meta: s, qty }) => sum + (s.liters_per_unit || 0) * Math.max(0, qty - 1), 0);
  const totalLiters = baseLiters + extraLiters;
  const totalAnimals = state.tank.reduce((sum, { qty }) => sum + qty, 0);
  const nitrate_max = Math.min(...all.map(s => s.nitrate_max || 25));

  const conflicts = [];
  const unknownPairs = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      if (a.type === 'plant' || b.type === 'plant') continue;
      const ca = state.db.compatibility[a.id];
      const cb = state.db.compatibility[b.id];
      const aIncompat = ca && compatIds(ca.incompatible).includes(b.id);
      const bIncompat = cb && compatIds(cb.incompatible).includes(a.id);
      const aCompat   = ca && compatIds(ca.compatible).includes(b.id);
      const bCompat   = cb && compatIds(cb.compatible).includes(a.id);
      if (aIncompat || bIncompat) {
        conflicts.push([a, b]);
      } else if (!aCompat && !bCompat) {
        const inf = inferCompat(a, b);
        if (inf.status === 'incompat') conflicts.push([a, b]);
        else if (inf.status === 'neutral') unknownPairs.push([a, b, inf]);
        // inf.status === 'compat' → no badge needed, engine is confident
      }
    }
  }
  const params = {
    temp: [Math.max(...all.map(s=>s.temp[0])), Math.min(...all.map(s=>s.temp[1]))],
    ph:   [Math.max(...all.map(s=>s.ph[0])),   Math.min(...all.map(s=>s.ph[1]))],
    gh:   [Math.max(...all.map(s=>s.gh[0])),   Math.min(...all.map(s=>s.gh[1]))],
    kh:   [Math.max(...all.map(s=>s.kh[0])),   Math.min(...all.map(s=>s.kh[1]))],
  };
  const paramConflict = Object.values(params).some(([lo,hi]) => lo > hi);
  const hasConflict   = conflicts.length > 0 || paramConflict;
  const hasWarning    = unknownPairs.length > 0;

  return { all, baseLiters, extraLiters, totalLiters, totalAnimals,
           nitrate_max, conflicts, unknownPairs, params, paramConflict, hasConflict, hasWarning };
}

// ── TANK RENDER ────────────────────────────────
function renderTank() {
  if (state.tank.length === 0) {
    document.getElementById('tab-tank').innerHTML = `
      <div class="tank-page">
        <div class="tank-empty-full">
          <div class="tank-empty-illustration">🌊</div>
          <div class="tank-empty-title">Tu pecera está vacía</div>
          <div class="tank-empty-sub">Explora el catálogo y agrega tus primeras especies</div>
          <button class="btn-primary" onclick="switchTab('catalog')">Explorar catálogo</button>
        </div>
      </div>`;
    return;
  }

  const { all, baseLiters, extraLiters, totalLiters, totalAnimals,
          nitrate_max, conflicts, unknownPairs, params, paramConflict, hasConflict, hasWarning } = computeTankStats();

  // ── Dificultad global
  const careOrder = { 'Fácil': 1, 'Intermedio': 2, 'Difícil': 3, 'Muy difícil': 4 };
  const maxCare = all.reduce((max, s) => {
    const rank = careOrder[s.care] || 1;
    return rank > (careOrder[max] || 1) ? s.care : max;
  }, 'Fácil');
  const careColor = { 'Fácil': 'var(--success)', 'Intermedio': 'var(--warn)', 'Difícil': 'var(--danger)', 'Muy difícil': 'var(--danger)' }[maxCare] || 'var(--success)';
  const careIcon  = { 'Fácil': '🟢', 'Intermedio': '🟡', 'Difícil': '🔴', 'Muy difícil': '🔴' }[maxCare] || '🟢';

  // ── Dieta del conjunto (solo animales)
  const diets = [...new Set(all.filter(s => s.diet).map(s => s.diet))];

  // ── Matriz de compatibilidad
  const matrixHTML = all.length > 1 ? (() => {
    let rows = '';
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        // Skip plant pairs — no behavioral compat needed
        if (a.type === 'plant' || b.type === 'plant') continue;
        const ca = state.db.compatibility[a.id];
        const cb = state.db.compatibility[b.id];
        const isIncompat = (ca && compatIds(ca.incompatible).includes(b.id)) || (cb && compatIds(cb.incompatible).includes(a.id));
        const isCompat   = (ca && compatIds(ca.compatible).includes(b.id))   || (cb && compatIds(cb.compatible).includes(a.id));
        const status = isIncompat ? 'incompat' : isCompat ? 'compat' : 'neutral';
        const icon   = isIncompat ? '✗' : isCompat ? '✓' : '❓';
        let reason, inferred = false;
        if (isIncompat) {
          reason = (ca && compatReason(ca.incompatible, b.id)) || (cb && compatReason(cb.incompatible, a.id)) || null;
        } else if (isCompat) {
          reason = (ca && compatReason(ca.compatible, b.id)) || (cb && compatReason(cb.compatible, a.id)) || null;
        } else {
          const inf = inferCompat(a, b);
          reason = inf.reason;
          inferred = true;
        }
        const inf = (!isIncompat && !isCompat) ? inferCompat(a, b) : null;
        const rowStatus = isIncompat ? 'incompat' : isCompat ? 'compat' : inf.status;
        const rowIcon   = isIncompat ? '✗' : isCompat ? '✓' : inf.icon;
        rows += '<div class="compat-matrix-row ' + rowStatus + '">'
          + '<span class="cmr-icon">' + rowIcon + '</span>'
          + '<span class="cmr-names">' + a.name + ' <span class="cmr-amp">&</span> ' + b.name + '</span>'
          + '<span class="cmr-reason">' + reason + '</span>'
          + '</div>';
      }
    }
    return rows;
  })() : '';

  // ── Barras de parámetros
  const paramRows = [
    ['🌡 Temperatura', 'temp', '°C',  15, 35],
    ['⚗️ pH',          'ph',   '',    4,  9 ],
    ['💧 GH',          'gh',   '°d',  0,  30],
    ['🪨 KH',          'kh',   '°d',  0,  20],
  ];

  const pct = (v, gMin, range) => Math.max(0, Math.min(100, ((v - gMin) / range * 100)));

  const paramBarsHTML = paramRows.map(([label, key, unit, gMin, gMax]) => {
    const [lo, hi] = params[key];
    const conflict = lo > hi;
    const range = gMax - gMin;

    const valueText = conflict ? '⚠ Sin zona común' : `Zona compatible: ${lo}–${hi} ${unit}`;
    const valColor  = conflict ? 'var(--danger)' : 'var(--success)';

    // Per-species ticks on a shared axis
    const relevant = all.filter(s => s[key] != null);
    const ticksHTML = relevant.map((s, i) => {
      const colors = ['#00d4ff','#fbbf24','#c084fc','#ff6b9d','#34d399','#f472b6'];
      const c = colors[i % colors.length];
      const tL = pct(s[key][0], gMin, range).toFixed(1);
      const tW = Math.max(pct(s[key][1], gMin, range) - pct(s[key][0], gMin, range), 1.5).toFixed(1);
      const shortName = s.name.split('/')[0].split(' ').slice(0,2).join(' ');
      return `<div class="pb-tick-row">
        <span class="pb-tick-name">${shortName}</span>
        <div class="pb-tick-track">
          <div class="pb-tick-bar" style="left:${tL}%;width:${tW}%;background:${c}"></div>
        </div>
        <span class="pb-tick-val">${s[key][0]}–${s[key][1]}</span>
      </div>`;
    }).join('');

    return `<div class="pb-block">
      <div class="pb-head">
        <span class="pb-label">${label}</span>
        <span class="pb-result" style="color:${valColor}">${valueText}</span>
      </div>
      <div class="pb-ticks">
        <div class="pb-scale-row">
          <span class="pb-tick-name"></span>
          <div class="pb-tick-track pb-tick-track--axis">
            ${!conflict ? `<div class="pb-safe-zone" style="left:${pct(lo,gMin,range).toFixed(1)}%;width:${Math.max(pct(hi,gMin,range)-pct(lo,gMin,range),2).toFixed(1)}%"></div>` : ''}
          </div>
          <span class="pb-tick-val"></span>
        </div>
        ${ticksHTML}
        <div class="pb-scale-labels">
          <span class="pb-tick-name"></span>
          <div class="pb-scale-inner"><span>${gMin}${unit}</span><span>${gMax}${unit}</span></div>
          <span class="pb-tick-val"></span>
        </div>
      </div>
    </div>`;
  }).join('');

  // ── Especies lista compacta
  const speciesListHTML = state.tank.map(({ meta: s, qty }) => {
    const compat = state.db.compatibility[s.id] || { incompatible: [] };
    const conflictWith = all.filter(o => o.id !== s.id && compatIds(compat.incompatible).includes(o.id));
    return '<div class="tnk-species-row">'
      + '<span class="tnk-sp-emoji">' + getEmoji(s) + '</span>'
      + '<div class="tnk-sp-info">'
      + '<div class="tnk-sp-name">' + s.name + (conflictWith.length > 0 ? ' <span class="tnk-sp-conflict">⚠️</span>' : '') + '</div>'
      + '<div class="tnk-sp-sci">' + s.scientific + '</div>'
      + '</div>'
      + '<div class="tnk-sp-controls">'
      + '<button class="tank-qty-btn" onclick="changeQty(\'' + s.id + '\',-1)">−</button>'
      + '<span class="tank-qty-val">' + qty + '</span>'
      + '<button class="tank-qty-btn" onclick="changeQty(\'' + s.id + '\',1)">+</button>'
      + '<button class="tnk-sp-detail" onclick="openDetail(\'' + s.id + '\')">Ver</button>'
      + '<button class="tnk-sp-remove" onclick="removeFromTank(\'' + s.id + '\')">✕</button>'
      + '</div>'
      + '</div>';
  }).join('');

  // ── Recomendación de sustrato
  const substrateRecoHTML = (() => {
    const hasPlants    = all.some(s => s.type === 'plant');
    const hasCaridina  = all.some(s => s.subcategory === 'caridina');
    const hasNeo       = all.some(s => s.subcategory === 'neocaridina');
    const hasShrimp    = all.some(s => s.type === 'invertebrate' && s.category === 'shrimp');
    const hasCorydoras = all.some(s => s.subcategory === 'fondo' && s.scientific && s.scientific.startsWith('Corydoras'));
    const hasGoldfish  = all.some(s => s.subcategory === 'ciprinido' && (s.scientific === 'Carassius auratus' || s.scientific === 'Cyprinus carpio'));
    const hasAfrican   = all.some(s => s.subcategory === 'ciclido' && s.gh && s.gh[0] >= 8);
    const avgPH        = params.ph ? (params.ph[0] + params.ph[1]) / 2 : 7;

    let reco, why, cat, warning = null;

    if (hasAfrican || avgPH > 7.8) {
      reco = 'Aragonita o Coral Triturado';
      cat  = '🟦 Alcalino';
      why  = 'Tus cíclidos africanos necesitan pH alcalino (7.8–8.5). Un sustrato alcalino estabiliza el pH y la dureza de forma natural.';
    } else if (hasCaridina) {
      reco = 'ADA Amazonia · Fluval Stratum · Seachem Flourite Red';
      cat  = '🟩 Nutritivo / 🟫 Poroso';
      why  = 'Los camarones Caridina (Crystal Red) requieren agua blanda y ácida (pH 6.0–6.8). Estos sustratos acidifican activamente y tienen alta capacidad de intercambio iónico.';
    } else if (hasPlants && hasNeo) {
      reco = 'Tropica Aquarium Soil · Fluval Stratum · Seachem Flourite Dark';
      cat  = '🟩 Nutritivo';
      why  = 'Tienes plantas que necesitan nutrientes y camarones Neocaridina que toleran pH 6.5–7.5. Estos sustratos equilibran ambas necesidades sin acidificar en exceso.';
    } else if (hasPlants) {
      reco = 'Tropica Aquarium Soil · Fluval Stratum · JBL Manado · Seachem Onyx';
      cat  = '🟩 Nutritivo / 🟫 Poroso';
      why  = 'Tus plantas se benefician de un sustrato nutritivo o poroso. JBL Manado y Seachem Onyx funcionan muy bien combinados con fertilizantes líquidos.';
    } else if (hasCorydoras || hasShrimp) {
      reco = 'Arena de Sílice o Grano de Oro';
      cat  = '⬜ Inerte';
      why  = 'Los Corydoras necesitan arena fina y redondeada para proteger sus barbillas. La arena de sílice es ideal y también segura para camarones.';
      if (hasCorydoras) warning = '⚠️ Evitá grava gruesa — puede dañar las barbillas de los Corydoras.';
    } else if (hasGoldfish) {
      reco = 'Gravilla Canto Rodado o Arena de Río';
      cat  = '⬜ Inerte';
      why  = 'Los goldfish remueven el sustrato constantemente. Una grava redondeada y pesada es más estable y fácil de limpiar.';
      warning = '⚠️ Evitá sustratos nutritivos — los goldfish los desenterrarán y enturbian el agua.';
    } else {
      reco = 'Arena de Sílice, Grano de Oro o Cuarzo Negro';
      cat  = '⬜ Inerte';
      why  = 'Tu conjunto no tiene requerimientos especiales de sustrato. Una arena inerte fina es versátil, económica y segura para todas las especies.';
    }

    return `
      <div class="sub-reco-card">
        <div class="sub-reco-top">
          <div class="sub-reco-cat">${cat}</div>
          <div class="sub-reco-name">${reco}</div>
        </div>
        <p class="sub-reco-why">${why}</p>
        ${warning ? `<div class="sub-reco-warn">${warning}</div>` : ''}
        <button class="sub-reco-btn" onclick="switchTab('tools');setTimeout(()=>toggleTool('substrate'),50)">Ver calculadora de sustrato →</button>
      </div>`;
  })();

  document.getElementById('tab-tank').innerHTML = `
    <div class="tank-page">

      <!-- HERO -->
      <div class="tnk-hero">
        <div class="tnk-hero-left">
          <div class="tnk-hero-label">Litros mínimos</div>
          <div class="tnk-hero-liters">${totalLiters}<span>L</span></div>
          <div class="tnk-hero-sub">${baseLiters}L base · +${extraLiters}L ejemplares</div>
          <button class="sub-reco-btn" style="margin-top:6px" onclick="switchTab('tools');setTimeout(()=>toggleTool('glass'),50)">Ver calculadora de acuario →</button>
        </div>
        <div class="tnk-hero-right">
          <div class="tnk-stat-badge ${hasConflict ? 'danger' : 'ok'}">
            <span>${hasConflict ? '⚠️' : '✅'}</span>
            <span>${hasConflict ? conflicts.length + ' conflicto' + (conflicts.length > 1 ? 's' : '') : 'Compatible'}</span>
          </div>
          ${!hasConflict && hasWarning ? `<div class="tnk-stat-badge warn">
            <span>❓</span>
            <span>${unknownPairs.length} sin datos</span>
          </div>` : ''}
          <div class="tnk-stat-badge" style="border-color:${careColor}20;color:${careColor}">
            <span>${careIcon}</span>
            <span>${maxCare}</span>
          </div>
          <div class="tnk-stat-badge neutral">
            <span>🐟</span>
            <span>${totalAnimals} ejemplares</span>
          </div>
        </div>
      </div>

      <!-- COMPATIBILIDAD -->
      ${all.length > 1 ? `
      <div class="tnk-section">
        <div class="tnk-section-title">🤝 Compatibilidad</div>
        <div class="tnk-compat-matrix">${matrixHTML}</div>
      </div>` : ''}

      <!-- PARÁMETROS -->
      <div class="tnk-section">
        <div class="tnk-section-title">💧 Zona de agua segura</div>
        ${paramBarsHTML}
        <div class="tnk-nitrate">Nitrato máx. recomendado: <strong>${nitrate_max} ppm</strong></div>
      </div>

      <!-- SUSTRATO -->
      <div class="tnk-section">
        <div class="tnk-section-title">🪨 Sustrato recomendado</div>
        ${substrateRecoHTML}
      </div>

      <!-- DIETA -->
      ${diets.length > 0 ? `
      <div class="tnk-section">
        <div class="tnk-section-title">🍽 Dieta del conjunto</div>
        <div class="tnk-diets">${diets.map(d => '<span class="tnk-diet-chip">' + d + '</span>').join('')}</div>
      </div>` : ''}

      <!-- ESPECIES -->
      <div class="tnk-section">
        <div class="tnk-section-title">${
          (() => {
            const hasFish   = all.some(s => s.type === 'fish');
            const hasPlant  = all.some(s => s.type === 'plant');
            const hasShrimp = all.some(s => s.category === 'shrimp');
            const hasSnail  = all.some(s => s.category === 'snail');
            return [hasFish ? '🐟' : '', hasPlant ? '🌿' : '', hasShrimp ? '🦐' : '', hasSnail ? '🐌' : ''].filter(Boolean).join('');
          })()
        } Especies en tu pecera</div>
        <div class="tnk-species-list">${speciesListHTML}</div>
        <button class="btn-go-catalog" onclick="switchTab('catalog')">+ Agregar más especies</button>
      </div>

    </div>`;
}



// ── DETAIL MODAL ───────────────────────────────
function preventOverlayScroll(e) {
  if (e.target.closest('.modal-box')) return;
  e.preventDefault();
}

async function openDetail(id) {
  const meta = state.db.species.find(s => s.id === id);
  if (!meta) return;

  // Load detail JSON if not cached
  if (!state.detailCache[id]) {
    try {
      const res = await fetch(meta.path);
      state.detailCache[id] = await res.json();
    } catch {
      state.detailCache[id] = {};
    }
  }

  state.modalSpecies = { ...meta, ...state.detailCache[id] };
  state.modalTab = 'general';
  renderModal();
  document.getElementById('detail-modal').classList.remove('hidden');
  lockScroll();
  document.getElementById('detail-modal').addEventListener('touchmove', preventOverlayScroll, { passive: false });

  // Fetch image — use fixed URL if available, otherwise Wikipedia strategy C
  if (!state.imageCache) state.imageCache = {};
  if (!state.imageCache[id]) {
    state.imageCache[id] = null;

    const meta = state.db.species.find(s => s.id === id);

    // Use fixed image if present in db.json
    if (meta.image_url) {
      state.imageCache[id] = meta.image_url;
      if (state.modalSpecies?.id === id) renderModal();
      return;
    }

    async function wikiSummary(title) {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g,'_'))}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const d = await r.json();
      return d.originalimage?.source || d.thumbnail?.source || null;
    }

    async function wikiSearch(query) {
      const url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const d = await r.json();
      const title = d.query?.search?.[0]?.title;
      if (!title) return null;
      return wikiSummary(title);
    }

    try {
      let img = null;
      img = await wikiSummary(meta.scientific);
      if (!img) img = await wikiSearch(meta.scientific);
      if (!img && meta.name_en) img = await wikiSearch(meta.name_en + ' fish');
      state.imageCache[id] = img;
    } catch {
      state.imageCache[id] = null;
    }

    if (state.modalSpecies?.id === id) renderModal();
  }
}

function closeModal() {
  document.getElementById('detail-modal').classList.add('hidden');
  unlockScroll();
  document.getElementById('detail-modal').removeEventListener('touchmove', preventOverlayScroll);
  state.modalSpecies = null;
}

function renderModal() {
  const s = state.modalSpecies;
  if (!s) return;
  const cfg = TYPE[s.type];
  const emoji = s.type === 'fish' ? '🐟' : s.type === 'plant' ? '🌿' : s.emoji;
  const inTank = state.tank.find(t => t.meta.id === s.id);

  const tabs = [
    { id: 'general',  label: '📋 General' },
    { id: 'params',   label: '💧 Parámetros' },
    { id: 'biology',  label: '🧬 Biología' },
    { id: 'care',     label: '🛠️ Cuidados' },
    { id: 'health',   label: s.type === 'plant' ? '🌿 Problemas' : '🦠 Salud' },
    { id: 'compat', label: '🤝 Compatibilidad' },
  ];

  const imgUrl = state.imageCache?.[s.id];

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <div class="modal-color-bar" style="background:${s.color}"></div>
      ${imgUrl ? `
      <div class="modal-img-hero" style="background-image:url('${imgUrl}')">
        <div class="modal-img-gradient"></div>
        <div class="modal-img-titles">
          <div class="modal-title">${s.name}</div>
          <div class="modal-scientific">${s.scientific}</div>
        </div>
        <button class="modal-close modal-close--img" onclick="closeModal()">×</button>
      </div>` : `
      <div class="modal-title-row">
        <div class="modal-emoji-box" style="background:${cfg.bg}">${emoji}</div>
        <div>
          <div class="modal-title">${s.name}</div>
          <div class="modal-scientific">${s.scientific}</div>
          <div class="modal-family">${s.family || ''} ${s.order ? '· ' + s.order : ''}</div>
        </div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>`}
      <div class="modal-tabs">
        ${tabs.map(t => `
          <button class="modal-tab-btn ${state.modalTab === t.id ? 'active' : ''}"
            style="${state.modalTab === t.id ? 'background:' + s.color : ''}"
            onclick="switchModalTab('${t.id}')">${t.label}</button>
        `).join('')}
      </div>
    </div>
    <div class="modal-body">${modalTabContent(s, state.modalTab)}</div>
    <div class="modal-footer">
      <button class="modal-action-btn"
        style="background:${inTank ? 'rgba(255,79,109,0.12)' : cfg.color};color:${inTank ? 'var(--danger)' : 'var(--bg-deep)'}"
        onclick="${inTank ? `removeFromTank('${s.id}');closeModal()` : `addToTank('${s.id}');closeModal()`}">
        ${inTank ? '✕ Quitar de la pecera' : `+ Agregar ${s.name} a mi pecera`}
      </button>
    </div>`;
}

function switchModalTab(tab) {
  const s = state.modalSpecies;
  if (!s) return;
  state.modalTab = tab;

  // Update tab buttons (active state + color) without re-rendering the whole modal
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    const isActive = btn.getAttribute('onclick') === `switchModalTab('${tab}')`;
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? s.color : '';
  });

  // Swap only the body content — no scroll jump
  const body = document.querySelector('.modal-body');
  if (body) body.innerHTML = modalTabContent(s, tab);
}

function modalTabContent(s, tab) {
  const cfg = TYPE[s.type];

  if (tab === 'general') {
    return `
      <p style="color:var(--text-2);line-height:1.7;font-size:14px;margin-bottom:18px">${s.description || '–'}</p>
      ${s.variants?.length ? `
        <div class="detail-section">
          <div class="detail-section-title">🎨 Variantes y morfologías</div>
          <div class="tag-list">${s.variants.map(v => `<span class="tag" style="background:${cfg.bg};color:${cfg.color};font-size:12px">${v}</span>`).join('')}</div>
        </div>` : ''}
      ${s.origin ? `
        <div class="detail-section">
          <div class="detail-section-title">🌍 Origen y hábitat natural</div>
          <div class="info-grid">
            <div class="info-cell"><div class="info-cell-label">Región</div><div class="info-cell-val">${s.origin.region}</div></div>
            <div class="info-cell"><div class="info-cell-label">Países</div><div class="info-cell-val">${s.origin.countries?.join(', ')}</div></div>
            <div class="info-cell wide"><div class="info-cell-label">Cuenca</div><div class="info-cell-val">${s.origin.basin}</div></div>
            <div class="info-cell wide"><div class="info-cell-label">Hábitat</div><div class="info-cell-val">${s.origin.habitat}</div></div>
            ${s.origin.wild_params ? `<div class="info-cell wide"><div class="info-cell-label">Parámetros silvestres</div><div class="info-cell-val">${s.origin.wild_params}</div></div>` : ''}
          </div>
        </div>` : ''}
      <div class="info-grid">
        ${s.size_cm ? `<div class="info-cell"><div class="info-cell-label">Tamaño adulto</div><div class="info-cell-val">${s.size_cm}–${s.max_size_cm || s.size_cm} cm</div></div>` : ''}
        ${s.type !== 'plant' && s.lifespan_years ? `<div class="info-cell"><div class="info-cell-label">Esperanza de vida</div><div class="info-cell-val">${s.lifespan_years} años</div></div>` : ''}
        ${s.min_liters ? `<div class="info-cell"><div class="info-cell-label">Litros mínimos</div><div class="info-cell-val">${s.min_liters} L</div></div>` : ''}
        <div class="info-cell"><div class="info-cell-label">Dificultad</div><div class="info-cell-val">${s.care}</div></div>
        ${s.diet ? `<div class="info-cell"><div class="info-cell-label">Dieta</div><div class="info-cell-val">${s.diet}</div></div>` : ''}
        ${s.temperament ? `<div class="info-cell"><div class="info-cell-label">Temperamento</div><div class="info-cell-val">${s.temperament}</div></div>` : ''}
        ${s.level ? `<div class="info-cell"><div class="info-cell-label">Estrato</div><div class="info-cell-val">${s.level}</div></div>` : ''}
        ${s.type !== 'plant' && s.schooling !== undefined ? `<div class="info-cell"><div class="info-cell-label">Cardumen</div><div class="info-cell-val">${s.schooling ? `Sí · mín. ${s.min_school}, ideal ${s.recommended_school}` : 'No'}</div></div>` : ''}
        ${s.iucn ? `<div class="info-cell wide"><div class="info-cell-label">Estado IUCN</div><div class="info-cell-val">${renderIUCN(s.iucn)}</div></div>` : ''}
      </div>
      ${s.market_notes ? `<div style="background:var(--accent-dim2);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--text-2);line-height:1.6"><strong>💡 Nota de mercado:</strong> ${s.market_notes}</div>` : ''}`;
  }

  if (tab === 'params') {
    const paramRows = [
      ['Temperatura', s.temp, '°C', 15, 35],
      ['pH', s.ph, '', 4, 9],
      ['GH', s.gh, '°dGH', 0, 30],
      ['KH', s.kh, '°dKH', 0, 20],
    ];
    return `
      <div class="detail-section">
        <div class="detail-section-title">💧 Parámetros del agua</div>
        ${paramRows.map(([label, range, unit, gMin, gMax]) => {
          const [lo, hi] = range || [0,0];
          const r = gMax - gMin;
          const left = ((lo - gMin) / r * 100).toFixed(1);
          const width = Math.max((hi - lo) / r * 100, 3).toFixed(1);
          return `<div class="param-bar-wrap">
            <div class="param-bar-labels"><span style="font-weight:600">${label}</span><span>${lo} – ${hi} ${unit}</span></div>
            <div class="param-bar-track"><div class="param-bar-fill" style="left:${left}%;width:${width}%;background:${cfg.color}"></div></div>
          </div>`;
        }).join('')}
        <div style="display:flex;gap:8px;margin-top:10px">
          ${[['Nitrato máx.', s.nitrate_max+' ppm'],['Amoniaco','0 ppm'],['Nitrito','0 ppm']].map(([l,v])=>`
          <div class="param-box" style="flex:1;text-align:center">
            <div class="param-label">${l}</div><div class="param-value">${v}</div>
          </div>`).join('')}
        </div>
      </div>
      ${s.substrate?.length ? `<div class="detail-section">
        <div class="detail-section-title">🪨 Sustrato</div>
        <div class="tag-list" style="margin-bottom:8px">${s.substrate.map(x=>`<span class="tag" style="background:var(--bg-surface);color:var(--text-2);font-size:12px">🪨 ${x}</span>`).join('')}</div>
        ${s.substrate_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6">${s.substrate_detail}</p>` : ''}
      </div>` : ''}
      ${s.plants ? `<div class="detail-section">
        <div class="detail-section-title">🌿 Plantas</div>
        <span class="tag" style="background:var(--accent-dim);color:var(--success);font-size:12px">${s.plants}</span>
        ${s.plant_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.plant_detail}</p>` : ''}
      </div>` : ''}
      ${s.light ? `<div class="detail-section">
        <div class="detail-section-title">💡 Iluminación</div>
        <span class="tag" style="background:var(--accent-dim2);color:var(--warn);font-size:12px">${s.light}</span>
        ${s.light_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.light_detail}</p>` : ''}
      </div>` : ''}
      ${s.co2 !== undefined ? `<div class="detail-section">
        <div class="detail-section-title">🫧 CO₂</div>
        <span class="tag" style="background:${s.co2?'var(--accent-dim)':'var(--bg-surface)'};color:${s.co2?'var(--success)':'var(--text-3)'};font-size:12px">${s.co2 ? 'Recomendado' : 'No necesario'}</span>
        ${s.co2_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.co2_detail}</p>` : ''}
      </div>` : ''}`;
  }

  if (tab === 'biology') {
    return `
      ${s.behavior ? `<div class="detail-section"><div class="detail-section-title">🧬 Comportamiento</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.behavior}</p></div>` : ''}
      ${s.type !== 'plant' && s.feeding_detail ? `<div class="detail-section"><div class="detail-section-title">🍽️ Alimentación</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.feeding_detail}</p></div>` : ''}
      ${s.type !== 'plant' && s.sexing ? `<div class="detail-section"><div class="detail-section-title">♀♂ Dimorfismo sexual</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.sexing}</p></div>` : ''}
      ${s.reproduction ? `<div class="detail-section"><div class="detail-section-title">🥚 Reproducción</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.reproduction}</p></div>` : ''}
      ${s.propagation ? `<div class="detail-section"><div class="detail-section-title">🌱 Propagación</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.propagation}</p></div>` : ''}`;
  }

  if (tab === 'care') {
    return `
      ${s.filtration ? `<div class="detail-section"><div class="detail-section-title">⚙️ Filtración</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.filtration}</p></div>` : ''}
      ${s.water_changes ? `<div class="detail-section"><div class="detail-section-title">🔄 Cambios de agua</div><span class="tag" style="background:var(--accent-dim);color:var(--accent);font-size:12px">${s.water_changes}</span></div>` : ''}
      ${s.compatibility_notes ? `<div class="detail-section"><div class="detail-section-title">🤝 Notas de compatibilidad</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.compatibility_notes}</p></div>` : ''}
      ${s.fertilizer ? `<div class="detail-section"><div class="detail-section-title">🌱 Fertilización</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.fertilizer}</p></div>` : ''}
      ${s.uses ? `<div class="detail-section"><div class="detail-section-title">🎨 Uso en el acuario</div><p style="font-size:14px;color:var(--text-2);line-height:1.7">${s.uses}</p></div>` : ''}`;
  }

  if (tab === 'health') {
    const items = s.diseases || s.problems || [];
    const title = s.type === 'plant' ? '🌿 Problemas comunes y soluciones' : '🦠 Enfermedades frecuentes';
    if (!items.length) return `<div style="text-align:center;padding:30px;color:var(--text-3)"><div style="font-size:32px">${s.type === 'plant' ? '🌿' : '🦠'}</div><p style="margin-top:8px;font-size:14px">Sin registros.</p></div>`;
    return `
      <div class="detail-section">
        <div class="detail-section-title">${title}</div>
        ${items.map(d => `
          <div class="disease-card">
            <div class="disease-symptom">
              <span>⚠️</span>
              <span class="disease-symptom-text">${d.symptom}</span>
            </div>
            <div class="disease-detail">
              <div class="disease-cause"><strong>Causa: </strong>${d.cause}</div>
              <div class="disease-solution"><strong>✓ Solución: </strong>${d.solution}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  if (tab === 'compat') {
    const compat = state.db.compatibility[s.id] || { compatible: [], incompatible: [] };
    const others = state.tank.filter(t => t.meta.id !== s.id);
    if (others.length === 0) return `
      <div class="compat-empty">
        <div style="font-size:40px;margin-bottom:12px">🤝</div>
        <div class="compat-empty-title">Tu pecera está vacía</div>
        <div class="compat-empty-sub">Agregá especies desde el catálogo para ver su compatibilidad con <strong>${s.name}</strong>.</div>
        <button class="btn-primary" style="margin-top:16px;width:100%" onclick="closeModal();switchTab('catalog')">Ir al catálogo</button>
      </div>`;
    const rows = others.map(function({ meta: t }) {
      if (t.type === 'plant') return ''; // skip plants
      const badIds  = compatIds(compat.incompatible);
      const goodIds = compatIds(compat.compatible);
      const isExplicitBad  = badIds.includes(t.id);
      const isExplicitGood = goodIds.includes(t.id);
      let status, label, reason;
      if (isExplicitBad) {
        status = 'incompatible'; label = '✗ Incompatible';
        reason = compatReason(compat.incompatible, t.id) || 'Incompatible según datos registrados.';
      } else if (isExplicitGood) {
        status = 'compatible'; label = '✓ Compatible';
        reason = compatReason(compat.compatible, t.id) || 'Compatible según datos registrados.';
      } else {
        const inf = inferCompat(s, t);
        status = inf.status === 'incompat' ? 'incompatible' : inf.status === 'compat' ? 'compatible' : 'warning';
        label  = inf.status === 'incompat' ? '✗ Prob. incompatible' : inf.status === 'compat' ? '✓ Prob. compatible' : '⚠️ Incierto';
        reason = inf.reason;
      }
      return '<div class="compat-row">'
        + '<span style="font-size:20px">' + getEmoji(t) + '</span>'
        + '<div style="flex:1">'
        +   '<div class="compat-row-name">' + t.name + '</div>'
        +   '<div style="font-size:11px;color:var(--text-3);font-style:italic">' + t.scientific + '</div>'
        +   '<div class="compat-reason ' + status + '">' + reason + '</div>'
        + '</div>'
        + '<span class="compat-badge ' + status + '">' + label + '</span>'
        + '</div>';
    }).join('');
    return '<div class="detail-section"><div class="detail-section-title">🤝 Compatibilidad con tu pecera</div>' + rows + '</div>';
  }

  return '';
}

// ── TOOLS ───────────────────────────────────────
// Substrate catalog
const SUBSTRATES = [
  // Inertes                                                              grain_mm = rango granulometría estándar, pack = factor compactación real
  { id:'grano_oro',    cat:'Inerte',    name:'Grano de Oro',          icon:'⬜', density:1.6,  color:'#f5c842', grain:'0.5–1 mm',   pack:0.62, note:'Arena dorada muy usada en México. Inerte, no altera pH. Grano fino y redondeado, segura para Corydoras.' },
  { id:'silice',       cat:'Inerte',    name:'Arena de Sílice',       icon:'⬜', density:1.7,  color:'#b0bec5', grain:'0.1–0.5 mm', pack:0.65, note:'Completamente inerte. No altera pH ni dureza. Muy fina y redondeada. Apta para cualquier especie.' },
  { id:'cuarzo_negro', cat:'Inerte',    name:'Cuarzo Negro',          icon:'⬜', density:1.7,  color:'#37474f', grain:'1–3 mm',     pack:0.60, note:'Cuarzo inerte en color oscuro. Realza los colores de los peces. No altera parámetros.' },
  { id:'arena_rio',    cat:'Inerte',    name:'Arena de Río',          icon:'⬜', density:1.5,  color:'#deb887', grain:'0.5–2 mm',   pack:0.63, note:'Natural, fina y redondeada. Económica y segura. Puede contener algo de materia orgánica — lavar bien.' },
  { id:'canto',        cat:'Inerte',    name:'Gravilla Canto Rodado', icon:'⬜', density:1.65, color:'#9b8ea0', grain:'3–8 mm',     pack:0.55, note:'Grano redondeado por erosión natural. Inerte. Buena circulación entre partículas.' },
  // Nutritivos
  { id:'flourite_red',  cat:'Nutritivo', name:'Seachem Flourite Red',  icon:'🟩', density:0.85, color:'#c62828', grain:'1–3 mm',     pack:0.58, note:'Arcilla porosa roja rica en hierro. Acidifica levemente (pH 6.2–6.8). Ideal para planted tanks y camarones Caridina. No requiere sustitución.' },
  { id:'flourite_dark', cat:'Nutritivo', name:'Seachem Flourite Dark', icon:'🟩', density:0.90, color:'#37474f', grain:'1–4 mm',     pack:0.58, note:'Arcilla porosa oscura. pH neutro a levemente ácido (~6.5). Nutritivo a largo plazo. Compatible con peces delicados y plantas de media dificultad.' },
  { id:'onyx_sand',    cat:'Nutritivo', name:'Seachem Onyx Sand',     icon:'🟩', density:0.88, color:'#424242', grain:'0.5–2 mm',   pack:0.57, note:'Arena oscura rica en carbonatos. Eleva pH 0.1–0.5 unidades. Soporta niveles óptimos de KH. Excelente para camarones y planted.' },
  { id:'ada_amazonia', cat:'Nutritivo', name:'ADA Amazonia',          icon:'🟩', density:0.85, color:'#2e7d32', grain:'1–3 mm',     pack:0.58, note:'Sustrato premium japonés de origen volcánico. Acidifica activamente a pH 6.0–6.8. Ideal para plantas exigentes y camarones Caridina. Se degrada con el tiempo.' },
  { id:'tropica_soil', cat:'Nutritivo', name:'Tropica Aquarium Soil', icon:'🟩', density:0.90, color:'#388e3c', grain:'1–4 mm',     pack:0.58, note:'Sustrato danés nutritivo con pH estabilizado (~6.5). Menos acidificante que ADA. Compatible con peces delicados y plantaciones densas.' },
  { id:'fluval_stratum', cat:'Nutritivo', name:'Fluval Stratum',      icon:'🟩', density:0.88, color:'#6d4c41', grain:'2–4 mm',     pack:0.57, note:'Suelo volcánico liviano. Acidifica levemente. Gran superficie porosa. Excelente para camarones y plantas de media dificultad.' },

  // Porosos
  { id:'onyx',         cat:'Poroso',    name:'Seachem Onyx',          icon:'🟫', density:0.88, color:'#212121', grain:'2–5 mm',     pack:0.57, note:'Grava porosa natural para cíclidos y planted. Ligera capacidad tampón. Estimula colonias bacterianas. Apto para agua dulce y marina.' },
  { id:'flourite',     cat:'Poroso',    name:'Seachem Flourite',      icon:'🟫', density:0.95, color:'#b71c1c', grain:'2–5 mm',     pack:0.57, note:'Grava de arcilla porosa. No requiere sustitución. Libera nutrientes a largo plazo. pH neutro.' },
  { id:'jbl_manado',   cat:'Poroso',    name:'JBL Manado',            icon:'🟫', density:0.85, color:'#e65100', grain:'2–5 mm',     pack:0.57, note:'Grano poroso de arcilla alemán. Estimula colonias bacterianas y favorece raíces. pH neutro-ácido. Fácil mantenimiento, no se degrada.' },
  { id:'tezontle',     cat:'Poroso',    name:'Tezontle',              icon:'🟫', density:0.7,  color:'#c0392b', grain:'3–10 mm',    pack:0.52, note:'Roca volcánica muy porosa y liviana. Excelente soporte bacteriano. Popular en México. No altera pH.' },
  { id:'pumice',       cat:'Poroso',    name:'Pómice (Piedra Pome)',  icon:'🟫', density:0.5,  color:'#bdbdbd', grain:'2–8 mm',     pack:0.53, note:'Extremadamente liviana y porosa. Ideal para filtración biológica y fondo drenante bajo sustratos nutritivos.' },

  // Alcalinos
  { id:'aragonita',    cat:'Alcalino',  name:'Aragonita',             icon:'🟦', density:1.7,  color:'#80cbc4', grain:'0.5–2 mm',   pack:0.63, note:'Carbonato de calcio natural. Sube y estabiliza pH (7.8–8.5) y KH. Esencial para cíclidos africanos.' },
  { id:'coral',        cat:'Alcalino',  name:'Coral Triturado',       icon:'🟦', density:1.4,  color:'#ff8a65', grain:'2–8 mm',     pack:0.55, note:'Eleva pH y KH progresivamente. Ideal para peces de aguas duras (Malawi, Tanganyika).' },
  { id:'dolomita',     cat:'Alcalino',  name:'Arena de Dolomita',     icon:'🟦', density:1.8,  color:'#a5d6a7', grain:'0.1–0.5 mm', pack:0.65, note:'Carbonato de calcio y magnesio. Estabiliza pH alcalino. Usada en acuarios de agua dura y salobre.' },
  { id:'conchilla',    cat:'Alcalino',  name:'Conchilla Molida',      icon:'🟦', density:1.3,  color:'#f0e68c', grain:'0.5–3 mm',   pack:0.60, note:'Conchas molidas de moluscos. Eleva pH y GH gradualmente. Económica y natural.' },
  { id:'marmol',       cat:'Alcalino',  name:'Mármol Triturado',      icon:'🟦', density:2.0,  color:'#e0e0e0', grain:'3–10 mm',    pack:0.55, note:'Calcita pura. Eleva pH y KH lentamente. Útil en mezclas para acuarios de agua dura.' },
];
const SUBSTRATE_CATS = ['Inerte', 'Nutritivo', 'Poroso', 'Alcalino'];

let substrateType = 'grano_oro';
let granulometry  = 'fine';

function selectSubstrate(btn, id) {
  substrateType = id;
  const sub = SUBSTRATES.find(s => s.id === id);
  document.querySelectorAll('.substrate-btn').forEach(b => {
    b.classList.remove('active');
    b.style.removeProperty('--sb');
  });
  btn.classList.add('active');
  btn.style.setProperty('--sb', sub.color);
  const noteEl = document.getElementById('substrate-note');
  if (noteEl) { noteEl.textContent = sub.note; }
}

function selectGran(btn, g) {
  granulometry = g;
  document.querySelectorAll('.gran-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleTool(id) {
  const body    = document.getElementById('body-' + id);
  const chevron = document.getElementById('chevron-' + id);
  const card    = body.closest('.tool-card');
  const wrap    = card ? card.closest('.tools-section-wrap') : null;
  const willOpen = body.classList.contains('hidden');

  // Cerrar todas las tarjetas abiertas en la página
  if (willOpen) {
    document.querySelectorAll('.tool-card').forEach(c => {
      const b = c.querySelector('.tool-body');
      const ch = c.querySelector('[id^="chevron-"]');
      if (b && !b.classList.contains('hidden')) {
        b.classList.add('hidden');
        c.classList.remove('open');
        if (ch) ch.textContent = '▾';
      }
    });
  }

  const isHidden = body.classList.toggle('hidden');
  chevron.textContent = isHidden ? '▾' : '▴';
  if (card) card.classList.toggle('open', !isHidden);
  if (!isHidden && id === 'substrate') renderSubstrateSelector();
}

function renderSubstrateSelector() {
  const el = document.getElementById('substrate-selector');
  if (!el) return;
  const catIcons = { Inerte: '⬜', Nutritivo: '🟩', Poroso: '🟫', Alcalino: '🟦' };
  const catDescs = {
    Inerte:    'No alteran pH ni dureza. Seguros para cualquier especie.',
    Nutritivo: 'Liberan nutrientes para plantas. Pueden acidificar el agua.',
    Poroso:    'Alta colonización bacteriana. Ideal para filtración biológica.',
    Alcalino:  'Elevan pH y KH. Para peces de aguas duras.'
  };
  let html = '';
  SUBSTRATE_CATS.forEach(function(cat) {
    const isOpen = cat === selectedCat;
    html += '<div class="sub-cat-box' + (isOpen ? ' open' : '') + '" onclick="toggleSubCat(\'' + cat + '\')">'
      + '<div class="sub-cat-header">'
      + '<span class="sub-cat-icon">' + catIcons[cat] + '</span>'
      + '<div class="sub-cat-info"><div class="sub-cat-name">' + cat + 's</div>'
      + '<div class="sub-cat-desc">' + catDescs[cat] + '</div></div>'
      + '<span class="sub-cat-chevron">' + (isOpen ? '▴' : '▾') + '</span>'
      + '</div>';
    if (isOpen) {
      html += '<div class="sub-cat-grid">';
      SUBSTRATES.filter(function(s) { return s.cat === cat; }).forEach(function(s) {
        const active = s.id === substrateType;
        html += '<button class="substrate-btn' + (active ? ' active' : '') + '"'
          + (active ? ' style="--sb:' + s.color + ';border-color:' + s.color + ';background:' + s.color + '18"' : '')
          + ' onclick="event.stopPropagation();pickSubstrate(\'' + s.id + '\')">'
          + '<span class="substrate-icon">' + s.icon + '</span>'
          + '<span class="substrate-name">' + s.name + '</span>'
          + '<span class="substrate-density">' + s.density + ' kg/L · ' + s.grain + '</span>'
          + '</button>';
      });
      html += '</div>';
      const cur = SUBSTRATES.find(function(s){ return s.id === substrateType && s.cat === cat; });
      if (cur) html += '<div class="substrate-note"><strong>Granulometría estándar: ' + cur.grain + '</strong><br><span style="color:var(--text-2)">' + cur.note + '</span></div>';
    }
    html += '</div>';
  });
  el.innerHTML = html;
}

let selectedCat = 'Inerte';

function toggleSubCat(cat) {
  selectedCat = (selectedCat === cat) ? '' : cat;
  renderSubstrateSelector();
}

function pickSubstrate(id) {
  substrateType = id;
  const cat = (SUBSTRATES.find(function(s){ return s.id === id; }) || {}).cat || 'Inerte';
  selectedCat = cat;
  renderSubstrateSelector();
}


function buildSubstrateSelector() {
  const catIcons = { Inerte: '⬜', Nutritivo: '🟩', Poroso: '🟫', Alcalino: '🟦' };
  return SUBSTRATE_CATS.map(function(cat) {
    const buttons = SUBSTRATES.filter(function(s) { return s.cat === cat; }).map(function(s) {
      const isActive = s.id === substrateType;
      const styleAttr = isActive ? ' style="--sb:' + s.color + ';border-color:' + s.color + '"' : '';
      return '<button class="substrate-btn' + (isActive ? ' active' : '') + '"'
        + ' onclick="selectSubstrate(this,\'' + s.id + '\')"'
        + styleAttr + '>'
        + '<span class="substrate-icon">' + s.icon + '</span>'
        + '<span class="substrate-name">' + s.name + '</span>'
        + '<span class="substrate-density">' + s.density + ' kg/L</span>'
        + '</button>';
    }).join('');
    const firstOfCat = SUBSTRATES.find(function(s) { return s.id === substrateType && s.cat === cat; });
    return '<div class="substrate-cat-label">' + catIcons[cat] + ' ' + cat + 's</div>'
      + '<div class="substrate-grid">' + buttons + '</div>';
  }).join('')
  + '<div id="substrate-note" class="substrate-note">'
  + (SUBSTRATES.find(function(s){ return s.id === substrateType; }) || SUBSTRATES[0]).note
  + '</div>';
}


function getEmoji(s) {
  return s.emoji || (s.type === 'fish' ? '🐟' : s.type === 'plant' ? '🌿' : '🐠');
}

function renderTools() {
  const firstSub = SUBSTRATES.find(s => s.id === 'grano_oro') || SUBSTRATES[0];
  document.getElementById('tab-tools').innerHTML = `
    <div class="tools-page">
      <div class="page-title">🔧 Herramientas</div>

      <!-- VIDRIO -->
      <div class="tools-section-wrap">
      <div class="tools-section-title">🧮 Calculadoras</div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('glass')" style="cursor:pointer">
          <div class="tool-card-icon">🪟</div>
          <div style="flex:1">
            <div class="tool-card-title">Calculadora de vidrio</div>
            <div class="tool-card-sub">Grosor por material y tipo de construcción</div>
          </div>
          <span id="chevron-glass" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-glass" class="tool-body hidden">
          <div class="input-label" style="margin-bottom:8px">Tipo de construcción</div>
          <div class="type-selector">
            <button class="type-btn active" onclick="selectGlassType(this,'framed')"><span class="type-btn-icon">🖼️</span>Con marco</button>
            <button class="type-btn" onclick="selectGlassType(this,'rimless')"><span class="type-btn-icon">🔲</span>Sin marco</button>
          </div>
          <div class="input-label" style="margin-bottom:8px;margin-top:14px">Nivel de seguridad</div>
          <div class="type-selector">
            <button class="type-btn safety-btn active" onclick="selectSafety(this,'standard')"><span class="type-btn-icon">🛡️</span>Estándar</button>
            <button class="type-btn safety-btn" onclick="selectSafety(this,'extra')"><span class="type-btn-icon">🔒</span>Seguridad extra</button>
          </div>
          <div class="dim-grid">
            <div class="input-group"><label class="input-label">Largo</label><div class="input-unit"><input class="input-field" type="number" id="glass-length" placeholder="120" min="10" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Ancho</label><div class="input-unit"><input class="input-field" type="number" id="glass-width" placeholder="45" min="10" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Alto</label><div class="input-unit"><input class="input-field" type="number" id="glass-height" placeholder="50" min="10" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Altura de agua</label><div class="input-unit"><input class="input-field" type="number" id="glass-water" placeholder="45" min="5" /><span class="input-unit-label">cm</span></div></div>
          </div>
          <div class="tool-hint">💡 La altura de agua suele ser 2–4 cm menos que el alto del acuario para evitar derrames.</div>
          <button class="calc-btn" id="btn-calc-glass" onclick="calculateGlass()">Calcular grosor</button>
          <div class="glass-result" id="glass-result"></div>
        </div>
      </div>

      <!-- SUSTRATO -->
      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('substrate')" style="cursor:pointer">
          <div class="tool-card-icon">🪨</div>
          <div style="flex:1">
            <div class="tool-card-title">Calculadora de sustrato</div>
            <div class="tool-card-sub">Kilos y volumen por tipo de sustrato</div>
          </div>
          <span id="chevron-substrate" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-substrate" class="tool-body hidden">
          <div id="substrate-selector"></div>
          <div class="dim-grid">
            <div class="input-group"><label class="input-label">Largo</label><div class="input-unit"><input class="input-field" type="number" id="sub-length" placeholder="120" min="10" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Ancho</label><div class="input-unit"><input class="input-field" type="number" id="sub-width" placeholder="45" min="10" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Profundidad</label><div class="input-unit"><input class="input-field" type="number" id="sub-depth" placeholder="6" min="1" /><span class="input-unit-label">cm</span></div></div>
            <div class="input-group"><label class="input-label">Pendiente extra</label><div class="input-unit"><input class="input-field" type="number" id="sub-slope" placeholder="0" min="0" /><span class="input-unit-label">cm</span></div></div>
          </div>
          <div class="tool-hint">💡 La pendiente eleva el sustrato al fondo trasero para efecto de profundidad.</div>
          <button class="calc-btn" id="btn-calc-substrate" onclick="calculateSubstrate()">Calcular sustrato</button>
          <div class="glass-result" id="substrate-result"></div>
        </div>
      </div>

      </div>
      <div class="tools-section-wrap">
      <div class="tools-section-title">📖 Guías</div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('guide-start')" style="cursor:pointer">
          <div class="tool-card-icon">📋</div>
          <div style="flex:1">
            <div class="tool-card-title">Primeros pasos</div>
            <div class="tool-card-sub">Qué hacer antes de meter peces</div>
          </div>
          <span id="chevron-guide-start" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-guide-start" class="tool-body hidden">
          <p class="guide-intro">Montar un acuario correctamente desde el inicio evita la mayoría de problemas. Sigue este orden.</p>
          <div class="guide-step"><span class="guide-step-n">1</span><div><strong>Elige el acuario adecuado</strong><br>Más grande es más estable. Un acuario de 60–100 L es ideal para empezar — perdona más errores que uno pequeño. Asegúrate de que la ubicación soporte el peso (1 L = 1 kg).</div></div>
          <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Equipo mínimo</strong><br>Filtro (caudal 5–10× el volumen/hora), calentador con termostato, termómetro, iluminación y sustrato. El test de agua (amoníaco, nitritos, nitratos, pH) es imprescindible.</div></div>
          <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Acondiciona el agua</strong><br>Usa siempre acondicionador de agua para eliminar cloro y cloraminasantes de llenar. Nunca uses agua directo del grifo sin tratar.</div></div>
          <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Cicla antes de agregar peces</strong><br>Deja correr el filtro al menos 4–8 semanas antes del primer pez. Ver guía de Ciclado.</div></div>
          <div class="guide-step"><span class="guide-step-n">5</span><div><strong>Agrega peces gradualmente</strong><br>Empieza con pocas especies resistentes. Espera 2 semanas entre adiciones para que el filtro se adapte a la carga biológica.</div></div>
          <div class="guide-step"><span class="guide-step-n">6</span><div><strong>Aclimata los peces nuevos</strong><br>Flota la bolsa 15 min para igualar temperatura. Luego agrega agua de tu acuario poco a poco durante 20–30 min antes de liberar el pez.</div></div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('guide-cycle')" style="cursor:pointer">
          <div class="tool-card-icon">🔄</div>
          <div style="flex:1">
            <div class="tool-card-title">Ciclado del acuario</div>
            <div class="tool-card-sub">Cómo establecer el ciclo del nitrógeno</div>
          </div>
          <span id="chevron-guide-cycle" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-guide-cycle" class="tool-body hidden">
          <p class="guide-intro">Antes de agregar peces, el acuario debe tener bacterias beneficiosas que procesen los desechos. Este proceso se llama <strong>ciclado</strong> y tarda entre 4 y 8 semanas.</p>
          <div class="guide-step"><span class="guide-step-n">1</span><div><strong>El ciclo del nitrógeno</strong><br>Los peces producen amoníaco (NH₃) como desecho. Las bacterias lo convierten primero en nitritos (NO₂⁻) y luego en nitratos (NO₃⁻), que son mucho menos tóxicos.</div></div>
          <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Cómo iniciarlo</strong><br>Agrega una fuente de amoníaco: unas gotas de amoníaco puro sin perfume, comida en descomposición o bacterias comerciales (Tetra SafeStart, Seachem Stability). Enciende el filtro y calentador.</div></div>
          <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Qué medir y cuándo</strong><br>Mide amoníaco, nitritos y nitratos cada 2–3 días. Primero sube el amoníaco → luego los nitritos → finalmente aparecen nitratos. Cuando amoníaco y nitritos llegan a 0 en 24h, el ciclo está completo.</div></div>
          <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Acelerar el proceso</strong><br>Usa material de filtro de un acuario ya establecido, bacterias en botella, o plantas vivas. Mantén temperatura entre 25–27 °C y no limpies el filtro durante este proceso.</div></div>
          <div class="guide-warn">⚠️ Nunca agregues peces a un acuario sin ciclar — el amoníaco y los nitritos son letales incluso en concentraciones bajas.</div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('guide-params')" style="cursor:pointer">
          <div class="tool-card-icon">💧</div>
          <div style="flex:1">
            <div class="tool-card-title">Cómo leer parámetros</div>
            <div class="tool-card-sub">pH, GH, KH y nitratos explicados</div>
          </div>
          <span id="chevron-guide-params" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-guide-params" class="tool-body hidden">
          <p class="guide-intro">Los parámetros del agua determinan si tus peces estarán sanos o estresados. Estos son los más importantes.</p>
          <div class="guide-param-block">
            <div class="guide-param-title">🔵 pH — Acidez del agua</div>
            <div class="guide-param-desc">Escala de 0 a 14. 7 es neutro, menos es ácido, más es alcalino. La mayoría de peces de acuario prefieren 6.5–7.5. <strong>Lo más importante es la estabilidad</strong> — un pH estable en 7.2 es mejor que uno que oscila entre 6.8 y 7.6.</div>
          </div>
          <div class="guide-param-block">
            <div class="guide-param-title">🟡 GH — Dureza general</div>
            <div class="guide-param-desc">Mide la cantidad de minerales disueltos (calcio y magnesio). GH bajo = agua blanda (ideal para tetras, discos, camarones). GH alto = agua dura (ideal para cíclidos africanos, livebearers). Se mide en °dH o ppm.</div>
          </div>
          <div class="guide-param-block">
            <div class="guide-param-title">🟠 KH — Dureza de carbonatos</div>
            <div class="guide-param-desc">Mide la capacidad del agua para resistir cambios de pH (alcalinidad). KH bajo = pH inestable y propenso a caídas bruscas. Mantener KH entre 3–8 °dH protege la estabilidad del pH.</div>
          </div>
          <div class="guide-param-block">
            <div class="guide-param-title">🔴 Nitratos (NO₃⁻)</div>
            <div class="guide-param-desc">Producto final del ciclo del nitrógeno. Menos tóxico que amoníaco o nitritos, pero acumulados dañan a largo plazo. Mantener bajo 20–40 ppm con cambios de agua regulares. Algunas especies sensibles (discos, camarones) requieren menos de 10 ppm.</div>
          </div>
          <div class="guide-param-block">
            <div class="guide-param-title">☠️ Amoníaco y Nitritos</div>
            <div class="guide-param-desc">Deben estar siempre en 0. Cualquier lectura positiva indica un problema: acuario sin ciclar, sobrepoblación, pez muerto o exceso de comida. Actúa de inmediato con cambios de agua parciales.</div>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('guide-quarantine')" style="cursor:pointer">
          <div class="tool-card-icon">🏥</div>
          <div style="flex:1">
            <div class="tool-card-title">Cuarentena</div>
            <div class="tool-card-sub">Por qué y cómo aislar peces nuevos</div>
          </div>
          <span id="chevron-guide-quarantine" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-guide-quarantine" class="tool-body hidden">
          <p class="guide-intro">Introducir un pez nuevo directamente al acuario principal es uno de los errores más comunes — puede contagiar enfermedades a todos tus peces.</p>
          <div class="guide-step"><span class="guide-step-n">1</span><div><strong>¿Qué es la cuarentena?</strong><br>Mantener el pez nuevo en un acuario separado durante 2–4 semanas para observar si tiene enfermedades antes de introducirlo con los demás.</div></div>
          <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Equipo mínimo</strong><br>Un recipiente de 20–40 L, filtro con esponja (fácil de limpiar), calentador y tapa. No necesita sustrato ni decoración elaborada.</div></div>
          <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Qué observar</strong><br>Manchas blancas (Ich), aletas rotas, comportamiento errático, falta de apetito, respiración acelerada en la superficie o encorvamiento del cuerpo.</div></div>
          <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Si el pez está sano</strong><br>Después de 4 semanas sin síntomas, puedes introducirlo al acuario principal. Aclimátalo gradualmente al agua del acuario destino.</div></div>
          <div class="guide-warn">⚠️ Nunca compartas redes, sifones ni herramientas entre el acuario de cuarentena y el principal sin desinfectarlas.</div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card-header" onclick="toggleTool('guide-compat')" style="cursor:pointer">
          <div class="tool-card-icon">🤝</div>
          <div style="flex:1">
            <div class="tool-card-title">Compatibilidad</div>
            <div class="tool-card-sub">Cómo elegir buenos compañeros de pecera</div>
          </div>
          <span id="chevron-guide-compat" style="color:var(--accent);font-size:18px">▾</span>
        </div>
        <div id="body-guide-compat" class="tool-body hidden">
          <p class="guide-intro">No todos los peces conviven bien. Estos son los factores clave para armar una comunidad exitosa.</p>
          <div class="guide-step"><span class="guide-step-n">1</span><div><strong>Parámetros similares</strong><br>Agrupa especies que requieran pH, temperatura y dureza parecidos. Mezclar un pez de agua blanda y ácida con uno de agua dura y alcalina resultará en estrés crónico para alguno.</div></div>
          <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Temperamento</strong><br>Evita mezclar especies agresivas con pacíficas. Un cíclido territorial puede acosar a tetras tranquilos. Verifica el temperamento de cada especie en sus fichas.</div></div>
          <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Tamaño</strong><br>Regla general: si cabe en la boca, es comida. No mezcles peces muy grandes con muy pequeños aunque sean "pacíficos".</div></div>
          <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Zonas del acuario</strong><br>Distribuye especies por nivel: peces de superficie, zona media y fondo. Así aprovechas todo el espacio y reduces conflictos territoriales.</div></div>
          <div class="guide-step"><span class="guide-step-n">5</span><div><strong>Usa Mi Pecera</strong><br>La sección Mi Pecera de esta app verifica compatibilidades automáticamente entre las especies que agregues.</div></div>
        </div>
      </div>

      </div>
    </div>`;
}

// Glass state
let glassType   = 'framed';
let safetyLevel = 'standard';

function selectGlassType(btn, type) {
  glassType = type;
  document.querySelectorAll('.type-btn:not(.safety-btn)').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function selectSafety(btn, level) {
  safetyLevel = level;
  document.querySelectorAll('.safety-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function calculateGlass() {
  const L  = parseFloat(document.getElementById('glass-length').value);
  const W  = parseFloat(document.getElementById('glass-width').value);
  const H  = parseFloat(document.getElementById('glass-height').value);
  const Hw = parseFloat(document.getElementById('glass-water').value);
  const result = document.getElementById('glass-result');

  // Validate
  if (!L || !W || !H || !Hw || L<10 || W<10 || H<10 || Hw<5) {
    result.className = 'glass-result visible';
    result.innerHTML = '<div class="result-warn-row warn"><span class="result-warn-icon">⚠️</span>Ingresá largo, ancho y alto mínimo 10 cm · altura de agua mínimo 5 cm.</div>';
    return;
  }
  if (Hw > H) {
    result.className = 'glass-result visible';
    result.innerHTML = `<div class="result-warn-row danger"><span class="result-warn-icon">❌</span>La altura de agua no puede superar el alto del acuario.</div>`;
    return;
  }

  // ── GLASS THICKNESS — LOOKUP TABLE ──────────
  // Based on standard aquarium glass thickness tables (Glasscages / industry).
  // Driving factors: longest unsupported span + water height.
  // Rimless: one commercial step up (no frame bracing = +1 step safety margin).
  //
  //                span ≤60  61-90  91-120  121-150  151-180  181+
  // water ≤ 30cm:   4mm   5mm    6mm     8mm     10mm    12mm
  // water 31-45cm:  5mm   6mm    8mm    10mm     12mm    15mm
  // water 46-60cm:  6mm   8mm   10mm    12mm     15mm    19mm
  // water 61-75cm:  8mm  10mm   12mm    15mm     19mm    25mm
  // water 76-90cm: 10mm  12mm   15mm    19mm     25mm    25mm
  // water 91+cm:   12mm  15mm   19mm    25mm     25mm    25mm

  const span = Math.max(L, W);

  const spanIdx = span <= 60 ? 0 : span <= 90 ? 1 : span <= 120 ? 2
                : span <= 150 ? 3 : span <= 180 ? 4 : 5;
  const hwIdx   = Hw <= 30 ? 0 : Hw <= 45 ? 1 : Hw <= 60 ? 2
                : Hw <= 75 ? 3 : Hw <= 90 ? 4 : 5;

  const TABLE = [
    [  4,  5,  6,  8, 10, 12 ],
    [  5,  6,  8, 10, 12, 15 ],
    [  6,  8, 10, 12, 15, 19 ],
    [  8, 10, 12, 15, 19, 25 ],
    [ 10, 12, 15, 19, 25, 25 ],
    [ 12, 15, 19, 25, 25, 25 ],
  ];

  const STANDARD = [4, 5, 6, 8, 10, 12, 15, 19, 25];
  const framedThickness = TABLE[hwIdx][spanIdx];
  const thickness_raw   = framedThickness;

  // Rimless: step up one commercial size
  const baseThickness = glassType === 'rimless'
    ? (STANDARD.find(t => t > framedThickness) || 25)
    : framedThickness;

  // Safety extra: always one step up from base
  const thickness = safetyLevel === 'extra'
    ? (STANDARD.find(t => t > baseThickness) || baseThickness)
    : baseThickness;

  // Liters
  const liters = Math.round(L * W * H / 1000);
  const litersWater = Math.round(L * W * Hw / 1000);

  // Water weight
  const weightKg = Math.round(litersWater * 1.025); // saltwater density approx

  // Pressure at base
  const pressureBase = (Hw * 9.81 * 1.025 / 100).toFixed(2); // kPa

  // Warnings
  const warnings = [];
  if (glassType === 'rimless') {
    warnings.push({ type: 'info', icon: '🔲', text: '<strong>Rimless:</strong> El grosor calculado incluye un factor de seguridad adicional del 25% por la ausencia de marco reforzador. Se recomienda usar bracing horizontal si el largo supera 90 cm.' });
  } else {
    warnings.push({ type: 'info', icon: '🖼️', text: '<strong>Con marco:</strong> El marco perimetral actúa como refuerzo estructural. El cálculo aplica el factor estándar de vidrio flotado.' });
  }
  if (span > 90) {
    warnings.push({ type: 'warn', icon: '⚠️', text: `Span de ${span} cm: considera agregar una <strong>tira central de vidrio (bracing)</strong> pegada en la parte superior para evitar pandeo.` });
  }
  if (Hw > 50) {
    warnings.push({ type: 'warn', icon: '⚠️', text: 'Altura de agua mayor a 50 cm: la presión hidrostática es significativa. Verificar el grosor con un vidriero especializado antes de construir.' });
  }
  if (thickness >= 15) {
    warnings.push({ type: 'danger', icon: '🔴', text: 'Grosor ≥ 15 mm: acuario de gran porte. <strong>Consultar con un profesional</strong> y pedir certificación del vidrio antes de llenarlo.' });
  }
  warnings.push({ type: 'info', icon: '💡', text: 'Este cálculo es orientativo. Las variables de calidad del vidrio, tipo de silicona y construcción pueden afectar el resultado. Siempre consulta con un vidriero.' });

  // ── GLASS VARIANTS ───────────────────────────
  // Normal (float): base thickness from table
  // Tempered: 30% thinner allowed (3-4x stronger) but cannot be cut after
  // Laminated (PVB): same thickness as normal but holds shards if broken — safer for livestock
  // Acrylic: 50% thinner allowed (lighter, no shattering) but scratches easily

  // Tempered: can go ~1 step down (stronger material, same span)
  const temperedThickness = STANDARD.slice().reverse().find(t => t < thickness) || thickness;

  // Laminated: same as normal (same rigidity, bonus = holds if broken)
  const laminatedThickness = thickness;

  // Acrylic: roughly 50% of normal, rounded to nearest practical size
  const acrylicRaw = thickness * 0.55;
  const acrylicThickness = STANDARD.find(t => t >= acrylicRaw) || thickness;

  const variants = [
    {
      key: 'normal',
      icon: '🪟',
      name: 'Vidrio flotado',
      subtitle: 'Estándar · más común',
      thickness: thickness,
      color: 'var(--accent)',
      pros: ['Económico', 'Fácil de cortar y conseguir', 'Estándar en la industria'],
      cons: ['Se quiebra en esquirlas', 'Menor resistencia a impactos'],
      note: null,
    },
    {
      key: 'tempered',
      icon: '💎',
      name: 'Vidrio templado',
      subtitle: 'Tratado térmicamente · 4× más resistente',
      thickness: temperedThickness,
      color: 'var(--accent2)',
      pros: ['Alta resistencia a impactos', 'Se desintegra en gránulos pequeños (más seguro)', 'Permite menor grosor'],
      cons: ['No se puede cortar después del templado', 'Mayor costo', 'Tiempo de fabricación'],
      note: temperedThickness < thickness ? `Permite reducir a ${temperedThickness}mm por su mayor resistencia` : null,
    },
    {
      key: 'laminated',
      icon: '🛡️',
      name: 'Vidrio laminado',
      subtitle: 'Dos láminas + PVB · máxima seguridad',
      thickness: laminatedThickness,
      color: '#c084fc',
      pros: ['Retiene los fragmentos al romperse (protege fauna)', 'Alta resistencia a impactos', 'Aislamiento acústico'],
      cons: ['Mayor costo que flotado', 'Algo más pesado', 'Menor disponibilidad en formatos acuarísticos'],
      note: 'Recomendado para acuarios con niños, mascotas o fauna valiosa',
    },
    {
      key: 'acrylic',
      icon: '🔷',
      name: 'Acrílico (PMMA)',
      subtitle: 'Plástico óptico · ligero y flexible',
      thickness: acrylicThickness,
      color: 'var(--warn)',
      pros: ['Liviano (50% menos que vidrio)', 'No se quiebra en esquirlas', 'Excelente claridad óptica', 'Mejor aislación térmica'],
      cons: ['Se raya con facilidad', 'Se amarillea con UV a largo plazo', 'Más difícil de sellar con silicona', 'Mayor costo por m²'],
      note: acrylicThickness < thickness ? `Permite reducir a ${acrylicThickness}mm por su flexibilidad controlada` : null,
    },
  ];

  result.className = 'glass-result visible';
  result.innerHTML = `
    <div class="result-hero">
      <div class="result-type-label">${glassType === 'rimless' ? '🔲 Sin marco / Rimless' : '🖼️ Con marco (Framed)'}</div>
      <div class="result-thickness">${thickness}<span> mm</span></div>
      <div class="result-note">${safetyLevel === 'extra' ? '🔒 Seguridad extra aplicada' : '🛡️ Seguridad estándar'} · ${glassType === 'rimless' ? 'Sin marco' : 'Con marco'}</div>
    </div>

    <div class="result-panels">
      <div class="result-panel">
        <div class="result-panel-label">Dimensiones</div>
        <div class="result-panel-val">${L}×${W}×${H} cm</div>
        <div class="result-panel-sub">Largo × Ancho × Alto</div>
      </div>
      <div class="result-panel">
        <div class="result-panel-label">Span máximo</div>
        <div class="result-panel-val">${span} cm</div>
        <div class="result-panel-sub">Panel más largo sin soporte</div>
      </div>
      <div class="result-panel">
        <div class="result-panel-label">Volumen total</div>
        <div class="result-panel-val">${liters} L</div>
        <div class="result-panel-sub">${litersWater} L con agua</div>
      </div>
      <div class="result-panel">
        <div class="result-panel-label">Peso del agua</div>
        <div class="result-panel-val">~${weightKg} kg</div>
        <div class="result-panel-sub">Presión base: ${pressureBase} kPa</div>
      </div>
    </div>

    <!-- VARIANTS -->
    <div class="variants-title">🪟 Comparativa de materiales</div>
    <div class="variants-list">
      ${variants.map(v => `
        <div class="variant-card" style="--vc:${v.color}">
          <div class="variant-header">
            <span class="variant-icon">${v.icon}</span>
            <div class="variant-info">
              <div class="variant-name">${v.name}</div>
              <div class="variant-subtitle">${v.subtitle}</div>
            </div>
            <div class="variant-thickness-badge">${v.thickness}<span>mm</span></div>
          </div>
          ${v.note ? `<div class="variant-note">${v.note}</div>` : ''}
          <div class="variant-pros-cons">
            <div class="variant-col">
              ${v.pros.map(p => `<div class="variant-pro">✓ ${p}</div>`).join('')}
            </div>
            <div class="variant-col">
              ${v.cons.map(c => `<div class="variant-con">✗ ${c}</div>`).join('')}
            </div>
          </div>
        </div>`).join('')}
    </div>

    <div class="result-warnings">
      ${warnings.map(w => `
        <div class="result-warn-row ${w.type}">
          <span class="result-warn-icon">${w.icon}</span>
          <span>${w.text}</span>
        </div>`).join('')}
    </div>

`;

}

// ── SUBSTRATE CALCULATOR ────────────────────────
function _calculateSubstrate() {
  const elL    = document.getElementById('sub-length');
  const elW    = document.getElementById('sub-width');
  const elD    = document.getElementById('sub-depth');
  const elS    = document.getElementById('sub-slope');
  const result = document.getElementById('substrate-result');

  if (!result) { alert('result div no encontrado'); return; }

  const L     = elL ? parseFloat(elL.value) : NaN;
  const W     = elW ? parseFloat(elW.value) : NaN;
  const D     = elD ? parseFloat(elD.value) : NaN;
  const slope = (elS && elS.value) ? parseFloat(elS.value) : 0;

  result.className = 'glass-result visible';

  if (isNaN(L) || isNaN(W) || isNaN(D) || L < 10 || W < 10 || D < 1) {
    result.innerHTML = '<div class="result-warn-row warn"><span class="result-warn-icon">⚠️</span>Ingresá largo y ancho mínimo 10 cm · profundidad mínimo 1 cm.</div>';
    return;
  }

  const sub = SUBSTRATES.find(function(s){ return s.id === substrateType; }) || SUBSTRATES[0];
  const packFactor = sub.pack || 0.60;

  const baseVolume  = (L * W * D) / 1000;
  const slopeVolume = (!isNaN(slope) && slope > 0) ? (L * W * slope * 0.5) / 1000 : 0;
  const totalVolume = baseVolume + slopeVolume;

  const weightKg  = (totalVolume * sub.density * packFactor).toFixed(1);
  const bags1     = Math.ceil(parseFloat(weightKg));
  const bags5     = Math.ceil(parseFloat(weightKg) / 5);
  const bags10    = Math.ceil(parseFloat(weightKg) / 10);

  const minDepth  = sub.cat === 'Nutritivo' ? 6 : sub.cat === 'Poroso' ? 5 : 4;
  const depthWarn = D < minDepth
    ? '<div class="result-warn-row warn"><span class="result-warn-icon">⚠️</span>Para ' + sub.name + ' se recomiendan mínimo <strong>' + minDepth + ' cm</strong>.</div>'
    : '';
  const slopeNote = (slope > 0)
    ? '<div class="result-warn-row info"><span class="result-warn-icon">📐</span>Pendiente: fondo trasero a <strong>' + (D + slope) + ' cm</strong>, frente a <strong>' + D + ' cm</strong>.</div>'
    : '';

  result.innerHTML =
    '<div class="result-hero">'
    + '<div class="result-type-label">' + sub.icon + ' ' + sub.name + '</div>'
    + '<div class="result-thickness">' + weightKg + '<span> kg</span></div>'
    + '<div style="font-size:11px;color:var(--text-3);margin-top:4px">📌 Peso estimado ±10% según humedad y compactación real.</div>'
    + '</div>'
    + '<div class="result-panels">'
    + '<div class="result-panel"><div class="result-panel-label">Volumen</div><div class="result-panel-val">' + totalVolume.toFixed(1) + ' L</div><div class="result-panel-sub">Sin compactar</div></div>'
    + '<div class="result-panel"><div class="result-panel-label">Peso</div><div class="result-panel-val">' + weightKg + ' kg</div><div class="result-panel-sub">Compactado ' + Math.round(packFactor*100) + '%</div></div>'
    + '<div class="result-panel"><div class="result-panel-label">Densidad</div><div class="result-panel-val">' + sub.density + ' kg/L</div><div class="result-panel-sub">' + sub.cat + '</div></div>'
    + '<div class="result-panel"><div class="result-panel-label">Prof. media</div><div class="result-panel-val">' + (slope > 0 ? ((D + D + slope)/2).toFixed(1) : D) + ' cm</div><div class="result-panel-sub">' + (slope > 0 ? 'Con pendiente' : 'Uniforme') + '</div></div>'
    + '</div>'
    + '<div class="variants-title">🛍️ Bolsas necesarias</div>'
    + '<div class="variants-list">'
    + '<div class="variant-card" style="--vc:var(--accent)"><div class="variant-header"><span class="variant-icon">📦</span><div class="variant-info"><div class="variant-name">Bolsas de 1 kg</div></div><div class="variant-thickness-badge">' + bags1 + '<span>u</span></div></div></div>'
    + '<div class="variant-card" style="--vc:var(--accent2)"><div class="variant-header"><span class="variant-icon">📦</span><div class="variant-info"><div class="variant-name">Bolsas de 5 kg</div></div><div class="variant-thickness-badge">' + bags5 + '<span>u</span></div></div></div>'
    + '<div class="variant-card" style="--vc:#c084fc"><div class="variant-header"><span class="variant-icon">📦</span><div class="variant-info"><div class="variant-name">Bolsas de 10 kg</div></div><div class="variant-thickness-badge">' + bags10 + '<span>u</span></div></div></div>'
    + '</div>'
    + '<div class="result-warnings">'
    + depthWarn + slopeNote
    + '</div>';
}


function calculateSubstrate() {
  try { _calculateSubstrate(); } catch(e) { alert('ERROR: ' + e.message + '\n' + e.stack); }
}


// ── IUCN HELPER ────────────────────────────────
const IUCN_MAP = {
  'EX':  { color: '#111',     label: 'Extinto',                    desc: 'No quedan individuos vivos conocidos.' },
  'EW':  { color: '#333',     label: 'Extinto en estado silvestre', desc: 'Solo sobrevive en cautiverio o cultivo.' },
  'CR':  { color: '#d32f2f',  label: 'En peligro crítico',         desc: 'Riesgo extremadamente alto de extinción.' },
  'EN':  { color: '#e64a19',  label: 'En peligro',                 desc: 'Alto riesgo de extinción en estado silvestre.' },
  'VU':  { color: '#f57c00',  label: 'Vulnerable',                 desc: 'Riesgo elevado si no se controlan las amenazas.' },
  'NT':  { color: '#fbc02d',  label: 'Casi amenazado',             desc: 'Próximo a cumplir criterios de especie amenazada.' },
  'LC':  { color: '#388e3c',  label: 'Preocupación menor',         desc: 'Población estable. Sin amenaza inmediata.' },
  'DD':  { color: '#757575',  label: 'Datos insuficientes',        desc: 'No hay información suficiente para evaluarla.' },
  'NE':  { color: '#90a4ae',  label: 'No evaluado',                desc: 'Aún no ha sido evaluada por la IUCN.' },
};

function renderIUCN(raw) {
  // Extract code from raw string (e.g. "VU (Vulnerable)", "LC", "No evaluado...")
  let code = 'NE';
  const match = raw.match(/\b(EX|EW|CR|EN|VU|NT|LC|DD|NE)\b/);
  if (match) code = match[1];
  else if (/no evaluad/i.test(raw) || /variedad de cría/i.test(raw)) code = 'NE';
  else if (/vulnerable/i.test(raw)) code = 'VU';
  else if (/preocupaci/i.test(raw)) code = 'LC';

  const info = IUCN_MAP[code] || IUCN_MAP['NE'];
  const extraNote = raw.replace(/\b(EX|EW|CR|EN|VU|NT|LC|DD|NE)\b/g, '').replace(/[().,]/g, '').trim();

  return `<div class="iucn-badge" style="--iucn-color:${info.color}">
    <span class="iucn-code">${code}</span>
    <div class="iucn-info">
      <div class="iucn-label">${info.label}</div>
      <div class="iucn-desc">${info.desc}${extraNote ? ' · ' + extraNote : ''}</div>
    </div>
  </div>`;
}


function preventOverlayScroll(e) {
  // Only block if the touch is directly on the overlay backdrop, not the modal box
  if (e.target.closest('.modal-box')) return;
  e.preventDefault();
}

function openInfoModal() {
  document.getElementById('info-modal').classList.remove('hidden');
  lockScroll();
}
function closeInfoModal() {
  document.getElementById('info-modal').classList.add('hidden');
  unlockScroll();
}

// ── EVENTS ─────────────────────────────────────
function bindEvents() {
  // Bottom nav
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Modal overlay click to close
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function toggleSortMenu() {
  const dd = document.getElementById('sort-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function bindCatalogEvents() {
  // Top filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeFilter = btn.dataset.filter;
      renderCatalog();
    });
  });

  // Sub-filter buttons (fish subcategories)
  document.querySelectorAll('.subfilter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeFilter = btn.dataset.filter;
      renderCatalog();
    });
  });

  // Sort options in dropdown
  document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeSort = btn.dataset.sort;
      renderCatalog();
    });
  });

  // Search input — only update grid, never re-render the whole page (would kill focus)
  const input = document.getElementById('cat-search-input');
  if (input) {
    input.addEventListener('input', e => {
      state.catalogSearch = e.target.value;
      updateCatalogGrid();
    });
  }
}


function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  if (tab === 'catalog') renderCatalog();
  if (tab === 'chem')    renderChem();
}


// ── SCROLL LOCK (iOS-safe) ──────────────────────
let _scrollY = 0;
function lockScroll() {
  _scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + _scrollY + 'px';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, _scrollY);
}

// ── INIT ───────────────────────────────────────
boot();

// ── BUBBLE BACKGROUND ──────────────────────────
(function () {
  const canvas = document.getElementById('bubble-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, bubbles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function randomBubble() {
    const r = 3 + Math.random() * 14;
    return {
      x: Math.random() * W,
      y: H + r + Math.random() * H,
      r,
      speed:  0.25 + Math.random() * 0.6,
      drift:  (Math.random() - 0.5) * 0.35,
      alpha:  0.12 + Math.random() * 0.22,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.012 + Math.random() * 0.018,
    };
  }

  // Spawn bubbles
  const COUNT = 38;
  for (let i = 0; i < COUNT; i++) {
    const b = randomBubble();
    b.y = Math.random() * H; // spread on init
    bubbles.push(b);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const b of bubbles) {
      // drift + wobble
      b.wobble += b.wobbleSpeed;
      b.x += b.drift + Math.sin(b.wobble) * 0.4;
      b.y -= b.speed;

      // reset when off top
      if (b.y + b.r < 0) {
        Object.assign(b, randomBubble());
      }

      // draw bubble
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100,210,255,${b.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // inner shine
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,240,255,${b.alpha * 0.6})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


// ══════════════════════════════════════════════════════
// ── MÓDULO QUÍMICA ────────────────────────────────────
// ══════════════════════════════════════════════════════

const CHEMICALS = [
  // ── ACONDICIONADORES DE AGUA ──────────────────────
  {
    id: 'anticloro', cat: 'Acondicionadores', name: 'Acondicionador / Anticloro', icon: '💧',
    brand: 'Seachem Prime, API Stress Coat, genérico',
    use: 'Neutraliza cloro y cloraminas del agua de la llave antes de añadirla al acuario. Indispensable en cada cambio de agua.',
    cases: ['Cambios parciales de agua', 'Llenado de acuario nuevo', 'Agua de la llave con cloro o cloraminas'],
    warnings: [
      'No omitir aunque el agua "huela bien" — el cloro daña branquias aunque sea imperceptible',
      'Seachem Prime también neutraliza amoniaco temporalmente; no confundir con ciclar el acuario',
      'Sobredosis moderada (2–3×) es generalmente segura, pero no exceder sin necesidad'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'estabilizador_ph', cat: 'Acondicionadores', name: 'Estabilizador de pH', icon: '⚗️',
    brand: 'Seachem Neutral Regulator, API pH Down/Up, genérico',
    use: 'Sube o baja el pH del agua hasta un valor objetivo y lo mantiene estable. Existen versiones para pH ácido (6.5–7.0) y alcalino (7.5–8.5).',
    cases: ['Agua con pH inadecuado para las especies', 'pH inestable con caídas nocturnas', 'Preparar agua para camarones Caridina'],
    warnings: [
      'Cambios bruscos de pH son más dañinos que un pH "incorrecto" estable — ajustar gradualmente',
      'No mezclar pH Up y pH Down en el mismo recipiente',
      'Los tampones (buffers) son más seguros que los ajustadores directos para uso regular',
      'Inútil si el KH es muy bajo — estabilizar KH primero'
    ],
    compat: {
      fish: true, plants: true,
      shrimp: { ok: false, reason: 'Los cambios de pH afectan el proceso de muda; los camarones son muy sensibles a variaciones' },
      snails: { ok: false, reason: 'Los caracoles necesitan pH estable; los ajustadores bruscos dañan su concha y metabolismo' }
    }
  },
  {
    id: 'estabilizador_kh', cat: 'Acondicionadores', name: 'Estabilizador de KH / Buffer', icon: '⚗️',
    brand: 'Seachem Alkaline Buffer, API KH booster, genérico',
    use: 'Eleva y estabiliza la dureza de carbonatos (KH), previniendo caídas de pH. Esencial en acuarios plantados con sustrato activo o agua muy blanda.',
    cases: ['KH menor a 3–4 dKH (riesgo de pH crash)', 'Acuarios plantados con CO₂ inyectado', 'Agua de ósmosis o lluvia sin mineralizar'],
    warnings: [
      'KH alto dificulta bajar el pH — no usar en acuarios de camarones Caridina que requieren pH 6.0–6.5',
      'Verificar KH después de cada dosis; no sobredosificar',
      'No confundir con GH (dureza general) — son parámetros distintos'
    ],
    compat: {
      fish: true, plants: true, snails: true,
      shrimp: { ok: false, reason: 'Los camarones Caridina necesitan KH muy bajo (0–2); elevar el KH impide su reproducción y puede matarlos' }
    }
  },

  // ── MEDICAMENTOS ──────────────────────────────────
  {
    id: 'azul_metileno', cat: 'Medicamentos', name: 'Azul de Metileno', icon: '🔵',
    brand: 'Genérico / API',
    use: 'Antifúngico y antiséptico de amplio espectro. Muy usado para tratar huevos infectados, hongos superficiales y como profiláctico en cuarentena.',
    cases: ['Hongos en huevos durante la incubación', 'Infecciones fúngicas superficiales leves', 'Baños profilácticos en cuarentena', 'Tratamiento de Ich en estadios iniciales'],
    warnings: [
      'Tiñe todo de azul intenso — silicón, decoración y plantas absorben el tinte permanentemente',
      'Destruye bacterias benéficas del filtro — no tratar en el acuario principal si es posible',
      'Usar guantes — tiñe piel y superficies'
    ],
    compat: {
      fish: true,
      plants: { ok: false, reason: 'Destruye la clorofila e inhibe la fotosíntesis; mata las plantas aunque sea en dosis bajas' },
      shrimp: { ok: false, reason: 'Tóxico para invertebrados; afecta su sistema respiratorio y puede matarlos rápidamente' },
      snails: { ok: false, reason: 'Tóxico para moluscos; daña sus tejidos blandos y sistema nervioso' }
    }
  },
  {
    id: 'sal_acuario', cat: 'Medicamentos', name: 'Sal de Acuario', icon: '🧂',
    brand: 'API Aquarium Salt, genérico (sal sin yodo)',
    use: 'Reduce el estrés osmótico, estimula la producción de moco protector y ayuda en recuperación de enfermedades leves. Útil como coadyuvante en tratamientos de Ich y bacteriosis.',
    cases: ['Recuperación post-enfermedad', 'Estrés por transporte', 'Tratamiento coadyuvante de Ich', 'Peces debilitados o con heridas'],
    warnings: [
      'NO usar con peces de agua muy blanda (Discus, Altum, Scalare) — sensibles a la salinidad',
      'No es sustituto de medicamentos específicos en infecciones graves',
      'Usar sal sin yodo ni anti-apelmazante'
    ],
    compat: {
      fish: true,
      plants: { ok: false, reason: 'La sal extrae agua de las células vegetales por ósmosis, deshidratando y matando las plantas' },
      shrimp: { ok: false, reason: 'Incluso dosis bajas alteran el equilibrio osmótico de los camarones, causando muerte en horas' },
      snails: { ok: false, reason: 'La sal deshidrata los tejidos blandos del caracol; concentraciones pequeñas pueden ser letales' }
    }
  },
  {
    id: 'metronidazol', cat: 'Medicamentos', name: 'Metronidazol', icon: '💊',
    brand: 'Seachem Metronidazole, API General Cure',
    use: 'Antiprotozoario y antibacteriano anaeróbico. Tratamiento de elección para enfermedades internas como Hexamita, enfermedad del hoyo en la cabeza y algunas bacteriosis intestinales.',
    cases: ['Enfermedad del hoyo en la cabeza (HLLE)', 'Hexamita / parásitos intestinales', 'Heces blancas o mucosas', 'Abdomen hinchado por parásitos internos'],
    warnings: [
      'Solo eficaz contra protozoarios y anaerobios — no sirve contra Ich ni bacterias aeróbicas',
      'Tratar vía alimento (mezclado en comida) es más efectivo que en el agua',
      'Retirar carbón activo antes del tratamiento — lo absorbe y neutraliza'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'malachite_green', cat: 'Medicamentos', name: 'Verde de Malaquita', icon: '🟢',
    brand: 'Genérico, Kordon Rid-Ich',
    use: 'Antiparasitario y antifúngico potente. Muy efectivo contra Ich (Ichthyophthirius), terciopelo (Oodinium) y hongos externos.',
    cases: ['Ich / Punto blanco', 'Terciopelo / Oodinium', 'Hongos externos severos', 'Saprolegnia en peces adultos'],
    warnings: [
      'Potencialmente carcinógeno — usar guantes y evitar contacto con piel y ojos',
      'Tóxico para peces sin escamas (Corydoras, plecos, bagres) — reducir dosis a la mitad',
      'No usar en acuarios con luz intensa — se degrada rápido y pierde eficacia',
      'Retirar carbón activo del filtro'
    ],
    compat: {
      fish: true,
      plants: { ok: false, reason: 'Inhibe la fotosíntesis y es fitotóxico; mata plantas acuáticas incluso en dosis terapéuticas' },
      shrimp: { ok: false, reason: 'Letal para todos los invertebrados; afecta sus enzimas respiratorias de forma irreversible' },
      snails: { ok: false, reason: 'Tóxico para moluscos; penetra sus tejidos blandos y causa muerte rápida' }
    }
  },
  {
    id: 'formalina', cat: 'Medicamentos', name: 'Formalina', icon: '⚠️',
    brand: 'Genérico (solución 37–40% formaldehído)',
    use: 'Antiparasitario de uso externo muy potente. Elimina ectoparásitos como monogeneos, tricodina, costia y branquiomicosis. Generalmente usado en baños cortos.',
    cases: ['Parásitos branquiales (monogeneos, tricodina)', 'Costia / Ichthyobodo', 'Branquiomicosis', 'Infestaciones externas severas resistentes a otros tratamientos'],
    warnings: [
      '⚠️ TÓXICO — usar solo con ventilación adecuada, guantes y protección ocular',
      'Dosis incorrecta puede matar peces rápidamente — pesar y calcular con precisión',
      'No usar en agua con temperatura mayor a 27°C — aumenta toxicidad',
      'Reduce el oxígeno disuelto — airear intensamente durante el tratamiento',
      'Solo para usuarios con experiencia — considerar alternativas más seguras primero'
    ],
    compat: {
      fish: true,
      plants: { ok: false, reason: 'El formaldehído es un fijador celular; destruye los tejidos vegetales de inmediato' },
      shrimp: { ok: false, reason: 'Extremadamente tóxico para crustáceos; concentraciones mínimas causan muerte instantánea' },
      snails: { ok: false, reason: 'Letal para moluscos; el formaldehído desnaturaliza sus proteínas celulares' }
    }
  },
  {
    id: 'kanamicina', cat: 'Medicamentos', name: 'Kanamicina / Antibióticos', icon: '💊',
    brand: 'Seachem KanaPlex, API Furan-2, Thomas Labs',
    use: 'Antibióticos de amplio espectro para infecciones bacterianas graves. Tratamiento de bacteriosis externas e internas, úlceras, podredumbre de aletas severa y dropsy.',
    cases: ['Dropsy / hidropesía (escamas erizadas)', 'Úlceras o llagas profundas', 'Podredumbre de aletas severa con tejido necrótico', 'Infección bacteriana interna confirmada'],
    warnings: [
      'Usar solo cuando sea necesario — el uso excesivo genera resistencia bacteriana',
      'Destruye completamente las bacterias del filtro biológico — monitorear amoniaco',
      'Completar el ciclo completo aunque el pez mejore antes',
      'Retirar carbón activo del filtro durante el tratamiento'
    ],
    compat: {
      fish: true, plants: true,
      shrimp: { ok: false, reason: 'Los antibióticos alteran la microbiota intestinal de los camarones y pueden ser tóxicos directamente' },
      snails: { ok: false, reason: 'Algunos antibióticos dañan el sistema digestivo de los moluscos y su microbioma' }
    }
  },

  // ── FERTILIZANTES ─────────────────────────────────
  {
    id: 'fertilizante_liquido', cat: 'Fertilizantes', name: 'Fertilizante Líquido (macro y micro)', icon: '🌿',
    brand: 'Seachem Flourish, API Leaf Zone, Tropica Premium',
    use: 'Aporta micronutrientes (hierro, manganeso, zinc, boro) y/o macronutrientes (NPK) directamente a la columna de agua. Esencial en planted tanks con sustrato inerte.',
    cases: ['Plantas con hojas amarillas (deficiencia de hierro)', 'Crecimiento lento o detenido', 'Planted tank con sustrato inerte', 'Suplemento a sustrato nutritivo maduro'],
    warnings: [
      'El exceso de nutrientes favorece el crecimiento de algas — dosificar con criterio',
      'Seachem Flourish Comprehensive no contiene nitrógeno ni fósforo — agregar por separado si necesario',
      'Verificar deficiencias específicas antes de elegir el fertilizante'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'pastillas_raiz', cat: 'Fertilizantes', name: 'Pastillas Fertilizantes de Raíz', icon: '🌱',
    brand: 'Seachem Flourish Tabs, API Root Tabs, Tropica',
    use: 'Fertilizante sólido que se entierra en el sustrato cerca de las raíces. Libera nutrientes de forma lenta y localizada. Ideal para plantas de raíz en sustratos inertes.',
    cases: ['Espadas amazónicas, Criptocorynes y otras plantas de raíz', 'Sustrato inerte sin capacidad nutritiva', 'Plantas con crecimiento deficiente a pesar de fertilización líquida'],
    warnings: [
      'Enterrar profundo para evitar que los nutrientes pasen directamente al agua y causen algas',
      'Renovar cada 3–6 meses según el fabricante',
      'Las plantas flotantes o de columna no se benefician de este tipo de fertilizante'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'hierro', cat: 'Fertilizantes', name: 'Hierro Quelado (Fe)', icon: '🟤',
    brand: 'Seachem Flourish Iron, Estimula Fe, genérico',
    use: 'Suplemento específico de hierro en forma quelada (Fe-EDTA o Fe-DTPA). Corrige deficiencias de hierro visibles como clorosis (hojas nuevas amarillas con venas verdes).',
    cases: ['Hojas nuevas amarillas con venas visiblemente verdes (clorosis férrica)', 'Plantas rojas que pierden coloración', 'Planted tanks de alta demanda con CO₂'],
    warnings: [
      'El hierro no quelado precipita rápidamente y es inútil',
      'Exceso de hierro puede favorecer proliferación de algas — no sobredosificar',
      'La deficiencia de hierro a veces indica pH demasiado alto que impide la absorción'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'co2_liquido', cat: 'Fertilizantes', name: 'CO₂ Líquido (Glutaraldehído)', icon: '🌫️',
    brand: 'Seachem Excel, Tropica Easy Carbo, Colombo Ferts',
    use: 'Fuente de carbono líquida como alternativa o suplemento al CO₂ gaseoso. También actúa como algicida suave, especialmente contra algas verdes filamentosas y algas negras.',
    cases: ['Planted tanks sin sistema de CO₂ gaseoso', 'Control de algas negras (BBA)', 'Control de algas filamentosas verdes', 'Suplemento de carbono en épocas de alta demanda'],
    warnings: [
      '⚠️ TÓXICO para Vallisneria y algunas Egeria — puede matarlas en una sola dosis estándar',
      'Es un desinfectante (glutaraldehído) — puede afectar bacterias del filtro en sobredosis',
      'Aplicar directamente sobre las algas negras con jeringa para mayor efectividad'
    ],
    compat: {
      fish: true, snails: true,
      plants: { ok: false, reason: 'El glutaraldehído es tóxico para Vallisneria y algunas Egeria incluso en dosis normales' },
      shrimp: { ok: false, reason: 'El glutaraldehído es un biocida; en dosis altas o acumuladas puede matar camarones' }
    }
  },

  // ── CONTROL DE ALGAS ──────────────────────────────
  {
    id: 'algicida', cat: 'Control de Algas', name: 'Algicida Químico', icon: '🟡',
    brand: 'API Algaefix, Tetra AlguMin, genérico',
    use: 'Elimina algas existentes y previene su proliferación. Útil como medida temporal cuando otras soluciones no han funcionado o en situaciones de emergencia.',
    cases: ['Explosión de algas verdes en el agua (agua verde)', 'Algas en superficie y vidrios difíciles de controlar', 'Control temporal mientras se corrige el desequilibrio'],
    warnings: [
      'Trata el síntoma, no la causa — sin corrección del desequilibrio las algas volverán',
      'Puede reducir el oxígeno al matar algas masivamente — airear bien',
      'No usar en sistemas con invertebrados bajo ninguna circunstancia'
    ],
    compat: {
      fish: true,
      plants: { ok: false, reason: 'Los algicidas no distinguen entre algas y plantas; dañan o matan plantas acuáticas' },
      shrimp: { ok: false, reason: '⚠️ LETAL — los algicidas matan camarones incluso en dosis mínimas; nunca usar juntos' },
      snails: { ok: false, reason: '⚠️ LETAL — los algicidas son tóxicos para todos los moluscos sin excepción' }
    }
  },
  {
    id: 'peroxido', cat: 'Control de Algas', name: 'Peróxido de Hidrógeno (H₂O₂)', icon: '💥',
    brand: 'Farmacia (agua oxigenada 3–12%)',
    use: 'Oxidante potente usado para eliminar algas específicas por aplicación directa o en baños cortos. Muy eficaz contra algas negras (BBA) y cianobacterias.',
    cases: ['Algas negras (BBA) en plantas y decoración', 'Cianobacterias (algas azul-verdosas)', 'Desinfección de plantas nuevas antes de introducirlas', 'Desinfección de decoración y utensilios'],
    warnings: [
      'Se degrada en agua y oxígeno — relativamente seguro si se aplica con cuidado y buena aireación',
      'Aplicación directa es muy eficaz; dosis al agua completa puede dañar peces y bacterias',
      'Usar solución máx. 3% en acuario; concentraciones mayores solo fuera del agua'
    ],
    compat: {
      fish: true, plants: true,
      shrimp: { ok: false, reason: 'Oxidante potente que daña las branquias y tejidos de los camarones; retirar antes del tratamiento' },
      snails: { ok: false, reason: 'El H₂O₂ daña los tejidos blandos y la concha de los caracoles; retirar antes de aplicar' }
    }
  },

  // ── CALIDAD DEL AGUA ──────────────────────────────
  {
    id: 'carbon_activo', cat: 'Calidad del Agua', name: 'Carbón Activo', icon: '⬛',
    brand: 'Seachem Matrix Carbon, Fluval Carbon, genérico',
    use: 'Adsorbente que elimina químicos, medicamentos, colorantes, olores y algunos metales pesados del agua. Purifica el agua y la mantiene cristalina.',
    cases: ['Después de un tratamiento con medicamentos para eliminar residuos', 'Agua amarillenta por taninos (madera, hojas)', 'Eliminar olores del agua', 'Acuarios de exhibición donde se prioriza la transparencia'],
    warnings: [
      'Se satura en 2–4 semanas y deja de funcionar — reemplazar periódicamente',
      'Elimina medicamentos activos — retirar siempre durante los tratamientos',
      'El carbón gastado puede liberar lo que adsorbió — no reutilizar'
    ],
    compat: {
      fish: true, shrimp: true, snails: true,
      plants: { ok: false, reason: 'Absorbe fertilizantes y micronutrientes del agua, privando a las plantas de su nutrición' }
    }
  },
  {
    id: 'zeolita', cat: 'Calidad del Agua', name: 'Zeolita', icon: '🪨',
    brand: 'Seachem Purigen, API Ammonia Chips, genérico',
    use: 'Mineral poroso que intercambia iones y adsorbe amoniaco del agua. Útil en emergencias de amoniaco o acuarios sin ciclar.',
    cases: ['Picos de amoniaco en acuarios nuevos sin ciclar', 'Emergencias con peces enfermos o superpoblación', 'Acuarios de cuarentena o transporte'],
    warnings: [
      'Solo funciona en agua dulce — pierde eficacia en agua salada o con sal',
      'Se satura rápidamente en acuarios con carga alta de peces',
      'No reemplaza el ciclo biológico del filtro — es una solución temporal'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'clarificante', cat: 'Calidad del Agua', name: 'Clarificante de Agua', icon: '🔮',
    brand: 'Seachem Clarity, API Accu-Clear, genérico',
    use: 'Aglutina partículas finas en suspensión formando grumos que el filtro puede capturar. Aclara agua turbia rápidamente.',
    cases: ['Agua turbia por polvo de sustrato nuevo', 'Turbidez bacteriana en acuario nuevo', 'Agua nublada de causa no identificada', 'Previo a fotografiar o exhibir el acuario'],
    warnings: [
      'Trata el síntoma — identificar y corregir la causa de la turbidez',
      'No usar en exceso; puede aglutinar partículas útiles y obstruir el filtro',
      'Si la turbidez es verde (algas) usar algicida, no clarificante'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'osmosis_remineralizador', cat: 'Calidad del Agua', name: 'Remineralizador (agua de ósmosis)', icon: '💎',
    brand: 'Seachem Equilibrium, Salty Shrimp GH+, genérico',
    use: 'Añade minerales (calcio, magnesio, potasio) al agua desmineralizada de ósmosis inversa para hacerla apta para los peces. Permite controlar con precisión el GH.',
    cases: ['Agua de ósmosis inversa pura (GH y KH = 0)', 'Preparar agua específica para camarones Caridina', 'Control preciso de parámetros en especies sensibles', 'Agua de lluvia o muy blanda'],
    warnings: [
      'Solo para agua de ósmosis o muy blanda — añadir a agua dura puede elevar parámetros peligrosamente',
      'Equilibrium no contiene sodio — ideal para agua dulce pero no sustituye KH buffer',
      'Calcular siempre la cantidad necesaria con base en el volumen real del acuario'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },

  // ── BACTERIAS BENÉFICAS ───────────────────────────
  {
    id: 'bacterias_inicio', cat: 'Bacterias Benéficas', name: 'Bacterias de Arranque / Cicladoras', icon: '🦠',
    brand: 'Seachem Stability, API Quick Start, Tetra SafeStart',
    use: 'Introducen colonias de bacterias nitrificantes para acelerar el ciclo del nitrógeno en acuarios nuevos o tras tratamientos antibióticos.',
    cases: ['Acuario nuevo sin ciclar', 'Después de tratamiento con antibióticos que destruyó el filtro', 'Tras limpieza excesiva del filtro', 'Reconfiguración total del acuario'],
    warnings: [
      'No añadir peces inmediatamente — dar tiempo a que las bacterias se establezcan (1–2 semanas mínimo)',
      'Caducan — verificar fecha antes de usar',
      'No usar junto con antibióticos o medicamentos que maten bacterias',
      'No reemplazan el monitoreo de parámetros — seguir midiendo amoniaco y nitrito'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  },
  {
    id: 'probioticos', cat: 'Bacterias Benéficas', name: 'Probióticos / Bacterias Degradadoras', icon: '🦠',
    brand: 'Seachem Pristine, Microbe-Lift, genérico',
    use: 'Bacterias heterótrofas que degradan materia orgánica (restos de comida, heces, detritos) reduciendo carga orgánica y mejorando la calidad del agua.',
    cases: ['Acuarios con exceso de materia orgánica', 'Fondo con acumulación de detritos', 'Reducción de nitratos en acuarios establecidos', 'Soporte a filtraciones biológicas insuficientes'],
    warnings: [
      'Complemento, no sustituto de un filtro adecuado y mantenimiento regular',
      'Pueden reducir temporalmente el oxígeno al proliferar — airear bien',
      'Abrir y usar rápido — el producto se degrada al exponerse al aire'
    ],
    compat: { fish: true, plants: true, shrimp: true, snails: true }
  }
];
const CHEM_CATS = ['Acondicionadores', 'Medicamentos', 'Fertilizantes', 'Control de Algas', 'Calidad del Agua', 'Bacterias Benéficas'];

const CHEM_CAT_META = {
  'Acondicionadores':   { icon: '💧', color: '#1565c0', desc: 'Preparan y estabilizan el agua' },
  'Medicamentos':       { icon: '💊', color: '#b71c1c', desc: 'Tratan enfermedades y parásitos' },
  'Fertilizantes':      { icon: '🌿', color: '#2e7d32', desc: 'Nutrición para plantas acuáticas' },
  'Control de Algas':   { icon: '🟡', color: '#f57f17', desc: 'Eliminan o previenen algas' },
  'Calidad del Agua':   { icon: '🔮', color: '#4a148c', desc: 'Filtración y purificación' },
  'Bacterias Benéficas':{ icon: '🦠', color: '#00695c', desc: 'Ciclo del nitrógeno y limpieza' }
};

let chemOpenCat  = null;
let chemOpenItem = null;

function renderChem() {
  const el = document.getElementById('tab-chem');
  if (!el) return;

  let html = `
    <div class="chem-page">
      <div class="chem-header">
        <h2 class="chem-title">🧪 Química del Acuario</h2>
        <p class="chem-subtitle">Guía de productos y sustancias para agua dulce</p>
      </div>
      <div class="chem-cats">`;

  CHEM_CATS.forEach(cat => {
    const meta  = CHEM_CAT_META[cat];
    const items = CHEMICALS.filter(c => c.cat === cat);
    const isOpen = chemOpenCat === cat;
    html += `
      <div class="chem-cat-block">
        <div class="chem-cat-header" onclick="toggleChemCat('${cat}')" style="--ccat:${meta.color}">
          <span class="chem-cat-icon">${meta.icon}</span>
          <div class="chem-cat-info">
            <div class="chem-cat-name">${cat}</div>
            <div class="chem-cat-desc">${meta.desc} · ${items.length} productos</div>
          </div>
          <span class="chem-cat-chevron">${isOpen ? '▴' : '▾'}</span>
        </div>
        <div class="chem-cat-items${isOpen ? ' open' : ''}">`;

    items.forEach(item => {
      const isItemOpen = chemOpenItem === item.id;
      const compatOk   = v => v === true || v?.ok === true;
      const compatIcons = [
        `<span class="compat-badge ${compatOk(item.compat.fish)   ? 'ok' : 'no'}" title="Peces">🐟</span>`,
        `<span class="compat-badge ${compatOk(item.compat.plants) ? 'ok' : 'no'}" title="Plantas">🌿</span>`,
        `<span class="compat-badge ${compatOk(item.compat.shrimp) ? 'ok' : 'no'}" title="Camarones">🦐</span>`,
        `<span class="compat-badge ${compatOk(item.compat.snails) ? 'ok' : 'no'}" title="Caracoles">🐌</span>`,
      ].join('');

      html += `
        <div class="chem-item${isItemOpen ? ' open' : ''}" onclick="toggleChemItem('${item.id}')">
          <div class="chem-item-row">
            <span class="chem-item-icon">⚫</span>
            <div class="chem-item-main">
              <div class="chem-item-name">${item.name}</div>
            </div>
            <div class="chem-compat-row">${compatIcons}</div>
            <span class="chem-chevron">${isItemOpen ? '▴' : '▾'}</span>
          </div>
          <div class="chem-item-detail${isItemOpen ? ' open' : ''}">
            <div class="chem-brand-row">
              <span class="chem-brand-label">Marcas</span>
              <span class="chem-brand-value">${item.brand}</span>
            </div>
            <div class="chem-section">
              <div class="chem-section-title">¿Para qué sirve?</div>
              <p class="chem-use-text">${item.use}</p>
            </div>
            <div class="chem-section">
              <div class="chem-section-title">¿Cuándo usarlo?</div>
              <ul class="chem-cases">${item.cases.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div class="chem-section warn-section">
              <div class="chem-section-title">⚠️ Precauciones</div>
              <ul class="chem-warnings">${item.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
            <div class="chem-section">
              <div class="chem-section-title">Compatibilidad</div>
              <div class="chem-compat-grid">
                ${buildCompatRow('🐟', 'Peces', item.compat.fish)}
                ${buildCompatRow('🌿', 'Plantas', item.compat.plants)}
                ${buildCompatRow('🦐', 'Camarones', item.compat.shrimp)}
                ${buildCompatRow('🐌', 'Caracoles', item.compat.snails)}
              </div>
            </div>
          </div>
        </div>`;
    });

    html += `</div></div>`;
  });

  html += `</div></div>`;
  el.innerHTML = html;
}

function buildCompatRow(icon, label, val) {
  const ok     = val === true || val?.ok === true;
  const reason = (!ok && typeof val === 'object') ? val.reason : null;
  return `<div class="compat-detail-row ${ok ? 'ok' : 'no'}">
    <span class="compat-dr-icon">${icon}</span>
    <div class="compat-dr-body">
      <span class="compat-dr-status">${ok ? '✅ Compatible' : '❌ No usar'}</span>
      ${reason ? `<span class="compat-dr-reason">${reason}</span>` : ''}
    </div>
  </div>`;
}

function toggleChemCat(cat) {
  chemOpenCat  = chemOpenCat === cat ? null : cat;
  chemOpenItem = null;
  renderChem();
}

function toggleChemItem(id) {
  chemOpenItem = chemOpenItem === id ? null : id;
  renderChem();
}
