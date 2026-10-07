// Entradas por scroll. Contrato (CSS em src/styles/global.css):
// - Marque elementos com data-reveal (ou data-reveal="fade|scale|left|right|pop|line").
// - Stagger: data-reveal-stagger no pai, ou --i no CSS do componente.
// - Conteúdo é visível por padrão. Só o que está abaixo da dobra no primeiro
//   aviso do IntersectionObserver vira "pending" (escondido) e depois "in".
//   Nada que já foi pintado na tela é escondido ou re-animado (protege o LCP).
const SELECTOR = '[data-reveal]';
const BELOW_FOLD = 1.1;

export function startReveal() {
  if (!('IntersectionObserver' in window)) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const pending = new Set();
  let frame = 0;

  const show = (el) => {
    pending.delete(el);
    observer.unobserve(el);
    el.setAttribute('data-reveal-state', 'in');
  };

  const revealAll = () => pending.forEach(show);
  // Na impressão o layout é feito na hora: pula direto para o estado final.
  const revealForPrint = () => pending.forEach((el) => {
    show(el);
    el.setAttribute('data-reveal-state', 'done');
  });

  // Elementos colados no fim da página podem nunca cruzar a margem inferior.
  const checkBottom = () => {
    frame = 0;
    const root = document.documentElement;
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) revealAll();
    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(checkBottom);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (pending.has(el)) {
          if (entry.isIntersecting) show(el);
          continue;
        }
        // Primeiro aviso: classificar sem forçar layout (rect vem do observer).
        const { top, left, right } = entry.boundingClientRect;
        const offscreenSideways = left >= window.innerWidth || right <= 0;
        if (entry.isIntersecting || top < window.innerHeight * BELOW_FOLD || offscreenSideways) {
          observer.unobserve(el);
          continue;
        }
        pending.add(el);
        el.setAttribute('data-reveal-state', 'pending');
      }
      if (pending.size) window.addEventListener('scroll', onScroll, { passive: true });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  // Ao fim da animação o elemento volta ao estilo normal (sem animation ativa).
  const onAnimationEnd = (event) => {
    const el = event.target;
    if (el.getAttribute?.('data-reveal-state') === 'in' && event.animationName.startsWith('gtap-reveal')) {
      el.setAttribute('data-reveal-state', 'done');
    }
  };

  document.querySelectorAll(SELECTOR).forEach((el) => {
    if (!el.hasAttribute('data-reveal-state')) observer.observe(el);
  });
  document.addEventListener('animationend', onAnimationEnd);
  window.addEventListener('beforeprint', revealForPrint);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('beforeprint', revealForPrint);
    document.removeEventListener('animationend', onAnimationEnd);
    pending.forEach((el) => el.removeAttribute('data-reveal-state'));
    pending.clear();
  };
}
