'use strict';
(() => {
  const root = document.documentElement;
  const menu = document.querySelector('#site-menu');
  const panel = document.querySelector('#color-panel');
  const toggle = document.querySelector('#color-mode-toggle');
  if (!menu || !panel || !toggle) return;
  const colorOptions = panel.querySelector('.color-options');
  const colorChoices = Array.from(panel.querySelectorAll('[data-color-choice]'));
  let hoveredColor = null;
  let lastColorGeometry = '';
  function positionColorHighlight(animate = true) {
    if (panel.hidden) return;
    const target = hoveredColor || colorChoices.find(choice => choice === document.activeElement)
      || colorChoices.find(choice => choice.getAttribute('aria-checked') === 'true');
    if (!target) {
      colorOptions.style.setProperty('--color-highlight-opacity', '0');
      lastColorGeometry = '';
      return;
    }
    const box = target.getBoundingClientRect();
    const origin = colorOptions.getBoundingClientRect();
    const y = box.top - origin.top;
    const key = y + ',' + box.height;
    if (key === lastColorGeometry) return;
    lastColorGeometry = key;
    if (!animate) colorOptions.style.setProperty('--color-highlight-transition', 'none');
    colorOptions.style.setProperty('--color-highlight-y', y + 'px');
    colorOptions.style.setProperty('--color-highlight-height', box.height + 'px');
    colorOptions.style.setProperty('--color-highlight-opacity', '1');
    if (!animate) {
      void colorOptions.offsetWidth;
      colorOptions.style.removeProperty('--color-highlight-transition');
    }
  }

  const translations = {
    'Clínicas parceiras': 'Partner clinics',
    'Clínicas': 'Partner',
    'parceiras': 'clinics',
    'confiado por clínicas de saúde': 'trusted by healthcare clinics',
    'CUIDADO QUE NOS CONECTA': 'CARE THAT CONNECTS US',
    'Pausar carrossel': 'Pause carousel',
    'Retomar carrossel': 'Resume carousel',
    'Clínicas fictícias para demonstração.': 'Fictional clinics for demonstration.',
    'Clínica anterior': 'Previous clinic',
    'Próxima clínica': 'Next clinic',
    'Escolher clínica': 'Choose clinic',
    'onde toda saúde se': 'where all of healthcare',
    'conecta': 'connects',
    'Conheça a': 'Meet',
    'onde toda saúde se conecta': 'where all of healthcare connects',
    'Conheça a BiaBot': 'Meet BiaBot',
    'Entrar': 'Get started',
    'Pronto para começar na': 'Ready to get started with',
    'Entrar na fila': 'Join the waitlist',
    'Logar': 'Log in',
    '01 / CONHEÇA A BIABOT': '01 / MEET BIABOT',
    'para o cuidado.': 'on care.',
    'Uma nova perspectiva para conectar exames, decisões e pessoas.': 'A fresh perspective on connecting test results, decisions and people.',
    'BiaBot — Um novo olhar para o cuidado.': 'BiaBot — A fresh perspective on care.',
    'BiaBot. Inteligência para aproximar exames, decisões e cuidado. Conheça uma nova perspectiva para a rotina clínica.': 'BiaBot. Intelligence connecting tests, decisions and care. Discover a fresh perspective on clinical practice.',
    'Pular apresentação': 'Skip presentation',
    'A BiaBot': 'About BiaBot',
    'Segurança': 'Security',
    'Como funciona': 'How it works',
    'Um novo olhar': 'A fresh perspective',
    'Início': 'Home',
    'Explorar': 'Explore',
    'DO DADO À DECISÃO': 'FROM DATA TO DECISIONS',
    'Transformamos': 'We turn',
    'exames em': 'test results into',
    'decisões clínicas.': 'clinical decisions.',
    'Em segundos.': 'In seconds.',
    'Transformamos exames em decisões clínicas. Em segundos.': 'We turn test results into clinical decisions. In seconds.',
    'ALÉM DOS RESULTADOS': 'BEYOND THE RESULTS',
    'Conexões que': 'Connections that',
    'ampliam o olhar.': 'broaden perspectives.',
    'E aproximam': 'And bring',
    'o cuidado.': 'care closer.',
    'Informação ganha contexto.': 'Information gains context.',
    'O profissional ganha perspectiva.': 'Professionals gain perspective.',
    'TECNOLOGIA COM PROPÓSITO': 'TECHNOLOGY WITH PURPOSE',
    'Mais clareza.': 'More clarity.',
    'Mais presença.': 'More presence.',
    'Mais espaço': 'More room',
    'para o humano.': 'for the human side.',
    'A inteligência apoia.': 'Intelligence supports.',
    'Quem cuida continua no centro.': 'Caregivers remain at the center.',
    'Segurança & LGPD': 'Security & LGPD',
    'Dados': 'Data',
    'sob cuidado.': 'in safe hands.',
    'Uma experiência pensada para preservar informações sensíveis ao longo de todo o fluxo.': 'An experience designed to protect sensitive information throughout the entire workflow.',
    'Privacidade': 'Privacy',
    'por princípio.': 'by design.',
    'Respeito às pessoas e aos seus dados desde a concepção de cada interação.': 'Respect for people and their data, built into every interaction from the start.',
    'Uma trilha': 'A clearer',
    'mais clara.': 'path.',
    'Contexto e visibilidade para acompanhar o caminho da informação até a revisão.': 'Context and visibility to follow information all the way through to review.',
    'Acesso': 'Access',
    'com propósito.': 'with purpose.',
    'A informação certa para cada papel, mantendo o foco no que cada pessoa precisa.': 'The right information for each role, focused on what each person needs.',
    'COMO FUNCIONA': 'HOW IT WORKS',
    'Do exame à decisão.': 'From tests to decisions.',
    'Em': 'In',
    'quatro': 'four',
    'passos.': 'steps.',
    'O PONTO DE PARTIDA': 'THE STARTING POINT',
    'Envie. Integre.': 'Upload. Integrate.',
    'Deixe fluir.': 'Let it flow.',
    'Adicione os exames e reúna as informações em um só lugar. Tudo pronto para o próximo passo.': 'Upload test results and bring information together in one place. Ready for the next step.',
    'INTELIGÊNCIA EM AÇÃO': 'INTELLIGENCE IN ACTION',
    'Os dados ganham': 'Data gains',
    'contexto.': 'context.',
    'A IA relaciona resultados e histórico para destacar padrões e apoiar a análise profissional.': 'AI connects results and history to highlight patterns and support professional analysis.',
    'CLAREZA PARA AVANÇAR': 'CLARITY TO MOVE FORWARD',
    'O que importa,': 'What matters,',
    'em evidência.': 'brought into focus.',
    'Tendências, pontos de atenção e uma síntese estruturada tornam a revisão mais fluida.': 'Trends, areas of concern and a structured summary make review smoother.',
    'O CUIDADO É HUMANO': 'CARE IS HUMAN',
    'A decisão continua': 'The decision stays',
    'com você.': 'with you.',
    'O profissional revisa, ajusta e decide. A tecnologia apoia; o olhar clínico conduz.': 'Professionals review, adjust and decide. Technology supports; clinical judgment leads.',
    'FILME BIABOT': 'BIABOT FILM',
    'Uma nova perspectiva.': 'A new perspective.',
    'Em breve, em movimento.': 'Coming to life soon.',
    'ESPAÇO RESERVADO PARA VÍDEO': 'VIDEO PLACEHOLDER',
    'Um novo olhar.': 'A fresh perspective.',
    'Infinitas possibilidades de cuidar.': 'Endless possibilities for care.',
    'EXPLORE': 'EXPLORE',
    'Segurança & privacidade': 'Security & privacy',
    'Nosso próximo capítulo': 'Our next chapter',
    'BiaBot. Todos os direitos reservados.': 'BiaBot. All rights reserved.',
    'INTELIGÊNCIA PARA O CUIDADO.': 'INTELLIGENCE FOR CARE.',
    'Feito para ir além.': 'Made to go further.',
    'BiaBot — início': 'BiaBot — home',
    'Navegação principal': 'Main navigation',
    'Abrir menu': 'Open menu',
    'Fechar menu': 'Close menu',
    'Menu completo': 'Full menu',
    'Explorar apresentação': 'Explore presentation',
    'Uma nova perspectiva para o cuidado': 'A fresh perspective on care',
    'carrossel': 'carousel',
    'O que move a BiaBot': 'What drives BiaBot',
    '1 de 3 — Transformamos exames em decisões clínicas': '1 of 3 — Turning test results into clinical decisions',
    '2 de 3 — Conexões que ampliam o olhar': '2 of 3 — Connections that broaden perspectives',
    '3 de 3 — Mais espaço para o que é humano': '3 of 3 — More room for the human side',
    'Escolher slide': 'Choose slide',
    'Ir para slide 1': 'Go to slide 1',
    'Ir para slide 2': 'Go to slide 2',
    'Ir para slide 3': 'Go to slide 3',
    'Pausar troca automática': 'Pause automatic playback',
    'Pausar movimento do carrossel': 'Pause carousel movement',
    'Retomar movimento do carrossel': 'Resume carousel movement',
    'Slide anterior': 'Previous slide',
    'Próximo slide': 'Next slide',
    'Filme de apresentação da BiaBot': 'BiaBot presentation film',
    'Área reservada para o futuro vídeo de apresentação da BiaBot, formato 16 por 9': 'Placeholder for the future BiaBot presentation video, in 16:9 format',
    'BiaBot — voltar ao início': 'BiaBot — back to top',
    'Voltar ao início': 'Back to top',
    'Idioma': 'Language',
    'Modo daltônico': 'Color vision mode',
    'Cores originais': 'Original colors',
    'Cores acessíveis': 'Accessible colors',
    'Escolha a paleta que funciona melhor para você.': 'Choose the palette that works best for you.',
    'Fechar configurações de cores': 'Close color settings',
    'Azul e amarelo': 'Blue and yellow',
    'Azul e dourado': 'Blue and gold',
    'Vinho e turquesa': 'Burgundy and turquoise',
    'Tons de cinza': 'Grayscale',
    'Acromatopsia': 'Achromatopsia',
    'Usar cores originais': 'Use original colors'
  };
  const reverse = new Map(Object.entries(translations).map(([pt, en]) => [en, pt]));
  const modes = ['default', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const modeNames = { default: 'Cores originais', protanopia: 'Protanopia', deuteranopia: 'Deuteranopia', tritanopia: 'Tritanopia', achromatopsia: 'Acromatopsia' };
  let language = 'pt-BR';
  let colorMode = 'default';
  function readPreference(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }
  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch { /* As preferências seguem funcionando sem armazenamento. */ }
  }
  function translate(value) {
    const text = value.trim();
    if (!text) return value;
    const original = Object.hasOwn(translations, text) ? text : reverse.get(text);
    if (!original) return value;
    return value.replace(text, language === 'en' ? translations[original] : original);
  }
  function translateText(node) {
    if (node.parentElement?.closest('script,style,svg')) return;
    const next = translate(node.nodeValue || '');
    if (next !== node.nodeValue) node.nodeValue = next;
  }
  const attributeNames = ['aria-label', 'aria-roledescription', 'title'];
  function translateAttributes(element) {
    attributeNames.forEach(name => {
      const value = element.getAttribute(name);
      if (value !== null) {
        const next = translate(value);
        if (next !== value) element.setAttribute(name, next);
      }
    });
  }
  function translateSubtree(element) {
    if (element.nodeType === Node.TEXT_NODE) { translateText(element); return; }
    if (element.nodeType !== Node.ELEMENT_NODE || element.matches('script,style,svg')) return;
    translateAttributes(element);
    element.querySelectorAll('[aria-label],[aria-roledescription],[title]').forEach(translateAttributes);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateText(node);
  }
  function setLanguage(next, persist = true) {
    language = next === 'en' ? 'en' : 'pt-BR';
    root.lang = language;
    translateSubtree(document.body);
    document.title = translate(document.title);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = translate(description.content);
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    if (persist) savePreference('biabot.language', language);
    // Recalcula apenas quando o texto muda de idioma, nunca durante a rolagem.
    window.dispatchEvent(new Event('resize'));
  }
  function setColorMode(next, persist = true) {
    colorMode = modes.includes(next) ? next : 'default';
    root.dataset.colorMode = colorMode;
    colorChoices.forEach((choice, index) => {
      const selected = choice.dataset.colorChoice === colorMode;
      choice.setAttribute('aria-checked', String(selected));
      choice.tabIndex = selected || (colorMode === 'default' && index === 0) ? 0 : -1;
    });
    positionColorHighlight();
    document.querySelector('#color-mode-status').textContent = translate(modeNames[colorMode]);
    if (persist) savePreference('biabot.colorMode', colorMode);
  }
  function setPanelOpen(open, focus = false) {
    panel.hidden = !open;
    menu.classList.toggle('has-color-panel', open);
    toggle.setAttribute('aria-expanded', String(open));
    hoveredColor = null;
    lastColorGeometry = '';
    if (focus) {
      const target = open ? colorChoices.find(choice => choice.getAttribute('aria-checked') === 'true') || colorChoices[0] : toggle;
      target.focus({ preventScroll: true });
    }
    if (open) positionColorHighlight(false);
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  colorChoices.forEach(choice => {
    choice.addEventListener('click', () => setColorMode(choice.dataset.colorChoice));
    choice.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hoveredColor = choice;
      positionColorHighlight();
    });
  });
  colorOptions.addEventListener('pointerleave', () => { hoveredColor = null; positionColorHighlight(); });
  colorOptions.addEventListener('focusin', () => positionColorHighlight());
  colorOptions.addEventListener('focusout', () => requestAnimationFrame(() => positionColorHighlight()));
  colorOptions.addEventListener('keydown', event => {
    const current = colorChoices.indexOf(document.activeElement);
    if (current < 0) return;
    let next = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % colorChoices.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current + colorChoices.length - 1) % colorChoices.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = colorChoices.length - 1;
    else return;
    event.preventDefault();
    hoveredColor = null;
    setColorMode(colorChoices[next].dataset.colorChoice);
    colorChoices[next].focus({ preventScroll: true });
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => positionColorHighlight(false)).observe(colorOptions);
  document.querySelector('#reset-colors').addEventListener('click', () => setColorMode('default'));
  toggle.addEventListener('click', () => setPanelOpen(panel.hidden, true));
  document.querySelector('#close-color-panel').addEventListener('click', () => setPanelOpen(false, true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setPanelOpen(false, true);
    }
  });
  new MutationObserver(() => { if (menu.hidden) setPanelOpen(false); }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
  setLanguage(readPreference('biabot.language', 'pt-BR'), false);
  setColorMode(readPreference('biabot.colorMode', 'default'), false);
  // Traduz também os rótulos dinâmicos e os slides duplicados pelo carrossel.
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateText(record.target);
      else if (record.type === 'attributes') translateAttributes(record.target);
      else record.addedNodes.forEach(translateSubtree);
    });
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributeNames });
})();
