"use client";

import { Icon } from "../../../../components/Icon/Icon";
import { useRef } from "react";
import "./SectionDepoimentos.css";

export const SectionDepoimentos = ({ data }) => {
  const depoimentos = data.filter((d) => d.type === 3);
  const sliderRef = useRef(null);

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

  const scrollLeft = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: -slideSize, behavior: "smooth" });
  };

  const scrollRight = () => {
    pauseAllVideos();
    sliderRef.current?.scrollBy({ left: slideSize, behavior: "smooth" });
  };

  return (
    <section className="section-depoimentos">
      <div>
        <h3>Depoimentos</h3>
        <h4>
          Veja o que <b>nosso público</b> fala sobre o GTAP
        </h4>
      </div>

      <div className="slider-wrapper">
        <button type="button" className="testimonial-arrow" onClick={scrollLeft} aria-label="Anterior"><Icon name="chevron-left" /></button>

        <div className="slider" ref={sliderRef}>
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

        <button type="button" className="testimonial-arrow" onClick={scrollRight} aria-label="Próximo"><Icon name="chevron-right" /></button>
      </div>
    </section>
  );
};
