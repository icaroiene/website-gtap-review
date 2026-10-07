import ResponsiveImage from "../../../../components/ResponsiveImage/ResponsiveImage";
import { Icon } from "../../../../components/Icon/Icon";
import "./SectionAtuacao.css";
import image1 from "../../../../assets/image1.webp";
import image2 from "../../../../assets/image-mobile.webp";

export const SectionAtuacao = ({ localImages = {} }) => {
  return (
    <section className="section-atuacao">
      <div className="left">
        <h2 className="text-title">
          O único congresso do país sobre <b>Gestão Tributária</b> voltado
          exclusivamente para a <b>Administração Pública</b> e <b>Sistema S</b>.
          <hr className="mobile-hr-display" />
          <div className="data-section-mobile">
            <h3>
              <Icon name="calendar"  />08 e 09 de Outubro de 2026
            </h3>
            <h3>
              <Icon name="location-dot"  />Salvador/BA
            </h3>
          </div>
          <div className="image-mobile-phone">
            <ResponsiveImage image={localImages.image2} sizes="(max-width: 768px) 90vw, 600px" src={image2.src} width={image2.width} height={image2.height} alt="banner evento gtap" loading="lazy" />
          </div>
        </h2>
        <div>
          <hr />
        </div>
        <div className="data-section">
          <h3>
            <Icon name="calendar"  />08 e 09 de Outubro de 2026
          </h3>
          <h3>
            <Icon name="location-dot"  />Salvador/BA
          </h3>
        </div>
      </div>
      <div className="right">
        <ResponsiveImage image={localImages.image1} sizes="(max-width: 768px) 90vw, 600px" src={image1.src} width={image1.width} height={image1.height} alt="banner evento gtap" loading="lazy" />
      </div>
      <div className="bottom">
        <div className="container-box">
          <h3>Confira as áreas de atuação do público-alvo</h3>
          <h4>
            Quem lida com os desafios tributários da administração pública marca
            presença no X GTAP.
          </h4>
          <div className="container-tags">
            <span>Recursos Humanos</span>
            <span>Gestão Orçamentária</span>
            <span>Licitações e Contratos</span>
            <span>Gestão Contábil</span>
            <span>Controle Interno</span>
            <span>Financeiro</span>
            <span>Jurídica</span>
            <span>Fiscal</span>
          </div>
        </div>
      </div>
    </section>
  );
};
