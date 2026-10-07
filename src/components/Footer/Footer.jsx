import "./Footer.css";

export const Footer = () => {

  return (
    <footer className="container-footer">
      <div className="content-logo">
        <p>Realização</p>
        <img src="/logoopen.svg" alt="logo-open" loading="lazy" width="600"
          height="400" />
        <p className="adress-open">R. Frederico Simões, 125 - SL 401<br />
          Edf. Liz Empresarial  - Caminho das Árvores<br />
          Salvador/ BA <br />CEP 41820-774</p>
      </div>
      <div className="content-text-footer">
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
      <div className="content-menu-footer">
        <p><a href="/">X GTAP</a></p>
        <ul>
          <li><a href="/#temas">Temas</a></li>
          <li><a href="/#palestrantes">Palestrantes</a></li>
          <li><a href="/galeria">Galeria</a></li>
          <li><a href="/#preços">Preços</a></li>
          <li><a href="/open-solucoes-tributarias">A Open</a></li>
          <li><a href="/#contato">Contato</a></li>
        </ul>
      </div>
    </footer>
  );
};
