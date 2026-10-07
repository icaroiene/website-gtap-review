"use client";

import { Icon } from "../Icon/Icon";
import { useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "../../motion/scrollLock";
import "./ModalPalestrante.css";

// Tempo da saída (mesmo valor da animação gtap-modal-saida, com folga).
const DURACAO_SAIDA_MS = 170;

const REDES_SOCIAIS = [
    { campo: "instagram", icone: "instagram", nome: "Instagram" },
    { campo: "youtube", icone: "youtube", nome: "YouTube" },
    { campo: "linkedin", icone: "linkedin-in", nome: "LinkedIn" },
];

export const ModalPalestrantes = ({ palestrantes, selecionado, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, palestrantes.findIndex((person) => person.id === selecionado.id)));
    // Direção da última troca (anima o conteúdo só depois de navegar, não na abertura).
    const [direcao, setDirecao] = useState(null);
    const [fechando, setFechando] = useState(false);
    const dialogRef = useRef(null);
    const fechadoRef = useRef(false);
    const travadoRef = useRef(false);
    const saidaRef = useRef(0);
    const cliqueNoFundoRef = useRef(false);

    // Define o índice com base no palestrante clicado
    useEffect(() => {
        const index = palestrantes.findIndex(p => p.id === selecionado.id);
        if (index !== -1) setCurrentIndex(index);
    }, [selecionado, palestrantes]);

    // Abre o dialog após montar e trava a rolagem da página por trás
    useEffect(() => {
        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }
        lockScroll();
        travadoRef.current = true;

        return () => {
            window.clearTimeout(saidaRef.current);
            if (travadoRef.current) {
                travadoRef.current = false;
                unlockScroll();
            }
        };
    }, []);

    const current = palestrantes[currentIndex];

    const next = () => {
        setDirecao("proximo");
        setCurrentIndex((prev) => (prev + 1) % palestrantes.length);
    };
    const prev = () => {
        setDirecao("anterior");
        setCurrentIndex((prev) =>
            prev === 0 ? palestrantes.length - 1 : prev - 1
        );
    };

    // Fecha de fato (uma única vez): dialog nativo, trava de rolagem e aviso ao pai.
    const finalizar = () => {
        if (fechadoRef.current) return;
        fechadoRef.current = true;
        window.clearTimeout(saidaRef.current);
        if (dialogRef.current?.open) dialogRef.current.close();
        if (travadoRef.current) {
            travadoRef.current = false;
            unlockScroll();
        }
        onClose();
    };

    // Pedido de fechamento (✕, fundo, Esc): saída curta e depois finalizar.
    const fecharModal = () => {
        if (fechadoRef.current || fechando) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            finalizar();
            return;
        }
        setFechando(true);
        saidaRef.current = window.setTimeout(finalizar, DURACAO_SAIDA_MS);
    };

    // Esc: segura o fechamento nativo para tocar a saída.
    const aoCancelar = (event) => {
        event.preventDefault();
        fecharModal();
    };

    // Clique no fundo (fora do conteúdo): o alvo é o próprio <dialog>.
    const aoPressionar = (event) => {
        cliqueNoFundoRef.current = event.target === event.currentTarget;
    };
    const aoClicar = (event) => {
        if (cliqueNoFundoRef.current && event.target === event.currentTarget) fecharModal();
        cliqueNoFundoRef.current = false;
    };

    // Setas do teclado navegam entre palestrantes
    const aoTeclar = (event) => {
        if (fechando || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            prev();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
        }
    };

    return (

        <dialog
            className={`modal-dialog${fechando ? " is-fechando" : ""}`}
            ref={dialogRef}
            data-direcao={direcao || undefined}
            data-lenis-prevent
            onClose={finalizar}
            onCancel={aoCancelar}
            onPointerDown={aoPressionar}
            onClick={aoClicar}
            onKeyDown={aoTeclar}
        >
            <button type="button" className="nav-arrow nav-left" onClick={prev} aria-label="Palestrante anterior"><Icon name="chevron-left"  /></button>
            <div className="modal-structure">
                <div className="modal-photo" key={`foto-${currentIndex}`} style={{ backgroundImage: `url(${current?.image?.src || current?.mediaUrl})` }}>

                </div>
                <button type="button" className="close" onClick={fecharModal} aria-label="Fechar">✕</button>
                <div className="modal-box">
                    {/* key pelo índice: o texto remonta e toca a troca; o rodapé (links) fica, preservando o foco */}
                    <div className="modal-texto" key={`titulo-${currentIndex}`}>
                        <h2>{current.title}</h2>
                        <h4>{current.description}</h4>
                    </div>
                    <div className="modal-texto" key={`bio-${currentIndex}`}>
                        <p>{current.annotation}</p>
                    </div>
                    <div className="footer-modal">
                        {REDES_SOCIAIS.map(({ campo, icone, nome }) => current[campo] && (
                            <a key={campo} className="link-social" href={current[campo]} target="_blank" rel="noopener noreferrer" aria-label={nome}>
                                <span className="iconbutton-social">
                                    <Icon name={icone}  />
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <button type="button" className="nav-arrow nav-right" onClick={next} aria-label="Próximo palestrante"><Icon name="chevron-right"  /></button>
        </dialog>

    );
};
