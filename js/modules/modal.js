import { state, TYPE } from '../state.js';
import { lockScroll, unlockScroll } from '../core/scroll.js';
import { compatIds, compatReason, inferCompat } from '../utils/compat.js';
import { getEmoji } from '../core/helpers.js';
import { addToTank, removeFromTank } from './tank.js';

// ── IUCN ───────────────────────────────────────
const IUCN_MAP = {
  'EX': { color: '#111',    label: 'Extinto',                    desc: 'No quedan individuos vivos conocidos.' },
  'EW': { color: '#333',    label: 'Extinto en estado silvestre', desc: 'Solo sobrevive en cautiverio o cultivo.' },
  'CR': { color: '#d32f2f', label: 'En peligro crítico',         desc: 'Riesgo extremadamente alto de extinción.' },
  'EN': { color: '#e64a19', label: 'En peligro',                 desc: 'Alto riesgo de extinción en estado silvestre.' },
  'VU': { color: '#f57c00', label: 'Vulnerable',                 desc: 'Riesgo elevado si no se controlan las amenazas.' },
  'NT': { color: '#fbc02d', label: 'Casi amenazado',             desc: 'Próximo a cumplir criterios de especie amenazada.' },
  'LC': { color: '#388e3c', label: 'Preocupación menor',         desc: 'Población estable. Sin amenaza inmediata.' },
  'DD': { color: '#757575', label: 'Datos insuficientes',        desc: 'No hay información suficiente para evaluarla.' },
  'NE': { color: '#90a4ae', label: 'No evaluado',                desc: 'Aún no ha sido evaluada por la IUCN.' },
};

function renderIUCN(raw) {
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

// ── MODAL TAB CONTENT ──────────────────────────
function modalTabContent(s, tab) {
  const cfg = TYPE[s.type];

  if (tab === 'general') {
    return `
      <p style="color:var(--text-2);line-height:1.7;font-size:14px;margin-bottom:18px">${s.description || '–'}</p>
      ${s.variants?.length ? `<div class="detail-section"><div class="detail-section-title">🎨 Variantes y morfologías</div><div class="tag-list">${s.variants.map(v => `<span class="tag" style="background:${cfg.bg};color:${cfg.color};font-size:12px">${v}</span>`).join('')}</div></div>` : ''}
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
      ${s.market_notes ? `<div style="background:var(--accent-dim2);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:8px"><strong>💡 Nota de mercado:</strong> ${s.market_notes}</div>` : ''}
      ${s.important_notes ? `<div style="background:#ff6b2b18;border-radius:10px;padding:12px 14px;font-size:13px;color:var(--text-2);line-height:1.6;border-left:3px solid #ff6b2b"><strong>⚠️ Importante:</strong> ${s.important_notes}</div>` : ''}`;
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
          <div class="param-box" style="flex:1;text-align:center"><div class="param-label">${l}</div><div class="param-value">${v}</div></div>`).join('')}
        </div>
      </div>
      ${s.substrate?.length ? `<div class="detail-section"><div class="detail-section-title">🪨 Sustrato</div><div class="tag-list" style="margin-bottom:8px">${s.substrate.map(x=>`<span class="tag" style="background:var(--bg-surface);color:var(--text-2);font-size:12px">🪨 ${x}</span>`).join('')}</div>${s.substrate_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6">${s.substrate_detail}</p>` : ''}</div>` : ''}
      ${s.plants ? `<div class="detail-section"><div class="detail-section-title">🌿 Plantas</div><span class="tag" style="background:var(--accent-dim);color:var(--success);font-size:12px">${s.plants}</span>${s.plant_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.plant_detail}</p>` : ''}</div>` : ''}
      ${s.light ? `<div class="detail-section"><div class="detail-section-title">💡 Iluminación</div><span class="tag" style="background:var(--accent-dim2);color:var(--warn);font-size:12px">${s.light}</span>${s.light_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.light_detail}</p>` : ''}</div>` : ''}
      ${s.co2 !== undefined ? `<div class="detail-section"><div class="detail-section-title">🫧 CO₂</div><span class="tag" style="background:${s.co2?'var(--accent-dim)':'var(--bg-surface)'};color:${s.co2?'var(--success)':'var(--text-3)'};font-size:12px">${s.co2 ? 'Recomendado' : 'No necesario'}</span>${s.co2_detail ? `<p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-top:8px">${s.co2_detail}</p>` : ''}</div>` : ''}`;
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
            <div class="disease-symptom"><span>⚠️</span><span class="disease-symptom-text">${d.symptom}</span></div>
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
      if (t.type === 'plant') return '';
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

// ── OPEN / CLOSE / RENDER ──────────────────────
function preventOverlayScroll(e) {
  if (e.target.closest('.modal-box')) return;
  e.preventDefault();
}

export async function openDetail(id) {
  const meta = state.db.species.find(s => s.id === id);
  if (!meta) return;

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

  if (!state.imageCache[id]) {
    state.imageCache[id] = null;
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
      let img = await wikiSummary(meta.scientific);
      if (!img) img = await wikiSearch(meta.scientific);
      if (!img && meta.name_en) img = await wikiSearch(meta.name_en + ' fish');
      state.imageCache[id] = img;
    } catch {
      state.imageCache[id] = null;
    }

    if (state.modalSpecies?.id === id) renderModal();
  }
}

export function closeModal() {
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
    { id: 'compat',   label: '🤝 Compatibilidad' },
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

export function switchModalTab(tab) {
  const s = state.modalSpecies;
  if (!s) return;
  state.modalTab = tab;

  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    const isActive = btn.getAttribute('onclick') === `switchModalTab('${tab}')`;
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? s.color : '';
  });

  const body = document.querySelector('.modal-body');
  if (body) { body.innerHTML = modalTabContent(s, tab); body.scrollTop = 0; }
}
