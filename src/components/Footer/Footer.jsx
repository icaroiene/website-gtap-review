import { OPEN_URL } from "../../data/links";
import "./Footer.css";

export const Footer = () => {

  return (
    <footer className="container-footer" data-reveal-stagger>
      <div className="content-logo" data-reveal>
        <p>Realização</p>
        <a
          className="content-logo-link"
          href={OPEN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Soluções Tributárias (abre em nova aba)"
        >
          <img src="/logoopen.svg" alt="logo-open" loading="lazy" width="252"
            height="94" />
        </a>
        <p className="adress-open">R. Frederico Simões, 125 - SL 401<br />
          Edf. Liz Empresarial  - Caminho das Árvores<br />
          Salvador/ BA <br />CEP 41820-774</p>
      </div>
      <div className="content-text-footer" data-reveal>
        <p>
          Único congresso brasileiro focado na gestão tributária da
          Administração Pública e do Sistema S, o GTAP reúne especialistas de
          todo o país para discutir desafios atuais e apresentar soluções
          inovadoras. <br />
          <br />
          Em um ambiente inspirador, o evento impulsiona o intercâmbio de
          conhecimento e a busca contínua pela excelência na gestão tributária
          pública. <br />
          <br />
          Consolidado como referência nacional, o GTAP reforça a importância da
          atualização constante diante das rápidas transformações do setor.
        </p>
      </div>
      <div className="content-menu-footer" data-reveal>
        <p><a href="/">X GTAP</a></p>
        <ul>
          <li><a href="/#temas">Temas</a></li>
          <li><a href="/#palestrantes">Palestrantes</a></li>
          <li><a href="/galeria/">Galeria</a></li>
          <li><a href="/#preços">Preços</a></li>
          <li>
            <a href={OPEN_URL} target="_blank" rel="noopener noreferrer">
              A Open<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </li>
          <li><a href="/#contato">Contato</a></li>
        </ul>
      </div>
    </footer>
  );
};
