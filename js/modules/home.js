import { state, CARE_COLOR } from '../state.js';

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

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: 'Buenos días',   icon: '🌅' };
  if (h >= 12 && h < 19) return { text: 'Buenas tardes', icon: '🌤' };
  return { text: 'Buenas noches', icon: '🌙' };
}

export function renderHome() {
  const yearDay  = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const card     = DAILY_CARDS[yearDay % DAILY_CARDS.length];
  const trivia   = TRIVIA[yearDay % TRIVIA.length];
  const species  = state.db.species;
  const sod      = species[yearDay % species.length];
  const greeting = getGreeting();
  const cardColor  = card.type === 'tip' ? 'var(--accent)' : 'var(--accent2)';
  const cardBg     = card.type === 'tip' ? 'rgba(0,212,255,0.06)' : 'rgba(0,229,160,0.06)';
  const cardBorder = card.type === 'tip' ? 'rgba(0,212,255,0.2)' : 'rgba(0,229,160,0.2)';

  document.getElementById('tab-home').innerHTML = `
    <div class="home-page">
      <div class="home-hero">
        <div class="home-hero-bg"></div>
        <div class="home-hero-content">
          <div class="home-hero-greeting">${greeting.icon} ${greeting.text}, acuarista</div>
          <div class="home-hero-title">OmniAcuario</div>
          <div class="home-hero-sub">El universo del acuario</div>
        </div>
      </div>

      <div class="home-sod" onclick="openDetail('${sod.id}')">
        <div class="home-sod-label">🌟 Especie del día</div>
        <div class="home-sod-body">
          <div class="home-sod-emoji">${sod.emoji || (sod.type==='fish'?'🐟':sod.type==='plant'?'🌿':'🐠')}</div>
          <div class="home-sod-info">
            <div class="home-sod-name">${sod.name}</div>
            <div class="home-sod-sci">${sod.scientific}</div>
            <div class="home-sod-origin">📍 ${sod.origin_region}</div>
            <div class="home-sod-tags">
              <span class="home-tag" style="color:${CARE_COLOR[sod.care]||'var(--text-3)'}">${{'Muy fácil':'🟢','Fácil':'🟢','Intermedio':'🟡','Difícil':'🔴'}[sod.care]||'🟢'} ${sod.care}</span>
              <span class="home-tag">🌡 ${sod.temp[0]}–${sod.temp[1]}°C</span>
              <span class="home-tag">⚗️ pH ${sod.ph[0]}–${sod.ph[1]}</span>
            </div>
          </div>
        </div>
        <div class="home-sod-cta">Ver ficha completa →</div>
      </div>

      <div class="home-daily-card" style="background:${cardBg};border-color:${cardBorder}">
        <div class="home-daily-label" style="color:${cardColor}">${card.label}</div>
        <div class="home-daily-text">${card.icon} ${card.text}</div>
      </div>

      <div class="home-trivia" onclick="this.classList.toggle('revealed')">
        <div class="home-trivia-label">🧠 Trivia del día</div>
        <div class="home-trivia-q">${trivia.q}</div>
        <div class="home-trivia-reveal-hint">Tocá para ver la respuesta</div>
        <div class="home-trivia-a">${trivia.a}</div>
      </div>
    </div>`;
}
