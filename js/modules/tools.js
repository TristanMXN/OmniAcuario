import { toolsState } from '../state.js';

// ── SUBSTRATE DATA ─────────────────────────────
const SUBSTRATES = [
  { id:'grano_oro',    cat:'Inerte',    name:'Grano de Oro',          icon:'⬜', density:1.6,  color:'#f5c842', grain:'0.5–1 mm',   pack:0.62, note:'Arena dorada muy usada en México. Inerte, no altera pH. Grano fino y redondeado, segura para Corydoras.' },
  { id:'silice',       cat:'Inerte',    name:'Arena de Sílice',       icon:'⬜', density:1.7,  color:'#b0bec5', grain:'0.1–0.5 mm', pack:0.65, note:'Completamente inerte. No altera pH ni dureza. Muy fina y redondeada. Apta para cualquier especie.' },
  { id:'cuarzo_negro', cat:'Inerte',    name:'Cuarzo Negro',          icon:'⬜', density:1.7,  color:'#37474f', grain:'1–3 mm',     pack:0.60, note:'Cuarzo inerte en color oscuro. Realza los colores de los peces. No altera parámetros.' },
  { id:'arena_rio',    cat:'Inerte',    name:'Arena de Río',          icon:'⬜', density:1.5,  color:'#deb887', grain:'0.5–2 mm',   pack:0.63, note:'Natural, fina y redondeada. Económica y segura. Puede contener algo de materia orgánica — lavar bien.' },
  { id:'canto',        cat:'Inerte',    name:'Gravilla Canto Rodado', icon:'⬜', density:1.65, color:'#9b8ea0', grain:'3–8 mm',     pack:0.55, note:'Grano redondeado por erosión natural. Inerte. Buena circulación entre partículas.' },
  { id:'flourite_red',  cat:'Nutritivo', name:'Seachem Flourite Red',  icon:'🟩', density:0.85, color:'#c62828', grain:'1–3 mm',     pack:0.58, note:'Arcilla porosa roja rica en hierro. Acidifica levemente (pH 6.2–6.8). Ideal para planted tanks y camarones Caridina. No requiere sustitución.' },
  { id:'flourite_dark', cat:'Nutritivo', name:'Seachem Flourite Dark', icon:'🟩', density:0.90, color:'#37474f', grain:'1–4 mm',     pack:0.58, note:'Arcilla porosa oscura. pH neutro a levemente ácido (~6.5). Nutritivo a largo plazo. Compatible con peces delicados y plantas de media dificultad.' },
  { id:'onyx_sand',    cat:'Nutritivo', name:'Seachem Onyx Sand',     icon:'🟩', density:0.88, color:'#424242', grain:'0.5–2 mm',   pack:0.57, note:'Arena oscura rica en carbonatos. Eleva pH 0.1–0.5 unidades. Soporta niveles óptimos de KH. Excelente para camarones y planted.' },
  { id:'ada_amazonia', cat:'Nutritivo', name:'ADA Amazonia',          icon:'🟩', density:0.85, color:'#2e7d32', grain:'1–3 mm',     pack:0.58, note:'Sustrato premium japonés de origen volcánico. Acidifica activamente a pH 6.0–6.8. Ideal para plantas exigentes y camarones Caridina. Se degrada con el tiempo.' },
  { id:'tropica_soil', cat:'Nutritivo', name:'Tropica Aquarium Soil', icon:'🟩', density:0.90, color:'#388e3c', grain:'1–4 mm',     pack:0.58, note:'Sustrato danés nutritivo con pH estabilizado (~6.5). Menos acidificante que ADA. Compatible con peces delicados y plantaciones densas.' },
  { id:'fluval_stratum', cat:'Nutritivo', name:'Fluval Stratum',      icon:'🟩', density:0.88, color:'#6d4c41', grain:'2–4 mm',     pack:0.57, note:'Suelo volcánico liviano. Acidifica levemente. Gran superficie porosa. Excelente para camarones y plantas de media dificultad.' },
  { id:'onyx',         cat:'Poroso',    name:'Seachem Onyx',          icon:'🟫', density:0.88, color:'#212121', grain:'2–5 mm',     pack:0.57, note:'Grava porosa natural para cíclidos y planted. Ligera capacidad tampón. Estimula colonias bacterianas. Apto para agua dulce y marina.' },
  { id:'flourite',     cat:'Poroso',    name:'Seachem Flourite',      icon:'🟫', density:0.95, color:'#b71c1c', grain:'2–5 mm',     pack:0.57, note:'Grava de arcilla porosa. No requiere sustitución. Libera nutrientes a largo plazo. pH neutro.' },
  { id:'jbl_manado',   cat:'Poroso',    name:'JBL Manado',            icon:'🟫', density:0.85, color:'#e65100', grain:'2–5 mm',     pack:0.57, note:'Grano poroso de arcilla alemán. Estimula colonias bacterianas y favorece raíces. pH neutro-ácido. Fácil mantenimiento, no se degrada.' },
  { id:'tezontle',     cat:'Poroso',    name:'Tezontle',              icon:'🟫', density:0.7,  color:'#c0392b', grain:'3–10 mm',    pack:0.52, note:'Roca volcánica muy porosa y liviana. Excelente soporte bacteriano. Popular en México. No altera pH.' },
  { id:'pumice',       cat:'Poroso',    name:'Pómice (Piedra Pome)',  icon:'🟫', density:0.5,  color:'#bdbdbd', grain:'2–8 mm',     pack:0.53, note:'Extremadamente liviana y porosa. Ideal para filtración biológica y fondo drenante bajo sustratos nutritivos.' },
  { id:'aragonita',    cat:'Alcalino',  name:'Aragonita',             icon:'🟦', density:1.7,  color:'#80cbc4', grain:'0.5–2 mm',   pack:0.63, note:'Carbonato de calcio natural. Sube y estabiliza pH (7.8–8.5) y KH. Esencial para cíclidos africanos.' },
  { id:'coral',        cat:'Alcalino',  name:'Coral Triturado',       icon:'🟦', density:1.4,  color:'#ff8a65', grain:'2–8 mm',     pack:0.55, note:'Eleva pH y KH progresivamente. Ideal para peces de aguas duras (Malawi, Tanganyika).' },
  { id:'dolomita',     cat:'Alcalino',  name:'Arena de Dolomita',     icon:'🟦', density:1.8,  color:'#a5d6a7', grain:'0.1–0.5 mm', pack:0.65, note:'Carbonato de calcio y magnesio. Estabiliza pH alcalino. Usada en acuarios de agua dura y salobre.' },
  { id:'conchilla',    cat:'Alcalino',  name:'Conchilla Molida',      icon:'🟦', density:1.3,  color:'#f0e68c', grain:'0.5–3 mm',   pack:0.60, note:'Conchas molidas de moluscos. Eleva pH y GH gradualmente. Económica y natural.' },
  { id:'marmol',       cat:'Alcalino',  name:'Mármol Triturado',      icon:'🟦', density:2.0,  color:'#e0e0e0', grain:'3–10 mm',    pack:0.55, note:'Calcita pura. Eleva pH y KH lentamente. Útil en mezclas para acuarios de agua dura.' },
];
const SUBSTRATE_CATS = ['Inerte', 'Nutritivo', 'Poroso', 'Alcalino'];

