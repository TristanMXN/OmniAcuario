import { state } from '../state.js';

const TANK_KEY = 'omniAcuario_tank';

export function saveTank() {
  const data = state.tank.map(({ meta, qty }) => ({ id: meta.id, qty }));
  localStorage.setItem(TANK_KEY, JSON.stringify(data));
}

export function loadTank() {
  try {
    const raw = localStorage.getItem(TANK_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.tank = saved.reduce((acc, { id, qty }) => {
      const meta = state.db.species.find(s => s.id === id);
      if (meta) acc.push({ meta, qty });
      return acc;
    }, []);
  } catch (e) {
    localStorage.removeItem(TANK_KEY);
  }
}
