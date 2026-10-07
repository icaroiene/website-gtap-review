"use client";

import { useState } from "react";
import "./Forms.css";

// Retorno do envio, mostrado abaixo do botão (região aria-live, no lugar do alert()).
const FEEDBACK = {
  success: "Recebemos seus dados! Em breve entraremos em contato.",
  error: "Não foi possível enviar agora. Tente novamente em instantes.",
};

export const Forms = () => {

const [isSend, isSetSend] = useState(false);
const [feedback, setFeedback] = useState(null); // null | "success" | "error"

const handleSubmit = async (e) => {

  const form = e.currentTarget;

  e.preventDefault();
  isSetSend(true); //desativa botao
  setFeedback(null); //limpa a mensagem anterior para a nova ser anunciada e animada

  const name = e.target.name.value;
  const email = e.target.email.value;
  const whatsapp = e.target.tel.value;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('whatsapp', whatsapp);


  try {
    const response = await fetch("https://gtap.com.br/form-handler.php", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      // Se o status HTTP não for 200-299
      setFeedback("error");
      console.log('erro ao enviar informações', response.status)
      return;
    } else {
      setFeedback("success");
       //limpando dados após envio
      form.reset();
    }

  } catch (error) {
    console.error("❌ Erro ao processar:", error);
    setFeedback("error"); //falha de rede também avisa o usuário
  } finally {
    isSetSend(false);
  }
};

//os dados são recebidos no arquivo .php que salva no banco de dados mySQl e envia o valor recebido para o e-mails lsitado no form-handler

  return (
    <div className="container-forms" data-reveal="scale">
      <div className="container-forms-left">
        <p data-reveal>
          Preencha o formulário abaixo e fale com nossa equipe para saber mais
          sobre o evento.
        </p>
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          id="contactForm"
          data-reveal-stagger
        >
          <div className="form-input" data-reveal>
            <label htmlFor="name">Nome *</label>
            <input
              id="name"
              autoComplete="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              required
            />
          </div>
          <div className="form-input" data-reveal>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              autoComplete="email"
              name="email"
              type="email"
              placeholder="Seu e-mail"
              required
            />
          </div>
          <div className="form-input" data-reveal>
            <label htmlFor="tel">WhatsApp *</label>
            <input
              id="tel"
              autoComplete="tel"
              name="tel"
              type="tel"
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          <div className="form-input" data-reveal>
            <button type="submit" disabled={isSend}>
              {isSend && <span className="form-spinner" aria-hidden="true" />}
              {isSend ? "ENVIANDO..." : "QUERO INFORMAÇÕES"}
            </button>
          </div>
          {/* Região sempre montada: o leitor de tela anuncia quando o texto muda. */}
          <p className="form-status" role="status" aria-live="polite">
            {feedback && (
              <span className={`form-status-message form-status-${feedback}`}>
                {FEEDBACK[feedback]}
              </span>
            )}
          </p>
        </form>
      </div>

      <div className="container-forms-right" data-reveal="right"></div>
    </div>
  );
};
