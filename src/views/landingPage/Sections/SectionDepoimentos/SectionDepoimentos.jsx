"use client";

import { Icon } from "../../../../components/Icon/Icon";
import { useEffect, useRef, useState } from "react";
import "./SectionDepoimentos.css";

export const SectionDepoimentos = ({ data }) => {
  const depoimentos = data.filter((d) => d.type === 3);
  const sliderRef = useRef(null);
  const [bordas, setBordas] = useState({ inicio: true, fim: false });

  // Início/fim do slider sem ler scrollLeft: observa o primeiro e o último card.
  useEffect(() => {
    const slider = sliderRef.current;
    const primeiro = slider?.firstElementChild;
    const ultimo = slider?.lastElementChild;
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
      { root: slider, threshold: 0.95 },
    );
    observer.observe(primeiro);
    observer.observe(ultimo);
    return () => observer.disconnect();
  }, [depoimentos.length]);

  const cardWidth = 330;
  const cardsPerSlide = 1;
  const slideSize = cardWidth * cardsPerSlide;

  const pauseAllVideos = () => {
    if (!sliderRef.current) return;
    const vids = sliderRef.current.querySelectorAll("video");
    vids.forEach(v => {
      try { v.pause(); } catch { /* Video may already be stopped. */ }
    });
  };

  const scrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const scrollLeft = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: -slideSize, behavior: scrollBehavior() });
  };

  const scrollRight = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: slideSize, behavior: scrollBehavior() });
  };

  return (
    <section className="section-depoimentos">
      <div>
        <h3 data-reveal>Depoimentos</h3>
        <h4 data-reveal>
          Veja o que <b>nosso público</b> fala sobre o GTAP
        </h4>
      </div>

      <div className="slider-wrapper" data-reveal>
        <button type="button" className="testimonial-arrow testimonial-arrow-prev" onClick={scrollLeft} aria-label="Anterior" aria-disabled={bordas.inicio}><Icon name="chevron-left" /></button>

        <div className="slider" ref={sliderRef} data-lenis-prevent-horizontal>
          {depoimentos.map((depoimento, index) => (
            <div
              className="depoimento-card"
              key={depoimento.id}
              style={index % 2 !== 0 ? { marginTop: 30 } : {}}
            >
              <div className="video-container">
                <video
                  controls
                  playsInline
                  preload="none"
                  width="300"
                  // poster={depoimento.posterUrl ?? undefined} // se tiver
                  style={{ borderRadius: 10, width: "100%", height: "100%", display: "block" }}
                  onPlay={(e) => {
                    // pausa outros vídeos quando um começar
                    const me = e.currentTarget;
                    sliderRef.current
                      ?.querySelectorAll("video")
                      .forEach(v => { if (v !== me) v.pause(); });
                  }}
                >
                  <source src={depoimento.mediaUrl} type="video/mp4" />
                  Seu navegador não suporta vídeo HTML5.
                </video>
              </div>

              <h6>{depoimento.title}</h6>
              <p>{depoimento.description}</p>
              <p>{depoimento.annotation}</p>
            </div>
          ))}
        </div>

        <button type="button" className="testimonial-arrow testimonial-arrow-next" onClick={scrollRight} aria-label="Próximo" aria-disabled={bordas.fim}><Icon name="chevron-right" /></button>
      </div>
    </section>
  );
};