// ── STATE ──────────────────────────────────────

// ── TOOLS RENDER ───────────────────────────────
export function renderTools() {
  document.getElementById('tab-tools').innerHTML = `
    <div class="tools-page">
      <div class="page-title">🔧 Herramientas</div>
      <div class="tools-section-wrap">
        <div class="tools-section-title">🧮 Calculadoras</div>
        <div class="tool-card">
          <div class="tool-card-header" onclick="toggleTool('glass')" style="cursor:pointer">
            <div class="tool-card-icon">🪟</div>
            <div style="flex:1"><div class="tool-card-title">Calculadora de vidrio</div><div class="tool-card-sub">Grosor por material y tipo de construcción</div></div>
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
              <button class="type-btn safety-btn" onclick="selectSafety(this,'extra')"><span class="type-btn-icon">🛡️🛡️</span>Seguridad extra</button>
            </div>
            <div class="dim-grid">
              <div class="input-group"><label class="input-label">Largo</label><div class="input-unit"><input class="input-field" type="number" id="glass-length" placeholder="120" min="10" /><span class="input-unit-label">cm</span></div></div>
              <div class="input-group"><label class="input-label">Ancho</label><div class="input-unit"><input class="input-field" type="number" id="glass-width" placeholder="45" min="10" /><span class="input-unit-label">cm</span></div></div>
              <div class="input-group"><label class="input-label">Alto</label><div class="input-unit"><input class="input-field" type="number" id="glass-height" placeholder="50" min="10" /><span class="input-unit-label">cm</span></div></div>
              <div class="input-group"><label class="input-label">Altura de agua</label><div class="input-unit"><input class="input-field" type="number" id="glass-water" placeholder="45" min="5" /><span class="input-unit-label">cm</span></div></div>
            </div>
            <div class="tool-hint">💡 La altura de agua suele ser 2–4 cm menos que el alto del acuario para evitar derrames.</div>
            <button class="calc-btn" onclick="calculateGlass()">Calcular grosor</button>
            <div class="glass-result" id="glass-result"></div>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-card-header" onclick="toggleTool('substrate')" style="cursor:pointer">
            <div class="tool-card-icon">🪨</div>
            <div style="flex:1"><div class="tool-card-title">Calculadora de sustrato</div><div class="tool-card-sub">Kilos y volumen por tipo de sustrato</div></div>
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
            <button class="calc-btn" onclick="calculateSubstrate()">Calcular sustrato</button>
            <div class="glass-result" id="substrate-result"></div>
          </div>
        </div>
      </div>

      <div class="tools-section-wrap">
        <div class="tools-section-title">📖 Guías</div>

        <div class="tool-card">
          <div class="tool-card-header" onclick="toggleTool('guide-start')" style="cursor:pointer">
            <div class="tool-card-icon">📋</div>
            <div style="flex:1"><div class="tool-card-title">Primeros pasos</div><div class="tool-card-sub">Qué hacer antes de meter peces</div></div>
            <span id="chevron-guide-start" style="color:var(--accent);font-size:18px">▾</span>
          </div>
          <div id="body-guide-start" class="tool-body hidden">
            <p class="guide-intro">Montar un acuario correctamente desde el inicio evita la mayoría de problemas. Sigue este orden.</p>
            <div class="guide-step"><span class="guide-step-n">1</span><div><strong>Elige el acuario adecuado</strong><br>Más grande es más estable. Un acuario de 60–100 L es ideal para empezar — perdona más errores que uno pequeño. Asegúrate de que la ubicación soporte el peso (1 L = 1 kg).</div></div>
            <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Equipo mínimo</strong><br>Filtro (caudal 5–10× el volumen/hora), calentador con termostato, termómetro, iluminación y sustrato. El test de agua (amoníaco, nitritos, nitratos, pH) es imprescindible.</div></div>
            <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Acondiciona el agua</strong><br>Usa siempre acondicionador de agua para eliminar cloro y cloraminas antes de llenar. Nunca uses agua directo del grifo sin tratar.</div></div>
            <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Cicla antes de agregar peces</strong><br>Deja correr el filtro al menos 4–8 semanas antes del primer pez. Ver guía de Ciclado.</div></div>
            <div class="guide-step"><span class="guide-step-n">5</span><div><strong>Agrega peces gradualmente</strong><br>Empieza con pocas especies resistentes. Espera 2 semanas entre adiciones para que el filtro se adapte a la carga biológica.</div></div>
            <div class="guide-step"><span class="guide-step-n">6</span><div><strong>Aclimata los peces nuevos</strong><br>Flota la bolsa 15 min para igualar temperatura. Luego agrega agua de tu acuario poco a poco durante 20–30 min antes de liberar el pez.</div></div>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-card-header" onclick="toggleTool('guide-cycle')" style="cursor:pointer">
            <div class="tool-card-icon">🔄</div>
            <div style="flex:1"><div class="tool-card-title">Ciclado del acuario</div><div class="tool-card-sub">Cómo establecer el ciclo del nitrógeno</div></div>
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
            <div style="flex:1"><div class="tool-card-title">Cómo leer parámetros</div><div class="tool-card-sub">pH, GH, KH y nitratos explicados</div></div>
            <span id="chevron-guide-params" style="color:var(--accent);font-size:18px">▾</span>
          </div>
          <div id="body-guide-params" class="tool-body hidden">
            <p class="guide-intro">Los parámetros del agua determinan si tus peces estarán sanos o estresados. Estos son los más importantes.</p>
            <div class="guide-param-block"><div class="guide-param-title">🔵 pH — Acidez del agua</div><div class="guide-param-desc">Escala de 0 a 14. 7 es neutro, menos es ácido, más es alcalino. La mayoría de peces de acuario prefieren 6.5–7.5. <strong>Lo más importante es la estabilidad</strong> — un pH estable en 7.2 es mejor que uno que oscila entre 6.8 y 7.6.</div></div>
            <div class="guide-param-block"><div class="guide-param-title">🟡 GH — Dureza general</div><div class="guide-param-desc">Mide la cantidad de minerales disueltos (calcio y magnesio). GH bajo = agua blanda (ideal para tetras, discos, camarones). GH alto = agua dura (ideal para cíclidos africanos, livebearers). Se mide en °dH o ppm.</div></div>
            <div class="guide-param-block"><div class="guide-param-title">🟠 KH — Dureza de carbonatos</div><div class="guide-param-desc">Mide la capacidad del agua para resistir cambios de pH (alcalinidad). KH bajo = pH inestable y propenso a caídas bruscas. Mantener KH entre 3–8 °dH protege la estabilidad del pH.</div></div>
            <div class="guide-param-block"><div class="guide-param-title">🔴 Nitratos (NO₃⁻)</div><div class="guide-param-desc">Producto final del ciclo del nitrógeno. Menos tóxico que amoníaco o nitritos, pero acumulados dañan a largo plazo. Mantener bajo 20–40 ppm con cambios de agua regulares.</div></div>
            <div class="guide-param-block"><div class="guide-param-title">☠️ Amoníaco y Nitritos</div><div class="guide-param-desc">Deben estar siempre en 0. Cualquier lectura positiva indica un problema: acuario sin ciclar, sobrepoblación, pez muerto o exceso de comida. Actúa de inmediato con cambios de agua parciales.</div></div>
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-card-header" onclick="toggleTool('guide-quarantine')" style="cursor:pointer">
            <div class="tool-card-icon">🏥</div>
            <div style="flex:1"><div class="tool-card-title">Cuarentena</div><div class="tool-card-sub">Por qué y cómo aislar peces nuevos</div></div>
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
            <div style="flex:1"><div class="tool-card-title">Compatibilidad</div><div class="tool-card-sub">Cómo elegir buenos compañeros de pecera</div></div>
            <span id="chevron-guide-compat" style="color:var(--accent);font-size:18px">▾</span>
          </div>
          <div id="body-guide-compat" class="tool-body hidden">
            <p class="guide-intro">No todos los peces conviven bien. Estos son los factores clave para armar una comunidad exitosa.</p>
            <div class="guide-step"><span class="guide-step-n">1</span><div><strong>Parámetros similares</strong><br>Agrupa especies que requieran pH, temperatura y dureza parecidos.</div></div>
            <div class="guide-step"><span class="guide-step-n">2</span><div><strong>Temperamento</strong><br>Evita mezclar especies agresivas con pacíficas. Un cíclido territorial puede acosar a tetras tranquilos.</div></div>
            <div class="guide-step"><span class="guide-step-n">3</span><div><strong>Tamaño</strong><br>Regla general: si cabe en la boca, es comida. No mezcles peces muy grandes con muy pequeños aunque sean "pacíficos".</div></div>
            <div class="guide-step"><span class="guide-step-n">4</span><div><strong>Zonas del acuario</strong><br>Distribuye especies por nivel: peces de superficie, zona media y fondo.</div></div>
            <div class="guide-step"><span class="guide-step-n">5</span><div><strong>Usa Mi Pecera</strong><br>La sección Mi Pecera verifica compatibilidades automáticamente entre las especies que agregues.</div></div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── TOGGLE ─────────────────────────────────────
export function toggleTool(id) {
  const body    = document.getElementById('body-' + id);
  const chevron = document.getElementById('chevron-' + id);
  const card    = body.closest('.tool-card');
  const willOpen = body.classList.contains('hidden');

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
  if (!isHidden && card) setTimeout(() => {
    const offset = card.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }, 50);
}

// ── SUBSTRATE ──────────────────────────────────
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
  SUBSTRATE_CATS.forEach(cat => {
    const isOpen = cat === toolsState.selectedCat;
    html += '<div class="sub-cat-box' + (isOpen ? ' open' : '') + '" onclick="toggleSubCat(\'' + cat + '\')">'
      + '<div class="sub-cat-header">'
      + '<span class="sub-cat-icon">' + catIcons[cat] + '</span>'
      + '<div class="sub-cat-info"><div class="sub-cat-name">' + cat + 's</div>'
      + '<div class="sub-cat-desc">' + catDescs[cat] + '</div></div>'
      + '<span class="sub-cat-chevron">' + (isOpen ? '▴' : '▾') + '</span>'
      + '</div>';
    if (isOpen) {
      html += '<div class="sub-cat-grid">';
      SUBSTRATES.filter(s => s.cat === cat).forEach(s => {
        const active = s.id === toolsState.substrateType;
        html += '<button class="substrate-btn' + (active ? ' active' : '') + '"'
          + (active ? ' style="--sb:' + s.color + ';border-color:' + s.color + ';background:' + s.color + '18"' : '')
          + ' onclick="event.stopPropagation();pickSubstrate(\'' + s.id + '\')">'
          + '<span class="substrate-icon">' + s.icon + '</span>'
          + '<span class="substrate-name">' + s.name + '</span>'
          + '<span class="substrate-density">' + s.density + ' kg/L · ' + s.grain + '</span>'
          + '</button>';
      });
      html += '</div>';
      const cur = SUBSTRATES.find(s => s.id === toolsState.substrateType && s.cat === cat);
      if (cur) html += '<div class="substrate-note"><strong>Granulometría estándar: ' + cur.grain + '</strong><br><span style="color:var(--text-2)">' + cur.note + '</span></div>';
    }
    html += '</div>';
  });
  el.innerHTML = html;
}

export function toggleSubCat(cat) {
  toolsState.selectedCat = (toolsState.selectedCat === cat) ? '' : cat;
  renderSubstrateSelector();
}

export function pickSubstrate(id) {
  toolsState.substrateType = id;
  const cat = (SUBSTRATES.find(s => s.id === id) || {}).cat || 'Inerte';
  toolsState.selectedCat = cat;
  renderSubstrateSelector();
}

// ── GLASS CALCULATOR ───────────────────────────
export function selectGlassType(btn, type) {
  toolsState.glassType = type;
  document.querySelectorAll('.type-btn:not(.safety-btn)').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

export function selectSafety(btn, level) {
  toolsState.safetyLevel = level;
  document.querySelectorAll('.safety-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

export function calculateGlass() {
  const L  = parseFloat(document.getElementById('glass-length').value);
  const W  = parseFloat(document.getElementById('glass-width').value);
  const H  = parseFloat(document.getElementById('glass-height').value);
  const Hw = parseFloat(document.getElementById('glass-water').value);
  const result = document.getElementById('glass-result');

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

  const span = Math.max(L, W);
  const spanIdx = span <= 60 ? 0 : span <= 90 ? 1 : span <= 120 ? 2 : span <= 150 ? 3 : span <= 180 ? 4 : 5;
  const hwIdx   = Hw <= 30 ? 0 : Hw <= 45 ? 1 : Hw <= 60 ? 2 : Hw <= 75 ? 3 : Hw <= 90 ? 4 : 5;

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
  const baseThickness = toolsState.glassType === 'rimless' ? (STANDARD.find(t => t > framedThickness) || 25) : framedThickness;
  const thickness = toolsState.safetyLevel === 'extra' ? (STANDARD.find(t => t > baseThickness) || baseThickness) : baseThickness;

  const liters      = Math.round(L * W * H / 1000);
  const litersWater = Math.round(L * W * Hw / 1000);
  const weightKg    = Math.round(litersWater * 1.025);
  const pressureBase = (Hw * 9.81 * 1.025 / 100).toFixed(2);

  const warnings = [];
  if (toolsState.glassType === 'rimless') {
    warnings.push({ type: 'info', icon: '🔲', text: '<strong>Rimless:</strong> El grosor calculado incluye un factor de seguridad adicional del 25% por la ausencia de marco reforzador. Se recomienda usar bracing horizontal si el largo supera 90 cm.' });
  } else {
    warnings.push({ type: 'info', icon: '🖼️', text: '<strong>Con marco:</strong> El marco perimetral actúa como refuerzo estructural. El cálculo aplica el factor estándar de vidrio flotado.' });
  }
  if (span > 90) warnings.push({ type: 'warn', icon: '⚠️', text: `Span de ${span} cm: considera agregar una <strong>tira central de vidrio (bracing)</strong> pegada en la parte superior para evitar pandeo.` });
  if (Hw > 50)  warnings.push({ type: 'warn', icon: '⚠️', text: 'Altura de agua mayor a 50 cm: la presión hidrostática es significativa. Verificar el grosor con un vidriero especializado antes de construir.' });
  if (thickness >= 15) warnings.push({ type: 'danger', icon: '🔴', text: 'Grosor ≥ 15 mm: acuario de gran porte. <strong>Consultar con un profesional</strong> y pedir certificación del vidrio antes de llenarlo.' });
  warnings.push({ type: 'info', icon: '💡', text: 'Este cálculo es orientativo. Las variables de calidad del vidrio, tipo de silicona y construcción pueden afectar el resultado. Siempre consulta con un vidriero.' });

  const temperedThickness  = STANDARD.slice().reverse().find(t => t < thickness) || thickness;
  const laminatedThickness = thickness;
  const acrylicRaw         = thickness * 0.55;
  const acrylicThickness   = STANDARD.find(t => t >= acrylicRaw) || thickness;

  const variants = [
    { key:'normal',    icon:'🪟', name:'Vidrio flotado',    subtitle:'Estándar · más común', thickness, color:'var(--accent)',
      pros:['Económico','Fácil de cortar y conseguir','Estándar en la industria'], cons:['Se quiebra en esquirlas','Menor resistencia a impactos'], note:null },
    { key:'tempered',  icon:'💎', name:'Vidrio templado',   subtitle:'Tratado térmicamente · 4× más resistente', thickness:temperedThickness, color:'var(--accent2)',
      pros:['Alta resistencia a impactos','Se desintegra en gránulos pequeños (más seguro)','Permite menor grosor'], cons:['No se puede cortar después del templado','Mayor costo','Tiempo de fabricación'],
      note:temperedThickness < thickness ? `Permite reducir a ${temperedThickness}mm por su mayor resistencia` : null },
    { key:'laminated', icon:'🛡️', name:'Vidrio laminado',   subtitle:'Dos láminas + PVB · máxima seguridad', thickness:laminatedThickness, color:'#c084fc',
      pros:['Retiene los fragmentos al romperse (protege fauna)','Alta resistencia a impactos','Aislamiento acústico'], cons:['Mayor costo que flotado','Algo más pesado','Menor disponibilidad en formatos acuarísticos'],
      note:'Recomendado para acuarios con niños, mascotas o fauna valiosa' },
    { key:'acrylic',   icon:'🔷', name:'Acrílico (PMMA)',   subtitle:'Plástico óptico · ligero y flexible', thickness:acrylicThickness, color:'var(--warn)',
      pros:['Liviano (50% menos que vidrio)','No se quiebra en esquirlas','Excelente claridad óptica','Mejor aislación térmica'], cons:['Se raya con facilidad','Se amarillea con UV a largo plazo','Más difícil de sellar con silicona','Mayor costo por m²'],
      note:acrylicThickness < thickness ? `Permite reducir a ${acrylicThickness}mm por su flexibilidad controlada` : null },
  ];

  result.className = 'glass-result visible';
  result.innerHTML = `
    <div class="result-hero">
      <div class="result-type-label">${toolsState.glassType === 'rimless' ? '🔲 Sin marco / Rimless' : '🖼️ Con marco (Framed)'}</div>
      <div class="result-thickness">${thickness}<span> mm</span></div>
      <div class="result-note">${toolsState.safetyLevel === 'extra' ? '🛡️🛡️ Seguridad extra aplicada' : '🛡️ Seguridad estándar'} · ${toolsState.glassType === 'rimless' ? 'Sin marco' : 'Con marco'}</div>
    </div>
    <div class="result-panels">
      <div class="result-panel"><div class="result-panel-label">Dimensiones</div><div class="result-panel-val">${L}×${W}×${H} cm</div><div class="result-panel-sub">Largo × Ancho × Alto</div></div>
      <div class="result-panel"><div class="result-panel-label">Span máximo</div><div class="result-panel-val">${span} cm</div><div class="result-panel-sub">Panel más largo sin soporte</div></div>
      <div class="result-panel"><div class="result-panel-label">Volumen total</div><div class="result-panel-val">${liters} L</div><div class="result-panel-sub">${litersWater} L con agua</div></div>
      <div class="result-panel"><div class="result-panel-label">Peso del agua</div><div class="result-panel-val">~${weightKg} kg</div><div class="result-panel-sub">Presión base: ${pressureBase} kPa</div></div>
    </div>
    <div class="variants-title">🪟 Comparativa de materiales</div>
    <div class="variants-list">
      ${variants.map(v => `
        <div class="variant-card" style="--vc:${v.color}">
          <div class="variant-header">
            <span class="variant-icon">${v.icon}</span>
            <div class="variant-info"><div class="variant-name">${v.name}</div><div class="variant-subtitle">${v.subtitle}</div></div>
            <div class="variant-thickness-badge">${v.thickness}<span>mm</span></div>
          </div>
          ${v.note ? `<div class="variant-note">${v.note}</div>` : ''}
          <div class="variant-pros-cons">
            <div class="variant-col">${v.pros.map(p => `<div class="variant-pro">✓ ${p}</div>`).join('')}</div>
            <div class="variant-col">${v.cons.map(c => `<div class="variant-con">✗ ${c}</div>`).join('')}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="result-warnings">
      ${warnings.map(w => `<div class="result-warn-row ${w.type}"><span class="result-warn-icon">${w.icon}</span><span>${w.text}</span></div>`).join('')}
    </div>`;
}

// ── SUBSTRATE CALCULATOR ───────────────────────
export function calculateSubstrate() {
  try { _calculateSubstrate(); } catch(e) { console.error('Error en sustrato:', e); }
}

function _calculateSubstrate() {
  const L     = parseFloat(document.getElementById('sub-length').value);
  const W     = parseFloat(document.getElementById('sub-width').value);
  const D     = parseFloat(document.getElementById('sub-depth').value);
  const slope = parseFloat(document.getElementById('sub-slope').value) || 0;
  const result = document.getElementById('substrate-result');

  result.className = 'glass-result visible';
  if (isNaN(L) || isNaN(W) || isNaN(D) || L < 10 || W < 10 || D < 1) {
    result.innerHTML = '<div class="result-warn-row warn"><span class="result-warn-icon">⚠️</span>Ingresá largo y ancho mínimo 10 cm · profundidad mínimo 1 cm.</div>';
    return;
  }

  const sub = SUBSTRATES.find(s => s.id === toolsState.substrateType) || SUBSTRATES[0];
  const packFactor  = sub.pack || 0.60;
  const baseVolume  = (L * W * D) / 1000;
  const slopeVolume = slope > 0 ? (L * W * slope * 0.5) / 1000 : 0;
  const totalVolume = baseVolume + slopeVolume;
  const weightKg    = (totalVolume * sub.density * packFactor).toFixed(1);
  const bags1 = Math.ceil(parseFloat(weightKg));
  const bags5 = Math.ceil(parseFloat(weightKg) / 5);
  const bags10 = Math.ceil(parseFloat(weightKg) / 10);
  const minDepth = sub.cat === 'Nutritivo' ? 6 : sub.cat === 'Poroso' ? 5 : 4;
  const depthWarn = D < minDepth ? '<div class="result-warn-row warn"><span class="result-warn-icon">⚠️</span>Para ' + sub.name + ' se recomiendan mínimo <strong>' + minDepth + ' cm</strong>.</div>' : '';
  const slopeNote = slope > 0 ? '<div class="result-warn-row info"><span class="result-warn-icon">📐</span>Pendiente: fondo trasero a <strong>' + (D + slope) + ' cm</strong>, frente a <strong>' + D + ' cm</strong>.</div>' : '';

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
    + '<div class="result-warnings">' + depthWarn + slopeNote + '</div>';
}
