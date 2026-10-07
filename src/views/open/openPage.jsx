import { getMedia } from "../../data/media";
import "./OpenPage.css"
import { Navbar } from "../../components/Navbar/Navbar";
import { SectionOpen } from "./sections/SectionOpen/SectionOpen";
import { SectionAbout } from "./sections/SectionAbout/SectionAbout";
import { Footer } from "../../components/Footer/Footer";
import { CarouselEmpresas } from "./sections/Carousel/CarouselEmpresas";

export const OpenPage = ({ data }) => {
  const clientesEmpresas = data.filter((cliente) => cliente.type === 2 || cliente.type === 5);

    return (
        <>
            <Navbar lightTemplate />
            <SectionOpen localImages={Object.fromEntries([["image1", "image-escritorio"], ["image2", "image-alexandre"], ["image3", "image-equipe"], ["image4", "image-apresentacao"], ["image5", "image-debate"], ["image6", "image-livro"], ["imageMobile", "group-image-open"]].map(([key, filename]) => [key, getMedia(`src/assets/open/${filename}.webp`)]))} />
            <CarouselEmpresas clientes={clientesEmpresas} />
            <SectionAbout />
            <Footer />
        </>
    )
}
