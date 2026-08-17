import { useState, useEffect } from "react";
import styles from "./cliente.module.css";
import { useNavigate } from "react-router-dom";


function Cliente() {

   const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  

  const [manutencao, setManutencao] = useState(null);


  useEffect(() => {
        fetch('http://localhost:3000/desafios/1')
        .then(resposta => resposta.json())
        .then(dados => {
            setManutencao(dados);
        })
        .catch(erro => {
            console.error(erro);
        });
  }, []);

  const responderOrcamento = (novoStatus) => {
    setManutencao((prev) => ({ ...prev, status: novoStatus }));
    alert(`Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`);
  };


  if (!manutencao) {
    return <div className={styles.carregando}>Carregando dados do cliente...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Área do Cliente</h2>
      <p>Bem-vindo cliente id:{manutencao.id_desafio}!</p>
      
      {/* Botão para abrir o histórico do caso */}
      <button 
        className={styles.btnPrincipal} 
        onClick={() => setIsModalOpen(true)}
      >
        Sistema de Manutenção
      </button>

      {/* Tela de Caso (Modal) condicional */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>
          
            
            <div className={styles.modalHeader}>
              <h3>Ordem de Serviço #{manutencao.id}</h3>
              {/* Mudança dinâmica na classe do badge conforme o status muda */}
              <span className={`${styles.status} ${
                manutencao.status === "Em Andamento" ? styles.emAndamento : 
                manutencao.status === "Aprovado" ? styles.aprovado : styles.reprovado
              }`}>
                {manutencao.status}
              </span>
            </div>

            <div className={styles.modalCorpo}>
              <div className={styles.secaoInfo}>
                <h4>{manutencao.titulo}</h4>
                <p><strong>Sintomas:</strong> {manutencao.descricao}</p>
              </div>

                <div className={styles.acoes}>
                  <button 
                    className={styles.btnCancelar} 
                    onClick={() => navigate('/dificuldade')}
                    
                  >
                    Cancelar Orçamento
                  </button>
                  <button 
                    className={styles.btnAceitar} 
                    onClick={() => {
                      responderOrcamento("Aprovado");
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
    </div>
  );
}

export default Cliente;

