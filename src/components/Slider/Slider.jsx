"use client";

import { useRef, useState } from "react";
import ResponsiveImage from "../ResponsiveImage/ResponsiveImage";
import { Icon } from "../Icon/Icon";
import "./Slider.css";

const scrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const AsNavFor = ({ images = [] }) => {
  const mainRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const frameRef = useRef(0);
  const activeIndexRef = useRef(0);
  // Foto pedida por seta/miniatura enquanto a rolagem suave ainda está a caminho:
  // as fotos intermediárias não viram "ativas" no meio do trajeto.
  const targetIndexRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Rola só a faixa de miniaturas, na horizontal, centralizando a ativa
  // (scrollIntoView podia rolar a página inteira e brigar com o Lenis).
  const centerThumbnail = (index) => {
    const strip = thumbnailsRef.current;
    const thumbnail = strip?.children[index];
    if (!thumbnail) return;
    strip.scrollTo({
      left: thumbnail.offsetLeft - (strip.clientWidth - thumbnail.offsetWidth) / 2,
      behavior: scrollBehavior(),
    });
  };

  const selectPhoto = (index) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    centerThumbnail(index);
  };

  const goToPhoto = (index) => {
    if (!images.length || !mainRef.current) return;

    const wrappedIndex = (index + images.length) % images.length;
    targetIndexRef.current = wrappedIndex;
    mainRef.current.scrollTo({
      left: wrappedIndex * mainRef.current.clientWidth,
      behavior: scrollBehavior(),
    });
    selectPhoto(wrappedIndex);
  };

  // Toque, trackpad ou teclado no trilho: o usuário assumiu, esquece o destino pendente.
  const releaseTarget = () => {
    targetIndexRef.current = null;
  };

  // No máximo uma leitura por quadro, e só atualiza quando a foto muda de fato.
  const syncActivePhoto = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const track = mainRef.current;
      const width = track?.clientWidth;
      if (!width) return;
      const nextIndex = Math.min(images.length - 1, Math.round(track.scrollLeft / width));
      if (targetIndexRef.current !== null) {
        if (nextIndex === targetIndexRef.current) targetIndexRef.current = null;
        return;
      }
      if (nextIndex !== activeIndexRef.current) selectPhoto(nextIndex);
    });
  };

  return (
    <div className="slider-container">
      <div className="slider-for-wrap">
        {images.length > 1 && (
          <>
            <button
              className="slider-arrow slider-arrow-prev"
              type="button"
              aria-label="Ver foto anterior"
              onClick={() => goToPhoto(activeIndex - 1)}
            >
              <Icon name="chevron-left" style={{ fontSize: "30px", color: "#fff" }} />
            </button>
            <button
              className="slider-arrow slider-arrow-next"
              type="button"
              aria-label="Ver próxima foto"
              onClick={() => goToPhoto(activeIndex + 1)}
            >
              <Icon name="chevron-right" style={{ fontSize: "30px", color: "#fff" }} />
            </button>
          </>
        )}
        <div
          className="slider-for"
          ref={mainRef}
          onScroll={syncActivePhoto}
          onPointerDown={releaseTarget}
          onWheel={releaseTarget}
          onKeyDown={releaseTarget}
          role="region"
          aria-label="Fotos do álbum"
          tabIndex={0}
          data-lenis-prevent-horizontal
        >
          {images.map((img, index) => (
            <div className="slider-photo" key={img.id ?? img.url ?? index}>
              <ResponsiveImage
                image={img.image}
                src={img.url}
                alt={`Imagem ${index + 1} do álbum`}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                sizes="(max-width: 768px) 100vw, 550px"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <p className="slider-counter" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Foto </span>
            <span className="slider-counter-current" key={activeIndex}>{activeIndex + 1}</span>
            <span aria-hidden="true"> / </span>
            <span className="sr-only"> de </span>
            {images.length}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="slider-nav"
          ref={thumbnailsRef}
          aria-label="Selecionar foto"
          data-enter
          data-lenis-prevent-horizontal
        >
          {images.map((img, index) => (
            <button
              className={`slider-thumbnail${index === activeIndex ? " is-active" : ""}`}
              key={img.id ?? img.url ?? index}
              type="button"
              aria-label={`Selecionar imagem ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goToPhoto(index)}
            >
              <ResponsiveImage
                image={img.image}
                src={img.url}
                alt=""
                loading="lazy"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsNavFor;
