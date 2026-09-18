import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import "./resultado.css";

function Resultado() {
  const resultado = {
    dificuldade: "",
    quantidadeDesafios: "",
    errosDesafios: "",
    errosRelatorios: "",
    pontuacaoFinal: "",
    tempoTotal: "",
    dataFinalizada: "",
  };

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

          <strong>{resultado.pontuacaoFinal}</strong>

        
        </section>

        <section className="resultado-cards">

          <div className="resultado-card">
            <span></span>

            <p>Dificuldade</p>

            <strong>
              {resultado.dificuldade}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Desafios</p>

            <strong>
              {resultado.quantidadeDesafios}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Erros nos desafios</p>

            <strong>
              {resultado.errosDesafios}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Erros nos relatórios</p>

            <strong>
              {resultado.errosRelatorios}
            </strong>
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Tempo total</p>

            <strong>
              {resultado.tempoTotal}
            </strong> 
          </div>

          <div className="resultado-card">
            <span></span>

            <p>Finalizada em</p>

            <strong>
              {resultado.dataFinalizada}
            </strong>
          </div>

        </section>

        <footer className="resultado-footer">

          <button className="btn-secundario" onclick={() => Navigate("/detalhes")}>
            Compartilhar
          </button>

               <button className="btn-principal" onClick={() => Navigate("/simulacao")}>
            Continuar
          </button>

        </footer>

      </div>
    </main>
  );
}

export default Resultado;