import { state } from '../state.js';

// ── INFERENCE ENGINE ───────────────────────────
export function inferCompat(a, b) {
  if (a.type === 'plant' || b.type === 'plant')
    return { status: 'compat', reason: '🌿 Las plantas son compatibles con todas las especies.' };

  const issues = [], positives = [];
  const paramOverlap = (a1, a2, b1, b2) => Math.max(a1, b1) <= Math.min(a2, b2);
  const tempOk = paramOverlap(a.temp[0], a.temp[1], b.temp[0], b.temp[1]);
  const phOk   = paramOverlap(a.ph[0],   a.ph[1],   b.ph[0],   b.ph[1]);
  const ghOk   = paramOverlap(a.gh[0],   a.gh[1],   b.gh[0],   b.gh[1]);

  if (!tempOk) issues.push(`rangos de temperatura incompatibles (${a.temp[0]}–${a.temp[1]}°C vs ${b.temp[0]}–${b.temp[1]}°C)`);
  if (!phOk)   issues.push(`rangos de pH incompatibles (${a.ph[0]}–${a.ph[1]} vs ${b.ph[0]}–${b.ph[1]})`);
  if (!ghOk)   issues.push(`dureza del agua incompatible (GH ${a.gh[0]}–${a.gh[1]} vs ${b.gh[0]}–${b.gh[1]})`);
  if (tempOk && phOk && ghOk) positives.push('parámetros de agua compatibles');

  const sizeA = a.size_cm || 5, sizeB = b.size_cm || 5;
  const ratio = Math.max(sizeA, sizeB) / Math.min(sizeA, sizeB);
  if (ratio >= 5) {
    const big = sizeA > sizeB ? a : b, small = sizeA > sizeB ? b : a;
    issues.push(`${big.name} (${big.size_cm} cm) puede comerse a ${small.name} (${small.size_cm} cm)`);
  } else if (ratio < 2) {
    positives.push('tamaños similares');
  }

  const aggressive = ['Agresivo', 'Semi-agresivo', 'Agresivo / Territorial'];
  const aAgg = aggressive.some(t => a.temperament?.includes(t));
  const bAgg = aggressive.some(t => b.temperament?.includes(t));
  if (aAgg && bAgg) issues.push('ambas especies tienen temperamento agresivo o semi-agresivo');
  else if (!aAgg && !bAgg) positives.push('ambas son pacíficas');

  const carnivore = s => s.diet?.toLowerCase().includes('carnív');
  if (carnivore(a) && sizeB < sizeA * 0.4) issues.push(`${a.name} es carnívoro y ${b.name} puede ser presa`);
  if (carnivore(b) && sizeA < sizeB * 0.4) issues.push(`${b.name} es carnívoro y ${a.name} puede ser presa`);

  const african = s => s.subcategory === 'ciclido' && s.gh && s.gh[0] >= 8;
  const softwater = s => s.gh && s.gh[1] <= 10;
  if (african(a) && softwater(b)) issues.push(`${a.name} necesita agua muy dura, ${b.name} prefiere agua blanda`);
  if (african(b) && softwater(a)) issues.push(`${b.name} necesita agua muy dura, ${a.name} prefiere agua blanda`);

  const cold = s => s.temp && s.temp[1] <= 22;
  const tropical = s => s.temp && s.temp[0] >= 24;
  if (cold(a) && tropical(b)) issues.push(`${a.name} es de agua fría y ${b.name} necesita agua cálida`);
  if (cold(b) && tropical(a)) issues.push(`${b.name} es de agua fría y ${a.name} necesita agua cálida`);

  const criticalIssues = issues.filter(i =>
    i.includes('temperatura') || i.includes('carnívoro') || i.includes('comerse') || i.includes('fría')
  );

  if (criticalIssues.length > 0 || issues.length >= 3) {
    return {
      status: 'incompat', icon: '✗', inferred: true,
      reason: '⚙️ Estimado: ' + criticalIssues.concat(issues.filter(i => !criticalIssues.includes(i))).slice(0, 2).join('; ') + '.',
    };
  }
  if (issues.length >= 1) {
    return {
      status: 'neutral', icon: '⚠️', inferred: true,
      reason: '⚙️ Estimado: posible incompatibilidad — ' + issues[0] + (positives.length ? '. A favor: ' + positives[0] : '') + '.',
    };
  }
  return {
    status: 'compat', icon: '✓', inferred: true,
    reason: '⚙️ Estimado: sin señales de incompatibilidad' + (positives.length ? ' — ' + positives.slice(0,2).join(', ') : '') + '.',
  };
}

export function compatIds(list) {
  return list.map(x => typeof x === 'string' ? x : x.id);
}

export function compatReason(list, id) {
  const entry = list.find(x => (typeof x === 'string' ? x : x.id) === id);
  return (entry && entry.reason) ? entry.reason : null;
}

export function getCompatHint(s) {
  if (state.tank.length === 0) return null;
  if (state.tank.find(t => t.meta.id === s.id)) return null;
  if (s.type === 'plant') return null;

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
