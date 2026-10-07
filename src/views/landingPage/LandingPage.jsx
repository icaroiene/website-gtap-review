import { getMedia, withMedia } from "../../data/media";
import gallery from "../../../public/api/galeria.json";
import { BannerSection } from "../../components/Banner/Banner";
import { Navbar } from "../../components/Navbar/Navbar";
import { SectionAtuacao } from "./Sections/SectionAtuacao/SectionAtuacao";
import { SectionDepoimentos } from "./Sections/SectionDepoimentos/SectionDepoimentos";
import { SectionForms } from "./Sections/SectionForms/SectionForms";
import { SectionGaleria } from "./Sections/SectionGaleria/SectionGaleria";
import { SectionLocal } from "./Sections/SectionLocal/SectionLocal";
import { SectionPalestrantes } from "./Sections/SectionPalestrantes/SectionPalestrantes";
import { SectionPublico } from "./Sections/SectionPublico/SectionPublico";
import { SectionTemas } from "./Sections/SectionTemas/SectionTemas";
import { CardButton } from "../../components/CardButton/CardButton";
import { SectionIdealizador } from "./Sections/SectionIdealizador/SectionIdealizador";
import { Footer } from "../../components/Footer/Footer";
import { SectionInvestimento } from "./Sections/SectionInvestimentos/SectionInvestimento";

export const LandingPage = ({ data, poster }) => {
  return (
    <>
      <Navbar />
      <CardButton />
      <BannerSection data={data.filter((item) => item.type === 6)} poster={poster} />
      <SectionAtuacao localImages={{ image1: getMedia("src/assets/image1.webp"), image2: getMedia("src/assets/image-mobile.webp") }} />
      <SectionTemas data={data.filter((item) => item.type === 1)} />
      <SectionIdealizador localImages={{ ImageAlexandre: getMedia("src/assets/alexandre.webp") }} />
      <SectionPalestrantes data={data.filter((item) => item.type === 0)} />
      <SectionGaleria images={withMedia(gallery, "imageUrl")} />
      <SectionPublico data={data.filter((item) => item.type === 2)} />
      <SectionDepoimentos data={data.filter((item) => item.type === 3)} />
      <SectionInvestimento />
      <SectionLocal data={data.filter((item) => item.type === 7)} />
      <SectionForms />
      <Footer />
    </>
  );
};
