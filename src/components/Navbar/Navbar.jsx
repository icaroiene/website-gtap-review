"use client";

import { useEffect, useState, useRef } from "react";
import { NavbarMobile } from "../NavbarMobile/NavbarMobile";
import { MotionRuntime } from "../MotionRuntime/MotionRuntime";
import { OPEN_URL } from "../../data/links";
import "./Navbar.css";

// Até aqui (px do topo) o header fica sempre visível e transparente.
const TOP_ZONE = 80;
// Rolagem mínima na mesma direção antes de esconder/mostrar (evita tremer).
const HYSTERESIS = 24;

// Foco de teclado dentro do header: não esconder (ele ficaria inert com o foco dentro).
function hasKeyboardFocus(header) {
  const active = document.activeElement;
  if (!header || !active || !header.contains(active)) return false;
  try {
    return active.matches(":focus-visible");
  } catch {
    return true;
  }
}

export const Navbar = () => {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    const mobile = window.matchMedia("(max-width: 768px)");
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // No mobile o header desktop está em display:none.
      if (mobile.matches) {
        lastY = y;
        setHidden(false);
        return;
      }
      setScrolled(y > TOP_ZONE);
      if (y < TOP_ZONE) {
        lastY = y;
        setHidden(false);
        return;
      }
      if (Math.abs(y - lastY) < HYSTERESIS) return;
      const goingDown = y > lastY;
      lastY = y;
      if (!goingDown) setHidden(false);
      else if (!hasKeyboardFocus(header)) setHidden(true);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Versão desktop: sempre montada; esconde ao rolar para baixo (transform) e
  // volta ao rolar para cima. Escondida fica inert (fora do Tab e do leitor de tela).
  const headerClass = `navbar${hidden ? " navbar--hidden" : ""}${scrolled ? " navbar--scrolled" : ""}`;

  return (
    <>
      <MotionRuntime />
      <div className="navigation-mobile"><NavbarMobile /></div>
      <div className="navigation-desktop">
        <header ref={headerRef} className={headerClass} inert={hidden}>
          <nav className="navbar-container" aria-label="Navegação principal">
            <h1 className="navbar-logo">
              <a href="/">
                <img src="/logo.svg" alt="logo do site" />
              </a>
            </h1>
            <ul className="navbar-links">
              <li><a href="/#temas">TEMAS</a></li>
              <li><a href="/#palestrantes">PALESTRANTES</a></li>
              <li><a href="/galeria/">GALERIA</a></li>
              <li><a href="/#preços">PREÇOS</a></li>
              <li>
                <a href={OPEN_URL} target="_blank" rel="noopener noreferrer">
                  A OPEN<span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
              <li><a href="/#contato">CONTATO</a></li>
            </ul>
          </nav>
        </header>
      </div>
    </>
  );
};
