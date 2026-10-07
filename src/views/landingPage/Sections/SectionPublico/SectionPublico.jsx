"use client";

import { useRef } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./SectionPublico.css";

export const SectionPublico = ({ data = [] }) => {
  const carouselRef = useRef(null);
  const clientes = data.filter((cliente) => cliente.type === 2);

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
        <h3>Grandes entidades públicas marcaram presença.</h3>
      </div>
      <div>
        <h5>
          Evento reuniu representantes de destaque para discutir soluções
          inovadoras e fortalecer parcerias institucionais.
        </h5>
      </div>

      <div className="container-publico">
        <div className="publico-carousel-controls" aria-label="Controles das entidades">
          <button type="button" onClick={() => scroll(-1)} aria-label="Ver entidades anteriores">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Ver próximas entidades">
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div
          className="publico-carousel"
          ref={carouselRef}
          role="region"
          aria-label="Entidades públicas participantes"
          tabIndex={0}
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
