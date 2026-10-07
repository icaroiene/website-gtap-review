"use client";

import { useRef } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./CarouselEmpresas.css";

export const CarouselEmpresas = ({ clientes = [] }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (!carouselRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carouselRef.current.scrollBy({
      left: direction * carouselRef.current.clientWidth * 0.8,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section className="container-empresas-open-slide" aria-label="Empresas parceiras">
      <div className="section-empresas-open">
        <div className="empresas-carousel-controls" aria-label="Controles das empresas">
          <button type="button" onClick={() => scroll(-1)} aria-label="Ver empresas anteriores">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Ver próximas empresas">
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div
          className="empresas-carousel"
          ref={carouselRef}
          role="region"
          aria-label="Logotipos das empresas parceiras"
          tabIndex={0}
        >
          {clientes.map((cliente) => (
            <div key={cliente.id} className="logo-slide">
              <ResponsiveImage
                image={cliente.image}
                src={cliente.mediaUrl}
                loading="lazy"
                alt={`Cliente ${cliente.title ?? ""}`.trim()}
                sizes="(max-width: 768px) 70px, 120px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
