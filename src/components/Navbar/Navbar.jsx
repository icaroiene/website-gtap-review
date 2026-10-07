"use client";

import { useEffect, useState, useRef } from "react";
import { NavbarMobile } from "../NavbarMobile/NavbarMobile";
import "./Navbar.css";

export const Navbar = ({ lightTemplate }) => {
  const [renderNav, setRenderNav] = useState(true);
  const lastDirection = useRef(null);

  useEffect(() => {
    const handleScroll = (event) => {
      if (window.matchMedia('(max-width: 768px)').matches) return;
      const direction = event.deltaY > 0 ? 'down' : 'up';
      if (direction !== lastDirection.current) {
        lastDirection.current = direction;
        setRenderNav(direction !== 'down');
      }
    };
    window.addEventListener('wheel', handleScroll, { passive: true });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  // Versão desktop com renderNav
  return (
    <>
      <div className="navigation-mobile"><NavbarMobile lightTemplate={lightTemplate} /></div>
      <div className="navigation-desktop">
      {renderNav && (
        <header className={lightTemplate ? "navbar-light" : "navbar"}>
          <nav className="navbar-container" aria-label="Navegação principal">
            <h1 className="navbar-logo">
              <a href="/">
                {lightTemplate ? (
                  <img src="/logo-gtap.svg" alt="logo gtap" />
                ) : (
                  <img src="/logo.svg" alt="logo do site" />
                )}
              </a>
            </h1>
            <ul className="navbar-links">
              <li><a href="/#temas">TEMAS</a></li>
              <li><a href="/#palestrantes">PALESTRANTES</a></li>
              <li><a href="/galeria">GALERIA</a></li>
              <li><a href="/#preços">PREÇOS</a></li>
              <li><a href="/open-solucoes-tributarias">A OPEN</a></li>
              <li><a href="/#contato">CONTATO</a></li>
            </ul>
          </nav>
        </header>
      )}
      </div>
    </>
  );
};
