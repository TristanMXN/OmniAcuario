// ── STATE ──────────────────────────────────────
export const state = {
  db: null,
  detailCache: {},
  imageCache: {},
  tank: [],
  activeTab: 'home',
  activeFilter: 'fish',
  catalogSearch: '',
  activeSort: 'compat',
  modalSpecies: null,
  modalTab: 'general',
};

// ── TYPE CONFIG ────────────────────────────────
export const TYPE = {
  fish:        { label: 'Peces',         color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  icon: '🐟' },
  plant:       { label: 'Plantas',       color: '#00e5a0', bg: 'rgba(0,229,160,0.1)',  icon: '🌿' },
  invertebrate:{ label: 'Invertebrados', color: '#c084fc', bg: 'rgba(192,132,252,0.1)',icon: '🦐' },
};

// ── TOOLS STATE ───────────────────────────────
export const toolsState = {
  substrateType: 'grano_oro',
  selectedCat:   '',
  glassType:     'framed',
  safetyLevel:   'standard',
};

// ── CHEM STATE ─────────────────────────────────
export const chemState = {
  openCat:  null,
  openItem: null,
};

export const CARE_COLOR = {
  'Muy fácil': '#00e5a0', 'Fácil': '#00e5a0',
  'Intermedio': '#ffaa00', 'Difícil': '#ff4f6d',
};
