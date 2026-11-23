import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Estrelas from "../../components/Estrelas";
import { useJogo } from "../../context/JogoContext";
import "./resultado.css";

function Resultado() {
  const navigate = useNavigate();
    const { jogatina } = useJogo();

    //marca o body só enquanto esta tela está aberta (o CSS global do resultado foi limitado a esta classe)
    useEffect(() => {
        document.body.classList.add("tela-resultado");
        return () => document.body.classList.remove("tela-resultado");
    }, []);


    function formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${String(minutos).padStart(2, "0")}:${String(
            segundosRestantes
        ).padStart(2, "0")}`;
    }


    //caso tentem acessar resultado sem terminar uma jogatina
    if (!jogatina.finalizada) {
        return (
            <main className="resultado">
                <div className="resultado-container">
                    <h1>Nenhum resultado disponível.</h1>
                    <button className="btn-principal"
                    onClick={() => navigate("/Dificuldade")}>
                        VOLTAR
                    </button>
                </div>
            </main>
        );

    }


  return (
    <main className="resultado">
      <div className="resultado-container">

        <header className="resultado-header">
          <div className="resultado-icon"></div>

          <h1>Resultado</h1>

          <p>
            Confira o resultado da sua simulação
          </p>
        </header>

        <section className="pontuacao">
          <span>Pontuação final</span>

          <strong>{jogatina.pontos}</strong>

        
        </section>

        {jogatina.estrelas !== null && jogatina.estrelas !== undefined && (
          <section className="pontuacao">
            <span>Avaliação</span>

            <strong><Estrelas valor={jogatina.estrelas} tamanho="2rem" /></strong>
          </section>
        )}

        <section className="resultado-cards">

          <div className="resultado-card">
            <span></span>

            <p>Dificuldade</p>

            <strong>
              {jogatina.dificuldade}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Desafios</p>

            <strong>
              {jogatina.quantidadeCasos}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Erros nos desafios</p>

            <strong>
              {jogatina.errosDesafio}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Erros nos relatórios</p>

            <strong>
              {jogatina.errosRelatorio}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Tempo total</p>

            <strong>
              {formatarTempo(jogatina.tempoSegundos)}
            </strong> 
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Finalizada em</p>

            <strong>
              {jogatina.dataFinalizacao ? new Date(jogatina.dataFinalizacao).toLocaleDateString("pt-BR") : "-"}
            </strong>
          </div>

        </section>

        {jogatina.teste && (
          <p className="resultado-aviso">
            Partida de teste do professor: ela não é salva no histórico.
          </p>
        )}

        {!jogatina.salvo && !jogatina.teste && (
          <p className="resultado-aviso">
            Esta partida não foi salva no histórico. Faça login para registrar seus resultados.
          </p>
        )}
        
        <footer className="resultado-footer">

          <button className="btn-secundario" onClick={() => navigate("/Dificuldade")}>
            NOVO JOGO
          </button>
               <button className="btn-principal" onClick={() => navigate("/")}>
            INÍCIO
          </button>
        </footer>
      </div>
    </main>
  );
}

export default Resultado;