import { useEffect, useState } from "react";
import "./ToastConquista.css";

const EVENTO_CONQUISTA = "repairsim:conquista-desbloqueada";
const DURACAO_MS = 4500;

export default function ToastConquista() {
    const [fila, setFila] = useState([]);
    const conquistaAtual = fila[0] || null;

    useEffect(() => {
        function aoDesbloquear(evento) {
            const { codigo, titulo } = evento.detail || {};
            if (!titulo && !codigo) return;

            setFila(prev => [
                ...prev,
                {
                    id: `${Date.now()}-${Math.random()}`,
                    codigo,
                    titulo: titulo || codigo
                }
            ]);
        }

        window.addEventListener(EVENTO_CONQUISTA, aoDesbloquear);
        return () => window.removeEventListener(EVENTO_CONQUISTA, aoDesbloquear);
    }, []);

    useEffect(() => {
        if (!conquistaAtual) return;

        const timer = window.setTimeout(() => {
            setFila(prev => prev.slice(1));
        }, DURACAO_MS);

        return () => window.clearTimeout(timer);
    }, [conquistaAtual]);

    if (!conquistaAtual) return null;

    return (
        <div className="toast-conquista-wrapper" role="status" aria-live="polite">
            <div className="toast-conquista-card">
                <div className="toast-conquista-icone">🏆</div>
                <div className="toast-conquista-texto">
                    <span className="toast-conquista-label">Conquista desbloqueada</span>
                    <strong className="toast-conquista-titulo">{conquistaAtual.titulo}</strong>
                </div>
            </div>
        </div>
    );
}