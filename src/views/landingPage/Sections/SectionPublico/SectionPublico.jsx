"use client";

import { useEffect, useRef, useState } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./SectionPublico.css";

export const SectionPublico = ({ data = [] }) => {
  const carouselRef = useRef(null);
  const [bordas, setBordas] = useState({ inicio: true, fim: false });
  const clientes = data.filter((cliente) => cliente.type === 2);

  // Início/fim do carrossel sem ler scrollLeft: observa o primeiro e o último card.
  useEffect(() => {
    const carousel = carouselRef.current;
    const primeiro = carousel?.firstElementChild;
    const ultimo = carousel?.lastElementChild;
    if (!primeiro || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        setBordas((atual) => {
          let { inicio, fim } = atual;
          entries.forEach((entry) => {
            const inteiro = entry.intersectionRatio >= 0.95;
            if (entry.target === primeiro) inicio = inteiro;
            if (entry.target === ultimo) fim = inteiro;
          });
          return inicio === atual.inicio && fim === atual.fim ? atual : { inicio, fim };
        });
      },
      { root: carousel, threshold: 0.95 },
    );
    observer.observe(primeiro);
    observer.observe(ultimo);
    return () => observer.disconnect();
  }, [clientes.length]);

  const scroll = (direction) => {
    if (!carouselRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carouselRef.current.scrollBy({
      left: direction * carouselRef.current.clientWidth * 0.8,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section className="section-publico">
      <div>
        <h3 data-reveal>Grandes entidades públicas marcaram presença.</h3>
      </div>
      <div>
        <h5 data-reveal>
          Evento reuniu representantes de destaque para discutir soluções
          inovadoras e fortalecer parcerias institucionais.
        </h5>
      </div>

      <div className="container-publico">
        <div className="publico-carousel-controls" aria-label="Controles das entidades" data-reveal="fade">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Ver entidades anteriores"
            aria-disabled={bordas.inicio}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Ver próximas entidades"
            aria-disabled={bordas.fim}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div
          className="publico-carousel"
          ref={carouselRef}
          role="region"
          aria-label="Entidades públicas participantes"
          tabIndex={0}
          data-reveal
          data-lenis-prevent-horizontal
          data-inicio={bordas.inicio || undefined}
          data-fim={bordas.fim || undefined}
        >
          {clientes.map((cliente) => (
            <div key={cliente.id} className="card-publico">
              <ResponsiveImage
                image={cliente.image}
                src={cliente.mediaUrl}
                alt={`Cliente ${cliente.title ?? ""}`.trim()}
                loading="lazy"
                sizes="(max-width: 480px) 120px, 150px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
