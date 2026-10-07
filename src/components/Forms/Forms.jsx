"use client";

import { useState } from "react";
import "./Forms.css";

export const Forms = () => {

const [isSend, isSetSend] = useState(false);

const handleSubmit = async (e) => {
  console.log('submissão clicada')

  const form = e.currentTarget;

  e.preventDefault();
  isSetSend(true); //desativa botao

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
      alert("❌ Não foi possível enviar informações, tente novamente");
      console.log('erro ao enviar informações', response.status)
      return;
    } else {
      alert("✅ Dados salvos e e-mail enviado!");
       //limpando dados após envio
      form.reset();
    }

  } catch (error) {
    console.error("❌ Erro ao processar:", error);
  } finally {
    isSetSend(false);
  }
};

//os dados são recebidos no arquivo .php que salva no banco de dados mySQl e envia o valor recebido para o e-mails lsitado no form-handler

  return (
    <div className="container-forms">
      <div className="container-forms-left">
        <p>
          Preencha o formulário abaixo e fale com nossa equipe para saber mais
          sobre o evento.
        </p>
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          id="contactForm"
        >
          <div className="form-input">
            <label htmlFor="name">Nome *</label>
            <input
              id="name"
              autoComplete="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              aria-label="name"
              required
            />
          </div>
          <div className="form-input">
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
          <div className="form-input">
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
          <div className="form-input">
            <button type="submit" disabled={isSend}>{isSend ? "ENVIANDO..." : "QUERO INFORMAÇÕES"}</button>
          </div>
        </form>
      </div>

      <div className="container-forms-right"></div>
    </div>
  );
};
