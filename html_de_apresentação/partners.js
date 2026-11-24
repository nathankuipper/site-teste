'use strict';
(() => {
  const carousel = document.querySelector('.partners-carousel');
  if (!carousel) return;
  const clinics = [
    { name: 'Clínica Aurora', image: 'assets/clinica-aurora.svg' },
    { name: 'Viva Saúde', image: 'assets/clinica-viva.svg' },
    { name: 'Clínica Elo', image: 'assets/clinica-elo.svg' },
    { name: 'Essência Saúde', image: 'assets/clinica-essencia.svg' },
    { name: 'Clínica Horizonte', image: 'assets/clinica-horizonte.svg' }
  ];
  const columns = [...carousel.querySelectorAll('.partners-column')];
  const name = carousel.querySelector('.partners-name');
  const pagination = carousel.querySelector('.partners-dots');
  const pause = carousel.querySelector('.partners-pause');
  const announcement = carousel.querySelector('.partners-announcement');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = index => (index % clinics.length + clinics.length) % clinics.length;
  const HOLD_MS = 2500;
  const TRANSITION_MS = 850;
  let current = 0;
  let timer;
  let busy = false;
  let userPaused = false;
  let visible = false;

  clinics.forEach((clinic, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', clinic.name);
    button.addEventListener('click', () => change(index, 1, true));
    pagination.append(button);
  });
  const dots = [...pagination.children];
  const highlight = document.createElement('span');
  highlight.className = 'partners-pagination-highlight';
  highlight.setAttribute('aria-hidden', 'true');
  pagination.prepend(highlight);
  let highlightAnimation = null;
  let hoveredDot = null;
  let lastHighlightX = null;

  // Mesmo destaque elástico e tempo de animação do carrossel principal.
  function positionHighlight(animate = true) {
    const focusedDot = dots.find(dot => dot === document.activeElement && dot.matches(':focus-visible'));
    const target = hoveredDot || focusedDot || dots[current];
    const box = target.getBoundingClientRect();
    const origin = pagination.getBoundingClientRect();
    if (!box.width) return;
    const width = highlight.offsetWidth;
    const x = box.left - origin.left + (box.width - width) / 2;
    if (x === lastHighlightX) return;
    const previous = highlight.getBoundingClientRect();
    const fromX = previous.left - origin.left;
    const initialized = lastHighlightX !== null;
    lastHighlightX = x;
    if (highlightAnimation) highlightAnimation.cancel();
    highlight.style.transform = `translateX(${x}px)`;
    if (animate && initialized && !reducedMotion.matches) {
      const left = Math.min(fromX, x);
      const right = Math.max(fromX + previous.width, x + width);
      highlightAnimation = highlight.animate([
        { transform: `translateX(${fromX}px) scaleX(${previous.width / width})` },
        { transform: `translateX(${left}px) scaleX(${(right - left) / width})`, offset: .55 },
        { transform: `translateX(${x}px) scaleX(1)` }
      ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  }
  dots.forEach(dot => dot.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hoveredDot = dot;
    positionHighlight();
  }));
  pagination.addEventListener('pointerleave', () => { hoveredDot = null; positionHighlight(); });
  pagination.addEventListener('focusin', () => positionHighlight());
  pagination.addEventListener('focusout', () => requestAnimationFrame(() => positionHighlight()));
  if ('ResizeObserver' in window) new ResizeObserver(() => positionHighlight(false)).observe(pagination);
  else window.addEventListener('resize', () => positionHighlight(false));
  document.fonts?.ready.then(() => positionHighlight(false));

  function position(card, slot) {
    card.dataset.slot = slot;
    card.style.setProperty('--slot', slot);
    card.style.setProperty('--depth', Math.abs(slot));
  }

  function render() {
    columns.forEach((column, side) => {
      column.classList.add('is-resetting');
      const cards = [];
      for (let slot = -3; slot <= 3; slot++) {
        // A ordem espelhada leva a mesma próxima clínica ao centro dos dois lados.
        const clinic = clinics[wrap(current + (side === 0 ? -slot : slot))];
        const card = document.createElement('div');
        card.className = 'partner-card';
        const image = document.createElement('img');
        image.src = clinic.image;
        image.alt = '';
        image.width = image.height = 120;
        image.draggable = false;
        card.append(image);
        position(card, slot);
        cards.push(card);
      }
      column.replaceChildren(...cards);
      void column.offsetWidth;
      column.classList.remove('is-resetting');
    });
    updateLabel();
  }

  function updateLabel() {
    name.textContent = clinics[current].name;
    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === current)));
    positionHighlight();
  }

  function schedule() {
    clearTimeout(timer);
    if (busy || userPaused || !visible || document.hidden || reducedMotion.matches) return;
    timer = setTimeout(() => change(wrap(current + 1), 1), HOLD_MS);
  }

  function change(target, direction, manual = false) {
    if (busy || target === current) return;
    clearTimeout(timer);
    // Seleção direta e movimento reduzido não percorrem clínicas intermediárias.
    if (reducedMotion.matches || target !== wrap(current + direction)) {
      current = target;
      render();
      if (manual) announcement.textContent = clinics[current].name;
      schedule();
      return;
    }
    busy = true;
    carousel.classList.add('is-changing');
    columns.forEach((column, side) => {
      [...column.children].forEach(card => {
        position(card, Number(card.dataset.slot) + (side === 0 ? direction : -direction));
      });
    });
    setTimeout(() => {
      current = target;
      updateLabel();
      carousel.classList.remove('is-changing');
      if (manual) announcement.textContent = clinics[current].name;
    }, TRANSITION_MS / 2);
    setTimeout(() => {
      render();
      busy = false;
      schedule();
    }, TRANSITION_MS);
  }

  carousel.querySelector('.partners-prev').addEventListener('click', () => change(wrap(current - 1), -1, true));
  carousel.querySelector('.partners-next').addEventListener('click', () => change(wrap(current + 1), 1, true));
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    change(wrap(current + direction), direction, true);
  });
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.textContent = userPaused ? 'Retomar carrossel' : 'Pausar carrossel';
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: .25 }).observe(carousel);
  render();
})();
