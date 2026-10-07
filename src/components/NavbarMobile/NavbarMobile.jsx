"use client";

import { Icon } from "../Icon/Icon";
import { useState } from "react";
import "./NavbarMobile.css";

export const NavbarMobile = ({ lightTemplate }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className={lightTemplate ? "navbar-light" : "navbar"}>
            <nav className="navbar-container" aria-label="Navegação principal">
                <div className="navbar-header">
                    <h1 className="navbar-logo">
                        <a href="/">
                            {lightTemplate ? (
                                <img src="/logo-gtap.svg" alt="logo gtap" loading='' />
                            ) : (
                                <img src="/logo.svg" alt="logo do site" />
                            )}
                        </a>
                    </h1>
                    <button
                        className="menu-toggle"
                        type="button"
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <Icon name="bars"  />
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="navbar-dialog" onClick={() => setMenuOpen(false)}>
                    <ul className="navbar-dialog-content" onClick={(e) => e.stopPropagation()}>
                        <li><img alt="icon" src="/assets/icons/bookicon.svg"/><a href="/#temas" onClick={() => setMenuOpen(false)}>Temas</a></li>
                        <li><img alt="icon" src="/assets/icons/peopleicon.svg"/><a href="/#palestrantes" onClick={() => setMenuOpen(false)}>Palestrantes</a></li>
                        <li><img alt="icon" src="/assets/icons/photoicon.svg"/><a href="/galeria" onClick={() => setMenuOpen(false)}>Galeria</a></li>
                        <li><img alt="icon" src="/assets/icons/contacticon.svg"/><a href="/#contato" onClick={() => setMenuOpen(false)}>Localização</a></li>
                        {/* <li><img alt="icon" src="/assets/icons/caricon.svg"/><a href="/#preços" onClick={() => setMenuOpen(false)}>Preços</a></li> */}
                        <li><img alt="icon" src="/assets/icons/openmini.svg"/><a href="/open-solucoes-tributarias" onClick={() => setMenuOpen(false)}>A Open</a></li>
                    </ul>
                </div>
            )}
        </header>

    );
};
