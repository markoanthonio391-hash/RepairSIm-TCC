import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./VisualizadorImagem.module.css";

// Mostra uma imagem ampliada por cima da tela.
// Props: src (url da imagem), alt, closeLabel (texto do botão) e onClose (função que fecha).
function VisualizadorImagem({ src, alt, closeLabel = "VOLTAR", onClose }) {

    // Fecha com a tecla Esc.
    // IMPORTANTE: todo hook precisa vir ANTES de qualquer "return" condicional.
    useEffect(() => {
        function aoPressionar(evento) {
            if (evento.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", aoPressionar);

        return () => window.removeEventListener("keydown", aoPressionar);
    }, [onClose]);

    if (!src) {
        return null;
    }

    // createPortal desenha o modal direto no <body>, então nenhum "overflow"
    // ou "transform" dos elementos de cima da tela consegue cortá-lo.
    return createPortal(
        <div className={styles.fundo} onClick={onClose} role="presentation">
            <div
                className={styles.conteudo}
                role="dialog"
                aria-modal="true"
                onClick={(evento) => evento.stopPropagation()}
            >
                <img src={src} alt={alt} className={styles.imagem} />

                <button type="button" className={styles.botao} onClick={onClose}>
                    {closeLabel}
                </button>
            </div>
        </div>,
        document.body
    );
}

export default VisualizadorImagem;
