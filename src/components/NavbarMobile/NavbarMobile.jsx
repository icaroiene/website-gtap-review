"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OPEN_URL } from "../../data/links";
import { lockScroll, unlockScroll } from "../../motion/scrollLock";
import "./NavbarMobile.css";

// Duração da saída do menu (casa com gtap-navmobile-*-out no CSS).
const EXIT_MS = 180;

export const NavbarMobile = () => {
    // closed → open → closing → closed. Fechado, o menu nem é renderizado
    // (os ícones da lista só são baixados ao abrir).
    const [menuState, setMenuState] = useState("closed");
    const menuOpen = menuState === "open";
    const toggleRef = useRef(null);
    const lockedRef = useRef(false);

    const releaseScroll = useCallback(() => {
        if (!lockedRef.current) return;
        lockedRef.current = false;
        unlockScroll();
    }, []);

    const openMenu = () => {
        if (!lockedRef.current) {
            lockedRef.current = true;
            lockScroll();
        }
        setMenuState("open");
    };

    // Destrava a rolagem na hora (antes de qualquer navegação) e toca a saída.
    const closeMenu = useCallback((restoreFocus) => {
        releaseScroll();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setMenuState((state) => (state === "closed" || reduceMotion ? "closed" : "closing"));
        if (restoreFocus) toggleRef.current?.focus({ preventScroll: true });
    }, [releaseScroll]);

    // Fim da animação de saída: desmonta o menu.
    useEffect(() => {
        if (menuState !== "closing") return;
        const timer = window.setTimeout(() => setMenuState("closed"), EXIT_MS);
        return () => window.clearTimeout(timer);
    }, [menuState]);

    // Aberto: Esc fecha; se a tela passar para desktop (menu some com display:none), fecha na hora.
    useEffect(() => {
        if (!menuOpen) return;
        const mobile = window.matchMedia("(max-width: 768px)");
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            closeMenu(true);
        };
        const onViewportChange = () => {
            if (mobile.matches) return;
            releaseScroll();
            setMenuState("closed");
        };
        document.addEventListener("keydown", onKeyDown);
        mobile.addEventListener("change", onViewportChange);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            mobile.removeEventListener("change", onViewportChange);
        };
    }, [menuOpen, closeMenu, releaseScroll]);

    // Nunca deixar a página travada se o componente desmontar com o menu aberto.
    useEffect(() => releaseScroll, [releaseScroll]);

    return (
        <header className="navbar">
            <nav className="navbar-container" aria-label="Navegação principal">
                <div className="navbar-header">
                    <h1 className="navbar-logo">
                        <a href="/">
                            <img src="/logo.svg" alt="logo do site" />
                        </a>
                    </h1>
                    <button
                        ref={toggleRef}
                        className="menu-toggle"
                        type="button"
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={menuOpen}
                        onClick={() => (menuOpen ? closeMenu(true) : openMenu())}
                    >
                        <span className="menu-burger" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </span>
                    </button>
                </div>
            </nav>

            {menuState !== "closed" && (
                <div
                    className={`navbar-dialog${menuState === "closing" ? " navbar-dialog--closing" : ""}`}
                    onClick={() => closeMenu(true)}
                >
                    <ul className="navbar-dialog-content" onClick={(e) => e.stopPropagation()}>
                        <li><img alt="icon" src="/assets/icons/bookicon.svg"/><a href="/#temas" onClick={() => closeMenu(false)}>Temas</a></li>
                        <li><img alt="icon" src="/assets/icons/peopleicon.svg"/><a href="/#palestrantes" onClick={() => closeMenu(false)}>Palestrantes</a></li>
                        <li><img alt="icon" src="/assets/icons/photoicon.svg"/><a href="/galeria/" onClick={() => closeMenu(false)}>Galeria</a></li>
                        <li><img alt="icon" src="/assets/icons/contacticon.svg"/><a href="/#localizacao" onClick={() => closeMenu(false)}>Localização</a></li>
                        {/* <li><img alt="icon" src="/assets/icons/caricon.svg"/><a href="/#preços" onClick={() => closeMenu(false)}>Preços</a></li> */}
                        {/* Abre em nova aba: a página continua aqui, então o foco volta ao botão. */}
                        <li><img alt="icon" src="/assets/icons/openmini.svg"/><a href={OPEN_URL} target="_blank" rel="noopener noreferrer" onClick={() => closeMenu(true)}>A Open<span className="sr-only"> (abre em nova aba)</span></a></li>
                    </ul>
                </div>
            )}
        </header>

    );
};
