import { attachLenis } from './scrollLock';

// Rolagem com inércia (Lenis), como no website-gtap, mas só onde faz diferença:
// desktop com mouse/trackpad. Toque continua 100% nativo e o pacote nem é baixado.
// Carregado sob demanda (chunk separado), depois do load + idle.
const IDLE_FRAMES = 30;

function canSmooth() {
  const mq = (query) => window.matchMedia(query).matches;
  return !mq('(prefers-reduced-motion: reduce)') && mq('(hover: hover) and (pointer: fine)') && !mq('(any-pointer: coarse)');
}

export function startSmoothScroll() {
  if (!canSmooth()) return () => {};

  let lenis = null;
  let cancelled = false;
  let rafId = 0;
  let idle = 0;

  // rAF só enquanto há rolagem; para sozinho depois de ~0,5 s parado.
  const loop = (time) => {
    lenis.raf(time);
    idle = lenis.isScrolling ? 0 : idle + 1;
    rafId = idle > IDLE_FRAMES ? 0 : requestAnimationFrame(loop);
  };
  const kick = () => {
    idle = 0;
    if (rafId || !lenis) return;
    lenis.time = 0; // evita salto: primeiro quadro após pausa tem deltaTime 0
    rafId = requestAnimationFrame(loop);
  };

  // Âncoras da mesma página (/#temas, #preços): Lenis anima respeitando scroll-padding-top.
  const onClick = (event) => {
    // detail 0 = ativado pelo teclado: a navegação nativa move o foco para a seção.
    if (!lenis || event.defaultPrevented || event.button !== 0 || event.detail === 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href*="#"]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (url.hash !== window.location.hash) window.history.pushState(null, '', url.hash);
    kick();
    lenis.scrollTo(target, { duration: 1.1 });
  };

  import('lenis').then(({ default: Lenis }) => {
    if (cancelled) return;
    lenis = new Lenis({
      lerp: 0.12,
      autoRaf: false,
      prevent: (node) => node.nodeName === 'DIALOG',
    });
    attachLenis(lenis);
    window.addEventListener('wheel', kick, { passive: true });
    document.addEventListener('click', onClick);
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('wheel', kick);
    document.removeEventListener('click', onClick);
    attachLenis(null);
    lenis?.destroy();
  };
}
