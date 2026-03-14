import { state } from '../state.js';
import { compatIds, inferCompat } from './compat.js';

// ── TANK STATS ─────────────────────────────────
export function computeTankStats() {
  const all = state.tank.map(t => t.meta);
  const dominant = state.tank.reduce((a, b) => (b.meta.min_liters || 0) > (a.meta.min_liters || 0) ? b : a);
  const baseLiters = dominant.meta.min_liters || 0;

  const extraLiters = state.tank.reduce((sum, { meta: s, qty }) => {
    const isDominant = s.id === dominant.meta.id;
    const units = isDominant ? Math.max(0, qty - 1) : qty;
    return sum + (s.liters_per_unit || 0) * units;
  }, 0);

  const totalLiters  = baseLiters + extraLiters;
  const totalAnimals = state.tank.reduce((sum, { qty }) => sum + qty, 0);
  const nitrate_max  = Math.min(...all.map(s => s.nitrate_max || 25));

  const conflicts = [], unknownPairs = [];
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

// ── FORMULA MODAL ──────────────────────────────
export function showLitersFormula() {
  const { baseLiters, extraLiters, totalLiters } = computeTankStats();
  const dominant = state.tank.reduce((a, b) => (b.meta.min_liters || 0) > (a.meta.min_liters || 0) ? b : a);

  const PONDER = { 'Pacífico': 2, 'Semi-agresivo': 3, 'Agresivo': 5 };
  const EMOJI  = { 'Pacífico': '🟢', 'Semi-agresivo': '🟡', 'Agresivo': '🔴' };

  const desglose = state.tank.map(({ meta: s, qty }) => {
    const isDominant = s.id === dominant.meta.id;
    const units = isDominant ? Math.max(0, qty - 1) : qty;
    const extra = (s.liters_per_unit || 0) * units;
    const temp = s.temperament || 'Pacífico';
    const ponder = PONDER[temp] || 2;
    const emoji = EMOJI[temp] || '🟢';
    return `
      <div style="background:var(--card);border-radius:10px;padding:12px 14px;margin-bottom:8px">
        <div style="font-weight:600;margin-bottom:4px">${s.emoji || '🐟'} ${s.name} × ${qty}${isDominant ? ' <span style="font-size:11px;color:var(--accent);font-weight:500">(dominante)</span>' : ''}</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.8">
          ${isDominant
            ? `Base: <b>${s.min_liters}L</b> · ${units} adicional${units !== 1 ? 'es' : ''} × ${s.liters_per_unit}L = <b>+${extra}L</b>`
            : `${units} ejemplar${units !== 1 ? 'es' : ''} × ${s.liters_per_unit}L = <b>+${extra}L</b>`
          }<br>
          ${emoji} ${temp} · ${s.size_cm}cm × ${ponder} = ${s.liters_per_unit}L por ejemplar adicional
        </div>
      </div>`;
  }).join('');

  const html = `
    <div style="padding:4px 0">
      <div style="background:var(--accent)15;border-left:3px solid var(--accent);border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:13px;line-height:1.9;color:var(--text-2)">
        <div style="font-weight:600;color:var(--text-1);margin-bottom:6px">📐 ¿Cómo se calcula?</div>
        Cada especie tiene un <b>acuario base</b> (mínimo para el primer ejemplar) más un <b>extra por cada ejemplar adicional</b>.<br>
        Cuando hay varias especies, se usa el <b>acuario base del pez dominante</b> (el de mayor base).<br><br>
        El extra por ejemplar adicional depende del temperamento:<br>
        🟢 <b>Pacífico</b> → talla cm × 2<br>
        🟡 <b>Semi-agresivo</b> → talla cm × 3<br>
        🔴 <b>Agresivo</b> → talla cm × 5<br><br>
        <b>Litraje total = acuario base del dominante + extras de todos los ejemplares adicionales</b>
      </div>
      <div style="font-weight:600;margin-bottom:8px">📊 Desglose</div>
      ${desglose}
      <div style="background:var(--accent);color:#fff;border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px">
        <span>Total</span>
        <span>${baseLiters}L base + ${extraLiters}L extras = ${totalLiters}L</span>
      </div>
    </div>`;

  document.getElementById('generic-modal-title').textContent = '💧 Cálculo de litraje';
  document.getElementById('generic-modal-body').innerHTML = html;
  const gm = document.getElementById('generic-modal');
  gm.classList.remove('hidden');
  gm.scrollTop = 0;
  gm.querySelector('.modal-box').scrollTop = 0;
}

export function closeGenericModal() {
  document.getElementById('generic-modal').classList.add('hidden');
}
