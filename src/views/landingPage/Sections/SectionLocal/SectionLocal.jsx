"use client";

import { useState, useEffect, useRef } from "react";
import imageUndefined from "../../../../assets/faroldabarra.webp";
import "./SectionLocal.css";

export const SectionLocal = ({ data }) => {
  const images = data.filter((item) => item.type === 7);

  const [index, setIndex] = useState(0);
  const [nearViewport, setNearViewport] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: '300px' });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport || images.length < 2) return undefined;
    // Com movimento reduzido o fundo fica parado na primeira imagem.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length, nearViewport]);

  const fundos = (images.length ? images : [undefined]).map(
    (image) => image?.image?.src || image?.mediaUrl || imageUndefined.src,
  );
  // Só a camada ativa e a próxima existem: a seguinte baixa durante a exibição da atual.
  // Com movimento reduzido não há rotação, então só a primeira.
  const [rotates, setRotates] = useState(false);
  useEffect(() => {
    setRotates(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const proxima = (index + 1) % fundos.length;

  return (
    <section className="section-localizacao" id="localizacao" ref={sectionRef}>
      {/* Camadas do fundo: a ativa entra por cima (crossfade) e só existem perto da tela. */}
      {/* Sem JavaScript o observer nunca roda: mostra a primeira imagem, sem rotação.
          Com JavaScript o navegador ignora o noscript (a imagem não é baixada). */}
      <noscript>
        <div className="section-localizacao-fundo" aria-hidden="true">
          <div className="section-localizacao-fundo-camada is-active" style={{ backgroundImage: `url(${fundos[0]})` }} />
        </div>
      </noscript>
      {nearViewport && (
        <div className="section-localizacao-fundo" aria-hidden="true">
          {fundos.map((src, i) => (i === index || (rotates && i === proxima)) && (
            <div
              key={i}
              className={`section-localizacao-fundo-camada${i === index ? " is-active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      )}
      <div className="section-localizacao-left" data-reveal="scale">
        <div className="section-localizacao-mapa">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d87966.15711226991!2d-38.45577891634429!3d-12.99795045296838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7161786a7ffff8b%3A0x2fcfe4b59d0dace1!2sHotel%20Deville%20Prime%20Salvador!5e0!3m2!1spt-BR!2sbr!4v1746561724708!5m2!1spt-BR!2sbr"
            allowFullScreen
            loading="lazy"
            title="Localização do Centro de Convenções Deville Prime, Salvador"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <div className="section-localizacao-right">
        <div className="box-text-local" data-reveal="right">
          <h5>
            Mais uma vez em <br /> <b>Salvador/BA</b>
          </h5>
          <p>
            A cidade que sedia o GTAP já está com local definido para receber
            servidores de todo o Brasil: Centro de Convenções Deville Prime.
          </p>
        </div>
      </div>
    </section>
  );
};
