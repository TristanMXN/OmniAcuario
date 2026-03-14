export function getEmoji(s) {
  return s.emoji || (s.type === 'fish' ? '🐟' : s.type === 'plant' ? '🌿' : '🐠');
}
