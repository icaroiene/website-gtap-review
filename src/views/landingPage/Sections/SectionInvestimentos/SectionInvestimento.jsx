"use client";

import { Icon } from "../../../../components/Icon/Icon";
import "./SectionInvestimento.css";
import { useLoteAtual } from "../../../../Utils/useLoteAtual";

export const SectionInvestimento = () => {
  const { lotes } = useLoteAtual();

  return (
    <section className="investimento-container" id="preços">
      <div className="investimento-title">
        <h3>
          Valor do <b>investimento</b> por participante
        </h3>
      </div>

      <div className="container-lotes">
        {lotes.map((lote, index) => (
          <div
            key={index}
            className={`card-lote ${lote.status}`}
            style={{
              background:
                lote.status === "presente"
                  ? undefined // aplica o CSS padrão
                  : lote.status === "passado"
                  ? "#010B5B"
                  : "#fff",

                  filter: lote.status === "passado" ? "blur(4px)" : "none",
                  userSelect: lote.status === "passado" ? "none" : null,
            }}
            
          >
            <p className="name-lote">{lote.nome}</p>
            <div className="container-border">
              <div className="border-recort"></div>
              <div className="border-recort-right"></div>
            </div>
            <hr className="linea" />
            <p className="valor-lote">{lote.preco}</p>
            <p>{lote.label}</p>
          </div>
        ))}
      </div>
      <div className="container-button-investimento">
        <a
          href="https://api.whatsapp.com/send/?phone=5571992084907&text=Quero%20informa%C3%A7%C3%A3o%20sobre%20o%20GTAP&type=phone_number&app_absent=0
"
          target="blank"
        >
          <button>
            <Icon name="user"  style={{ color: "#000d74" }} />Confira
            condições especiais para grupo
          </button>
        </a>
      </div>
    </section>
  );
};
