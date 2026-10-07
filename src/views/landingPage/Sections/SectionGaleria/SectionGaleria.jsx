"use client";

import { Icon } from "../../../../components/Icon/Icon";
import { useEffect, useState, useRef } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./SectionGaleria.css";

const IMAGES_VISIBLE = 6;
const INTERVAL_MS = 5000;

export const SectionGaleria = ({ images }) => {
  const sectionRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: "300px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  const [startIndex, setStartIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!nearViewport || images.length <= IMAGES_VISIBLE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let fadeTimeout;
    const interval = setInterval(() => {
      setVisible(false); // inicia fade-out

      fadeTimeout = setTimeout(() => {
        setStartIndex((prev) => (prev + 6) % images.length); // avança 1 posição
        setVisible(true); // aplica fade-in
      }, 800);
    }, INTERVAL_MS);

    return () => { clearInterval(interval); clearTimeout(fadeTimeout); };
  }, [images.length, nearViewport]);

  const getVisibleImages = () => {
    const visibleImages = [];
    for (let i = 0; i < Math.min(IMAGES_VISIBLE, images.length); i++) {
      const index = (startIndex + i) % images.length;
      if (images[index]) visibleImages.push(images[index]);
    }
    return visibleImages;
  };

  const currentGroup = getVisibleImages();

  return (
    <section ref={sectionRef} className="section-galeria" id="galeria">
       <h3 className="title-galeria-mobile">Galeria</h3>
      <div className="section-galeria-left">
        {currentGroup.map((img, index) => (
          <div
            className={`card-imagens ${visible ? "fade-in" : ""}`}
            key={img.id}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ResponsiveImage image={img.image} src={img.imageUrl} alt="Registro de uma edição do GTAP" sizes="(max-width: 768px) 45vw, 240px" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="section-galeria-right">
        <h3>Galeria</h3>
        <h5>Acompanhe de perto o que o GTAP tem realizado nos últimos anos.</h5>
        <a href="/galeria">
          <button>
            <Icon name="camera"  />ACESSE A GALERIA
          </button>
        </a>
      </div>
    </section>
  );
};
