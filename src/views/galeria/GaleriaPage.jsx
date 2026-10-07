import "./GaleriaPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

const images = [
    {
        id: 0,
        url: "https://gtap.com.br/midias/cards/gtap%20i.webp",
        text: "I GTAP",
    },
    {
        id: 1,
        url: "https://gtap.com.br/midias/cards/gtap%20ii.webp",
        text: "II GTAP",
    },
    {
        id: 2,
        url: "https://gtap.com.br/midias/cards/gtap%20iii.webp",
        text: "III GTAP",
    },
    {
        id: 3,
        url: "https://gtap.com.br/midias/cards/gtap%20iv.webp",
        text: "IV GTAP",
    },
    {
        id: 4,
        url: "https://gtap.com.br/midias/cards/gtap%20v.webp",
        text: "V GTAP",
    },
    {
        id: 5,
        url: "https://gtap.com.br/midias/cards/gtap%20vi.webp",
        text: "VI GTAP",
    },
    {
        id: 6,
        url: "https://gtap.com.br/midias/cards/gtap%20vii.webp",
        text: "VII GTAP",
    },
    {
        id: 7,
        url: "https://gtap.com.br/midias/cards/gtap%20viii.webp",
        text: "VIII GTAP",
    },
    {
        id: 8,
        url: "https://gtap.com.br/midias/cards/gtap%20ix.webp",
        text: "IX GTAP",
    }
];


export const GaleriaPage = () => {

    return (
        <>
            <Navbar />
            <section className="container-banner-galeria">
                <div className="content-text-galeria-banner">
                    <div className="div-text-galeria">
                        <h5 data-enter>IX GTAP</h5>
                        <p data-enter>A melhor edição de todos os tempos</p>
                    </div>
                    <div className="div-button-galeria-banner">
                        <a className="galeria-banner-cta" href="/IX%20GTAP/" data-enter>Acessar álbum completo</a>
                    </div>
                </div>
            </section>
            <section className="container-card-gtaps">
                <h3 data-reveal>Confira as fotos das edições passadas</h3>
                <div className="content-card-gtaps">
                    {images.slice().reverse().map((image) => (
                        <a
                            className="card-gtap"
                            href={`/${encodeURIComponent(image.text)}/`}
                            data-reveal="scale"
                            key={image.id}
                            style={{backgroundImage: `url(${image.url})`}}
                        >
                            <p>{image.text}</p>
                        </a>
                    ))}
                </div>
            </section>
            <Footer />
        </>
    )
}
