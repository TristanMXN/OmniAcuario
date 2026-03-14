import { state } from '../state.js';
import { computeTankStats, showLitersFormula } from '../utils/liters.js';
import { compatIds, compatReason, inferCompat } from '../utils/compat.js';
import { getEmoji } from '../core/helpers.js';

// ── TANK ACTIONS ───────────────────────────────
export function addToTank(id) {
  const meta = state.db.species.find(s => s.id === id);
  if (!meta || state.tank.find(t => t.meta.id === id)) return;
  const qty = meta.schooling ? meta.min_school : 1;
  state.tank.push({ meta, qty });
  renderAfterTankChange();
}

export function removeFromTank(id) {
  state.tank = state.tank.filter(t => t.meta.id !== id);
  renderAfterTankChange();
}

export function changeQty(id, delta) {
  const entry = state.tank.find(t => t.meta.id === id);
  if (entry) {
    entry.qty = Math.max(1, entry.qty + delta);
    renderAfterTankChange();
    return;
  }
  if (delta > 0) addToTank(id);
}

function renderAfterTankChange() {
  renderTank();
  window.dispatchEvent(new CustomEvent('tankChanged'));
}

// ── RENDER ─────────────────────────────────────
export function renderTank() {
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

  const careOrder = { 'Fácil': 1, 'Intermedio': 2, 'Difícil': 3, 'Muy difícil': 4 };
  const maxCare = all.reduce((max, s) => {
    const rank = careOrder[s.care] || 1;
    return rank > (careOrder[max] || 1) ? s.care : max;
  }, 'Fácil');
  const careColor = { 'Fácil': 'var(--success)', 'Intermedio': 'var(--warn)', 'Difícil': 'var(--danger)', 'Muy difícil': 'var(--danger)' }[maxCare] || 'var(--success)';
  const careIcon  = { 'Fácil': '🟢', 'Intermedio': '🟡', 'Difícil': '🔴', 'Muy difícil': '🔴' }[maxCare] || '🟢';

  const diets = [...new Set(all.filter(s => s.diet).map(s => s.diet))];

  // Matriz de compatibilidad
  const matrixHTML = all.length > 1 ? (() => {
    let rows = '';
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (a.type === 'plant' || b.type === 'plant') continue;
        const ca = state.db.compatibility[a.id];
        const cb = state.db.compatibility[b.id];
        const isIncompat = (ca && compatIds(ca.incompatible).includes(b.id)) || (cb && compatIds(cb.incompatible).includes(a.id));
        const isCompat   = (ca && compatIds(ca.compatible).includes(b.id))   || (cb && compatIds(cb.compatible).includes(a.id));
        const inf = (!isIncompat && !isCompat) ? inferCompat(a, b) : null;
        const rowStatus = isIncompat ? 'incompat' : isCompat ? 'compat' : inf.status;
        const rowIcon   = isIncompat ? '✗' : isCompat ? '✓' : inf.icon;
        let reason = null;
        if (isIncompat) reason = (ca && compatReason(ca.incompatible, b.id)) || (cb && compatReason(cb.incompatible, a.id)) || null;
        else if (isCompat) reason = (ca && compatReason(ca.compatible, b.id)) || (cb && compatReason(cb.compatible, a.id)) || null;
        else reason = inf.reason;
        rows += '<div class="compat-matrix-row ' + rowStatus + '">'
          + '<span class="cmr-icon">' + rowIcon + '</span>'
          + '<span class="cmr-names">' + a.name + ' <span class="cmr-amp">&</span> ' + b.name + '</span>'
          + '<span class="cmr-reason">' + reason + '</span>'
          + '</div>';
      }
    }
    return rows;
  })() : '';

  // Barras de parámetros
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
      <div class="pb-head"><span class="pb-label">${label}</span><span class="pb-result" style="color:${valColor}">${valueText}</span></div>
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

  // Especies lista
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

  // Sustrato recomendado
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
      reco = 'Aragonita o Coral Triturado'; cat = '🟦 Alcalino';
      why = 'Tus cíclidos africanos necesitan pH alcalino (7.8–8.5). Un sustrato alcalino estabiliza el pH y la dureza de forma natural.';
    } else if (hasCaridina) {
      reco = 'ADA Amazonia · Fluval Stratum · Seachem Flourite Red'; cat = '🟩 Nutritivo ácido';
      why = 'Los camarones Caridina necesitan pH 6.0–6.8 y KH bajo. Los sustratos activos acidifican el agua y estabilizan los parámetros.';
    } else if (hasPlants && !hasGoldfish) {
      reco = 'Seachem Flourite Dark · Tropica Aquarium Soil · JBL Manado'; cat = '🟩 Nutritivo';
      why = 'Tus plantas se beneficiarán de un sustrato nutritivo que aporte hierro y nutrientes directamente a las raíces.';
    } else if (hasCorydoras || hasShrimp) {
      reco = 'Arena de Sílice · Arena de Río · Grano de Oro'; cat = '⬜ Inerte fino';
      why = 'Los Corydoras necesitan arena fina y redondeada para proteger sus barbillas. Los camarones también prefieren sustratos suaves.';
    } else if (hasGoldfish) {
      reco = 'Grava Canto Rodado · Arena de Río'; cat = '⬜ Inerte grueso';
      why = 'Los Goldfish revuelven el sustrato constantemente. Se recomienda grava gruesa o arena de río que no se enturbie fácilmente.';
    } else if (hasNeo) {
      reco = 'Seachem Flourite · JBL Manado · Arena de Río'; cat = '🟫 Poroso o inerte';
      why = 'Las gambas Neocaridina son adaptables, pero prefieren sustratos oscuros que realcen su color y ofrezcan buena colonización bacteriana.';
    } else {
      reco = 'Grano de Oro · Arena de Sílice · Arena de Río'; cat = '⬜ Inerte';
      why = 'Para tu combinación de especies un sustrato inerte es la opción más versátil y segura. No altera pH ni dureza.';
    }

    if (hasCaridina && hasNeo) {
      warning = '⚠️ Mezcla de Caridina y Neocaridina: sus necesidades de pH son incompatibles. El sustrato ácido beneficiará a la Caridina pero puede estresar a la Neocaridina.';
    }

    return `
      <div class="sub-reco-card">
        <div class="sub-reco-top">
          <span class="sub-reco-cat">${cat}</span>
          <span class="sub-reco-name">${reco}</span>
        </div>
        <p class="sub-reco-why">${why}</p>
        ${warning ? `<div class="sub-reco-warn">${warning}</div>` : ''}
        <button class="sub-reco-btn" onclick="switchTab('tools');setTimeout(()=>toggleTool('substrate'),50)">Ir a calculadora de sustrato →</button>
      </div>`;
  })();

  document.getElementById('tab-tank').innerHTML = `
    <div class="tank-page">
      <div class="tnk-hero">
        <div class="tnk-hero-left">
          <div class="tnk-hero-label">Litros mínimos</div>
          <div class="tnk-hero-liters">${totalLiters}<span>L</span><span onclick="showLitersFormula()" style="cursor:pointer;font-size:13px;margin-left:6px;opacity:0.7;vertical-align:top;line-height:1" title="Ver cómo se calculó">ℹ️</span></div>
          <div class="tnk-hero-sub">${baseLiters}L base · +${extraLiters}L ejemplares</div>
          <button class="sub-reco-btn" style="margin-top:6px" onclick="switchTab('tools');setTimeout(()=>toggleTool('glass'),50)">Ir a calculadora de vidrio →</button>
        </div>
        <div class="tnk-hero-right">
          <div class="tnk-stat-badge ${hasConflict ? 'danger' : 'ok'}">
            <span>${hasConflict ? '⚠️' : '✅'}</span>
            <span>${hasConflict ? conflicts.length + ' conflicto' + (conflicts.length > 1 ? 's' : '') : 'Compatible'}</span>
          </div>
          ${!hasConflict && hasWarning ? `<div class="tnk-stat-badge warn"><span>❓</span><span>${unknownPairs.length} sin datos</span></div>` : ''}
          <div class="tnk-stat-badge" style="border-color:${careColor}20;color:${careColor}"><span>${careIcon}</span><span>${maxCare}</span></div>
          <div class="tnk-stat-badge neutral"><span>🐟</span><span>${totalAnimals} ejemplares</span></div>
        </div>
      </div>

      ${all.length > 1 ? `<div class="tnk-section"><div class="tnk-section-title">🤝 Compatibilidad</div><div class="tnk-compat-matrix">${matrixHTML}</div></div>` : ''}

      <div class="tnk-section">
        <div class="tnk-section-title">💧 Zona de agua segura</div>
        ${paramBarsHTML}
        <div class="tnk-nitrate">Nitrato máx. recomendado: <strong>${nitrate_max} ppm</strong></div>
      </div>

      <div class="tnk-section"><div class="tnk-section-title">🪨 Sustrato recomendado</div>${substrateRecoHTML}</div>

      ${diets.length > 0 ? `<div class="tnk-section"><div class="tnk-section-title">🍽 Dieta del conjunto</div><div class="tnk-diets">${diets.map(d => '<span class="tnk-diet-chip">' + d + '</span>').join('')}</div></div>` : ''}

      <div class="tnk-section">
        <div class="tnk-section-title">${
          (() => {
            const hasFish   = all.some(s => s.type === 'fish');
            const hasPlant  = all.some(s => s.type === 'plant');
            const hasShrimp = all.some(s => s.category === 'shrimp');
            const hasSnail  = all.some(s => s.category === 'snail');
            return [hasFish?'🐟':'',hasPlant?'🌿':'',hasShrimp?'🦐':'',hasSnail?'🐌':''].filter(Boolean).join('');
          })()
        } Especies en tu pecera</div>
        <div class="tnk-species-list">${speciesListHTML}</div>
        <button class="btn-go-catalog" onclick="switchTab('catalog')">+ Agregar más especies</button>
      </div>
    </div>`;
}
