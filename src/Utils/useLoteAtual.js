import { useEffect, useState } from "react";

// Essa função é um hook que verifica a data atual e retorna como resultado o lote "presente",
// baseado na lista de lotes (array). Mantive sua estrutura e apenas tratei o caso de cruzar o ano.

// ATUALIZE AQUI se precisar mudar meses de início/fim.
// Interpretei sua regra assim:
// - LOTE 1: R$ 3.690,00 até abril/2026 (começando em out/2025)
// - LOTE 2: R$ 3.990,00 até junho/2026 (maio e junho/2026)
// - LOTE 3: R$ 4.290,00 a partir de julho/2026 (usei jul→dez como padrão)
const lotes = [
  {
    nome: "Primeiro Lote",
    preco: "R$ 3.690,00",
    ano: 2025,
    mesInicio: 10, // OUT/2025
    mesFim: 4,     // ABR/2026 (cruza o ano)
    label: "OUTUBRO/2025 A ABRIL/2026",
  },
  {
    nome: "Segundo Lote",
    preco: "R$ 3.990,00",
    ano: 2026,
    mesInicio: 5, // MAI/2026
    mesFim: 6,    // JUN/2026
    label: "MAIO A JUNHO/2026",
  },
  {
    nome: "Terceiro Lote",
    preco: "R$ 4.290,00",
    ano: 2026,
    mesInicio: 7,  // JUL/2026
    mesFim: 10,    // DEZ/2026 (ajuste se quiser ir além)
    label: "JULHO A OUTUBRO/2026",
  },
];

// Lógica com suporte a intervalos que cruzam o ano (ex.: OUT/2025 → ABR/2026)
const getStatusDoLote = (ano, mesInicio, mesFim, hoje) => {
  if (!hoje) return "futuro";
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const cruzaAno = mesFim < mesInicio;

  if (!cruzaAno) {
    // intervalo dentro do MESMO ano
    if (ano < anoAtual || (ano === anoAtual && mesFim < mesAtual)) return "passado";
    if (ano === anoAtual && mesInicio <= mesAtual && mesFim >= mesAtual) return "presente";
    return "futuro";
  }

  // intervalo CRUZANDO ano (ex.: OUT → ABR do ano seguinte)
  // "ano" é o ano do mesInicio; o fim ocorre em (ano + 1)
  const anoFim = ano + 1;

  // está presente se:
  // - ainda no ano de início e já passou do mesInicio
  // - ou no ano seguinte e ainda não passou do mesFim
  if (
    (ano === anoAtual && mesAtual >= mesInicio) ||
    (anoFim === anoAtual && mesAtual <= mesFim)
  ) {
    return "presente";
  }

  // passado se já passamos do anoFim/mesFim
  if (anoAtual > anoFim || (anoAtual === anoFim && mesAtual > mesFim)) return "passado";

  // senão é futuro
  return "futuro";
};

export const useLoteAtual = () => {
  const [hoje, setHoje] = useState(null);
  useEffect(() => { setHoje(new Date()); }, []);
  const lotesComStatus = lotes.map((lote) => ({
    ...lote,
    status: getStatusDoLote(lote.ano, lote.mesInicio, lote.mesFim, hoje),
  }));

  const loteAtual = lotesComStatus.find((lote) => lote.status === "presente");

  return {
    loteAtual,
    precoAtual: loteAtual?.preco || null,
    nomeLoteAtual: loteAtual?.nome || null,
    lotes: lotesComStatus,
  };
};
