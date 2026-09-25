"use strict";
(() => {
  const progress = document.querySelector('#reading-progress');
  const links = [...document.querySelectorAll('.folio-index a')];
  const sections = links.map(link => document.querySelector(link.hash));
  let scheduled = false;

  function updateReadingPosition() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= innerHeight * .35) current = index;
    });
    links.forEach((link, index) => {
      link.classList.toggle('is-current', index === current);
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateReadingPosition);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('projectsrendered', schedule);
  updateReadingPosition();

  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const observed = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (Site.motion.matches) return;
      const delay = Number(entry.target.dataset.folioOrder || 0) * 65;
      entry.target.animate([
        { opacity: .35, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 620, delay, easing: 'cubic-bezier(.2,.75,.3,1)' });
    });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });

  function observeCards() {
    document.querySelectorAll('.project-entry, .activity-row').forEach((card, index) => {
      if (observed.has(card)) return;
      observed.add(card);
      card.dataset.folioOrder = String(index % 3);
      observer.observe(card);
    });
  }
  observeCards();
  document.addEventListener('projectsrendered', observeCards);
})();
