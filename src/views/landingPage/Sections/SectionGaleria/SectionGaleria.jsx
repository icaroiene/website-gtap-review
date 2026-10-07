"use client";

import { Icon } from "../../../../components/Icon/Icon";
import { useEffect, useState, useRef } from "react";
import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import "./SectionGaleria.css";

const IMAGES_VISIBLE = 6;
const INTERVAL_MS = 5000;
// Crossfade: 700 ms por card + 80 ms de cascata entre eles (ver SectionGaleria.css).
const TROCA_MS = 700 + 80 * (IMAGES_VISIBLE - 1) + 100;
// Se a decodificação travar (rede lenta), troca assim mesmo depois disso.
const DECODE_LIMITE_MS = 3000;

export const SectionGaleria = ({ images }) => {
  const sectionRef = useRef(null);
  const proximoRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: "300px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  const [startIndex, setStartIndex] = useState(0);
  // Grupo que vai entrar: fica empilhado sobre o atual (mesma célula do grid, sem mudar altura).
  const [nextIndex, setNextIndex] = useState(null);
  const [trocando, setTrocando] = useState(false);
  // Pausa enquanto o mouse está sobre a seção ou o foco está dentro dela.
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const pausado = hover || foco;

  // 1) A cada 5 s, monta o próximo grupo (ainda invisível).
  useEffect(() => {
    if (!nearViewport || pausado || nextIndex !== null || images.length <= IMAGES_VISIBLE) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeout = setTimeout(() => {
      setNextIndex((startIndex + IMAGES_VISIBLE) % images.length); // avança um grupo
    }, INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [images.length, nearViewport, pausado, nextIndex, startIndex]);

  // 2) Só começa o fade depois que as imagens do próximo grupo estão decodificadas.
  useEffect(() => {
    if (nextIndex === null || trocando || pausado || !nearViewport) return;

    let cancelado = false;
    let limite;
    const imgs = [...(proximoRef.current?.querySelectorAll("img") ?? [])];
    Promise.race([
      Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
      new Promise((resolve) => { limite = setTimeout(resolve, DECODE_LIMITE_MS); }),
    ]).then(() => {
      if (!cancelado) setTrocando(true);
    });

    return () => { cancelado = true; clearTimeout(limite); };
  }, [nextIndex, trocando, pausado, nearViewport]);

  // 3) Fim do crossfade: o grupo novo vira o atual e o antigo sai do DOM.
  useEffect(() => {
    if (!trocando) return;

    const timeout = setTimeout(() => {
      setStartIndex(nextIndex);
      setNextIndex(null);
      setTrocando(false);
    }, TROCA_MS);

    return () => clearTimeout(timeout);
  }, [trocando, nextIndex]);

  const getVisibleImages = (inicio) => {
    const visibleImages = [];
    for (let i = 0; i < Math.min(IMAGES_VISIBLE, images.length); i++) {
      const index = (inicio + i) % images.length;
      if (images[index]) visibleImages.push(images[index]);
    }
    return visibleImages;
  };

  const renderGrupo = (inicio, loading) =>
    getVisibleImages(inicio).map((img) => (
      <div className="card-imagens" key={img.id}>
        <ResponsiveImage image={img.image} src={img.imageUrl} alt="Registro de uma edição do GTAP" sizes="(max-width: 768px) 45vw, 240px" loading={loading} />
      </div>
    ));

  const aoEntrarPonteiro = (event) => {
    if (event.pointerType !== "touch") setHover(true);
  };
  const aoSairPonteiro = (event) => {
    if (event.pointerType !== "touch") setHover(false);
  };
  const aoSairFoco = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFoco(false);
  };

  return (
    <section
      ref={sectionRef}
      className="section-galeria"
      id="galeria"
      onPointerEnter={aoEntrarPonteiro}
      onPointerLeave={aoSairPonteiro}
      onFocus={() => setFoco(true)}
      onBlur={aoSairFoco}
    >
       <h3 className="title-galeria-mobile" data-reveal>Galeria</h3>
      <div className="section-galeria-left" data-reveal="scale">
        <div
          className={`galeria-grupo${trocando ? " is-saindo" : ""}`}
          key={`grupo-${startIndex}`}
          aria-hidden={trocando || undefined}
        >
          {renderGrupo(startIndex, "lazy")}
        </div>
        {nextIndex !== null && (
          <div
            className={`galeria-grupo ${trocando ? "is-entrando" : "is-preparando"}`}
            key={`grupo-${nextIndex}`}
            ref={proximoRef}
            aria-hidden={!trocando || undefined}
          >
            {renderGrupo(nextIndex, "eager")}
          </div>
        )}
      </div>
      <div className="section-galeria-right" data-reveal-stagger>
        <h3 data-reveal>Galeria</h3>
        <h5 data-reveal>Acompanhe de perto o que o GTAP tem realizado nos últimos anos.</h5>
        <a href="/galeria/" className="galeria-cta" data-reveal>
          <Icon name="camera"  />ACESSE A GALERIA
        </a>
      </div>
    </section>
  );
};
