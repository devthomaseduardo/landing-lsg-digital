const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = reducedMotionQuery.matches;

document.documentElement.classList.add('motion-enabled');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Fechar' : 'Menu';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
    });
  });
}

const splitHeroTitle = () => {
  const title = document.querySelector('.hero h1');
  if (!title || reducedMotion || title.dataset.motionSplit === 'true') return;

  const text = title.textContent.trim();
  const words = text.split(/\s+/);
  const fragment = document.createDocumentFragment();

  title.setAttribute('aria-label', text);
  title.dataset.motionSplit = 'true';
  title.textContent = '';

  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'motion-word';
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--word-index', String(index));
    span.textContent = word;
    fragment.appendChild(span);

    if (index < words.length - 1) {
      fragment.appendChild(document.createTextNode(' '));
    }
  });

  title.appendChild(fragment);
};

const setRevealStagger = (selector, step = 80) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${index * step}ms`);
  });
};

setRevealStagger('.service-row.reveal', 70);
setRevealStagger('.testimonial.reveal', 90);
splitHeroTitle();

const reveals = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -7% 0px',
  });

  reveals.forEach((element) => revealObserver.observe(element));
}

const sections = document.querySelectorAll('main section');

if (reducedMotion || !('IntersectionObserver' in window)) {
  sections.forEach((section) => section.classList.add('is-section-visible'));
} else {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-section-visible');
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -12% 0px',
  });

  sections.forEach((section) => sectionObserver.observe(section));
}

const parseCounter = (element) => {
  const raw = element.dataset.counterValue || element.textContent.trim();
  const match = raw.match(/^([+]?)(\d+(?:[.,]\d+)?)([A-Za-z%]*)$/);

  if (!match) return null;

  const decimalPart = match[2].match(/[.,](\d+)$/);

  return {
    raw,
    prefix: match[1],
    value: Number(match[2].replace(',', '.')),
    suffix: match[3],
    decimals: decimalPart ? decimalPart[1].length : 0,
  };
};

const animateCounter = (element, duration = 1250) => {
  if (!element || element.dataset.counted === 'true') return;

  const parsed = parseCounter(element);
  if (!parsed) return;

  element.dataset.counterValue = parsed.raw;
  element.dataset.counted = 'true';

  if (reducedMotion) {
    element.textContent = parsed.raw;
    return;
  }

  const start = performance.now();
  const formatter = (value) => {
    const number = parsed.decimals > 0
      ? value.toFixed(parsed.decimals).replace('.', ',')
      : Math.round(value).toString();

    return `${parsed.prefix}${number}${parsed.suffix}`;
  };

  const frame = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = formatter(parsed.value * eased);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = parsed.raw;
    }
  };

  requestAnimationFrame(frame);
};

const metricRows = document.querySelectorAll('.metric');

if (reducedMotion || !('IntersectionObserver' in window)) {
  metricRows.forEach((metric) => {
    metric.classList.add('is-metric-visible');
    animateCounter(metric.querySelector('strong'));
  });
} else {
  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-metric-visible');
      animateCounter(entry.target.querySelector('strong'));
      metricObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.45,
  });

  metricRows.forEach((metric) => metricObserver.observe(metric));
}

const enterHero = () => {
  const heroCopy = document.querySelector('.hero-copy');
  const heroProof = document.querySelector('.hero-proof');
  const heroFoot = document.querySelector('.hero-foot');

  if (reducedMotion) {
    [heroCopy, heroProof, heroFoot].forEach((element) => element?.classList.add('is-entered'));
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroCopy?.classList.add('is-entered');
      heroProof?.classList.add('is-entered');
      heroFoot?.classList.add('is-entered');

      window.setTimeout(() => {
        animateCounter(document.querySelector('.proof-number'), 1450);
        document.querySelectorAll('.proof-list strong').forEach((counter, index) => {
          window.setTimeout(() => animateCounter(counter, 900), index * 110);
        });
      }, 520);
    });
  });
};

enterHero();

const hero = document.querySelector('.hero');
const heroGrid = document.querySelector('.hero-grid');

if (hero && heroGrid && !reducedMotion) {
  let pointerX = 0;
  let pointerY = 0;
  let scrollOffset = 0;
  let rafId = null;

  const renderGrid = () => {
    heroGrid.style.setProperty('--grid-x', `${pointerX}px`);
    heroGrid.style.setProperty('--grid-y', `${pointerY}px`);
    heroGrid.style.setProperty('--grid-scroll', `${scrollOffset}px`);
    rafId = null;
  };

  const requestGridRender = () => {
    if (rafId === null) rafId = requestAnimationFrame(renderGrid);
  };

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    pointerX = x * 16;
    pointerY = y * 12;
    requestGridRender();
  });

  hero.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    requestGridRender();
  });

  window.addEventListener('scroll', () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    scrollOffset = progress * 28;
    requestGridRender();
  }, { passive: true });
}

if (header) {
  let headerRaf = null;

  const syncHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    headerRaf = null;
  };

  const requestHeaderSync = () => {
    if (headerRaf === null) headerRaf = requestAnimationFrame(syncHeader);
  };

  syncHeader();
  window.addEventListener('scroll', requestHeaderSync, { passive: true });
}
