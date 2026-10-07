"use client";

import { useRef, useState } from "react";
import ResponsiveImage from "../ResponsiveImage/ResponsiveImage";
import { Icon } from "../Icon/Icon";
import "./Slider.css";

const AsNavFor = ({ images = [] }) => {
  const mainRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPhoto = (index) => {
    if (!images.length || !mainRef.current) return;

    const wrappedIndex = (index + images.length) % images.length;
    mainRef.current.scrollTo({
      left: wrappedIndex * mainRef.current.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setActiveIndex(wrappedIndex);
    thumbnailsRef.current?.children[wrappedIndex]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const syncActivePhoto = () => {
    if (!mainRef.current) return;
    const width = mainRef.current.clientWidth;
    if (!width) return;
    const nextIndex = Math.min(images.length - 1, Math.round(mainRef.current.scrollLeft / width));
    setActiveIndex(nextIndex);
    thumbnailsRef.current?.children[nextIndex]?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
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
          role="region"
          aria-label="Fotos do álbum"
          tabIndex={0}
        >
          {images.map((img, index) => (
            <div className="slider-photo" key={img.id ?? img.url ?? index}>
              <ResponsiveImage
                image={img.image}
                src={img.url}
                alt={`Imagem ${index + 1} do álbum`}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 550px"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="slider-nav" ref={thumbnailsRef} aria-label="Selecionar foto">
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
