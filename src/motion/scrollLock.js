// Trava de rolagem compartilhada (menu mobile, modal). Contagem de referências:
// só destrava quando todos os que travaram liberarem. Se o Lenis estiver
// ativo (desktop), ele também é pausado.
let locks = 0;
let lenis = null;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  document.documentElement.setAttribute('data-scroll-locked', '');
  lenis?.stop();
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  document.documentElement.removeAttribute('data-scroll-locked');
  lenis?.start();
}

export function attachLenis(instance) {
  lenis = instance;
  if (instance && locks > 0) instance.stop();
}
