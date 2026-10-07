import "./GaleriaEdition.css";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import AsNavFor from "../../../components/Slider/Slider";

export const GaleriaEdition = ({ editionText, images, logo }) => {

    return (
        <>
            <Navbar />
            <section className="container-edition-galeria">
                <div className="edition-galeria-left">
                    <img src={logo} alt={`${editionText} logo`}/>
                    <hr />
                    <p>Reviva os <b>melhores momentos</b> do maior congresso de Gestão Tributária na Administração Pública.</p>
                </div>

                <div className="edition-galeria-right">
                    <AsNavFor images={images} />
                </div>
            </section>
            <Footer />
        </>

    )
}
