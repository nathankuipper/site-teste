'use strict';
// Um único fundo acompanha o mouse, o foco e a seção atual, como no teste.
(() => {
  const nav = document.querySelector('.desktop-nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let hoveredLink = null;
  let lastGeometry = '';
  let pending = false;

  function positionHighlight(animate = true) {
    const target = hoveredLink || links.find(link => link === document.activeElement)
      || links.find(link => link.hasAttribute('aria-current')) || links[0];
    if (!target) return;
    const box = target.getBoundingClientRect();
    const origin = nav.getBoundingClientRect();
    if (!box.width || !box.height) {
      nav.style.setProperty('--nav-destaque-opacidade', '0');
      lastGeometry = '';
      return;
    }
    const geometry = [box.left - origin.left, box.top - origin.top, box.width, box.height];
    const key = geometry.join(',');
    if (key === lastGeometry) return;
    lastGeometry = key;
    if (!animate) nav.style.setProperty('--nav-destaque-transicao', 'none');
    ['x', 'y', 'largura', 'altura'].forEach((name, index) => {
      nav.style.setProperty(`--nav-destaque-${name}`, `${geometry[index]}px`);
    });
    nav.style.setProperty('--nav-destaque-opacidade', '1');
    if (!animate) {
      void nav.offsetWidth;
      nav.style.removeProperty('--nav-destaque-transicao');
    }
  }

  function markSection() {
    pending = false;
    let current = 0;
    const limit = document.querySelector('.site-header').getBoundingClientRect().height + 140;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= limit) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    positionHighlight();
  }

  nav.classList.add('nav-deslizante');
  links.forEach(link => link.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hoveredLink = link;
    positionHighlight();
  }));
  nav.addEventListener('pointerleave', () => { hoveredLink = null; positionHighlight(); });
  nav.addEventListener('focusin', () => positionHighlight());
  nav.addEventListener('focusout', () => requestAnimationFrame(() => positionHighlight()));
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(markSection); }
  }, { passive: true });
  window.addEventListener('resize', () => { markSection(); positionHighlight(false); });
  if ('ResizeObserver' in window) new ResizeObserver(() => positionHighlight(false)).observe(nav);
  document.fonts?.ready.then(() => positionHighlight(false));
  markSection();
  positionHighlight(false);
})();

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;
  const ease = (value) => value * value * (3 - 2 * value);
  const header = document.querySelector('.site-header');
  const intro = document.querySelector('.intro');
  const introScene = document.querySelector('.intro-scene');
  const metalStage = document.querySelector('.intro .metal-world');
  const metalHome = document.createComment('posição do fundo metálico na abertura');
  metalStage.before(metalHome);
  const metalSurface = document.createElement('div');
  metalSurface.className = 'metal-header-surface';
  metalSurface.setAttribute('aria-hidden', 'true');
  metalSurface.hidden = true;
  document.body.append(metalSurface);

  function placeMetalSurface() {
    root.classList.add('has-morph-capability');
    root.classList.toggle('has-morph-background', !reducedMotion.matches);
    if (reducedMotion.matches) {
      if (metalStage.parentElement !== introScene) metalHome.after(metalStage);
      metalSurface.hidden = true;
      metalSurface.classList.remove('is-ready');
    } else {
      if (metalStage.parentElement !== metalSurface) metalSurface.append(metalStage);
      metalSurface.hidden = false;
    }
  }

  const sourceB = document.querySelector('.hero-b');
  const targetB = document.querySelector('.nav-b');
  const letters = Array.from(document.querySelectorAll('.logo-rest > span'));
  const connection = document.querySelector('.intro-connection');
  let entrancePlayed = false;
  let entranceAnimations = [];
  let entranceImages = [];
  let entrancePending = false;
  function finishBrandEntrance() {
    if (!entranceAnimations.length && !entrancePending) return;
    entrancePending = false;
    entranceAnimations.forEach(animation => animation.cancel());
    entranceAnimations = [];
    entranceImages.forEach(image => image.style.removeProperty('opacity'));
  }
  function playBrandEntrance() {
    if (entrancePlayed) return;
    entrancePlayed = true;
    if (reducedMotion.matches || !flying || window.scrollY > geometry.introTop + 1) return;
    entranceImages.forEach(image => image.style.removeProperty('opacity'));
    entrancePending = false;
    entranceAnimations = entranceImages.map((image, index) => image.animate([
      { opacity: 0, transform: 'translate3d(0,12px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ], { duration: 420, delay: index * 65, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
  }
  function updateConnection(progress) {
    if (!connection) return;
    const enter = reducedMotion.matches ? 1 : ease(clamp((progress - .48) / .24));
    // Mantém a chamada legível por mais rolagem antes da saída suave.
    const exit = reducedMotion.matches ? 0 : ease(clamp((progress - .74) / .26));
    const opacity = enter * (1 - exit);
    connection.style.setProperty('--connection-opacity', opacity.toFixed(4));
    connection.style.setProperty('--connection-y', (20 * (1 - enter) - 18 * exit).toFixed(2) + 'px');
    connection.style.setProperty('--connection-scale', (.97 + .03 * enter).toFixed(4));
    connection.setAttribute('aria-hidden', String(opacity < .02));
  }
  reducedMotion.addEventListener('change', finishBrandEntrance);
  const introExtras = document.querySelectorAll('.intro-kicker, .intro-caption, .intro-bottom, .intro-top');
  const exploreButton = document.querySelector('.intro-scroll');
  let exploreScrollFrame = null;
  function cancelExploreScroll() {
    if (exploreScrollFrame !== null) cancelAnimationFrame(exploreScrollFrame);
    exploreScrollFrame = null;
  }
  function scrollFromExplore(event) {
    event.preventDefault();
    cancelExploreScroll();
    const destination = document.querySelector(exploreButton.getAttribute('href'));
    if (!destination || !geometry) return;
    const end = () => {
      exploreScrollFrame = null;
      if (location.hash !== exploreButton.hash) history.pushState(null, '', exploreButton.hash);
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    };
    const targetY = Math.min(document.documentElement.scrollHeight - window.innerHeight,
      Math.max(0, destination.getBoundingClientRect().top + window.scrollY - geometry.headerHeight - 8));
    if (reducedMotion.matches) {
      window.scrollTo({ top: targetY, behavior: 'instant' });
      end();
      return;
    }
    const from = window.scrollY;
    const duration = 2000;
    let started = null;
    function advanceExplore(timestamp) {
      if (started === null) started = timestamp;
      const progress = clamp((timestamp - started) / duration);
      window.scrollTo({ top: lerp(from, targetY, ease(progress)), behavior: 'instant' });
      if (progress >= 1) { end(); return; }
      exploreScrollFrame = requestAnimationFrame(advanceExplore);
    }
    exploreScrollFrame = requestAnimationFrame(advanceExplore);
  }
  window.addEventListener('wheel', cancelExploreScroll, { passive: true });
  window.addEventListener('touchstart', cancelExploreScroll, { passive: true });
  window.addEventListener('pointerdown', cancelExploreScroll, { passive: true });
  window.addEventListener('resize', cancelExploreScroll, { passive: true });
  window.addEventListener('pagehide', cancelExploreScroll);
  document.addEventListener('keydown', event => {
    if (['Escape', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelExploreScroll();
  });
  reducedMotion.addEventListener('change', cancelExploreScroll);

  let exploreHovered = false;
  let exploreFocused = false;
  function syncExploreZoom() {
    const atStart = window.scrollY <= intro.getBoundingClientRect().top + window.scrollY + 1;
    root.classList.toggle('is-intro-exploring', !reducedMotion.matches && atStart && (exploreHovered || exploreFocused));
  }
  exploreButton.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !finePointer.matches) return;
    exploreHovered = true;
    syncExploreZoom();
  });
  exploreButton.addEventListener('pointerleave', () => { exploreHovered = false; syncExploreZoom(); });
  exploreButton.addEventListener('focus', () => { exploreFocused = true; syncExploreZoom(); });
  exploreButton.addEventListener('blur', () => { exploreFocused = false; syncExploreZoom(); });
  exploreButton.addEventListener('click', event => {
    exploreHovered = false;
    exploreFocused = false;
    syncExploreZoom();
    scrollFromExplore(event);
  });
  reducedMotion.addEventListener('change', syncExploreZoom);

  const timeline = document.querySelector('.timeline');
  const steps = Array.from(document.querySelectorAll('.timeline-step'));
  let geometry;
  let flying;
  let framePending = false;
  let lastIntroProgress = -1;
  let lastTimelineProgress = -1;

  function measureBrand() {
    placeMetalSurface();
    if (!reducedMotion.matches && !flying) {
      flying = document.createElement('div');
      flying.className = 'flying-brand brand-window';
      flying.setAttribute('aria-hidden', 'true');
      flying.innerHTML = sourceB.innerHTML;
      const zoomLayer = document.createElement('div');
      zoomLayer.className = 'flying-brand-zoom';
      zoomLayer.setAttribute('aria-hidden', 'true');
      zoomLayer.append(flying);
      document.body.append(zoomLayer);
      root.classList.add('has-flying-brand');
    }
    // Mede a origem sem incorporar a aproximação temporária da logo.
    const logoCenter = document.querySelector('.intro-center');
    const logoBox = logoCenter.getBoundingClientRect();
    const logoScale = parseFloat(getComputedStyle(logoCenter).scale) || 1;
    const rawFrom = sourceB.getBoundingClientRect();
    const centerX = logoBox.left + logoBox.width / 2;
    const centerY = logoBox.top + logoBox.height / 2;
    const from = {
      left: centerX + (rawFrom.left - centerX) / logoScale,
      top: centerY + (rawFrom.top - centerY) / logoScale,
      width: rawFrom.width / logoScale,
      height: rawFrom.height / logoScale
    };
    const to = targetB.getBoundingClientRect();
    const introTop = intro.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, intro.offsetHeight - window.innerHeight);
    // Todas as medidas são lidas juntas, fora dos quadros de rolagem.
    const timelineBox = timeline.getBoundingClientRect();
    const railBox = timeline.querySelector('.timeline-rail').getBoundingClientRect();
    const vertical = window.matchMedia('(max-width: 760px)').matches;
    const stepPositions = steps.map(step => {
      const dot = step.querySelector('.step-dot').getBoundingClientRect();
      return vertical
        ? (dot.top + dot.height / 2 - railBox.top) / Math.max(1, railBox.height)
        : (dot.left + dot.width / 2 - railBox.left) / Math.max(1, railBox.width);
    });
    geometry = {
      introTop,
      timelineTop: timelineBox.top + window.scrollY,
      timelineHeight: Math.max(1, timelineBox.height),
      stepPositions,
      x: from.left,
      y: from.top + Math.max(0, window.scrollY - introTop - travel),
      width: from.width,
      height: from.height,
      targetX: to.left,
      targetY: to.top,
      targetWidth: to.width,
      targetHeight: to.height,
      viewportHeight: window.innerHeight,
      headerHeight: header.getBoundingClientRect().height,
      travel: travel
    };
    if (flying) {
      flying.style.width = geometry.width + 'px';
      flying.style.height = geometry.height + 'px';
      flying.hidden = reducedMotion.matches;
    }
    root.classList.toggle('has-flying-brand', !reducedMotion.matches);
    lastIntroProgress = -1;
    lastTimelineProgress = -1;
    requestFrame();
  }

  function updateScroll() {
    framePending = false;
    if (!geometry) return;
    const scroll = window.scrollY;
    // O cabeçalho avança sem pausas; somente a frase recebe o tempo de leitura.
    const introScroll = scroll - geometry.introTop;
    const readingHold = Math.min(geometry.viewportHeight * .7, geometry.travel * .5);
    const animationTravel = geometry.travel - readingHold;
    const heldScroll = clamp(introScroll - animationTravel * .74, 0, readingHold);
    const progress = reducedMotion.matches
      ? (scroll > geometry.viewportHeight * 0.65 ? 1 : 0)
      : clamp(introScroll / animationTravel);
    const connectionProgress = reducedMotion.matches
      ? progress : clamp((introScroll - heldScroll) / animationTravel);
    // Continua atualizando a frase mesmo depois que o cabeçalho termina de se transformar.
    updateConnection(connectionProgress);
    // A abertura só é atualizada enquanto seu progresso realmente muda.
    if (progress !== lastIntroProgress) {
      lastIntroProgress = progress;
      if (progress > 0) {
        root.classList.remove('is-intro-exploring');
        finishBrandEntrance();
      }
      const flight = ease(clamp((progress - 0.16) / 0.8));
      metalSurface.style.setProperty('--header-purple-progress', flight.toFixed(4));
      root.classList.toggle('is-morphing', !reducedMotion.matches && progress > 0 && progress < 1);
      const visible = progress > 0.71;
      header.classList.toggle('is-visible', visible);
      header.inert = !visible;
      header.setAttribute('aria-hidden', String(!visible));

      if (!reducedMotion.matches) {
        const surfaceHeight = lerp(geometry.viewportHeight, geometry.headerHeight, flight);
        const shapeScale = lerp(1, 0.62, flight);
        metalSurface.style.setProperty('--metal-surface-height', surfaceHeight.toFixed(3) + 'px');
        metalSurface.style.setProperty('--metal-shape-scale', shapeScale.toFixed(5));
        metalSurface.classList.add('is-ready');
      }
      const docked = !reducedMotion.matches && flight >= 1;
      root.classList.toggle('is-metal-header-docked', docked);
      intro.classList.toggle('intro-finished', docked);

      if (!reducedMotion.matches && flying) {
        const x = lerp(geometry.x, geometry.targetX, flight);
        const y = lerp(geometry.y, geometry.targetY, flight);
        const sx = lerp(1, geometry.targetWidth / geometry.width, flight);
        const sy = lerp(1, geometry.targetHeight / geometry.height, flight);
        flying.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + sx + ',' + sy + ')';
      }
      letters.forEach((letter, index) => {
        const letterProgress = reducedMotion.matches ? 0 : ease(clamp((progress - index * 0.025) / 0.48));
        letter.style.opacity = String(1 - letterProgress);
        letter.style.transform = 'translate3d(' + letterProgress * (15 + index * 10) + 'px,' + -letterProgress * 45 + 'px,0) scale(' + (1 - letterProgress * 0.12) + ')';
      });
      introExtras.forEach(element => {
        element.style.opacity = String(reducedMotion.matches ? 1 : 1 - clamp(progress * 2));
      });

    }

    const timelineProgress = reducedMotion.matches ? 1
      : clamp((geometry.viewportHeight * 0.78 - geometry.timelineTop + scroll) / geometry.timelineHeight);
    if (timelineProgress === lastTimelineProgress) return;
    lastTimelineProgress = timelineProgress;
    timeline.style.setProperty('--timeline-progress', timelineProgress.toFixed(4));
    timeline.classList.toggle('is-complete', timelineProgress >= 1 && !reducedMotion.matches);
    let activeStep = -1;
    const reached = geometry.stepPositions.map((position, index) => {
      const hasReached = timelineProgress >= position;
      if (hasReached) activeStep = index;
      return hasReached;
    });
    steps.forEach((step, index) => {
      step.classList.toggle('is-reached', reached[index]);
      step.classList.toggle('is-current', activeStep === index);
    });
  }
  function requestFrame() {
    if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureBrand, 100);
  }, { passive: true });
  reducedMotion.addEventListener('change', () => { measureBrand(); syncPlayback(); });
  window.addEventListener('pageshow', measureBrand);
  window.addEventListener('load', measureBrand);
  measureBrand();
  entranceImages = [flying?.querySelector('img'), ...letters.map(letter => letter.querySelector('img'))].filter(Boolean);
  if (!reducedMotion.matches && window.scrollY <= geometry.introTop + 1) {
    entrancePending = true;
    entranceImages.forEach(image => { image.style.opacity = '0'; });
  }
  const brandImage = sourceB.querySelector('img');
  const brandReady = brandImage?.decode ? brandImage.decode().catch(() => {}) : Promise.resolve();
  brandReady.then(playBrandEntrance);
  if (document.fonts) document.fonts.ready.then(measureBrand);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal, .workflow-words').forEach(element => observer.observe(element));
    root.classList.add('js-reveal');
  }

  // Faixa contínua: a cópia do primeiro slide torna a volta imperceptível.
  const carousel = document.querySelector('.carousel');
  const track = carousel.querySelector('.slides');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const dots = Array.from(carousel.querySelectorAll('.slide-dot'));
  const pagination = carousel.querySelector('.slide-pagination');
  const paginationHighlight = document.createElement('span');
  paginationHighlight.className = 'pagination-highlight';
  paginationHighlight.setAttribute('aria-hidden', 'true');
  pagination.prepend(paginationHighlight);
  let paginationAnimation = null;
  let hoveredDot = null;
  let lastPaginationX = null;
  function positionPaginationHighlight(animate = true) {
    const keyboardFocus = dots.find(dot => dot === document.activeElement && dot.matches(':focus-visible'));
    const target = hoveredDot || keyboardFocus || dots.find(dot => dot.classList.contains('is-active')) || dots[0];
    const box = target.getBoundingClientRect();
    const origin = pagination.getBoundingClientRect();
    if (!box.width) return;
    const x = box.left - origin.left + (box.width - 28) / 2;
    if (x === lastPaginationX) return;
    const previousBox = paginationHighlight.getBoundingClientRect();
    const fromX = previousBox.left - origin.left;
    const fromWidth = previousBox.width;
    const initialized = lastPaginationX !== null;
    lastPaginationX = x;
    if (paginationAnimation) paginationAnimation.cancel();
    paginationHighlight.style.transform = 'translateX(' + x + 'px)';
    if (animate && initialized && !reducedMotion.matches) {
      const stretchLeft = Math.min(fromX, x);
      const stretchRight = Math.max(fromX + fromWidth, x + 28);
      paginationAnimation = paginationHighlight.animate([
        { transform: 'translateX(' + fromX + 'px) scaleX(' + fromWidth / 28 + ')' },
        { transform: 'translateX(' + stretchLeft + 'px) scaleX(' + (stretchRight - stretchLeft) / 28 + ')', offset: .55 },
        { transform: 'translateX(' + x + 'px) scaleX(1)' }
      ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
    }

  }
  dots.forEach(dot => dot.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hoveredDot = dot;
    positionPaginationHighlight();
  }));
  pagination.addEventListener('pointerleave', () => { hoveredDot = null; positionPaginationHighlight(); });
  pagination.addEventListener('focusin', () => positionPaginationHighlight());
  pagination.addEventListener('focusout', () => requestAnimationFrame(() => positionPaginationHighlight()));
  if ('ResizeObserver' in window) new ResizeObserver(() => positionPaginationHighlight(false)).observe(pagination);

  const pauseButton = carousel.querySelector('.autoplay-toggle');
  const announcement = carousel.querySelector('#carousel-announcement');
  // Uma segunda sequência mantém blocos visíveis nas duas bordas durante a volta.
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    clone.classList.remove('is-active');
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    track.append(clone);
  });
  carousel.classList.add('carousel-continuous');
  const slideDuration = 12000;
  const loopDuration = slideDuration * slides.length;
  let slideStride = 1;
  let centerOffsetTime = 0;
  function measureCarousel() {
    slideStride = track.getBoundingClientRect().width || 1;
    const cardWidth = slides[0].getBoundingClientRect().width;
    centerOffsetTime = (carousel.clientWidth - cardWidth) / 2 / slideStride * slideDuration;
  }
  measureCarousel();
  const motion = track.animate([
    { transform: 'translate3d(0,0,0)' },
    { transform: 'translate3d(-' + slides.length * 100 + '%,0,0)' }
  ], { duration: loopDuration, iterations: Infinity, easing: 'linear' });
  let userPaused = false;
  let inView = !('IntersectionObserver' in window);
  let active = -1;
  let carouselFrame = null;
  let slideSeek = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function currentIndex() {
    const phase = ((Number(motion.currentTime) || 0) % loopDuration + loopDuration) % loopDuration;
    return Math.round((phase + centerOffsetTime) / slideDuration) % slides.length;
  }
  function updateSlideState(manual = false) {
    const index = currentIndex();
    if (index !== active || manual) {
      active = index;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === active);
        slide.setAttribute('aria-hidden', String(i !== active));
        slide.inert = i !== active;
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === active);
        if (i === active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      positionPaginationHighlight();
      if (manual) announcement.textContent = slides[active].getAttribute('aria-label');
    }
  }
  const wrapCarouselTime = time => ((time % loopDuration) + loopDuration) % loopDuration;
  function followCarousel(timestamp) {
    carouselFrame = null;
    if (slideSeek) {
      if (slideSeek.start === null) slideSeek.start = timestamp;
      const progress = clamp((timestamp - slideSeek.start) / 650);
      motion.currentTime = wrapCarouselTime(lerp(slideSeek.from, slideSeek.to, ease(progress)));
      updateSlideState();
      if (progress >= 1) {
        slideSeek = null;
        updateSlideState(true);
        syncPlayback();
        return;
      }
      carouselFrame = requestAnimationFrame(followCarousel);
      return;
    }
    updateSlideState();
    if (motion.playState === 'running') carouselFrame = requestAnimationFrame(followCarousel);
  }
  function syncPlayback() {
    if (slideSeek && (reducedMotion.matches || document.hidden || !inView)) {
      motion.currentTime = wrapCarouselTime(slideSeek.to);
      slideSeek = null;
      updateSlideState(true);
    }
    const playing = !userPaused && inView && !document.hidden && !reducedMotion.matches;
    if (slideSeek) {
      motion.pause();
      if (carouselFrame === null) carouselFrame = requestAnimationFrame(followCarousel);
    } else if (playing) {
      motion.play();
      if (carouselFrame === null) carouselFrame = requestAnimationFrame(followCarousel);
    } else {
      motion.pause();
      if (carouselFrame !== null) cancelAnimationFrame(carouselFrame);
      carouselFrame = null;
    }
    carousel.classList.toggle('is-paused', !playing);
  }
  function selectedSlide() { return slideSeek ? slideSeek.index : currentIndex(); }
  function showSlide(index, direction = 0) {
    const targetIndex = (index % slides.length + slides.length) % slides.length;
    const from = wrapCarouselTime(Number(motion.currentTime) || 0);
    let to = targetIndex * slideDuration - centerOffsetTime;
    if (direction > 0 && to <= from) to += loopDuration;
    else if (direction < 0 && to >= from) to -= loopDuration;
    else if (!direction && Math.abs(to - from) > loopDuration / 2) to += to < from ? loopDuration : -loopDuration;
    if (reducedMotion.matches) {
      slideSeek = null;
      motion.currentTime = wrapCarouselTime(to);
      updateSlideState(true);
    } else {
      slideSeek = { from, to, index: targetIndex, start: null };
    }
    syncPlayback();
  }
  carousel.querySelector('.carousel-prev').addEventListener('click', () => showSlide(selectedSlide() - 1, -1));
  carousel.querySelector('.carousel-next').addEventListener('click', () => showSlide(selectedSlide() + 1, 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  pauseButton.setAttribute('aria-label', 'Pausar movimento do carrossel');
  pauseButton.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseButton.setAttribute('aria-label', userPaused ? 'Retomar movimento do carrossel' : 'Pausar movimento do carrossel');
    pauseButton.firstElementChild.textContent = userPaused ? '▷' : 'Ⅱ';
    syncPlayback();
  });
  // Converte os gestos horizontais do touchpad em deslocamento da faixa.
  if ('ResizeObserver' in window) {
    const carouselResize = new ResizeObserver(measureCarousel);
    carouselResize.observe(track);
    carouselResize.observe(carousel);
  } else {
    window.addEventListener('resize', measureCarousel);
  }
  carousel.addEventListener('wheel', event => {
    if (event.ctrlKey || !event.cancelable) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX : (event.shiftKey && event.deltaX === 0 ? event.deltaY : 0);
    if (!delta || !slideStride) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? slideStride : 1;
    const offset = delta * unit / slideStride * slideDuration;
    const nextTime = (Number(motion.currentTime) || 0) + offset;
    slideSeek = null;
    motion.currentTime = wrapCarouselTime(nextTime);
    updateSlideState();
    syncPlayback();
  }, { passive: false });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(selectedSlide() + 1, 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(selectedSlide() - 1, -1); }
  });
  carousel.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showSlide(selectedSlide() + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0.01 });
    carouselObserver.observe(carousel);
  }
  updateSlideState();
  syncPlayback();

  // O menu das três barras reúne apenas as preferências da apresentação.
  const menu = document.querySelector('#site-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  let menuFrame = null;
  function closeMenu(restoreFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }
  menuToggle.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(true); return; }
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    menu.querySelector('[data-language][aria-pressed="true"]').focus({ preventScroll: true });
  });
  menu.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!menu.contains(document.activeElement) && document.activeElement !== menuToggle) closeMenu();
  }));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); closeMenu(true); }
  });
  window.addEventListener('scroll', () => {
    if (menu.hidden || menuFrame !== null) return;
    menuFrame = requestAnimationFrame(() => {
      menuFrame = null;
      if (header.inert) closeMenu();
    });
  }, { passive: true });

  document.querySelectorAll('.magnetic:not(.nav-cta)').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const box = element.getBoundingClientRect();
      const x = clamp((event.clientX - box.left - box.width / 2) * 0.16, -6, 6);
      const y = clamp((event.clientY - box.top - box.height / 2) * 0.16, -5, 5);
      element.style.transition = 'transform 150ms ease-out';
      element.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    });
    const reset = () => {
      element.style.transition = 'transform 450ms cubic-bezier(.2,.8,.2,1)';
      element.style.transform = '';
    };
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
  });

  // Parallax suave: o deslocamento do ponteiro fica separado da flutuação.
  let metalFrame = null;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let stageVisible = true;
  function moveMetal() {
    metalFrame = null;
    if (!stageVisible || document.hidden || reducedMotion.matches) return;
    mouseX = lerp(mouseX, targetMouseX, 0.085);
    mouseY = lerp(mouseY, targetMouseY, 0.085);
    metalStage.style.setProperty('--pointer-x', mouseX.toFixed(4));
    metalStage.style.setProperty('--pointer-y', mouseY.toFixed(4));
    if (Math.abs(mouseX - targetMouseX) + Math.abs(mouseY - targetMouseY) > 0.001) {
      metalFrame = requestAnimationFrame(moveMetal);
    }
  }
  function requestMetal() {
    if (metalFrame === null && stageVisible && !document.hidden && !reducedMotion.matches) {
      metalFrame = requestAnimationFrame(moveMetal);
    }
  }
  introScene.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = introScene.getBoundingClientRect();
    targetMouseX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    targetMouseY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    requestMetal();
  }, { passive: true });
  introScene.addEventListener('pointerleave', () => {
    targetMouseX = 0; targetMouseY = 0; requestMetal();
  });
  function syncMetal() {
    metalStage.classList.toggle('is-asleep', !stageVisible || document.hidden);
    requestMetal();
  }
  if ('IntersectionObserver' in window) {
    const metalObserver = new IntersectionObserver(entries => {
      stageVisible = entries[0].isIntersecting;
      syncMetal();
    });
    metalObserver.observe(introScene);
  }
  document.addEventListener('visibilitychange', syncMetal);
  reducedMotion.addEventListener('change', () => {
    targetMouseX = 0; targetMouseY = 0; mouseX = 0; mouseY = 0;
    metalStage.style.setProperty('--pointer-x', '0');
    metalStage.style.setProperty('--pointer-y', '0');
    syncMetal();
  });

  document.querySelector('#current-year').textContent = new Date().getFullYear();
})();


