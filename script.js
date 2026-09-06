const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const cursor = document.querySelector('[data-cursor]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep the navigation legible without doing expensive scroll work.
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Accessible mobile navigation.
const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  mobileMenu.classList.toggle('open', opening);
  mobileMenu.setAttribute('aria-hidden', String(!opening));
  document.body.classList.toggle('menu-open', opening);
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); }, { passive: true });

// Reveal sections once as they enter the viewport.
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
  reveals.forEach((item) => observer.observe(item));
}

// Filter projects while exposing the selected state to assistive technology.
const filterButtons = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    projects.forEach((project) => {
      const visible = filter === 'all' || project.dataset.category === filter;
      project.classList.toggle('filtered-out', !visible);
      if (visible) project.classList.add('visible');
    });
  });
});

// Smooth custom cursor for precise pointers only.
if (window.matchMedia('(pointer: fine)').matches && cursor) {
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  let cursorX = mouseX, cursorY = mouseY;
  window.addEventListener('mousemove', (event) => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
  const followCursor = () => {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) ${cursor.classList.contains('active') ? 'scale(1)' : 'scale(.65)'}`;
    requestAnimationFrame(followCursor);
  };
  followCursor();
  document.querySelectorAll('[data-cursor-label]').forEach((canvas) => {
    canvas.addEventListener('mouseenter', () => { cursor.textContent = canvas.dataset.cursorLabel; cursor.classList.add('active'); });
    canvas.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

// Restrained depth motion on the hero mockup.
const tilt = document.querySelector('[data-tilt]');
if (tilt && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const stage = tilt.parentElement;
  stage.addEventListener('mousemove', (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `rotate(1.8deg) perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  }, { passive: true });
  stage.addEventListener('mouseleave', () => { tilt.style.transform = 'rotate(1.8deg) perspective(900px) rotateY(0) rotateX(0)'; });
}
