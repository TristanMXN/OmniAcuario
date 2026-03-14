import { lockScroll, unlockScroll } from '../core/scroll.js';

export function openInfoModal() {
  document.getElementById('info-modal').classList.remove('hidden');
  lockScroll();
}

export function closeInfoModal() {
  document.getElementById('info-modal').classList.add('hidden');
  unlockScroll();
}