// No rodapé, só o fundo muda; logo, links e informações mantêm o layout original.
(() => {
  const footer = document.querySelector('.footer-color-shift');
  const originalMetal = document.querySelector('.metal-world');
  if (!footer || !originalMetal) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const metal = originalMetal.cloneNode(true);
  metal.classList.remove('intro-background', 'is-asleep');
  metal.classList.add('footer-metal-world');
  metal.style.setProperty('--pointer-x', '0');
  metal.style.setProperty('--pointer-y', '0');
  metal.setAttribute('aria-hidden', 'true');
  metal.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  footer.prepend(metal);
  let geometry = null;
  let lastProgress = -1;
  let scheduled = false;
  let resizeTimer;
  let pointerFrame = null;
  let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0;
  let footerVisible = true;
  function moveFooterMetal() {
    pointerFrame = null;
    if (reduce.matches || document.hidden || !footerVisible) return;
    mouseX += (targetX - mouseX) * .085;
    mouseY += (targetY - mouseY) * .085;
    metal.style.setProperty('--pointer-x', mouseX.toFixed(4));
    metal.style.setProperty('--pointer-y', mouseY.toFixed(4));
    if (Math.abs(targetX - mouseX) + Math.abs(targetY - mouseY) > .001) requestFooterPointer();
  }
  function requestFooterPointer() {
    if (pointerFrame === null && !reduce.matches && footerVisible && !document.hidden) pointerFrame = requestAnimationFrame(moveFooterMetal);
  }
  function resetFooterPointer() {
    if (pointerFrame !== null) cancelAnimationFrame(pointerFrame);
    pointerFrame = null;
    targetX = targetY = mouseX = mouseY = 0;
    metal.style.setProperty('--pointer-x', '0');
    metal.style.setProperty('--pointer-y', '0');
  }
  footer.addEventListener('pointermove', event => {
    if (!geometry || !pointer.matches || reduce.matches) return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - geometry.left) / geometry.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - geometry.top + window.scrollY) / geometry.height * 2 - 1));
    requestFooterPointer();
  }, { passive: true });
  footer.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; requestFooterPointer(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      footerVisible = entries[0].isIntersecting;
      if (!footerVisible) resetFooterPointer();
    }).observe(footer);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetFooterPointer(); });
  function measureFooter() {
    const bounds = footer.getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header').getBoundingClientRect().height;
    geometry = {
      left: bounds.left, top: bounds.top + window.scrollY, width: Math.max(1, bounds.width), height: Math.max(1, bounds.height),
      start: bounds.top + window.scrollY - window.innerHeight,
      travel: Math.max(1, Math.min(bounds.height, window.innerHeight - headerHeight))
    };
    lastProgress = -1;
    updateFooter();
  }
  function updateFooter() {
    scheduled = false;
    if (!geometry) return;
    const raw = reduce.matches ? 1 : Math.max(0, Math.min(1, (window.scrollY - geometry.start) / geometry.travel));
    const progress = raw * raw * (3 - 2 * raw);
    if (progress === lastProgress) return;
    lastProgress = progress;
    footer.style.setProperty('--footer-metal-opacity', progress.toFixed(4));
  }
  function requestFooterFrame() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateFooter); }
  }
  window.addEventListener('scroll', requestFooterFrame, { passive: true });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureFooter, 100);
  }, { passive: true });
  window.addEventListener('load', measureFooter);
  window.addEventListener('pageshow', measureFooter);
  reduce.addEventListener('change', () => { resetFooterPointer(); measureFooter(); });
  if (document.fonts) document.fonts.ready.then(measureFooter);
  footer.querySelector('.footer-wordmark img')?.addEventListener('load', measureFooter);
  measureFooter();
})();
