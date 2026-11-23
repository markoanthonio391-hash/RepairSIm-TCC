import { useState } from "react";
import styles from "./cliente.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useJogo } from "../../context/JogoContext";

function Cliente() {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [statusOrcamento, setStatusOrcamento] = useState("Em Andamento");
  const { getDesafioAtual, aceitarDesafio, finalizarJogatina, jogatina } = useJogo();
  const desafioAtual = getDesafioAtual();

  const responderOrcamento = (novoStatus) => {
    setStatusOrcamento(novoStatus);

    setAviso({
      texto: `Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`,
      tipo: novoStatus === "Aprovado" ? "sucesso" : "erro"
    });

    setTimeout(() => setAviso(null), 2500);
  };

  // sem desafio na memória (ex.: abriu esta tela direto ou deu F5 sem partida): volta para a escolha de dificuldade
  if (!desafioAtual) {
    return <Navigate to="/dificuldade" replace />;
  }

  // =====================================================
  // RECUSAR DESAFIO
  // =====================================================

  async function recusarDesafio() {

      try {

          //recusou o PRIMEIRO caso: nenhum caso foi concluído, então não salva uma partida vazia no Histórico
          if (jogatina.indiceAtual === 0) {
              navigate("/dificuldade");
              return;
          }

          /*
          * jogatina.indiceAtual representa quantos
          * desafios anteriores já foram concluídos.
          *
          * Exemplo:
          *
          * índice 0 = ainda não completou nenhum
          * índice 1 = completou o primeiro
          * índice 2 = completou dois
          */

          await finalizarJogatina(0, jogatina.indiceAtual );
          // Depois que o resultado foi salvo,
          // vai para a tela final.
          navigate("/resultado");
      } catch (erro) {console.error(
              "Erro ao finalizar jogatina:",
              erro);
      }
}

  return (
    <div className={styles.container}>
      <h2>Área do Cliente</h2>
      <p>Bem-vindo cliente {desafioAtual.cliente}!</p>

      <button
        className={styles.btnPrincipal}
        onClick={() => setIsModalOpen(true)}
      >
        Sistema de Manutenção
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h3>Ordem de Serviço {desafioAtual.id_desafio}</h3>
              <span className={`${styles.status} ${
                statusOrcamento === "Em Andamento" ? styles.emAndamento :
                statusOrcamento === "Aprovado" ? styles.aprovado : styles.reprovado
              }`}>
                {statusOrcamento}
              </span>
            </div>

            <div className={styles.modalCorpo}>
              <div className={styles.secaoInfo}>
                <h4>{desafioAtual.titulo}</h4>
                <p><strong>Sintomas:</strong> {desafioAtual.descricao}</p>
              </div>

                <div className={styles.acoes}>
                  <button 
                    className={styles.btnCancelar} 
                    onClick={async() => {
                      //primeiro agente avisa o estado do sistema que orçamento foi recusado
                      responderOrcamento("Reprovado");

                      //Importante, em vez de ir para os desafios ira para tela de resultado
                      //o state é como uma mochila ele vai carregar esses dados para la no caso para o resultado
                      //ai a tela de resultado uca vai quebrar por falta de dados
                      await recusarDesafio();
                    }}
                  >
                    Cancelar Orçamento
                  </button>
                  <button 
                    className={styles.btnAceitar} 
                    onClick={() => {
                      responderOrcamento("Aprovado");
                      aceitarDesafio();
                      navigate('/caso');
                    }}
                  >
                    Aceitar Desafio
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div className={`${styles.avisoFlutuante} ${aviso.tipo === 'sucesso' ? styles.avisoSucesso : styles.avisoErro}`}>
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

export default Cliente;
